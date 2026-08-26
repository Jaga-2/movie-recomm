import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictionsAPI } from '../services/api';
import { 
  Upload, 
  FileSpreadsheet, 
  HelpCircle, 
  AlertCircle, 
  Download, 
  Check, 
  Trash2,
  ListFilter,
  CheckCircle2,
  XCircle,
  Activity,
  Award
} from 'lucide-react';

export const WaterAnalysisPage = () => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'manual'
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  
  // Manual Input Form State
  const [manualForm, setManualForm] = useState({
    ph: '',
    hardness: '',
    solids: '',
    chloramines: '',
    sulfate: '',
    conductivity: '',
    organic_carbon: '',
    trihalomethanes: '',
    turbidity: ''
  });
  const [manualResult, setManualResult] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Handle Drag Over
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Handle File Select
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    setSuccess('');
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setError('Invalid file format. Only CSV and Excel files are supported.');
      return;
    }
    setFile(selectedFile);
  };

  // Download sample dataset template client-side
  const downloadSampleTemplate = () => {
    const csvContent = 
      "pH,Hardness,Solids,Chloramines,Sulfate,Conductivity,Organic_carbon,Trihalomethanes,Turbidity\n" +
      "7.21,152,498,3.1,205,410,2.0,82,1.0\n" +
      "7.45,178,612,2.7,240,455,1.9,76,0.9\n" +
      "5.85,195,14000,5.1,280,410,12.5,70,3.2\n" +
      "7.08,134,472,3.6,185,365,2.3,91,1.3\n" +
      "7.32,163,525,3.0,215,425,2.1,84,1.1";
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "water_quality_sample_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Upload Submission
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await predictionsAPI.uploadFile(formData);
      setUploadResult(data);
      setSuccess(`Successfully analyzed ${data.file_details.record_count} water sample records.`);
      setFile(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to process file. Ensure data parameters format is correct.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Manual Input Change
  const handleManualChange = (e) => {
    setManualForm({
      ...manualForm,
      [e.target.name]: e.target.value
    });
  };

  // Handle Manual Form Submission
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setManualResult(null);

    // Format fields (empty values mapped to null for imputer)
    const payload = {
      ph: manualForm.ph === '' ? null : parseFloat(manualForm.ph),
      hardness: parseFloat(manualForm.hardness),
      solids: parseFloat(manualForm.solids),
      chloramines: parseFloat(manualForm.chloramines),
      sulfate: manualForm.sulfate === '' ? null : parseFloat(manualForm.sulfate),
      conductivity: parseFloat(manualForm.conductivity),
      organic_carbon: parseFloat(manualForm.organic_carbon),
      trihalomethanes: manualForm.trihalomethanes === '' ? null : parseFloat(manualForm.trihalomethanes),
      turbidity: parseFloat(manualForm.turbidity)
    };

    try {
      const res = await predictionsAPI.predictSingle(payload);
      // Predict single endpoint returns database prediction model.
      // We need to fetch details for AI insights. We can mock or compute AI insights client-side or
      // read them if predict single can evaluate them.
      // Wait, let's verify what predict_single returns. Our backend predict_single returns a JSON payload including:
      // prediction, confidence, wqs_score, wqs_grade, and insights!
      // But in FastAPI models, the DB save saves it to `models.Prediction` which does NOT contain the full nested insights.
      // Ah! But our backend endpoint returns: `return db_pred` which matches `schemas.PredictionResponse`!
      // Wait, let's look at schemas.PredictionResponse. It has wqs_score and wqs_grade, but doesn't have the recommendations dictionary.
      // That's fine! We can generate recommendations on the client-side using the same simple logic, which is super fast and clean,
      // or we can read them from a simulated object if they are present.
      // Let's create a client-side parser to display insights for manual predictions! This is extremely robust and double-safeguards the display.
      setManualResult(res);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to analyze water sample parameters. Verify values are numeric.');
    } finally {
      setLoading(false);
    }
  };

  // Client-side AI Recommendations Generator (Safe-guard fallback)
  const getClientInsights = (res) => {
    const issues = [];
    const recs = [];
    
    if (res.prediction === 1) {
      recs.push("Water quality appears suitable for drinking. Safe to drink. Keep stored in a clean container.");
      return { summary: "Water quality appears suitable for drinking.", issues, recommendations: recs };
    }

    if (res.ph !== null && (res.ph < 6.5)) {
      issues.push("Low pH (Acidic water)");
      recs.push("Use pH correction / Calcite Neutralizer");
    } else if (res.ph !== null && (res.ph > 8.5)) {
      issues.push("High pH (Alkaline water)");
      recs.push("Acid injection neutralizing system");
    }

    if (res.hardness > 250) {
      issues.push("Excessive Hardness (Scaling minerals)");
      recs.push("Install Water Softener (Ion Exchange) or RO system");
    }

    if (res.solids > 20000) {
      issues.push("High Total Dissolved Solids (TDS)");
      recs.push("Reverse Osmosis (RO) Filter or Distillation");
    }

    if (res.chloramines > 4.0) {
      issues.push("High Chloramines");
      recs.push("Activated Carbon Block Filter");
    }

    if (res.sulfate !== null && res.sulfate > 250) {
      issues.push("High Sulfate levels");
      recs.push("Reverse Osmosis (RO) filtration");
    }

    if (res.conductivity > 500) {
      issues.push("High Conductivity");
      recs.push("Deionization or RO Treatment");
    }

    if (res.organic_carbon > 10) {
      issues.push("High Organic Carbon (TOC)");
      recs.push("Activated Carbon Adsorption + UV Sanitization");
    }

    if (res.trihalomethanes !== null && res.trihalomethanes > 80) {
      issues.push("High Trihalomethanes (THMs)");
      recs.push("Granular Activated Carbon Filter");
    }

    if (res.turbidity > 5.0) {
      issues.push("High Turbidity (Cloudiness)");
      recs.push("Sand filter or Coagulation/Sedimentation");
    }

    if (recs.length === 0) {
      recs.push("Multi-stage RO + UV purification system.");
      recs.push("Boil water for 1 minute before drinking.");
    }

    return {
      summary: "Water quality is NOT safe for drinking.",
      issues,
      recommendations: recs
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Water Quality Analysis</h1>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Upload water index spreadsheets or manually input values to predict drinking safety potability
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-slate-900 rounded-2xl w-fit">
        <button
          onClick={() => { setActiveTab('upload'); setError(''); setSuccess(''); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'upload' 
              ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Spreadsheet Upload
        </button>
        <button
          onClick={() => { setActiveTab('manual'); setError(''); setSuccess(''); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'manual' 
              ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Manual Parameter Input
        </button>
      </div>

      {/* Alert Boxes */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <Check size={16} className="shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Tab Content 1: Upload */}
      {activeTab === 'upload' && !uploadResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-brand-primary bg-brand-primary/5' 
                    : 'border-slate-300 dark:border-slate-800 hover:border-brand-primary dark:hover:border-brand-primary bg-white/40 dark:bg-slate-900/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                />
                
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary mb-4">
                  <Upload size={22} />
                </div>
                
                {file ? (
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{file.name}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="mt-4 text-xs font-bold text-rose-500 flex items-center gap-1 mx-auto hover:underline"
                    >
                      <Trash2 size={12} />
                      <span>Remove file</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold">Drag and drop your spreadsheet here</p>
                    <p className="mt-1.5 text-xs text-slate-400">or click to browse local files</p>
                    <p className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 font-medium">Supports CSV, XLSX, XLS</p>
                  </div>
                )}
              </div>

              {file && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 rounded-2xl bg-brand-primary text-sm font-bold text-white hover:bg-brand-hover shadow-lg shadow-brand-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "Analyze Water Spreadsheet"
                  )}
                </button>
              )}
            </form>
          </div>

          {/* Guide card */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle size={18} className="text-brand-primary" />
                <h3 className="text-sm font-bold">File Upload Guidelines</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Ensure your dataset contains the required parameters listed below. Headers can include units (e.g. `pH`, `Hardness (mg/L)`, `Turbidity (NTU)`).
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50">
                  <span className="font-bold">Required features</span>
                  <span className="text-[10px] text-brand-primary font-bold">pH, Hardness, Solids, Chloramines, Sulfate, Conductivity, Organic_carbon, Trihalomethanes, Turbidity</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={downloadSampleTemplate}
              className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-brand-primary/20 hover:bg-brand-primary/5 text-brand-primary text-xs font-bold transition-all"
            >
              <Download size={14} />
              <span>Download CSV Template</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab Content 1 (UPLOADED RESULTS DISPLAY) */}
      {activeTab === 'upload' && uploadResult && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl">
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Analysis Summary</span>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{uploadResult.file_details.filename}</h2>
              <p className="text-xs text-slate-500 mt-2">{uploadResult.report.summary}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setUploadResult(null)}
                className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
              >
                Analyze Another File
              </button>
              <button 
                onClick={() => navigate(`/report/${uploadResult.file_details.id}`)}
                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-brand-primary text-white hover:bg-brand-hover shadow-md shadow-brand-primary/10 transition-all"
              >
                Open Detailed Report
              </button>
            </div>
          </div>

          {/* Row predictions list */}
          <div className="glass-card p-6">
            <h3 className="text-base font-bold mb-4">Sample Results Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200/50 dark:divide-slate-800/50">
                <thead>
                  <tr>
                    <th className="glass-table-th">Row</th>
                    <th className="glass-table-th">pH</th>
                    <th className="glass-table-th">Hardness</th>
                    <th className="glass-table-th">Turbidity</th>
                    <th className="glass-table-th">WQ Score</th>
                    <th className="glass-table-th">Grade</th>
                    <th className="glass-table-th">Confidence</th>
                    <th className="glass-table-th">Potability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                  {uploadResult.predictions.map((pred, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="glass-table-td font-bold">#{idx + 1}</td>
                      <td className="glass-table-td">{pred.ph !== null ? pred.ph.toFixed(2) : 'N/A'}</td>
                      <td className="glass-table-td">{pred.hardness.toFixed(1)}</td>
                      <td className="glass-table-td">{pred.turbidity.toFixed(1)}</td>
                      <td className="glass-table-td font-bold">{pred.wqs_score.toFixed(1)}</td>
                      <td className="glass-table-td">
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                          pred.wqs_grade === 'A' || pred.wqs_grade === 'B' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : pred.wqs_grade === 'C' || pred.wqs_grade === 'D' 
                            ? 'bg-amber-500/10 text-amber-500' 
                            : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {pred.wqs_grade}
                        </span>
                      </td>
                      <td className="glass-table-td">{(pred.confidence * 100).toFixed(0)}%</td>
                      <td className="glass-table-td">
                        {pred.prediction === 1 ? (
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
      )}

      {/* Tab Content 2: Manual Parameter Form */}
      {activeTab === 'manual' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleManualSubmit} className="glass-card p-6 space-y-6">
              <h3 className="text-base font-bold pb-3 border-b border-slate-100 dark:border-slate-800">
                Water Chemical Parameters Form
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">pH (0 - 14)</label>
                  <input
                    type="number"
                    step="any"
                    name="ph"
                    value={manualForm.ph}
                    onChange={handleManualChange}
                    className="input-field text-sm"
                    placeholder="e.g. 7.2"
                  />
                  <span className="text-[9px] text-slate-400 mt-1 block">Leave empty to impute</span>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Hardness (mg/L)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    name="hardness"
                    value={manualForm.hardness}
                    onChange={handleManualChange}
                    className="input-field text-sm"
                    placeholder="e.g. 196.3"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Solids / TDS (mg/L)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    name="solids"
                    value={manualForm.solids}
                    onChange={handleManualChange}
                    className="input-field text-sm"
                    placeholder="e.g. 22000"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Chloramines (ppm)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    name="chloramines"
                    value={manualForm.chloramines}
                    onChange={handleManualChange}
                    className="input-field text-sm"
                    placeholder="e.g. 7.1"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Sulfate (mg/L)</label>
                  <input
                    type="number"
                    step="any"
                    name="sulfate"
                    value={manualForm.sulfate}
                    onChange={handleManualChange}
                    className="input-field text-sm"
                    placeholder="e.g. 333.8"
                  />
                  <span className="text-[9px] text-slate-400 mt-1 block">Leave empty to impute</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Conductivity (µS/cm)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    name="conductivity"
                    value={manualForm.conductivity}
                    onChange={handleManualChange}
                    className="input-field text-sm"
                    placeholder="e.g. 426.2"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Organic Carbon (mg/L)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    name="organic_carbon"
                    value={manualForm.organic_carbon}
                    onChange={handleManualChange}
                    className="input-field text-sm"
                    placeholder="e.g. 14.3"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Trihalomethanes (µg/L)</label>
                  <input
                    type="number"
                    step="any"
                    name="trihalomethanes"
                    value={manualForm.trihalomethanes}
                    onChange={handleManualChange}
                    className="input-field text-sm"
                    placeholder="e.g. 66.4"
                  />
                  <span className="text-[9px] text-slate-400 mt-1 block">Leave empty to impute</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Turbidity (NTU)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    name="turbidity"
                    value={manualForm.turbidity}
                    onChange={handleManualChange}
                    className="input-field text-sm"
                    placeholder="e.g. 3.9"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setManualForm({ ph:'', hardness:'', solids:'', chloramines:'', sulfate:'', conductivity:'', organic_carbon:'', trihalomethanes:'', turbidity:'' });
                    setManualResult(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 text-xs font-bold"
                >
                  Clear Fields
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-hover text-xs font-bold transition-all shadow-md shadow-brand-primary/10 disabled:opacity-50"
                >
                  {loading ? "Analyzing..." : "Evaluate Safety"}
                </button>
              </div>
            </form>
          </div>

          {/* Manual prediction display panel */}
          <div className="lg:col-span-1">
            {manualResult ? (
              <div className="glass-card p-6 space-y-6 animate-fadeIn">
                <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Analysis Result</span>
                  <div className="mt-4 flex justify-center">
                    {manualResult.prediction === 1 ? (
                      <div className="flex flex-col items-center gap-2 text-emerald-500">
                        <CheckCircle2 size={48} />
                        <h4 className="text-lg font-bold">Safe for Drinking</h4>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-rose-500">
                        <XCircle size={48} />
                        <h4 className="text-lg font-bold">Not Safe for Drinking</h4>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400">Confidence Score: {(manualResult.confidence * 100).toFixed(0)}%</p>
                </div>

                {/* Score & Grade */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-2xl text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">WQ Score</span>
                    <span className="text-xl font-black text-brand-primary mt-1 block">{manualResult.wqs_score.toFixed(1)}</span>
                  </div>
                  <div className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-2xl text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Water Grade</span>
                    <span className="text-xl font-black text-brand-primary mt-1 block">{manualResult.wqs_grade}</span>
                  </div>
                </div>

                {/* Insights */}
                <div>
                  <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                    <Activity size={14} className="text-brand-primary" />
                    <span>AI Purification Insights</span>
                  </h4>
                  
                  {/* Render insights based on prediction */}
                  {(() => {
                    const insights = getClientInsights(manualResult);
                    return (
                      <div className="space-y-3">
                        {insights.issues.length > 0 && (
                          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block mb-1">Detected Contamination</span>
                            <ul className="list-disc pl-4 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                              {insights.issues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
                          <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider block mb-1">Recommendations</span>
                          <ul className="list-disc pl-4 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                            {insights.recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full min-h-[300px]">
                <Activity size={32} className="text-slate-300 dark:text-slate-700 animate-pulse mb-3" />
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">Ready for Analysis</h4>
                <p className="mt-1 text-[10px] text-slate-400 max-w-[200px] mx-auto">Fill in the water parameter form and submit to receive instant AI evaluation results</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
