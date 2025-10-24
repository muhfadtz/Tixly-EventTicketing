import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { AppUser } from '../types';
import Spinner from '../components/Spinner';

const Register: React.FC = () => {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'peserta' | 'panitia'>('peserta');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (user) {
        const userData: AppUser = {
          uid: user.uid,
          email: user.email,
          namaLengkap,
          role,
        };
        await db.collection('users').doc(user.uid).set(userData);
      }

      if (role === 'panitia') {
        navigate('/panitia/dashboard');
      } else {
        navigate('/my-tickets');
      }

    } catch (err: any) {
       setError(err.code === 'auth/email-already-in-use' ? 'This email is already registered.' : 'Failed to register. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-md p-8 space-y-6 bg-card border border-border rounded-lg shadow-sm">
         <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Create an Account</h2>
            <p className="text-muted-foreground">Join Tixly today.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-destructive text-center bg-destructive/10 border border-destructive/20 rounded-md p-3">{error}</p>}
          
          <div>
            <label className="block text-sm font-medium text-foreground">Register as:</label>
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-md bg-muted p-1">
              <button
                type="button"
                onClick={() => setRole('peserta')}
                className={`px-4 py-2 text-sm font-medium rounded ${role === 'peserta' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/50'}`}
              >
                Participant
              </button>
              <button
                type="button"
                onClick={() => setRole('panitia')}
                className={`px-4 py-2 text-sm font-medium rounded ${role === 'panitia' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/50'}`}
              >
                Organizer
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Full Name</label>
            <input
              type="text"
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-foreground bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
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
              minLength={6}
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
                  <span className="ml-2">Creating account...</span>
                </>
            ) : (
                'Register'
            )}
          </button>
        </form>
         <p className="text-sm text-center text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;