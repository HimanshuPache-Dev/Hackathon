export function startAssignmentPolling(refresh:()=>void,intervalMs=10000){refresh();const timer=setInterval(refresh,intervalMs);return()=>clearInterval(timer)}
