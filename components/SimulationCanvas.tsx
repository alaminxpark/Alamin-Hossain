
import React, { useRef, useEffect } from 'react';
import { NR, NZ } from '../constants';

interface Props {
  uField: React.MutableRefObject<Float32Array[]>;
  rbcs: React.MutableRefObject<{ z: number; r: number }[]>;
  isRunning: boolean;
}

const getJetColor = (v: number, max: number) => {
  let x = Math.min(Math.max(v / max, 0), 1);
  let r = Math.min(Math.max(1.5 - Math.abs(x * 4 - 3), 0), 1) * 255;
  let g = Math.min(Math.max(1.5 - Math.abs(x * 4 - 2), 0), 1) * 255;
  let b = Math.min(Math.max(1.5 - Math.abs(x * 4 - 1), 0), 1) * 255;
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
};

const SimulationCanvas: React.FC<Props> = ({ uField, rbcs, isRunning }) => {
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const vectorRef = useRef<HTMLCanvasElement>(null);
  const rbcRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fctx = fieldRef.current?.getContext('2d');
    const vctx = vectorRef.current?.getContext('2d');
    const rctx = rbcRef.current?.getContext('2d');
    if (!fctx || !vctx || !rctx) return;

    let animationId: number;

    const render = () => {
      const w = fieldRef.current!.width;
      const h = fieldRef.current!.height;
      const dw = w / NZ;
      const dh = h / NR;
      const limit = 0.25;

      const currentU = uField.current;

      // 1. Velocity Field
      fctx.clearRect(0, 0, w, h);
      for (let i = 0; i < NR; i++) {
        for (let j = 0; j < NZ; j++) {
          fctx.fillStyle = getJetColor(currentU[i][j], limit);
          fctx.fillRect(j * dw, (NR - 1 - i) * dh, dw + 1, dh + 1);
        }
      }

      // 2. Vectors
      vctx.clearRect(0, 0, w, h);
      vctx.strokeStyle = 'rgba(255,255,255,0.2)';
      vctx.lineWidth = 1;
      for (let i = 2; i < NR; i += 6) {
        for (let j = 2; j < NZ; j += 8) {
          const vx = j * dw;
          const vy = (NR - 1 - i) * dh;
          const len = (currentU[i][j] / limit) * 20;
          vctx.beginPath();
          vctx.moveTo(vx, vy);
          vctx.lineTo(vx + len, vy);
          vctx.stroke();
        }
      }

      // 3. RBC Particles
      rctx.clearRect(0, 0, w, h);
      rctx.fillStyle = 'rgba(255, 60, 60, 0.7)';
      
      const currentRbcs = rbcs.current;
      if (currentRbcs.length < 250) {
        currentRbcs.push({ z: Math.random(), r: Math.random() });
      }

      currentRbcs.forEach(p => {
        const idxR = Math.min(Math.floor(p.r * (NR - 1)), NR - 1);
        const idxZ = Math.min(Math.floor(p.z * (NZ - 1)), NZ - 1);
        
        if (isRunning) {
          p.z += currentU[idxR][idxZ] * 0.08;
          if (p.z > 1) p.z = 0;
        }
        
        rctx.beginPath();
        rctx.arc(p.z * w, h - p.r * h, 1.8, 0, Math.PI * 2);
        rctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [isRunning, uField, rbcs]);

  return (
    <div className="relative w-full h-[320px] bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-2xl">
      <canvas ref={fieldRef} className="absolute inset-0 w-full h-full" width={800} height={300} />
      <canvas ref={vectorRef} className="absolute inset-0 w-full h-full opacity-40" width={800} height={300} />
      <canvas ref={rbcRef} className="absolute inset-0 w-full h-full" width={800} height={300} />
      
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 h-4/5">
        <span className="text-[10px] text-white mono font-bold">0.25</span>
        <div className="w-2.5 flex-grow border border-white/20 bg-gradient-to-t from-blue-900 via-cyan-400 to-red-900 rounded-full" />
        <span className="text-[10px] text-white mono font-bold">0.00</span>
      </div>
    </div>
  );
};

export default SimulationCanvas;
