import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { User, Mail, Lock, Shield, Database, Calendar, Award, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.updateProfile({ fullName });
      if (res.success) {
        success('Full name updated successfully!');
        refreshProfile();
      }
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.updateProfile({ currentPassword, newPassword });
      if (res.success) {
        success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      error(err.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">User Account & Profile</h2>
        <p className="text-xs text-slate-500">Manage credentials and inspect DBMS account statistics</p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-indigo-600/20">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{user?.fullName}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email}</span>
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Account Created: {formatDate(user?.createdAt)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Authenticated (JWT)
            </span>
          </div>
        </div>

        {/* User Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Transactions</span>
            <span className="text-lg font-bold text-slate-800 block mt-0.5">
              {user?.stats?.totalTransactions || 0}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Income Volume</span>
            <span className="text-lg font-bold text-emerald-600 block mt-0.5">
              {formatCurrency(user?.stats?.totalIncome || 0)}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Expense Volume</span>
            <span className="text-lg font-bold text-rose-600 block mt-0.5">
              {formatCurrency(user?.stats?.totalExpense || 0)}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Configured Budgets</span>
            <span className="text-lg font-bold text-indigo-600 block mt-0.5">
              {user?.stats?.totalBudgets || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Update */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Update Profile Details</span>
          </h4>

          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50"
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span>Change Account Password</span>
          </h4>

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* DBMS Mini Project Details Card */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Academic Project Metadata & Specification</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div>
            <span className="text-slate-500 text-[10px] block uppercase font-bold">Project Name</span>
            <span className="font-semibold text-white">Expense Tracker & Budget Management System</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block uppercase font-bold">Assessment Type</span>
            <span className="font-semibold text-white">B.Tech CSE DBMS Mini-Project</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block uppercase font-bold">RDBMS Engine</span>
            <span className="font-semibold text-emerald-400">MySQL Server 8.0.46 (InnoDB)</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          Features fully realized relational schema: Primary Keys, Foreign Keys (<code className="font-mono text-slate-300">CASCADE</code> & <code className="font-mono text-slate-300">RESTRICT</code>), CHECK constraints, B-Tree indexes, Updatable Views (<code className="font-mono text-indigo-300">WITH CHECK OPTION</code>), multi-table JOIN views, and analytical aggregates.
        </div>
      </div>
    </div>
  );
};
