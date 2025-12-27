
import { VariableInfo } from './types';

export const NR = 30; // Radial resolution
export const NZ = 80; // Axial resolution
export const RHO = 1060.0; // Blood density (kg/m^3)
export const MU_BASE = 0.0012; // Plasma viscosity (Pa·s)
export const DT = 0.001; // Simulation time step
export const WAVE_VELOCITY = 7.5; // Pulse wave velocity (m/s)

export const CITY_AQI_DATA = [
  { name: 'Dhaka', aqi: 285, status: 'Very Unhealthy', color: '#7e0023', avgO2: 245, avgCO2: 210, dust: 180, chemicals: 95 },
  { name: 'Delhi', aqi: 342, status: 'Hazardous', color: '#af2d24', avgO2: 238, avgCO2: 205, dust: 210, chemicals: 115 },
  { name: 'Shanghai', aqi: 158, status: 'Unhealthy', color: '#ff0000', avgO2: 252, avgCO2: 215, dust: 85, chemicals: 60 },
  { name: 'London', aqi: 42, status: 'Good', color: '#00e400', avgO2: 265, avgCO2: 225, dust: 12, chemicals: 18 },
  { name: 'New York', aqi: 35, status: 'Good', color: '#00e400', avgO2: 268, avgCO2: 228, dust: 9, chemicals: 14 },
  { name: 'Tokyo', aqi: 38, status: 'Good', color: '#00e400', avgO2: 270, avgCO2: 230, dust: 11, chemicals: 16 },
  { name: 'Mexico City', aqi: 165, status: 'Unhealthy', color: '#ff0000', avgO2: 248, avgCO2: 212, dust: 75, chemicals: 65 },
  { name: 'Lagos', aqi: 182, status: 'Unhealthy', color: '#ff0000', avgO2: 242, avgCO2: 208, dust: 140, chemicals: 55 },
  { name: 'Cairo', aqi: 195, status: 'Unhealthy', color: '#ff0000', avgO2: 240, avgCO2: 206, dust: 160, chemicals: 58 },
  { name: 'Paris', aqi: 52, status: 'Moderate', color: '#ffff00', avgO2: 262, avgCO2: 222, dust: 18, chemicals: 22 },
];

