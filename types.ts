
export interface SimulationParams {
  hct: number;
  hr: number;
  cholesterol: number;
  vesselRadius: number;
  aqi: number;
  cityName: string;
}

export interface SimulationResult {
  maxV: number;
  dpDz: number;
  maxG: number;
  wavelength: number;
  o2Cons: number;
  co2Prod: number;
  time: number;
  riskIndex: number;
  wallStress: number;
  peakPressure: number;
  heartbeat: number; // ECG signal value
  aqiImpact: number; // Efficiency coefficient
}

export interface HistoryPoint {
  time: number;
  pressure: number;
  rq: number;
  heartbeat: number;
  pollutantLoad: number; // Normalized dust + chemicals
  lungStress: number;    // 1 - aqiImpact
  riskIndex: number;
}
