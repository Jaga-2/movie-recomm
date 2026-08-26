import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  ArrowRight,
  TrendingUp, 
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard metrics. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const COLORS = ['#10b981', '#f43f5e']; // Emerald (Safe) vs Rose (Unsafe)

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-center text-rose-600 dark:text-rose-400">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8" />
        <h3 className="text-lg font-bold">Connection Issue</h3>
        <p className="mt-1 text-sm">{error}</p>
        <button 
          onClick={fetchStats}
          className="mt-4 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white hover:bg-brand-hover transition-all"
        >
          Try Reconnecting
        </button>
      </div>
    );
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">System Dashboard</h1>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Real-time water quality prediction telemetry and historical metrics overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Total Uploaded Files */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Uploads</span>
            <h3 className="mt-2 text-3xl font-extrabold">{stats?.total_files || 0}</h3>
            <p className="mt-1.5 text-[10px] text-slate-400">Analyzed batch datasets</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <FileSpreadsheet size={22} />
          </div>
        </div>

        {/* Card 2: Safe Predictions */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Safe Samples</span>
            <h3 className="mt-2 text-3xl font-extrabold text-emerald-500">{stats?.safe_count || 0}</h3>
            <p className="mt-1.5 text-[10px] text-slate-400">Classified potable water</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Card 3: Unsafe Predictions */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Unsafe Samples</span>
            <h3 className="mt-2 text-3xl font-extrabold text-rose-500">{stats?.unsafe_count || 0}</h3>
            <p className="mt-1.5 text-[10px] text-slate-400">High contamination risks</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <XCircle size={22} />
          </div>
        </div>

        {/* Card 4: Avg Water Quality Score */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Avg WQ Score</span>
            <h3 className="mt-2 text-3xl font-extrabold text-brand-primary">{stats?.average_wqs ? stats.average_wqs.toFixed(1) : '0.0'}</h3>
            <p className="mt-1.5 text-[10px] text-slate-400">Out of 100 max scale</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <Activity size={22} />
          </div>
        </div>
      </div>

      {/* Flagged Issue Warning */}
      {stats?.most_common_issue && stats.most_common_issue !== 'None detected' && (
        <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <AlertTriangle size={18} className="shrink-0 animate-bounce" />
          <span>**Principal Failure Vector**: {stats.most_common_issue}. We recommend checking your filtration logs or running diagnostic updates.</span>
        </div>
      )}

      {/* Chart Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pie Chart: Safe vs Unsafe */}
        <div className="glass-card p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold">Safety Distribution</h3>
            <p className="text-[10px] text-slate-400">Ratio of potable vs non-potable water</p>
          </div>
          <div className="h-64 my-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.prediction_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.prediction_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    color: 'white',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs font-bold pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Safe ({stats?.safe_count || 0})</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-500">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Unsafe ({stats?.unsafe_count || 0})</span>
            </div>
          </div>
        </div>

        {/* Bar Chart: Monthly uploads trend */}
        <div className="glass-card p-6 lg:col-span-2">
          <div>
            <h3 className="text-base font-bold">Upload History Trend</h3>
            <p className="text-[10px] text-slate-400">Volume of uploads tracked over recent months</p>
          </div>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthly_trend || []}>
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(33, 150, 243, 0.05)' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    backgroundColor: '#0f172a',
                    color: 'white',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#2196F3" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Uploads Table */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold">Recent Uploads</h3>
            <p className="text-[10px] text-slate-400">Latest CSV or Excel files processed by prediction engine</p>
          </div>
          <Link 
            to="/history" 
            className="text-xs font-bold text-brand-primary hover:text-brand-hover flex items-center gap-1"
          >
            <span>View All History</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/50 dark:divide-slate-800/50">
            <thead>
              <tr>
                <th className="glass-table-th">Filename</th>
                <th className="glass-table-th">Uploaded At</th>
                <th className="glass-table-th">Records</th>
                <th className="glass-table-th">WQS Avg</th>
                <th className="glass-table-th">Safe/Unsafe Ratio</th>
                <th className="glass-table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50 bg-transparent">
              {stats?.recent_uploads?.length > 0 ? (
                stats.recent_uploads.map((file) => {
                  const safePercent = file.record_count > 0 ? ((file.safe_count / file.record_count) * 100).toFixed(0) : 0;
                  return (
                    <tr key={file.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="glass-table-td font-bold flex items-center gap-2">
                        <FolderOpen size={16} className="text-brand-primary" />
                        <span>{file.filename}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({formatFileSize(file.file_size)})</span>
                      </td>
                      <td className="glass-table-td">{new Date(file.created_at).toLocaleString()}</td>
                      <td className="glass-table-td">{file.record_count}</td>
                      <td className="glass-table-td font-bold">{file.average_score.toFixed(1)}</td>
                      <td className="glass-table-td">
                        <div className="flex items-center gap-2 w-full max-w-[120px]">
                          <div className="h-2 w-full rounded-full bg-rose-500 overflow-hidden flex">
                            <div className="h-full bg-emerald-500" style={{ width: `${safePercent}%` }} />
                          </div>
                          <span className="text-xs font-semibold">{safePercent}%</span>
                        </div>
                      </td>
                      <td className="glass-table-td">
                        <Link 
                          to={`/report/${file.id}`}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
                        >
                          View Report
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-500">
                    No uploads registered yet. Go to <Link to="/analysis" className="text-brand-primary hover:underline font-bold">Water Analysis</Link> to upload your first water quality dataset!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
