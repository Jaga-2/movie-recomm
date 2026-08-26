import React, { useState, useEffect } from 'react';
import { monitoringAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, Play, Pause, RefreshCw, Radio, Droplet, ShieldCheck, XCircle } from 'lucide-react';

export const LiveMonitoringPage = () => {
  const [liveData, setLiveData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Live Telemetry
  const fetchTelemetry = async () => {
    try {
      const data = await monitoringAPI.getLiveSensor();
      setLiveData(data);
      
      const timeStr = new Date(data.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      // Keep only last 10 ticks for rolling chart
      setHistory(prev => {
        const next = [...prev, {
          time: timeStr,
          pH: data.parameters.ph,
          Turbidity: data.parameters.turbidity,
          Chloramines: data.parameters.chloramines,
          Score: data.wqs_score
        }];
        if (next.length > 10) return next.slice(1);
        return next;
      });

      // Analyze active sensor alerts
      const currentAlerts = [];
      if (data.parameters.ph < 6.5) currentAlerts.push("Warning: Acidic pH levels detected (< 6.5)");
      if (data.parameters.ph > 8.5) currentAlerts.push("Warning: Alkaline pH levels detected (> 8.5)");
      if (data.parameters.turbidity > 4.5) currentAlerts.push("Critical: Elevated turbidity particles (> 4.5 NTU)");
      if (data.parameters.chloramines > 4.0) currentAlerts.push("Notice: High chloramine disinfectant concentration (> 4.0 ppm)");
      setAlerts(currentAlerts);
      
    } catch (err) {
      console.error("Failed to poll IoT sensors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Interval hook for polling
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        fetchTelemetry();
      }, 3000); // Poll every 3 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  if (loading && !liveData) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Radio className="text-brand-primary animate-pulse" />
            <span>IoT Sensor Stream</span>
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Simulated live sensor telemetry showing real-time water quality fluctuations and safety flags
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md ${
              isRunning 
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10' 
                : 'bg-brand-primary hover:bg-brand-hover shadow-brand-primary/10'
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={14} />
                <span>Pause Feed</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>Resume Feed</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* Status Card */}
        <div className="glass-card p-6 flex flex-col justify-between items-center text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Potability Status</span>
          <div className="my-4">
            {liveData?.prediction === 1 ? (
              <div className="flex flex-col items-center gap-1.5 text-emerald-500 animate-pulse">
                <ShieldCheck size={48} />
                <span className="text-lg font-black uppercase">SAFE</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-rose-500 animate-pulse">
                <XCircle size={48} />
                <span className="text-lg font-black uppercase">UNSAFE</span>
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-400">Confidence: {(liveData?.confidence * 100).toFixed(0)}%</span>
        </div>

        {/* WQS Card */}
        <div className="glass-card p-6 flex flex-col justify-between items-center text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quality Score</span>
          <div className="my-3">
            <span className="text-4xl font-black text-brand-primary">{liveData?.wqs_score.toFixed(1)}</span>
            <span className="text-slate-400 text-xs ml-1">/100</span>
          </div>
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Award size={14} className="text-brand-primary" />
            <span>Grade {liveData?.wqs_grade}</span>
          </span>
        </div>

        {/* pH Card */}
        <div className="glass-card p-6 flex flex-col justify-between items-center text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sensor pH</span>
          <div className="my-3">
            <span className="text-4xl font-black text-slate-800 dark:text-white">{liveData?.parameters.ph.toFixed(2)}</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            liveData?.parameters.ph >= 6.5 && liveData?.parameters.ph <= 8.5 
              ? 'bg-emerald-500/10 text-emerald-500' 
              : 'bg-rose-500/10 text-rose-500'
          }`}>
            {liveData?.parameters.ph >= 6.5 && liveData?.parameters.ph <= 8.5 ? "Optimal Range" : "Abnormal Range"}
          </span>
        </div>

        {/* Turbidity Card */}
        <div className="glass-card p-6 flex flex-col justify-between items-center text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Turbidity (NTU)</span>
          <div className="my-3">
            <span className="text-4xl font-black text-slate-800 dark:text-white">{liveData?.parameters.turbidity.toFixed(2)}</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            liveData?.parameters.turbidity < 4.0 
              ? 'bg-emerald-500/10 text-emerald-500' 
              : 'bg-rose-500/10 text-rose-500'
          }`}>
            {liveData?.parameters.turbidity < 4.0 ? "Clear (Optimal)" : "Cloudy (Action Req.)"}
          </span>
        </div>
      </div>

      {/* Main Section: Chart + Alert panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time moving chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <div>
            <h3 className="text-base font-bold">Rolling Telemetry Stream</h3>
            <p className="text-[10px] text-slate-400">Monitoring real-time fluctuations of physical parameters</p>
          </div>
          <div className="h-72 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis dataKey="time" stroke="#888888" fontSize={9} tickLine={false} />
                <YAxis stroke="#888888" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: 'white', fontSize: '10px' }}
                />
                <Line type="monotone" dataKey="pH" stroke="#2196F3" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Turbidity" stroke="#f43f5e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Chloramines" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-[10px] font-bold pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-brand-primary">● pH</span>
            <span className="text-rose-500">● Turbidity (NTU)</span>
            <span className="text-emerald-500">● Chloramines (ppm)</span>
          </div>
        </div>

        {/* Live Alerts Panel */}
        <div className="glass-card p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold mb-4">Live Alert Log</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {alerts.length > 0 ? (
                alerts.map((alert, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-semibold text-amber-600 dark:text-amber-400 animate-pulse">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>{alert}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                  <span>All sensors reading optimal levels. No alerts flagged.</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-400 dark:text-slate-500 font-medium">
            IoT sensor simulation operates at a frequency of 0.33Hz (3 second intervals). Check developer APIs to bind physical ESP8266 or Arduino sockets.
          </div>
        </div>
      </div>
      
    </div>
  );
};
