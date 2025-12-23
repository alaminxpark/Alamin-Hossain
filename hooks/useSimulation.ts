
import { useState, useRef, useCallback, useEffect } from 'react';
import { SimulationParams, SimulationResult, HistoryPoint } from '../types';
import { NR, NZ, RHO, MU_BASE, DT, WAVE_VELOCITY, CITY_AQI_DATA } from '../constants';

// Synthetic ECG generator
const getECGValue = (t: number, hr: number) => {
  const period = 60 / hr;
  const localT = t % period;
  
  // P-wave
  const p = 0.15 * Math.exp(-Math.pow(localT - 0.1, 2) / 0.001);
  // QRS complex
  const q = -0.1 * Math.exp(-Math.pow(localT - 0.18, 2) / 0.0001);
  const r = 1.0 * Math.exp(-Math.pow(localT - 0.2, 2) / 0.0001);
  const s = -0.25 * Math.exp(-Math.pow(localT - 0.22, 2) / 0.0001);
  // T-wave
  const tw = 0.35 * Math.exp(-Math.pow(localT - 0.45, 2) / 0.002);
  
  return p + q + r + s + tw;
};

export const useSimulation = (params: SimulationParams) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  
  const uFieldRef = useRef<Float32Array[]>(
    Array.from({ length: NR }, () => new Float32Array(NZ).fill(0))
  );
  const timeRef = useRef(0);
  const rbcsRef = useRef<{ z: number; r: number }[]>([]);

  const reset = useCallback(() => {
    setIsRunning(false);
    timeRef.current = 0;
    uFieldRef.current = Array.from({ length: NR }, () => new Float32Array(NZ).fill(0));
    rbcsRef.current = [];
    setResults(null);
    setHistory([]);
  }, []);

  const solveStep = useCallback(() => {
    const { hct, hr, cholesterol, vesselRadius, aqi, cityName } = params;
    const cityData = CITY_AQI_DATA.find(c => c.name === cityName);
    
    const rad = vesselRadius / 1000;
    const dr = rad / (NR - 1);
    const omega = 2 * Math.PI * (hr / 60);
    const p_ampl = 20.0;
    const dp_dz = 22.0 + p_ampl * Math.sin(omega * timeRef.current);
    
    const wavelength = WAVE_VELOCITY / (hr / 60);
    const currentU = uFieldRef.current;
    const newU = Array.from({ length: NR }, () => new Float32Array(NZ));
    
    let maxV = 0;
    let maxG = 0;

    const mu_chol = MU_BASE * (1 + (cholesterol - 180) / 1000);
    const h = hct / 100;

    for (let i = 1; i < NR - 1; i++) {
      const r = i * dr;
      for (let j = 0; j < NZ; j++) {
        const du_dr = (currentU[i + 1][j] - currentU[i - 1][j]) / (2 * dr);
        const d2u_dr2 = (currentU[i + 1][j] - 2 * currentU[i][j] + currentU[i - 1][j]) / (dr * dr);
        
        const g_dot = Math.max(Math.abs(du_dr), 0.1);
        const k0 = 4.08, kInf = 1.8;
        const kq = (k0 + kInf * Math.sqrt(g_dot / 1.88)) / (1 + Math.sqrt(g_dot / 1.88));
        const mu_effective = mu_chol * Math.pow(1 - 0.5 * kq * h, -2);

        const viscous = mu_effective * (d2u_dr2 + (1 / r) * du_dr);
        newU[i][j] = currentU[i][j] + DT * ((1 / RHO) * dp_dz + (1 / RHO) * viscous);
        
        if (newU[i][j] > maxV) maxV = newU[i][j];
        if (Math.abs(du_dr) > maxG) maxG = Math.abs(du_dr);
      }
    }

    for (let j = 0; j < NZ; j++) {
      newU[NR - 1][j] = 0;
      newU[0][j] = newU[1][j];
    }

    uFieldRef.current = newU;
    timeRef.current += DT;

    // Environmental Impact Factors
    const normalizedDust = (cityData?.dust || 0) / 200;
    const normalizedChem = (cityData?.chemicals || 0) / 120;
    const pollutantLoad = (normalizedDust + normalizedChem + (aqi / 400)) / 3;

    const aqiImpact = Math.max(0.4, 1 - pollutantLoad);
    const q_flow = currentU[Math.floor(NR / 2)][0] * Math.PI * rad * rad * 1000 * 60;
    const o2_cons = q_flow * (hct / 100) * 1.34 * 0.25 * aqiImpact;
    const co2_prod = o2_cons * 0.85;
    
    const riskIndex = (hct / 45) * (hr / 70) * (cholesterol / 180) * (0.005 / Math.max(maxV, 0.001)) * (1 + pollutantLoad);

    return {
      maxV,
      dpDz: dp_dz,
      maxG,
      wavelength,
      o2Cons: o2_cons,
      co2Prod: co2_prod,
      time: timeRef.current,
      riskIndex,
      wallStress: MU_BASE * maxG,
      peakPressure: 90 + (dp_dz / 2),
      heartbeat: getECGValue(timeRef.current, hr),
      aqiImpact,
      pollutantLoad
    };
  }, [params]);

  useEffect(() => {
    let animationId: number;
    const frame = () => {
      if (isRunning) {
        let lastRes: any = null;
        for (let i = 0; i < 8; i++) {
          lastRes = solveStep();
        }
        if (lastRes) {
          setResults(lastRes);
          if (Math.floor(lastRes.time * 1000) % 40 === 0) {
            setHistory(prev => [...prev.slice(-80), {
              time: lastRes!.time,
              pressure: lastRes!.dpDz,
              rq: lastRes!.co2Prod / Math.max(0.1, lastRes!.o2Cons),
              heartbeat: lastRes!.heartbeat,
              pollutantLoad: lastRes!.pollutantLoad,
              lungStress: 1 - lastRes!.aqiImpact,
              riskIndex: lastRes!.riskIndex
            }]);
          }
        }
        animationId = requestAnimationFrame(frame);
      }
    };

    if (isRunning) {
      animationId = requestAnimationFrame(frame);
    }
    return () => cancelAnimationFrame(animationId);
  }, [isRunning, solveStep]);

  return { isRunning, setIsRunning, results, history, uField: uFieldRef, rbcs: rbcsRef, reset };
};
