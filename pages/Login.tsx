import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { appUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      // Let the AuthProvider fetch the appUser, then navigate based on role
    } catch (err: any) {
      setError(err.code === 'auth/invalid-credential' ? 'Invalid email or password.' : 'Failed to login. Please try again.');
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (appUser) {
        if (appUser.role === 'panitia') {
            navigate('/panitia/dashboard');
        } else {
            navigate('/my-tickets');
        }
    }
  }, [appUser, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-md p-8 space-y-6 bg-card border border-border rounded-lg shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Welcome Back</h2>
          <p className="text-muted-foreground">Login to access your account.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-destructive text-center bg-destructive/10 border border-destructive/20 rounded-md p-3">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-foreground bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-foreground bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="text-primary-foreground" />
                <span className="ml-2">Logging in...</span>
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
         <p className="text-sm text-center text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;