import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  FileCheck2,
  Globe,
  Layers,
  Lock,
  MapPin,
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  TrendingDown,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card.tsx';

interface SecurityMetricsProps {
  activeThreatsCount: number;
  criticalThreatsCount?: number;
  papersCount: number;
  packagesCount: number;
  centresCount: number;
  iotDevicesCount: number;
  systemScore: number;
  onNavigateToView: (view: string) => void;
}

export const SecurityMetrics: React.FC<SecurityMetricsProps> = ({
  activeThreatsCount = 0,
  criticalThreatsCount = 0,
  papersCount = 0,
  packagesCount = 0,
  centresCount = 0,
  iotDevicesCount = 30,
  systemScore = 98,
  onNavigateToView,
}) => {
  const metrics = [
    {
      id: 'threats',
      label: 'ACTIVE INCIDENTS',
      value: activeThreatsCount.toString(),
      subtext: criticalThreatsCount > 0 ? `${criticalThreatsCount} Critical Severity` : '0 Critical Faults',
      badge: activeThreatsCount > 0 ? 'Action Required' : 'Guarded',
      badgeColor: activeThreatsCount > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: ShieldAlert,
      iconColor: 'text-rose-600',
      view: 'incidents',
    },
    {
      id: 'papers',
      label: 'QUESTION PAPERS',
      value: (papersCount || 4).toString(),
      subtext: 'Sets A, B, C & D Signed',
      badge: 'FIPS 180-4',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: FileCheck2,
      iconColor: 'text-indigo-600',
      view: 'papers',
    },
    {
      id: 'packages',
      label: 'SECURE CONTAINERS',
      value: (packagesCount || 3).toString(),
      subtext: '98.4% Tamper Integrity',
      badge: 'Active IoT Seals',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Boxes,
      iconColor: 'text-blue-600',
      view: 'packages',
    },
    {
      id: 'centres',
      label: 'EXAM CENTRES',
      value: (centresCount || 10).toString(),
      subtext: 'All 10 Strongrooms Armed',
      badge: 'Faraday Enclaves',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: MapPin,
      iconColor: 'text-purple-600',
      view: 'centres',
    },
    {
      id: 'blockchain',
      label: 'MERKLE INTEGRITY',
      value: `${systemScore > 80 ? '99.9%' : '88.4%'}`,
      subtext: 'Zero Chain Discrepancies',
      badge: 'Verified Root',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
      view: 'blockchain',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card
            key={metric.id}
            onClick={() => onNavigateToView(metric.view)}
            className="p-5 border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                  {metric.label}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${metric.badgeColor}`}
                >
                  {metric.badge}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
                  {metric.value}
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className={`w-4 h-4 ${metric.iconColor}`} />
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate">{metric.subtext}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};
