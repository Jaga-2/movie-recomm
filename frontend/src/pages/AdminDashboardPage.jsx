import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { ShieldCheck, Terminal, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export const AdminDashboardPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminAPI.getLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch system audit logs. Ensure you have admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-brand-primary" />
            <span>Admin Console</span>
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            System log auditor, database entries monitoring, and security telemetry records
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800 px-3.5 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit Logs Console Layout */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Terminal size={18} className="text-brand-primary" />
          <h3 className="text-base font-bold">System Log Auditing</h3>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/50 dark:divide-slate-800/50">
              <thead>
                <tr>
                  <th className="glass-table-th">Timestamp</th>
                  <th className="glass-table-th">User Email</th>
                  <th className="glass-table-th">Action / Endpoint</th>
                  <th className="glass-table-th">Host IP</th>
                  <th className="glass-table-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50 bg-transparent">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors text-xs">
                      <td className="glass-table-td font-semibold text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="glass-table-td font-bold text-slate-700 dark:text-slate-200">{log.user_email}</td>
                      <td className="glass-table-td">
                        <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                          {log.action}
                        </code>
                      </td>
                      <td className="glass-table-td font-mono">{log.ip_address || '127.0.0.1'}</td>
                      <td className="glass-table-td">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          log.status === 'SUCCESS' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-500">
                      No system logs registered in audit database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
