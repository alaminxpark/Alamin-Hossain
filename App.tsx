
import React, { useState, useEffect } from 'react';
import { SimulationParams, VariableInfo } from './types';
import { useSimulation } from './hooks/useSimulation';
import { analyzeMedicalData, generateVoiceBriefing } from './services/gemini';
import SimulationCanvas from './components/SimulationCanvas';
import { PressureChart, RQChart, HeartbeatChart, PollutantImpactChart, BasalFlowChart } from './components/Charts';
import { CITY_AQI_DATA, VARIABLE_REGISTRY, ALGORITHM_STEPS } from './constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [view, setView] = useState<'opening' | 'simulator' | 'variable-detail' | 'report'>('opening');
  const [selectedVar, setSelectedVar] = useState<VariableInfo | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [params, setParams] = useState<SimulationParams>({
    hct: 45,
    hr: 72,
    cholesterol: 180,
    vesselRadius: 2.5,
    aqi: 45,
    cityName: 'London',
    stenosisSeverity: 0
  });

  const { isRunning, setIsRunning, results, history, uField, rbcs, reset } = useSimulation(params);
  const [aiReport, setAiReport] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [maxFlowAchieved, setMaxFlowAchieved] = useState(0);

  // Track the maximum basal flow rate during the session
  useEffect(() => {
    if (results && results.basalFlow > maxFlowAchieved) {
      setMaxFlowAchieved(results.basalFlow);
    }
  }, [results?.basalFlow, maxFlowAchieved]);

  useEffect(() => {
    if (view === 'opening') {
      const interval = setInterval(() => {
        setActiveSlide(prev => (prev + 1) % ALGORITHM_STEPS.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [view]);

  const handleRun = () => setIsRunning(!isRunning);

  const handleAIAnalysis = async () => {
    if (!results) return;
    setIsAnalyzing(true);
    const report = await analyzeMedicalData(params, results);
    setAiReport(report);
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    reset();
    setMaxFlowAchieved(0);
    setAiReport('');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = CITY_AQI_DATA.find(c => c.name === e.target.value);
    if (city) {
      setParams(p => ({
        ...p,
        cityName: city.name,
        aqi: city.aqi
      }));
    }
  };

  const handleTTS = async () => {
    if (aiReport) {
      await generateVoiceBriefing(aiReport);
    }
  };

  const isRiskHigh = results && results.riskIndex > 1.2;
  const currentCityData = CITY_AQI_DATA.find(c => c.name === params.cityName);

  const openVarDetail = (v: VariableInfo) => {
    setSelectedVar(v);
    setView('variable-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // FULL SCIENTIFIC REPORT VIEW
  if (view === 'report') {
    return (
      <div className="min-h-screen bg-white text-slate-800 selection:bg-indigo-100">
        <div className="max-w-4xl mx-auto px-8 py-20 space-y-24">
          <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur border-b border-slate-100 py-4 z-50">
            <div className="max-w-4xl mx-auto px-8 flex justify-between items-center">
              <button onClick={() => setView('opening')} className="text-indigo-600 font-black text-xs uppercase tracking-widest">
                ← Exit Report
              </button>
              <div className="text-[10px] font-bold text-slate-400">RESEARCH PROTOCOL #HEMO-2025-AX</div>
            </div>
          </nav>

          <header className="space-y-6 pt-12">
            <h1 className="text-7xl font-black tracking-tighter text-slate-900">Technical Synthesis: Pulsatile Hemodynamics in Urban Environments</h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              A comprehensive documentation of the COMSOL Biophysics Engine, detailing the Navier-Stokes solvers, 
              rheological modeling of blood sludging, and respiratory-cardiac coupling in polluted cityscapes.
            </p>
            <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Section: Mechanics</span>
              <span>Section: Toxicology</span>
              <span>Section: Computational Logic</span>
            </div>
          </header>

          <section className="space-y-8">
            <div className="flex items-center gap-4 text-indigo-600">
              <span className="text-xs font-black uppercase tracking-[0.5em]">Section 01</span>
              <div className="h-px flex-grow bg-indigo-100" />
            </div>
            <h2 className="text-4xl font-black text-slate-900">Navier-Stokes Core Fluidics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <p className="leading-relaxed">
                  The primary solver handles incompressible viscous flow in a cylindrical axisymmetric domain. 
                  The simulation resolves the radial and axial velocity components (u_r, u_z) through a 
                  Finite-Difference scheme.
                </p>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 font-mono text-indigo-700 text-sm">
                  ρ(∂u/∂t + u·∇u) = -∇P + μ∇²u + f
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900">Pressure Pulse Coupling</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Unlike steady-state Poiseuille flows, the engine incorporates the heart's oscillatory period. 
                  This creates a phase lag between the pressure gradient and velocity (Womersley Effect), 
                  leading to transient flow reversals and complex wall shear dynamics.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-4 text-emerald-600">
              <span className="text-xs font-black uppercase tracking-[0.5em]">Section 02</span>
              <div className="h-px flex-grow bg-emerald-100" />
            </div>
            <h2 className="text-4xl font-black text-slate-900">Non-Newtonian Rheology (Quemada)</h2>
            <p className="leading-relaxed">
              Blood is a suspension of red blood cells (RBCs) and plasma. At low shear rates, RBCs form 
              stacks (rouleaux), drastically increasing viscosity. The COMSOL engine employs the Quemada model 
              to update viscosity locally in every grid cell at every time step (1000 Hz).
            </p>
            <div className="bg-slate-900 text-emerald-400 p-10 rounded-[3rem] shadow-2xl space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest opacity-50">Local Stress Tensor Analysis</h4>
              <p className="text-lg leading-relaxed">
                As Hematocrit (Hct) rises, the internal resistance of the fluid grows non-linearly. In 
                areas of high stenosis (arterial narrowing), the local shear spike actually lowers 
                effective viscosity, creating a high-velocity jet that causes localized endothelial erosion.
              </p>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-4 text-red-600">
              <span className="text-xs font-black uppercase tracking-[0.5em]">Section 03</span>
              <div className="h-px flex-grow bg-red-100" />
            </div>
            <h2 className="text-4xl font-black text-slate-900">Toxicological Metabolic Integration</h2>
            <p className="leading-relaxed">
              The engine integrates environmental pollutants (PM2.5, NOx) as efficiency inhibitors in 
              the lung-heart axis. Higher AQI values simulate reduced alveolar gas exchange, forcing 
              the cardiac output (Q) to increase to maintain systemic O2 partial pressures.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h5 className="font-bold text-slate-900 mb-2">Hypoxic Shunt</h5>
                <p className="text-xs text-slate-500">Pollutants simulate a functional reduction in surface area for diffusion.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h5 className="font-bold text-slate-900 mb-2">Viscosity Compounding</h5>
                <p className="text-xs text-slate-500">Dehydration and inflammation models slightly increase plasma viscosity base.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h5 className="font-bold text-slate-900 mb-2">Ischemic Triggers</h5>
                <p className="text-xs text-slate-500">Combined stenosis and low flow trigger metabolic alerts in the AI solver.</p>
              </div>
            </div>
          </section>

          <footer className="border-t border-slate-100 pt-12 pb-24 text-center space-y-4">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">End of Documentation</div>
            <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-indigo-600 font-bold text-sm">Return to top</button>
          </footer>
        </div>
      </div>
    );
  }

  // VARIABLE DETAIL VIEW
  if (view === 'variable-detail' && selectedVar) {
    return (
      <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <nav className="mb-12 flex justify-between items-center">
            <button 
              onClick={() => setView('opening')} 
              className="group flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-800 transition-all"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span> BACK TO DASHBOARD
            </button>
            <div className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">Slide Protocol: {selectedVar.id.toUpperCase()}</div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-10">
              <header className="border-b-4 border-slate-900 pb-8">
                <div className="text-blue-600 font-black text-xs uppercase tracking-widest mb-4">Presentation Mode</div>
                <h1 className="text-6xl font-black tracking-tighter mb-4">{selectedVar.name}</h1>
                <div className="flex gap-4">
                  <span className="bg-slate-900 text-white px-3 py-1 text-[10px] font-bold rounded">UNITS: {selectedVar.unit}</span>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 text-[10px] font-bold rounded">SOLVER: NAVIER-STOKES</span>
                </div>
              </header>

              <section className="space-y-6">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Computational Formulation</h2>
                <div className="bg-slate-950 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-20">
                    <span className="text-white text-6xl font-black italic">f(x)</span>
                  </div>
                  <div className="text-blue-400 font-mono text-3xl mb-4 tracking-tighter">
                    {selectedVar.equation}
                  </div>
                  <p className="text-slate-500 text-sm italic">Engine implementation for real-time stress tensor updates.</p>
                </div>
              </section>

              <section className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 text-center">Simulated Impact Graph</h2>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedVar.impactCurve}>
                      <defs>
                        <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="label" fontSize={10} stroke="#94a3b8" />
                      <YAxis fontSize={10} stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '10px' }} 
                        itemStyle={{ color: '#2563eb', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="y" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#impactGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="space-y-4 pb-12">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Physiological Implications</h2>
                <div className="text-lg text-slate-600 leading-relaxed border-l-2 border-slate-200 pl-6">
                  {selectedVar.clinical}
                </div>
              </section>
            </div>

            <aside className="space-y-8">
              <div className="bg-red-600 text-white p-10 rounded-[2rem] shadow-2xl shadow-red-200 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">⚡</div>
                  <h3 className="text-2xl font-black tracking-tight leading-none uppercase">Risk<br />Assessment</h3>
                </div>
                <div className="space-y-4 border-t border-white/20 pt-6">
                  <h4 className="font-black text-xl">{selectedVar.riskTitle}</h4>
                  <p className="text-sm font-medium leading-relaxed opacity-90">
                    {selectedVar.riskDesc}
                  </p>
                </div>
              </div>

              <div className="bg-slate-100 p-8 rounded-3xl space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Solver Interaction</h4>
                <div className="text-xs font-bold text-slate-800 leading-relaxed">
                  This parameter is dynamically modulated in the iterative loop. You can isolate this effect in the live simulator.
                </div>
              </div>

              <button 
                onClick={() => setView('simulator')}
                className="w-full py-6 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95"
              >
                TEST IN SIMULATOR →
              </button>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // OPENING VIEW
  if (view === 'opening') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden relative selection:bg-blue-500">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-600 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
          <div className="lg:col-span-5 space-y-10 flex flex-col justify-center">
            <header className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black tracking-[0.3em] uppercase">
                COMSOL BIOPHYSICS ENGINE v3.2
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">
                HEMO-CITY<br /><span className="text-blue-500">DYNAMICS</span>
              </h1>
              <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-lg">
                High-fidelity pulsatile blood flow simulation integrated with urban toxicology.
              </p>
            </header>

            <div className="flex gap-4">
               <button
                onClick={() => setView('simulator')}
                className="group relative inline-flex items-center justify-center gap-4 px-10 py-6 bg-white text-slate-950 rounded-3xl font-black text-lg transition-all hover:scale-[1.03] hover:shadow-[0_0_60px_rgba(59,130,246,0.3)] active:scale-95"
              >
                INITIALIZE ENGINE
                <span className="text-2xl transition-transform group-hover:translate-x-2">→</span>
              </button>
              <button
                onClick={() => setView('report')}
                className="group inline-flex items-center justify-center gap-4 px-8 py-6 bg-slate-900 border border-white/10 text-white rounded-3xl font-black text-lg transition-all hover:bg-slate-800"
              >
                FULL REPORT
              </button>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{ALGORITHM_STEPS[activeSlide].icon}</span>
                <h3 className="text-xl font-bold tracking-tight">{ALGORITHM_STEPS[activeSlide].title}</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                {ALGORITHM_STEPS[activeSlide].desc}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 px-4">Biophysical Variable Registry</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto pr-4 custom-scrollbar">
              {VARIABLE_REGISTRY.map((v) => (
                <button 
                  key={v.id} 
                  onClick={() => openVarDetail(v)}
                  className="w-full text-left bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 p-8 rounded-[2.5rem] transition-all group relative overflow-hidden backdrop-blur-sm"
                >
                  <div className="absolute right-0 top-0 h-full w-2 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{v.name}</h4>
                    <span className="text-[9px] mono bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-blue-400 font-black">
                      {v.unit}
                    </span>
                  </div>

                  {/* Aesthetic Meter */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                      <span>Live Vector Status</span>
                      <span className="text-blue-400">{v.meterValue} NOMINAL</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(v.meterValue, 100)}%` }} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-6 leading-relaxed line-clamp-2">
                    {v.desc}
                  </p>

                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-auto border-t border-white/5 pt-4 group-hover:text-white transition-colors">
                    <span>Analyze Synthesis Slide</span>
                    <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="mt-16 text-slate-700 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
          Computational Medicine & Fluid Dynamics Division • Open Research Consortium 2025
        </footer>
      </div>
    );
  }

  // MAIN SIMULATOR VIEW
  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-6">
           <button 
             onClick={() => setView('opening')}
             className="text-slate-400 hover:text-slate-900 transition-colors p-2 text-2xl font-bold"
             title="Back to Intro"
           >
             ←
           </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
              <span className="bg-blue-800 text-white px-3 py-1 rounded-lg text-xs tracking-widest font-bold uppercase">BioPhys Core</span>
              Hemodynamic Engine
            </h1>
            <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-widest font-black opacity-60">
              Pulsatile Solver / Urban Metabolism / AI Synthesis
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRun}
            className={`${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-700 hover:bg-blue-800'} text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 uppercase tracking-widest`}
          >
            {isRunning ? 'Halt Study' : 'Start Engine'}
          </button>
          <button 
            onClick={handleReset}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-sm transition-all border border-slate-200 uppercase tracking-widest"
          >
            Reset
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b pb-3">Input Vector</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">City Profile (AQI Sync)</label>
                <select 
                  value={params.cityName}
                  onChange={handleCityChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CITY_AQI_DATA.map(city => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-bold text-slate-600">Stenosis %</label>
                  <span className={`mono text-xs font-bold ${params.stenosisSeverity > 50 ? 'text-red-600' : 'text-slate-600'}`}>{params.stenosisSeverity}%</span>
                </div>
                <input 
                  type="range" min="0" max="85" value={params.stenosisSeverity}
                  onChange={(e) => setParams(p => ({...p, stenosisSeverity: parseInt(e.target.value)}))}
                  className="w-full h-2 bg-red-50 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-bold text-slate-600">Hematocrit</label>
                  <span className="mono text-xs font-bold text-blue-600">{params.hct}%</span>
                </div>
                <input 
                  type="range" min="20" max="70" value={params.hct}
                  onChange={(e) => setParams(p => ({...p, hct: parseInt(e.target.value)}))}
                  className="w-full h-2 bg-blue-50 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-bold text-slate-600">Heart Rate</label>
                  <span className="mono text-xs font-bold text-blue-600">{params.hr} BPM</span>
                </div>
                <input 
                  type="range" min="40" max="180" value={params.hr}
                  onChange={(e) => setParams(p => ({...p, hr: parseInt(e.target.value)}))}
                  className="w-full h-2 bg-blue-50 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </section>

          <section className={`p-6 rounded-2xl shadow-sm border-l-4 transition-colors ${isRiskHigh ? 'border-red-500 bg-red-50' : 'border-emerald-500 bg-white'}`}>
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Metabolic Feedback</h2>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500">Flow Rate</span>
                  <span className="text-sm mono font-bold text-blue-700">{results?.basalFlow.toFixed(2) || '0.00'} L/min</span>
                </div>
                {/* Dedicated Peak Flow UI Element */}
                <div className="flex justify-between items-center bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50">
                  <span className="text-[10px] font-black text-indigo-900/60 uppercase">Peak Session Flow</span>
                  <span className="text-sm mono font-black text-indigo-700">{maxFlowAchieved.toFixed(2)} L/min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500">O₂ Consumption</span>
                  <span className="text-sm mono font-bold text-blue-700">{results?.o2Cons.toFixed(2) || '0.00'} mL/min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500">CO₂ Emission</span>
                  <span className="text-sm mono font-bold text-emerald-600">{results?.co2Prod.toFixed(2) || '0.00'} mL/min</span>
                </div>
                <div className="border-t border-slate-100 pt-4 flex justify-between items-end">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aggregate Risk</span>
                  <span className={`text-2xl font-black ${isRiskHigh ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>
                    {results?.riskIndex.toFixed(2) || '0.00'}
                  </span>
                </div>
             </div>
          </section>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Pulsatile Vector Field (CFD)</h2>
              <div className="flex gap-4">
                <span className="text-[10px] mono text-slate-400 font-bold">t: {results?.time.toFixed(3) || '0.000'}s</span>
              </div>
            </div>
            
            <SimulationCanvas 
              uField={uField} 
              rbcs={rbcs} 
              isRunning={isRunning} 
              stenosisSeverity={params.stenosisSeverity}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Wavelength', value: `${results?.wavelength.toFixed(2) || '0.00'} m` },
                { label: 'Frequency', value: `${(params.hr / 60).toFixed(2)} Hz` },
                { label: 'Wall Stress', value: `${results?.wallStress.toFixed(2) || '0.00'} Pa`, highlight: true },
                { label: 'Peak BP', value: `${results?.peakPressure.toFixed(0) || '0'} mmHg` },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div className="text-[9px] uppercase text-slate-400 font-black mb-1 tracking-widest">{item.label}</div>
                  <div className={`text-sm font-bold mono ${item.highlight ? 'text-blue-700' : 'text-slate-800'}`}>{results ? item.value : '--'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BasalFlowChart data={history} />
            <PollutantImpactChart data={history} />
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <HeartbeatChart data={history} />
          
          <section className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl shadow-sm border-t-4 border-indigo-600">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">✨</span>
              <h2 className="text-xs font-bold text-indigo-900 uppercase tracking-widest">AI Clinical Solver</h2>
            </div>
            
            <div className="bg-white/60 rounded-xl p-4 min-h-[140px] max-h-[240px] overflow-y-auto mb-6 text-[11px] leading-relaxed text-slate-700 border border-indigo-100 scrollbar-hide">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-32 space-y-2">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="animate-pulse font-bold text-[10px] text-indigo-600 uppercase">Synthesizing Clinical Path...</span>
                </div>
              ) : aiReport ? (
                <div className="whitespace-pre-wrap font-medium">{aiReport}</div>
              ) : (
                <div className="text-slate-400 italic flex items-center justify-center h-32 text-center text-[10px] font-bold uppercase tracking-widest">
                  Ready for synthesis...
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button 
                onClick={handleAIAnalysis}
                disabled={!results || isAnalyzing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-[10px] py-4 rounded-xl transition-all uppercase tracking-widest shadow-md active:scale-95"
              >
                Generate Synthesis
              </button>
              {aiReport && (
                <button 
                  onClick={handleTTS}
                  className="w-full bg-white hover:bg-slate-50 text-slate-600 font-black text-[10px] py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200 shadow-sm uppercase tracking-widest"
                >
                  🔊 Audio Brief
                </button>
              )}
            </div>
          </section>

          <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-700 space-y-4">
            <div className="text-center space-y-1">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{params.cityName} Ambient</div>
              <div className={`text-4xl font-black ${params.aqi > 150 ? 'text-red-500' : 'text-emerald-400'} tracking-tighter`}>
                AQI {params.aqi}
              </div>
            </div>
            
            {currentCityData && (
              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-1">Particulates</div>
                    <div className="text-xs font-bold text-amber-500">{currentCityData.dust} <span className="text-[8px] font-normal opacity-50 italic">μg/m³</span></div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-1">NOx Vector</div>
                    <div className="text-xs font-bold text-red-400">{currentCityData.chemicals} <span className="text-[8px] font-normal opacity-50 italic">μg/m³</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <footer className="text-center pb-8 opacity-40">
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">
          Computational Medicine • NS-Solver v3.2 • Quemada Viscosity Logic
        </p>
      </footer>
    </div>
  );
};

export default App;
