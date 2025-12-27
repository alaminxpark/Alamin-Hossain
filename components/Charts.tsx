
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { HistoryPoint } from '../types';

interface Props {
  data: HistoryPoint[];
}

export const BasalFlowChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-48 w-full bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <h3 className="text-[9px] font-bold text-slate-500 uppercase mb-2 tracking-widest flex items-center justify-between">
        Basal Flow Rate (L/min)
        <span className="text-[8px] text-blue-500">Volumetric Flux</span>
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="time" hide />
          <YAxis fontSize={9} stroke="#94a3b8" unit="L" />
          <Tooltip 
            contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none' }}
            labelStyle={{ display: 'none' }}
          />
          <Area type="monotone" dataKey="basalFlow" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorFlow)" strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PollutantImpactChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-64 w-full bg-slate-50 rounded-xl p-4 border border-slate-200">
      <h3 className="text-[10px] font-bold text-slate-700 uppercase mb-4 tracking-widest flex items-center justify-between">
        Pathophysiological Axis Analysis
        <span className="text-[8px] text-slate-400 font-normal">Pollutant load vs. Multi-Organ Stress</span>
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPollutant" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorLung" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="time" hide />
          <YAxis domain={[0, 2]} fontSize={9} stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ display: 'none' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} />
          <Area type="monotone" name="Pollutant Load" dataKey="pollutantLoad" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPollutant)" strokeWidth={2} isAnimationActive={false} />
          <Area type="monotone" name="Cardiac Risk" dataKey="riskIndex" stroke="#ef4444" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={2} isAnimationActive={false} />
          <Area type="monotone" name="Lung Stress" dataKey="lungStress" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLung)" strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const HeartbeatChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-40 w-full bg-slate-900/50 rounded-xl p-3 border border-slate-800">
      <h3 className="text-[9px] font-bold text-emerald-400 uppercase mb-2 tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        ECG Monitor (Lead II)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis domain={[-0.5, 1.2]} hide />
          <Area 
            type="monotone" 
            dataKey="heartbeat" 
            stroke="#10b981" 
            strokeWidth={2} 
            fill="rgba(16, 185, 129, 0.1)"
            isAnimationActive={false} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PressureChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-32 w-full">
      <h3 className="text-[9px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Pressure (Pa/m)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="time" hide />
          <YAxis domain={[0, 50]} fontSize={9} stroke="#94a3b8" />
          <Line type="monotone" dataKey="pressure" stroke="#1e40af" strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const RQChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-32 w-full">
      <h3 className="text-[9px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Metabolic RQ (CO₂/O₂)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="time" hide />
          <YAxis domain={[0.7, 1.0]} fontSize={9} stroke="#94a3b8" />
          <Area type="monotone" dataKey="rq" stroke="#9333ea" fill="rgba(147, 51, 234, 0.05)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
