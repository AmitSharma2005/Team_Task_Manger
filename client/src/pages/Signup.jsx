import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';

const Signup = () => {
  const isGoogleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(formData.name, formData.email, formData.password);
      toast.success('Account created.');
      navigate('/');
    } catch (error) {
      toast.error('Signup failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('Account ready.');
      navigate('/');
    } catch (error) {
      toast.error('Google signup failed. Please try again.');
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
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-3 mb-3 p-2.5 bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/70">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <ShieldCheck size={20} />
            </div>
            <h1 className="text-xl font-[900] tracking-tight text-slate-900">
              Ethara
            </h1>
          </div>
          <h2 className="text-2xl font-[900] text-slate-900 tracking-tight mb-1">Sign up</h2>
          <p className="text-slate-500 font-medium text-sm">Create your account</p>
        </div>

        <div className="card p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 px-1">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  className="input-field pl-10 py-2.5 text-sm"
                  placeholder="Alex North"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
            <div className="rounded-2xl bg-teal-50 border border-teal-100 px-4 py-3 text-xs font-bold text-teal-700">
              New accounts start as members. Admins can promote users from the Admin Dashboard.
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 px-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  className="input-field pl-10 py-2.5 text-sm"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  className="input-field pl-10 py-2.5 text-sm"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Create account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {isGoogleEnabled && (
            <>
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-xs font-bold"><span className="px-4 bg-white text-slate-400">or</span></div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google signup failed.')}
                  theme="filled_blue"
                  shape="pill"
                  size="large"
                  text="continue_with"
                  render={(renderProps) => (
                    <button
                      type="button"
                      onClick={renderProps.onClick}
                      disabled={renderProps.disabled || loading}
                      className="btn-secondary w-full py-3 flex items-center justify-center gap-3 group hover:ring-8 hover:ring-primary-500/5 transition-all"
                    >
                      <span className="text-xs font-black uppercase tracking-widest">Continue with Google</span>
                    </button>
                  )}
                />
              </div>
            </>
          )}

          <p className="text-center mt-3 text-slate-500 font-bold text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-black hover:underline underline-offset-8">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
