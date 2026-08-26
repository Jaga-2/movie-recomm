import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Droplet, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingState, setLoadingState] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingState(true);
    
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
      setLoadingState(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-card p-8"
      >
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand-primary mb-6 transition-all"
        >
          <ArrowLeft size={12} />
          <span>Back to Landing</span>
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary mb-4">
            <Droplet size={24} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome Back</h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Access the Water Safety Intelligence portal</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingState}
            className="w-full flex justify-center py-3 rounded-xl bg-brand-primary text-sm font-bold text-white hover:bg-brand-hover shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loadingState ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          New to AquaFlow?{' '}
          <Link to="/register" className="font-bold text-brand-primary hover:underline">
            Create an Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
