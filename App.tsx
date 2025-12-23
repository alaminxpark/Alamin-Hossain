
import React, { useState } from 'react';
import { SimulationParams } from './types';
import { useSimulation } from './hooks/useSimulation';
import { analyzeMedicalData, generateVoiceBriefing } from './services/gemini';
import SimulationCanvas from './components/SimulationCanvas';
import { PressureChart, RQChart, HeartbeatChart, PollutantImpactChart } from './components/Charts';
import { CITY_AQI_DATA } from './constants';

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    hct: 45,
    hr: 72,
    cholesterol: 180,
    vesselRadius: 2.5,
    aqi: 45,
    cityName: 'London'
  });

  const { isRunning, setIsRunning, results, history, uField, rbcs, reset } = useSimulation(params);
  const [aiReport, setAiReport] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRun = () => setIsRunning(!isRunning);

  const handleAIAnalysis = async () => {
    if (!results) return;
    setIsAnalyzing(true);
    const report = await analyzeMedicalData(params, results);
    setAiReport(report);
    setIsAnalyzing(false);
  };

  const getAQIColor = (v: number) => {
    if (v < 50) return 'text-emerald-500';
    if (v < 100) return 'text-yellow-500';
    if (v < 150) return 'text-orange-500';
    if (v < 200) return 'text-red-500';
    return 'text-purple-600';
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

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <span className="bg-blue-800 text-white px-3 py-1 rounded-lg text-xs tracking-widest font-bold">COMSOL</span>
            Bio-Hemodynamic Simulator
          </h1>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-tighter font-semibold">
            Global City Metabolism & Environmental Pulsatile Engine
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRun}
            className={`${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-700 hover:bg-blue-800'} text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95`}
          >
            {isRunning ? 'Halt Study' : 'Compute Study'}
          </button>
          <button 
            onClick={reset}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-sm transition-all border border-slate-200"
          >
            Reset
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parameters Column */}
        <div className="lg:col-span-3 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b pb-3">Global Parameters</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Urban Environment</label>
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
                  <label className="text-xs font-bold text-slate-600">Air Quality Index (AQI)</label>
                  <span className={`mono text-xs font-bold ${getAQIColor(params.aqi)}`}>{params.aqi} AQI</span>
                </div>
                <input 
                  type="range" min="0" max="400" value={params.aqi}
                  onChange={(e) => setParams(p => ({...p, aqi: parseInt(e.target.value), cityName: 'Custom'}))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-600"
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
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Physiological State</h2>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500">Lung Efficiency</span>
                  <span className="text-sm mono font-bold text-blue-700">{(results?.aqiImpact ? results.aqiImpact * 100 : 100).toFixed(0)}%</span>
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
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Risk Index</span>
                  <span className={`text-2xl font-black ${isRiskHigh ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>
                    {results?.riskIndex.toFixed(2) || '0.00'}
                  </span>
                </div>
             </div>
          </section>
        </div>

        {/* Main Content Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pulsatile Velocity Field</h2>
              <div className="flex gap-4">
                <span className="text-[10px] mono text-slate-400">Time: {results?.time.toFixed(3) || '0.000'}s</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{params.cityName} Mode</span>
              </div>
            </div>
            
            <SimulationCanvas uField={uField} rbcs={rbcs} isRunning={isRunning} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Wavelength', value: results?.wavelength.toFixed(2) + ' m' },
                { label: 'Pulse Freq', value: (params.hr/60).toFixed(2) + ' Hz' },
                { label: 'Wall Stress', value: results?.wallStress.toFixed(2) + ' Pa', highlight: true },
                { label: 'Peak Pressure', value: results?.peakPressure.toFixed(0) + ' mmHg' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div className="text-[9px] uppercase text-slate-400 font-extrabold mb-1 tracking-tighter">{item.label}</div>
                  <div className={`text-sm font-bold mono ${item.highlight ? 'text-blue-700' : 'text-slate-800'}`}>{results ? item.value : '--'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <PollutantImpactChart data={history} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <PressureChart data={history} />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <RQChart data={history} />
            </div>
          </div>
        </div>

        {/* Insights Column */}
        <div className="lg:col-span-3 space-y-6">
          <HeartbeatChart data={history} />
          
          <section className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl shadow-sm border-t-4 border-indigo-600">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">✨</span>
              <h2 className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Clinical AI Solver</h2>
            </div>
            
            <div className="bg-white/60 rounded-xl p-4 min-h-[140px] max-h-[240px] overflow-y-auto mb-6 text-xs leading-relaxed text-slate-700 border border-indigo-100">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-32 space-y-2">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="animate-pulse font-medium text-indigo-600">Analyzing biological vectors...</span>
                </div>
              ) : aiReport ? (
                <div className="whitespace-pre-wrap">{aiReport}</div>
              ) : (
                <div className="text-slate-400 italic flex items-center justify-center h-32 text-center">
                  Execute study to generate environmental & metabolic insights for {params.cityName}.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button 
                onClick={handleAIAnalysis}
                disabled={!results || isAnalyzing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-[10px] py-3 rounded-xl transition-all uppercase shadow-md active:scale-95"
              >
                Generate Medical Insight
              </button>
              {aiReport && (
                <button 
                  onClick={handleTTS}
                  className="w-full bg-white hover:bg-slate-50 text-slate-600 font-bold text-[10px] py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200 shadow-sm"
                >
                  <span className="text-lg">🔊</span> Voice Briefing
                </button>
              )}
            </div>
          </section>

          <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-700 space-y-4">
            <div className="text-center space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Environment: {params.cityName}</div>
              <div className={`text-3xl font-black ${params.aqi > 150 ? 'text-red-500' : 'text-emerald-400'}`}>
                {params.aqi > 200 ? 'SEVERE' : params.aqi > 150 ? 'CRITICAL' : 'NOMINAL'}
              </div>
              <div className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 ${getAQIColor(params.aqi)}`}>
                {currentCityData?.status || 'Custom AQI'}
              </div>
            </div>
            
            {currentCityData && (
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Avg Inhale (O₂)</div>
                    <div className="text-xs font-bold text-blue-400">{currentCityData.avgO2} <span className="text-[8px] font-normal opacity-70">mL/m</span></div>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Avg Exhale (CO₂)</div>
                    <div className="text-xs font-bold text-emerald-400">{currentCityData.avgCO2} <span className="text-[8px] font-normal opacity-70">mL/m</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Particulates (Dust)</div>
                    <div className="text-xs font-bold text-amber-500">{currentCityData.dust} <span className="text-[8px] font-normal opacity-70">μg/m³</span></div>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Chemicals (NOx)</div>
                    <div className="text-xs font-bold text-red-400">{currentCityData.chemicals} <span className="text-[8px] font-normal opacity-70">μg/m³</span></div>
                  </div>
                </div>
              </div>
            )}
            <div className="text-[8px] text-slate-500 text-center italic">
              *Real-time Lung/Heart stress tracked in Analysis Chart
            </div>
          </div>
        </div>
      </div>
      
      <footer className="text-center pb-8">
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          Computational Core: Navier-Stokes Pulsatile Solver v2.9 • Environmental Stress Modeling • Recharts Integration
        </p>
      </footer>
    </div>
  );
};

export default App;
