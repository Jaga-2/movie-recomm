import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { predictionsAPI } from '../services/api';
import { 
  History, 
  Search, 
  Trash2, 
  FileSpreadsheet, 
  ArrowUpRight, 
  Download,
  AlertCircle,
  FolderSync
} from 'lucide-react';

export const PredictionHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await predictionsAPI.getHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load upload history. Verify backend server status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prediction history record? This will delete all associated sample rows.")) {
      return;
    }
    
    try {
      await predictionsAPI.deleteHistory(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to delete prediction record.");
    }
  };

  // Format File Size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Filter history list based on search
  const filteredHistory = history.filter(item => 
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Prediction History</h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            View, search, audit, export, and delete previously processed water quality datasets
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800 px-3.5 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
        >
          <FolderSync size={14} />
          <span>Sync Records</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-fadeIn">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Summary */}
      {!loading && !error && history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="glass-card p-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Uploaded Files</span>
            <h4 className="text-2xl font-black mt-1">{history.length}</h4>
          </div>
          <div className="glass-card p-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accumulated Predictions</span>
            <h4 className="text-2xl font-black mt-1">
              {history.reduce((acc, item) => acc + item.record_count, 0)}
            </h4>
          </div>
          <div className="glass-card p-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Safe/Unsafe Total Ratio</span>
            <h4 className="text-2xl font-black mt-1 text-emerald-500">
              {(() => {
                const total = history.reduce((acc, item) => acc + item.record_count, 0);
                const safe = history.reduce((acc, item) => acc + item.safe_count, 0);
                return total > 0 ? `${((safe / total) * 100).toFixed(0)}%` : '0%';
              })()}
            </h4>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search filenames..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 text-xs py-2"
          />
        </div>
        <div className="text-[10px] font-bold text-slate-400">
          Showing {filteredHistory.length} of {history.length} files
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="glass-card p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/50 dark:divide-slate-800/50">
              <thead>
                <tr>
                  <th className="glass-table-th">Filename</th>
                  <th className="glass-table-th">Uploaded On</th>
                  <th className="glass-table-th">Records</th>
                  <th className="glass-table-th">Safe</th>
                  <th className="glass-table-th">Unsafe</th>
                  <th className="glass-table-th">WQS Avg</th>
                  <th className="glass-table-th text-center">Export</th>
                  <th className="glass-table-th">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50 bg-transparent">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="glass-table-td font-bold flex items-center gap-2">
                        <FileSpreadsheet size={16} className="text-brand-primary shrink-0" />
                        <span className="truncate max-w-[200px]">{item.filename}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({formatFileSize(item.file_size)})</span>
                      </td>
                      <td className="glass-table-td">{new Date(item.created_at).toLocaleString()}</td>
                      <td className="glass-table-td">{item.record_count}</td>
                      <td className="glass-table-td text-emerald-500 font-semibold">{item.safe_count}</td>
                      <td className="glass-table-td text-rose-500 font-semibold">{item.unsafe_count}</td>
                      <td className="glass-table-td font-bold">{item.average_score.toFixed(1)}</td>
                      <td className="glass-table-td text-center">
                        <a
                          href={predictionsAPI.getExcelExportUrl(item.id)}
                          download
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline"
                        >
                          <Download size={12} />
                          <span>XLSX</span>
                        </a>
                      </td>
                      <td className="glass-table-td">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/report/${item.id}`}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 flex items-center gap-0.5"
                          >
                            <span>Report</span>
                            <ArrowUpRight size={12} />
                          </Link>
                          
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded-lg bg-rose-500/10 p-2 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/30 transition-all"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-sm text-slate-500">
                      No matching history logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
