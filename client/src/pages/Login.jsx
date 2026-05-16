import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';

const Login = () => {
  const isGoogleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful.');
      navigate('/');
    } catch (error) {
      toast.error('Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('Login successful.');
      navigate('/');
    } catch (error) {
      toast.error('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-main)] transition-colors duration-300 overflow-hidden relative">

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-3 mb-4 p-3 bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/70">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <ShieldCheck size={22} />
            </div>
            <h1 className="text-xl font-[900] tracking-tight text-slate-900">
              Ethara
            </h1>
          </div>
          <h2 className="text-3xl font-[900] text-slate-900 tracking-tight mb-2">Login</h2>
          <p className="text-slate-500 font-medium text-sm">Sign in to your account</p>
        </div>

        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 px-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  className="input-field pl-12 py-3.5 text-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 px-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  className="input-field pl-12 py-3.5 text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Login
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {isGoogleEnabled && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-xs font-bold"><span className="px-4 bg-white text-slate-400">or</span></div>
              </div>

              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google login failed.')}
                render={(renderProps) => (
                  <button
                    type="button"
                    onClick={renderProps.onClick}
                    disabled={renderProps.disabled || loading}
                    className="btn-secondary w-full py-4 flex items-center justify-center gap-3 group hover:ring-8 hover:ring-primary-500/5 transition-all"
                  >
                    <span className="text-xs font-black uppercase tracking-widest">Continue with Google</span>
                  </button>
                )}
              />
            </>
          )}

          <p className="text-center mt-6 text-slate-500 font-bold text-sm">
            New here?{' '}
            <Link to="/signup" className="text-primary-600 font-black hover:underline underline-offset-8">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
