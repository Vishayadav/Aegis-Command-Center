import React from 'react';
import { Shield, LayoutDashboard, BrainCircuit, MessageSquare, ShieldCheck, ChevronRight, Zap } from 'lucide-react';

type Page = 'overview' | 'ml' | 'llm' | 'governance';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (p: Page) => void;
  triggerDrift: boolean;
  triggerHallucination: boolean;
  triggerCost: boolean;
  triggerSafety: boolean;
  onToggleDrift: () => void;
  onToggleHallucination: () => void;
  onToggleCost: () => void;
  onToggleSafety: () => void;
  alertCount: number;
}

const navItems = [
  { id: 'overview' as Page, label: 'Command Center', icon: LayoutDashboard },
  { id: 'ml' as Page, label: 'ML Observability', icon: BrainCircuit },
  { id: 'llm' as Page, label: 'LLM Observability', icon: MessageSquare },
  { id: 'governance' as Page, label: 'Governance', icon: ShieldCheck },
];

interface SimToggleProps {
  label: string;
  active: boolean;
  onToggle: () => void;
  color: string;
}

function SimToggle({ label, active, onToggle, color }: SimToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all border ${
        active
          ? `border-${color}-border bg-${color}-dim text-${color}`
          : 'border-border bg-surface-2 text-foreground-muted hover:bg-surface-hover hover:text-foreground'
      }`}
      style={{
        borderColor: active ? undefined : undefined,
      }}
    >
      <span>{label}</span>
      <span className={`w-2 h-2 rounded-full ${active ? 'bg-danger animate-pulse' : 'bg-surface-3'}`} />
    </button>
  );
}

export function Sidebar({
  currentPage,
  onNavigate,
  triggerDrift,
  triggerHallucination,
  triggerCost,
  triggerSafety,
  onToggleDrift,
  onToggleHallucination,
  onToggleCost,
  onToggleSafety,
  alertCount,
}: SidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 h-screen sticky top-0 flex flex-col border-r border-border bg-sidebar overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-success border-2 border-sidebar animate-live-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground tracking-wide">AegisAI</div>
            <div className="text-[10px] text-foreground-subtle font-mono uppercase tracking-widest">AI Governance</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 flex-1 space-y-1">
        <div className="section-label px-3 mb-3">Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`nav-item w-full text-left ${isActive ? 'nav-item-active' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.id === 'governance' && alertCount > 0 && (
                <span className="ml-auto text-[10px] font-mono font-bold bg-danger/20 text-danger border border-danger/30 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {alertCount}
                </span>
              )}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </button>
          );
        })}
      </nav>

      {/* Simulation Controls */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-3 h-3 text-warning" />
          <span className="section-label">Simulation</span>
        </div>
        <div className="space-y-2">
          <SimToggle label="ML Drift" active={triggerDrift} onToggle={onToggleDrift} color="danger" />
          <SimToggle label="Hallucination" active={triggerHallucination} onToggle={onToggleHallucination} color="danger" />
          <SimToggle label="High Token Cost" active={triggerCost} onToggle={onToggleCost} color="warning" />
          <SimToggle label="Safety Incident" active={triggerSafety} onToggle={onToggleSafety} color="danger" />
        </div>
        <p className="text-[10px] text-foreground-subtle mt-3 font-mono leading-relaxed">
          Toggle to simulate adverse conditions for demo purposes
        </p>
      </div>

      {/* Version */}
      <div className="px-5 py-3 border-t border-border">
        <div className="text-[10px] font-mono text-foreground-subtle">
          v2.4.1 · Production · Banking
        </div>
      </div>
    </aside>
  );
}
