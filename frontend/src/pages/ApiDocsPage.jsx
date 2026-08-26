import React from 'react';
import { BookOpen, Terminal, Shield, ArrowRight } from 'lucide-react';

export const ApiDocsPage = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <BookOpen className="text-brand-primary" />
          <span>Developer API Portal</span>
        </h1>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Integrate AquaFlow AI water prediction classifiers directly into your hardware sensors or IoT microcontrollers
        </p>
      </div>

      {/* Docs Overview */}
      <div className="glass-card p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold">API Access Guidelines</h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All requests must include a Bearer JWT Token in the authorization header. Tokens expire in 7 days.
            Base URL: <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 rounded font-mono text-brand-primary">http://localhost:8000/api/v1</code>
          </p>
        </div>

        {/* API Headers */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl font-mono text-xs text-slate-600 dark:text-slate-400">
          <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block mb-1">Authorization Header</span>
          Authorization: Bearer &lt;YOUR_JWT_ACCESS_TOKEN&gt;
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-6">
        
        {/* Endpoint 1: Single Prediction */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-white font-bold text-[10px] px-2 py-1 rounded">POST</span>
            <code className="text-sm font-bold font-mono">/predictions/predict-single</code>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Evaluates a single water sample parameter object. Missing pH, Sulfate, or THM values are automatically imputed by ML pipelines.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Request Schema */}
            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Request Body (JSON)</span>
              <pre className="font-mono text-[10px] text-slate-600 dark:text-slate-400 overflow-x-auto">
{`{
  "ph": 7.21,
  "hardness": 196.3,
  "solids": 22000.0,
  "chloramines": 7.12,
  "sulfate": 333.8,
  "conductivity": 426.2,
  "organic_carbon": 14.3,
  "trihalomethanes": 66.4,
  "turbidity": 3.97
}`}
              </pre>
            </div>
            
            {/* Response Schema */}
            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Response Output (JSON)</span>
              <pre className="font-mono text-[10px] text-slate-600 dark:text-slate-400 overflow-x-auto">
{`{
  "prediction": 1,
  "confidence": 0.84,
  "wqs_score": 83.4,
  "wqs_grade": "B",
  "insights": {
    "summary": "Water quality is safe.",
    "recommendations": ["Safe to drink."]
  }
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Endpoint 2: IoT Telemetry Sensor stream */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-sky-500 text-white font-bold text-[10px] px-2 py-1 rounded">GET</span>
            <code className="text-sm font-bold font-mono">/monitoring/current</code>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Returns real-time fluctuating simulated parameters from IoT sensors. Useful for checking node status or drawing real-time charts.
          </p>
          
          <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Response JSON</span>
            <pre className="font-mono text-[10px] text-slate-600 dark:text-slate-400 overflow-x-auto">
{`{
  "timestamp": 1782348574.2,
  "parameters": { "ph": 7.34, "turbidity": 3.41, ... },
  "prediction": 1,
  "wqs_score": 84.1,
  "status": "Safe"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
