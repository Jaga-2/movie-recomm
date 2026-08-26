import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, AlertCircle, Check, Key } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const res = await updateProfile(fullName);
    if (res.success) {
      setSuccess('Profile updated successfully!');
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Account Profile</h1>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Manage your personal information, portal roles, and configuration preferences
        </p>
      </div>

      {/* Main Profile Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Card: Summary */}
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 flex items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-3xl font-black mb-4">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{user?.full_name || 'Aqua User'}</h3>
          <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
          
          <div className="mt-6 flex items-center gap-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 text-[10px] font-bold text-brand-dark dark:text-brand-light">
            <Shield size={12} />
            <span className="uppercase">{user?.role} Access</span>
          </div>
        </div>

        {/* Right Card: Form */}
        <div className="glass-card p-6 md:col-span-2 space-y-6">
          <h3 className="text-base font-bold pb-2 border-b border-slate-100 dark:border-slate-800">
            Account Details
          </h3>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Check size={16} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="input-field pl-10 opacity-60 cursor-not-allowed text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field pl-10 text-sm"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-hover text-xs font-bold transition-all shadow-md shadow-brand-primary/10 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
