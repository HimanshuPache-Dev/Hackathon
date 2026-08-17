import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            🚔 Nagpur SafeFlow
          </h1>
          <p className="text-gray-600">
            Traffic Safety Decision Support System
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleDemoLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
          >
            👮 Commander Demo Login
          </button>

          <button
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
            disabled
          >
            📱 Officer Login (Phase 2)
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>⚠️ Demo Mode:</strong> This is a simulated environment with fictional data for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;