export const VARIABLE_REGISTRY: VariableInfo[] = [
  {
    id: 'hct',
    name: 'Hematocrit (Hct)',
    unit: '%',
    desc: 'The cellular fraction of blood. It determines the oxygen-carrying capacity but also exponentially increases non-Newtonian viscosity.',
    clinical: 'Directly influences the Reynolds number and shear stress thresholds. Vital for understanding erythrocytosis-induced hypertension.',
    riskTitle: 'Thrombotic Hyperviscosity',
    riskDesc: 'Elevated Hct leads to sluggish flow in micro-capillaries, significantly increasing the likelihood of spontaneous clot formation and stroke.',
    equation: '\\mu_{eff} = \\mu_p (1 - 0.5 k H)^{-2}',
    impactCurve: Array.from({ length: 15 }, (_, i) => ({ x: 20 + i * 4, y: Math.pow(1 - 0.5 * 3.5 * (0.2 + i * 0.04), -2.2), label: (20 + i * 4).toString() })),
    xAxisLabel: 'Hct Percentage',
    yAxisLabel: 'Relative Viscosity',
    meterValue: 45
  },
  {
    id: 'stenosis',
    name: 'Stenosis Severity',
    unit: '% Area',
    desc: 'Geometric obstruction within the arterial lumen. This variable triggers the Navier-Stokes local acceleration solver.',
    clinical: 'Significant stenosis (>50%) creates a jet effect, increasing localized wall shear stress and potential for plaque rupture.',
    riskTitle: 'Critical Perfusion Loss',
    riskDesc: 'As narrowing approaches 75%, distal pressure collapses (Critical Stenosis). Tissue necrosis and severe ischemia follow rapidly.',
    equation: 'R(z) = R_0 (1 - s \\cdot cos^2(\\pi z / L))',
    impactCurve: Array.from({ length: 11 }, (_, i) => ({ x: i * 10, y: 1 / Math.pow(1 - (i * 0.08), 4), label: (i * 10).toString() })),
    xAxisLabel: 'Vessel Narrowing %',
    yAxisLabel: 'Resistance Factor',
    meterValue: 15
  },
  {
    id: 'hr',
    name: 'Heart Rate (HR)',
    unit: 'BPM',
    desc: 'The oscillatory frequency of the pressure gradient. It defines the Womersley number (α) of the simulation.',
    clinical: 'Higher frequencies reduce diastolic time, which is critical for coronary artery perfusion during the pulse cycle.',
    riskTitle: 'Tachycardic Strain',
    riskDesc: 'Persistent rates above 100 BPM cause myocardial metabolic exhaustion and increased pulsatile wall fatigue in large elastic arteries.',
    equation: '\\alpha = R \\sqrt{\\frac{\\omega \\rho}{\\mu}}',
    impactCurve: Array.from({ length: 10 }, (_, i) => ({ x: 40 + i * 15, y: Math.pow(1.012, i * 15) * 50, label: (40 + i * 15).toString() })),
    xAxisLabel: 'Heart Rate (BPM)',
    yAxisLabel: 'O2 Demand',
    meterValue: 72
  },
  {
    id: 'aqi',
    name: 'Air Quality Index',
    unit: 'AQI',
    desc: 'Local environmental toxicant load. Acts as a pulmonary gas-exchange efficiency multiplier in our metabolic solver.',
    clinical: 'Particulates cross the blood-air barrier, inducing systemic oxidative stress and altering vasomotor tone.',
    riskTitle: 'Pulmonary Hypoxia',
    riskDesc: 'High pollutant loads act as a biochemical shunt, reducing oxygen saturation and forcing the heart to increase workload (Risk Index spike).',
    equation: '\\eta_{env} = 1 - \\Phi(AQI, \\text{Dust}, \\text{NOx})',
    impactCurve: Array.from({ length: 10 }, (_, i) => ({ x: i * 50, y: Math.max(0.3, 1 - (i * 0.07)), label: (i * 50).toString() })),
    xAxisLabel: 'Urban AQI',
    yAxisLabel: 'Lung Efficiency',
    meterValue: 88
  },
  {
    id: 'cholesterol',
    name: 'Total Cholesterol',
    unit: 'mg/dL',
    desc: 'Serum lipid profile acting as a viscous modifier for the plasma component of the blood fluid.',
    clinical: 'Long-term elevations contribute to plaque formation, but acutely they slightly increase the base Newtonian viscosity (μ).',
    riskTitle: 'Atherogenic Loading',
    riskDesc: 'Concentrations >240 mg/dL correlate with high-viscosity "sludging" and long-term reduction in nitric oxide mediated vasodilation.',
    equation: '\\mu_{plasma} = \\mu_{base} (1 + \\gamma C)',
    impactCurve: Array.from({ length: 10 }, (_, i) => ({ x: 100 + i * 30, y: 1 + (i * 0.05), label: (100 + i * 30).toString() })),
    xAxisLabel: 'Serum mg/dL',
    yAxisLabel: 'Plasma μ',
    meterValue: 195
  },
  {
    id: 'radius',
    name: 'Vessel Radius',
    unit: 'mm',
    desc: 'The fundamental characteristic dimension for fluid flow. Governs the fourth-power law of volumetric flux.',
    clinical: 'Vasodilation and Vasoconstriction are the primary methods the body uses to regulate systemic blood pressure.',
    riskTitle: 'Vasospastic Shock',
    riskDesc: 'Sudden reduction in radius (spasm) causes catastrophic pressure spikes and can lead to localized infarction even without plaque.',
    equation: 'Q = \\frac{\\pi R^4 \\Delta P}{8 \\mu L}',
    impactCurve: Array.from({ length: 10 }, (_, i) => ({ x: 1 + i * 0.5, y: Math.pow(1 + i * 0.5, 4), label: (1 + i * 0.5).toString() })),
    xAxisLabel: 'Lumen Radius (mm)',
    yAxisLabel: 'Flow Flux (Q)',
    meterValue: 2.5
  }
];

export const ALGORITHM_STEPS = [
  {
    title: 'Finite-Difference NS Solver',
    math: 'ρ(∂u/∂t) = -∇P + μ∇²u',
    desc: 'We compute blood velocity at every point in a 2D cross-section using the Navier-Stokes momentum equations. This allows for real-time visualization of flow jets and stagnations.',
    icon: '🌀'
  },
  {
    title: 'Quemada Non-Newtonian Flow',
    math: 'μ_eff = μ_p(1 - 0.5kH)⁻²',
    desc: 'Blood is not a simple fluid. Our engine calculates effective viscosity as a function of local shear rate and hematocrit, capturing the "sludging" effect in low-flow areas.',
    icon: '🩸'
  },
  {
    title: 'Metabolic Gas Exchange',
    math: 'VO₂ = Q × Hct × 1.34 × η_env',
    desc: 'The metabolic axis calculates O2 consumption and CO2 production by integrating cardiac output (Q) with environmental efficiency (η_env) derived from local AQI data.',
    icon: '🫁'
  }
];
