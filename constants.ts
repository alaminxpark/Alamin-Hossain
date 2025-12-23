
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

export const COLORS = {
  primary: '#1e40af', // Blue 800
  secondary: '#9333ea', // Purple 600
  accent: '#10b981', // Emerald 500
  critical: '#ef4444', // Red 500
};
