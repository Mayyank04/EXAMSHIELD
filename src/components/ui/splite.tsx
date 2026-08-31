import React, { Suspense, useState } from 'react';
import { Box, CheckCircle2, Cpu, Globe, Lock, Shield, Sparkles } from 'lucide-react';

const Spline = React.lazy(() => import('@splinetool/react-spline'));

interface SplineSceneProps {
  scene?: string;
  className?: string;
  onLoad?: () => void;
}

export const SplineScene: React.FC<SplineSceneProps> = ({
  scene = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode',
  className = 'w-full h-full',
  onLoad,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleSplineLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  if (hasError) {
    return (
      <div className={`relative flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-slate-800 rounded-3xl ${className}`}>
        {/* Holographic Sphere Cyber Fallback */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/40 animate-spin" style={{ animationDuration: '20s' }} />
          <div className="absolute inset-2 rounded-full border border-purple-500/30 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-cyan-400/20 border border-cyan-400/50 backdrop-blur-xl flex items-center justify-center text-cyan-300 shadow-[0_0_30px_rgba(0,217,255,0.3)]">
            <Shield className="w-10 h-10" />
          </div>
        </div>
        <h4 className="text-sm font-bold text-white font-heading tracking-wide">
          Sovereign Security Vault Node
        </h4>
        <p className="text-xs text-slate-400 max-w-xs mt-1 font-sans">
          Hardware cryptographic enclave active. Monitoring 30 IoT sentinels & 10 armored corridors.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className} overflow-hidden`}>
      <Suspense
        fallback={
          <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center space-y-3 bg-slate-950/50 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <span className="text-[11px] font-mono text-cyan-400 tracking-wider">
              LOADING 3D SECURITY ENCLAVE...
            </span>
          </div>
        }
      >
        <Spline
          scene={scene}
          onLoad={handleSplineLoad}
          onError={() => setHasError(true)}
          className="w-full h-full"
        />
      </Suspense>
    </div>
  );
};
