
// Variable metadata for registry and presentation
export interface VariableInfo {
  id: string;
  name: string;
  unit: string;
  desc: string;
  clinical: string;
  riskTitle: string;
  riskDesc: string;
  equation: string; // LaTeX-style equation
  impactCurve: { x: number; y: number; label: string }[];
  xAxisLabel: string;
  yAxisLabel: string;
  meterValue: number; // For the opening page dashboard
}

export interface SimulationParams {
  hct: number;
  hr: number;
  cholesterol: number;
  vesselRadius: number;
  aqi: number;
  cityName: string;
  stenosisSeverity: number; // Percentage 0-90
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
  basalFlow: number; // Volume flow rate in L/min
  pollutantLoad: number;
}

export interface HistoryPoint {
  time: number;
  pressure: number;
  rq: number;
  heartbeat: number;
  pollutantLoad: number; // Normalized dust + chemicals
  lungStress: number;    // 1 - aqiImpact
  riskIndex: number;
  basalFlow: number;
}
