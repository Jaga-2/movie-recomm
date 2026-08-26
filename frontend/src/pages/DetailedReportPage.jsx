import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { predictionsAPI } from '../services/api';
import { 
  FileText, 
  Printer, 
  Download, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Award,
  BookOpen
} from 'lucide-react';

export const DetailedReportPage = () => {
  const { fileId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await predictionsAPI.getReport(fileId);
      setReportData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch detailed report. Verify database entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [fileId]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-center text-rose-600 dark:text-rose-400">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8" />
        <h3 className="text-lg font-bold">Report Load Error</h3>
        <p className="mt-1 text-sm">{error || 'The requested file report does not exist.'}</p>
        <Link 
          to="/history"
          className="mt-4 inline-block rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white hover:bg-brand-hover transition-all"
        >
          Back to History
        </Link>
      </div>
    );
  }

  const { file_details, predictions, report } = reportData;
  const safePercent = file_details.record_count > 0 ? ((file_details.safe_count / file_details.record_count) * 100).toFixed(0) : 0;
  
  // Parse Recommendations array from JSON string safely
  let recommendationsList = [];
  try {
    recommendationsList = JSON.parse(report.recommendations);
  } catch (e) {
    recommendationsList = [report.recommendations];
  }

  // Format File Size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 print:p-8 print:bg-white print:text-black">
      
      {/* Header Actions - hidden during print */}
      <div className="flex flex-wrap justify-between items-center gap-4 print:hidden">
        <Link 
          to="/history" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand-primary transition-all"
        >
          <ArrowLeft size={12} />
          <span>Back to History</span>
        </Link>
        
        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800 px-4 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
          >
            <Printer size={14} />
            <span>Print Report / Save PDF</span>
          </button>
          
          <a 
            href={predictionsAPI.getExcelExportUrl(file_details.id)}
            download
            className="flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-hover shadow-md shadow-brand-primary/10 transition-all"
          >
            <Download size={14} />
            <span>Download Excel</span>
          </a>
        </div>
      </div>

      {/* Print-only title */}
      <div className="hidden print:block text-center border-b pb-6 mb-6">
        <h1 className="text-3xl font-black text-slate-900">AQUAFLOW AI - WATER QUALITY REPORT</h1>
        <p className="text-sm text-slate-500 mt-2">Generated on {new Date().toLocaleString()} | ID: #{file_details.id}</p>
      </div>

      {/* Title block */}
      <div className="bg-gradient-to-tr from-brand-dark to-brand-primary text-white p-8 rounded-3xl shadow-xl shadow-brand-primary/10 print:bg-none print:text-black print:border print:p-6 print:shadow-none">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={20} className="print:text-black" />
          <span className="text-xs font-bold uppercase tracking-wider opacity-85">Detailed Batch Report</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black">{file_details.filename}</h2>
        <p className="text-xs mt-2 opacity-85">Processed on {new Date(file_details.created_at).toLocaleString()} | File size: {formatFileSize(file_details.file_size)}</p>
      </div>

      {/* KPI stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="glass-card p-5 text-center print:border print:shadow-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Samples</span>
          <span className="text-2xl font-black mt-1 block">{file_details.record_count}</span>
        </div>
        <div className="glass-card p-5 text-center text-emerald-500 print:border print:shadow-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Safe Samples</span>
          <span className="text-2xl font-black mt-1 block">{file_details.safe_count}</span>
        </div>
        <div className="glass-card p-5 text-center text-rose-500 print:border print:shadow-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unsafe Samples</span>
          <span className="text-2xl font-black mt-1 block">{file_details.unsafe_count}</span>
        </div>
        <div className="glass-card p-5 text-center text-brand-primary print:border print:shadow-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Safe Ratio</span>
          <span className="text-2xl font-black mt-1 block">{safePercent}%</span>
        </div>
      </div>

      {/* Analysis Details & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Summary Card */}
        <div className="glass-card p-6 lg:col-span-2 space-y-6 print:border print:shadow-none">
          <div>
            <h3 className="text-base font-bold pb-2 border-b border-slate-100 dark:border-slate-800">Batch Executive Summary</h3>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {report.summary}
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold pb-2 border-b border-slate-100 dark:border-slate-800 mb-4">Chemical & Physical Insights</h3>
            <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 text-xs text-slate-500 dark:text-slate-400 leading-relaxed print:bg-none print:border">
              {report.insights}
            </div>
          </div>
        </div>

        {/* Purification Recommendations Card */}
        <div className="glass-card p-6 lg:col-span-1 space-y-6 print:border print:shadow-none">
          <h3 className="text-base font-bold pb-2 border-b border-slate-100 dark:border-slate-800">
            AI Remediation Directives
          </h3>
          
          <div className="space-y-3">
            {recommendationsList.map((rec, idx) => (
              <div key={idx} className="flex gap-2.5 items-start p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl print:bg-none print:border">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold">
                  {idx + 1}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table: Full row-by-row prediction details */}
      <div className="glass-card p-6 print:border print:shadow-none print:p-0">
        <h3 className="text-base font-bold mb-4 print:p-4">Full Prediction Index</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/50 dark:divide-slate-800/50">
            <thead>
              <tr>
                <th className="glass-table-th">Row</th>
                <th className="glass-table-th">pH</th>
                <th className="glass-table-th">Hardness</th>
                <th className="glass-table-th">Solids (TDS)</th>
                <th className="glass-table-th">Chloramines</th>
                <th className="glass-table-th">Sulfate</th>
                <th className="glass-table-th">Turbid</th>
                <th className="glass-table-th">WQ Score</th>
                <th className="glass-table-th">Grade</th>
                <th className="glass-table-th">Potability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
              {predictions.map((p, idx) => (
                <tr key={p.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                  <td className="glass-table-td font-bold">#{idx + 1}</td>
                  <td className="glass-table-td">{p.ph !== null ? p.ph.toFixed(2) : 'N/A'}</td>
                  <td className="glass-table-td">{p.hardness.toFixed(0)}</td>
                  <td className="glass-table-td">{p.solids.toFixed(0)}</td>
                  <td className="glass-table-td">{p.chloramines.toFixed(1)}</td>
                  <td className="glass-table-td">{p.sulfate !== null ? p.sulfate.toFixed(0) : 'N/A'}</td>
                  <td className="glass-table-td">{p.turbidity.toFixed(1)}</td>
                  <td className="glass-table-td font-bold">{p.wqs_score.toFixed(1)}</td>
                  <td className="glass-table-td font-bold text-center">
                    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      p.wqs_grade === 'A' || p.wqs_grade === 'B' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {p.wqs_grade}
                    </span>
                  </td>
                  <td className="glass-table-td">
                    {p.prediction === 1 ? (
                      <span className="badge-safe">
                        <CheckCircle2 size={12} />
                        <span>Safe</span>
                      </span>
                    ) : (
                      <span className="badge-unsafe">
                        <XCircle size={12} />
                        <span>Unsafe</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
