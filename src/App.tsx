import React, { useEffect, useState } from 'react';
import { AuthModal } from './components/AuthModal.tsx';
import { CommandPalette } from './components/CommandPalette.tsx';
import { Navbar } from './components/Navbar.tsx';
import { NotificationCenter } from './components/NotificationCenter.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { ToastContainer, ToastMessage } from './components/ToastContainer.tsx';
import { api } from './services/api.ts';
import {
  Alert,
  AuditLog,
  CustodyEvent,
  DashboardMetrics,
  ExamCentre,
  ImmutableBlock,
  Incident,
  IoTDevice,
  NotificationItem,
  Package,
  Paper,
  Question,
  SecurityPolicy,
  TransportRoute,
  User,
  UserRiskProfile,
} from './types/index.ts';
import { AlertsView } from './views/AlertsView.tsx';
import { BlockchainView } from './views/BlockchainView.tsx';
import { CustodyView } from './views/CustodyView.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { DemoModeView } from './views/DemoModeView.tsx';
import { HandoverView } from './views/HandoverView.tsx';
import { IncidentsView } from './views/IncidentsView.tsx';
import { InsiderThreatView } from './views/InsiderThreatView.tsx';
import { LeakAnalysisView } from './views/LeakAnalysisView.tsx';
import {
  AuditTrailView,
  CentresView,
  IotFleetView,
  QuestionBankView,
  SecurityPoliciesView,
} from './views/OtherViews.tsx';
import { PackagesView } from './views/PackagesView.tsx';
import { PapersView } from './views/PapersView.tsx';
import { SecurityVault3DView } from './views/SecurityVault3DView.tsx';
import { SimulatorView } from './views/SimulatorView.tsx';
import { SystemHealthView } from './views/SystemHealthView.tsx';
import { TransportView } from './views/TransportView.tsx';
import { VerificationView } from './views/VerificationView.tsx';
import { WelcomeView } from './views/WelcomeView.tsx';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('welcome');
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'USR-001',
    name: 'Dr. Rajeshwar Sharma',
    email: 'admin@examshield.local',
    role: 'SUPER_ADMIN',
    department: 'National Examination Security Command',
    badgeNumber: 'ESC-ADMIN-01',
    assignedCentreId: 'ALL',
    status: 'ACTIVE',
    mfaEnabled: true,
  });

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [centres, setCentres] = useState<ExamCentre[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [chain, setChain] = useState<ImmutableBlock[]>([]);
  const [custodyEvents, setCustodyEvents] = useState<CustodyEvent[]>([]);
  const [riskProfiles, setRiskProfiles] = useState<UserRiskProfile[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const showToast = (title: string, message: string, severity: Alert['severity'] = 'INFO') => {
    const id = `toast-${Date.now()}-${Math.random().toString().slice(-4)}`;
    setToasts((prev) => [...prev, { id, title, message, severity }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const fetchAllData = async () => {
    try {
      const [
        metricsRes,
        papersRes,
        packagesRes,
        centresRes,
        routesRes,
        alertsRes,
        incidentsRes,
        chainRes,
        custodyRes,
        riskRes,
        questionsRes,
        devicesRes,
        policiesRes,
        auditRes,
        usersRes,
      ] = await Promise.all([
        api.getDashboardMetrics(),
        api.getPapers(),
        api.getPackages(),
        api.getCentres(),
        api.getRoutes(),
        api.getAlerts(),
        api.getIncidents(),
        api.getBlockchainChain(),
        api.getCustodyEvents(),
        api.getUserRiskProfiles(),
        api.getQuestions(),
        api.getIoTDevices(),
        api.getSecurityPolicies(),
        api.getAuditLogs(),
        api.getUsers(),
      ]);

      setMetrics(metricsRes);
      setPapers(papersRes);
      setPackages(packagesRes);
      setCentres(centresRes);
      setRoutes(routesRes);
      setAlerts(alertsRes);
      setIncidents(incidentsRes);
      setChain(chainRes);
      setCustodyEvents(custodyRes);
      setRiskProfiles(riskRes);
      setQuestions(questionsRes);
      setDevices(devicesRes);
      setPolicies(policiesRes);
      setAuditLogs(auditRes);
      setAvailableUsers(usersRes);

      // Generate notifications from active alerts
      const notifs: NotificationItem[] = alertsRes.slice(0, 10).map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        severity: a.severity,
        timestamp: a.timestamp,
        read: a.status === 'RESOLVED',
        linkView: 'incidents',
        linkId: a.id,
      }));
      setNotifications(notifs);
    } catch (err) {
      console.error('Error fetching ExamShield data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // 10-second background polling
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAllData();
  };

  const handleResetDemo = async () => {
    await api.resetDemo();
    showToast('Demonstration Baseline Reset', 'All telemetry, sensor states, and ledger blocks restored.', 'INFO');
    fetchAllData();
  };

  const activeAlertsCount = alerts.filter((a) => a.status === 'OPEN' || a.status === 'INVESTIGATING').length;
  const criticalIncidentsCount = incidents.filter((i) => i.status !== 'CLOSED' && i.status !== 'RESOLVED').length;

  // Render Welcome Page if at root / welcome view
  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen bg-[#F8F7F4] font-sans selection:bg-blue-600 selection:text-white">
        <WelcomeView
          onEnterApp={() => setCurrentView('dashboard')}
          onExploreArchitecture={() => setCurrentView('vault3d')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Editorial Navbar */}
      <Navbar
        currentUser={currentUser}
        availableUsers={availableUsers}
        onSelectUser={setCurrentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onNavigateToView={setCurrentView}
        stats={metrics}
        activeAlertsCount={activeAlertsCount}
        onResetDemo={handleResetDemo}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Body Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Hierarchical Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          currentUserRole={currentUser.role}
          alertsCount={activeAlertsCount}
          incidentsCount={criticalIncidentsCount}
        />

        {/* Dynamic View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0B0F19] scrollbar-thin">
          {isLoading && !metrics ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
              <div className="text-xs font-mono text-slate-400">
                BOOTING ZERO-TRUST EXAMSHIELD PLATFORM & VERIFYING LEDGER...
              </div>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && metrics && (
                <DashboardView
                  metrics={metrics}
                  papers={papers}
                  packages={packages}
                  alerts={alerts}
                  incidents={incidents}
                  centres={centres}
                  currentUser={currentUser}
                  onNavigateToView={setCurrentView}
                  onRefresh={handleRefresh}
                />
              )}

              {currentView === 'papers' && (
                <PapersView
                  papers={papers}
                  questions={questions}
                  currentUser={currentUser}
                  onRefresh={handleRefresh}
                />
              )}

              {currentView === 'packages' && (
                <PackagesView
                  packages={packages}
                  papers={papers}
                  centres={centres}
                  currentUser={currentUser}
                  onRefresh={handleRefresh}
                />
              )}

              {currentView === 'transport' && (
                <TransportView
                  packages={packages}
                  centres={centres}
                  routes={routes}
                  onRefresh={handleRefresh}
                />
              )}

              {currentView === 'verification' && (
                <VerificationView papers={papers} packages={packages} />
              )}

              {currentView === 'handover' && (
                <HandoverView
                  packages={packages}
                  users={availableUsers}
                  currentUser={currentUser}
                  onRefresh={handleRefresh}
                />
              )}

              {currentView === 'blockchain' && (
                <BlockchainView chain={chain} onRefresh={handleRefresh} />
              )}

              {currentView === 'insider' && (
                <InsiderThreatView
                  users={availableUsers}
                  riskProfiles={riskProfiles}
                  onRefresh={handleRefresh}
                />
              )}

              {currentView === 'leak' && (
                <LeakAnalysisView questions={questions} onRefresh={handleRefresh} />
              )}

              {currentView === 'alerts' && (
                <AlertsView
                  alerts={alerts}
                  currentUser={currentUser}
                  onRefresh={handleRefresh}
                  onNavigateToIncidents={() => setCurrentView('incidents')}
                />
              )}

              {currentView === 'incidents' && (
                <IncidentsView
                  incidents={incidents}
                  currentUser={currentUser}
                  onRefresh={handleRefresh}
                />
              )}

              {currentView === 'custody' && (
                <CustodyView
                  custodyEvents={custodyEvents}
                  papers={papers}
                  onRefresh={handleRefresh}
                />
              )}

              {currentView === 'simulator' && (
                <SimulatorView
                  onRefresh={handleRefresh}
                  onNavigateToView={setCurrentView}
                />
              )}

              {currentView === 'demo' && (
                <DemoModeView
                  onNavigateToView={setCurrentView}
                  onRefresh={handleRefresh}
                />
              )}

              {currentView === 'vault3d' && (
                <SecurityVault3DView onNavigateToView={setCurrentView} />
              )}

              {currentView === 'centres' && (
                <CentresView centres={centres} onRefresh={handleRefresh} />
              )}

              {currentView === 'iot' && (
                <IotFleetView devices={devices} onRefresh={handleRefresh} />
              )}

              {currentView === 'policies' && (
                <SecurityPoliciesView policies={policies} />
              )}

              {currentView === 'questions' && (
                <QuestionBankView questions={questions} />
              )}

              {currentView === 'audit' && (
                <AuditTrailView auditLogs={auditLogs} />
              )}

              {currentView === 'health' && (
                <SystemHealthView onRefresh={handleRefresh} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setCurrentView}
        papers={papers}
        packages={packages}
        incidents={incidents}
        centres={centres}
        users={availableUsers}
      />

      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={(id) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
        }}
        onClearAll={() => setNotifications([])}
        onNavigateToView={(view) => {
          setCurrentView(view);
          setIsNotificationsOpen(false);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        availableUsers={availableUsers}
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
        onLoginSuccess={() => showToast('Session Granted', `Authenticated as ${currentUser.name}`, 'INFO')}
      />

      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
