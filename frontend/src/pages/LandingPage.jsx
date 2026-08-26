import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Droplet, 
  ShieldCheck, 
  LineChart, 
  Database, 
  Cpu, 
  ArrowRight, 
  FileSpreadsheet, 
  Award,
  Sparkles
} from 'lucide-react';

export const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 sm:pt-28 sm:pb-36 water-bg">
        <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/40" />
        
        {/* Animated wave pattern or bubbles can go here */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 px-3.5 py-1.5 text-xs font-bold text-brand-dark dark:text-brand-light mb-6">
              <Sparkles size={12} className="text-brand-primary animate-pulse" />
              <span>Next-Gen Water Safety Intelligence</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white leading-[1.15]">
              Predict Water Safety with <br />
              <span className="bg-gradient-to-r from-brand-primary to-cyan-500 bg-clip-text text-transparent dark:to-cyan-400">
                Machine Learning AI
              </span>
            </h1>
            
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 font-medium">
              AquaFlow AI analyzes physical, chemical, and biological water quality parameters. Upload CSV/Excel batches to predict drinking potability instantly.
            </p>
            
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/analysis"
                className="flex items-center gap-2 rounded-2xl bg-brand-primary px-6 py-3.5 text-base font-bold text-white shadow-lg hover:bg-brand-hover shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <span>Analyze Samples</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm px-6 py-3.5 text-base font-bold text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Try Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Safety Statistics Banner */}
      <section className="-mt-16 relative z-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-100/50 dark:shadow-none">
            
            <div className="text-center p-4 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800">
              <h3 className="text-4xl font-extrabold text-brand-primary">92.4%</h3>
              <p className="mt-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Model Training Accuracy</p>
              <span className="text-[10px] text-slate-400">Random Forest Classifier</span>
            </div>

            <div className="text-center p-4 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800">
              <h3 className="text-4xl font-extrabold text-brand-primary">1 in 4</h3>
              <p className="mt-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">People Lack Safe Water</p>
              <span className="text-[10px] text-slate-400">WHO Global Report (2025)</span>
            </div>

            <div className="text-center p-4">
              <h3 className="text-4xl font-extrabold text-brand-primary">&lt; 1 sec</h3>
              <p className="mt-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bulk Prediction Speed</p>
              <span className="text-[10px] text-slate-400">Per 1,000 Data Batches</span>
            </div>
            
          </div>
        </div>
      </section>

      {/* 3. Features Showcase */}
      <section className="py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Advanced Analytical Capabilities
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400">
              We leverage machine learning pipelines to parse water quality indices and deliver intelligent remediation strategies.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 gap-8 md:grid-cols-3"
          >
            {/* Card 1 */}
            <motion.div variants={itemVariants} className="glass-card p-8 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary mb-6">
                  <FileSpreadsheet size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Bulk CSV / Excel Upload</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Drag and drop files containing pH, Solids, Chloramines, Sulfates, and other indices. Analyze every sample in milliseconds.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-brand-primary flex items-center gap-1.5">
                  Supports .csv, .xlsx, .xls
                </span>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={itemVariants} className="glass-card p-8 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary mb-6">
                  <Cpu size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Comparative ML Pipelines</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Compiles and compares Random Forest, XGBoost, and Gradient Boosting models, selecting the highest-accuracy model automatically.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-brand-primary flex items-center gap-1.5">
                  Full ROC/AUC curves
                </span>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={itemVariants} className="glass-card p-8 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary mb-6">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI Recommendations</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Get structural reasons for unsafe predictions and AI-driven purification strategies, from Reverse Osmosis to Carbon filtration.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-brand-primary flex items-center gap-1.5">
                  WHO compliant insights
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. Statistics Details & SVG Map Teaser */}
      <section className="py-12 bg-white dark:bg-slate-900/20 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">Water Safety Context</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 leading-tight">
                Why Water Parameter Assessment is Vital
              </h2>
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Chemical components like chloramines and sulfates protect water from pathogens but are dangerous in excess. Contaminants such as heavy dissolved solids (TDS) and trihalomethanes raise long-term toxicity risks.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <Award size={14} />
                  </div>
                  <span className="text-sm font-semibold">WHO Standard Safe pH range is 6.5 - 8.5</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <Award size={14} />
                  </div>
                  <span className="text-sm font-semibold">TDS limit is &lt; 1,000 mg/L</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <Award size={14} />
                  </div>
                  <span className="text-sm font-semibold">Trihalomethanes carcinogenic byproduct threshold &lt; 80 µg/L</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              {/* Premium Looking Graphic: Water Droplet with parameters orbiting */}
              <div className="relative h-72 w-72 flex items-center justify-center rounded-full bg-brand-primary/5 dark:bg-brand-primary/10 animate-pulse">
                <div className="h-56 w-56 flex items-center justify-center rounded-full bg-brand-primary/10 dark:bg-brand-primary/20">
                  <div className="h-36 w-36 flex items-center justify-center rounded-full bg-gradient-to-tr from-brand-dark to-brand-primary text-white shadow-xl shadow-brand-primary/30">
                    <Droplet size={64} fill="currentColor" />
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-2xl text-[10px] font-bold">
                  pH: 7.21 (Safe)
                </div>
                <div className="absolute bottom-8 right-0 bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-2xl text-[10px] font-bold">
                  Turbidity: 1.2 NTU (Safe)
                </div>
                <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-2xl text-[10px] font-bold">
                  TDS: 22k ppm (Unsafe)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="mt-auto py-12 bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary text-white">
                <Droplet size={16} fill="currentColor" />
              </div>
              <span className="text-lg font-bold text-white">AquaFlow AI</span>
            </div>
            <p className="text-xs">&copy; 2026 AquaFlow AI Water Prediction System. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/docs" className="hover:text-white transition-colors">API Docs</Link>
              <Link to="/analysis" className="hover:text-white transition-colors">Portal</Link>
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  );
};
