import React, { Suspense } from 'react';
import { Shield } from 'lucide-react';

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class SplineErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: any): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: any, errorInfo: any) {
    console.warn('Spline 3D Scene safely caught by ErrorBoundary:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const Spline = React.lazy(() => import('@splinetool/react-spline'));

interface SplineSceneProps {
  scene?: string;
  className?: string;
  onLoad?: () => void;
}

const FallbackEnclave: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <div className={`relative flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-slate-800 rounded-3xl ${className}`}>
    {/* Holographic Sphere Cyber Fallback */}
    <div className="relative w-36 h-36 flex items-center justify-center mb-4">
      <div
        className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/40 animate-spin"
        style={{ animationDuration: '20s' }}
      />
      <div
        className="absolute inset-2 rounded-full border border-purple-500/30 animate-ping"
        style={{ animationDuration: '3s' }}
      />
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

export const SplineScene: React.FC<SplineSceneProps> = ({
  scene = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode',
  className = 'w-full h-full',
  onLoad,
}) => {
  return (
    <SplineErrorBoundary fallback={<FallbackEnclave className={className} />}>
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
            onLoad={onLoad}
            className="w-full h-full"
          />
        </Suspense>
      </div>
    </SplineErrorBoundary>
  );
};
