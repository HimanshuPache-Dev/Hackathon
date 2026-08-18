const http = require('http');
const { spawn } = require('child_process');

const port = Number(process.env.PORT || 3001);
const host = '127.0.0.1';

function inspectExistingServer() {
  return new Promise((resolve) => {
    let body = '';
    const request = http.get(
      { host, port, path: '/api/health', timeout: 12000 },
      (response) => {
        response.setEncoding('utf8');
        response.on('data', (chunk) => { if (body.length < 4096) body += chunk; });
        response.on('end', () => {
          try {
            const health = JSON.parse(body);
            resolve({
              listening: true,
              policeOps: ['ok', 'down'].includes(health.status) && typeof health.database === 'string',
            });
          } catch {
            resolve({ listening: true, policeOps: false });
          }
        });
      },
    );
    request.on('timeout', () => {
      request.destroy();
      resolve({ listening: true, policeOps: false });
    });
    request.on('error', (error) => {
      resolve({ listening: error.code !== 'ECONNREFUSED', policeOps: false });
    });
  });
}

async function start() {
  const existing = await inspectExistingServer();
  if (existing.listening && existing.policeOps) {
    console.log(`PoliceOps API is already running at http://${host}:${port}. Reusing the existing server.`);
    return;
  }
  if (existing.listening) {
    console.error(`Port ${port} is occupied by an unresponsive or unrelated process.`);
    console.error('Close that process or set PORT to a different value before starting PoliceOps.');
    process.exitCode = 1;
    return;
  }

  const nodemonEntry = require.resolve('nodemon/bin/nodemon.js');
  const child = spawn(process.execPath, [nodemonEntry, '--exec', 'ts-node', 'src/server.ts'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => child.kill(signal));
  }
  child.on('error', (error) => {
    console.error(`Unable to start PoliceOps API: ${error.message}`);
    process.exitCode = 1;
  });
  child.on('exit', (code) => {
    process.exitCode = code ?? 1;
  });
}

start().catch((error) => {
  console.error(`Unable to inspect port ${port}: ${error.message}`);
  process.exitCode = 1;
});
