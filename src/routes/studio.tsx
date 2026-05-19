import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Inbox,
  Radio,
  Users,
  UserCog,
  Settings,
  FileCheck2,
  Sparkles,
  Search,
  Bell,
  Send,
  Check,
  X,
  Pencil,
  ShieldCheck,
  MessageSquare,
  Mail,
  Instagram,
  Phone,
  MessageCircle,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { useState, type CSSProperties, type ReactNode } from "react";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Design Direction Studio — AI Reception" },
      {
        name: "description",
        content: "Compare three premium visual directions for AI Reception SaaS.",
      },
    ],
  }),
  component: StudioPage,
});

/* ─────────── Direction tokens (scoped via CSS vars) ─────────── */

type Mode = "light" | "dark";
type DirTokens = {
  bg: string;
  card: string;
  cardElev: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryFg: string;
  primarySoft: string;
  ai: string;
  aiSoft: string;
  success: string;
  warning: string;
  danger: string;
  planned: string;
  sidebar: string;
  sidebarActive: string;
  input: string;
  tableHead: string;
  rowHover: string;
  shadowCard: string;
  shadowElev: string;
  radius: string;
  font: string;
};

type Direction = {
  id: "A" | "B" | "C";
  name: string;
  tagline: string;
  best: string;
  modes: Record<Mode, DirTokens>;
};

const DIRECTIONS: Direction[] = [
  {
    id: "A",
    name: "Executive SaaS",
    tagline: "Enterprise trust, royal blue, crisp white cards.",
    best: "B2B decision-makers, clinics, managers.",
    modes: {
      light: {
        bg: "oklch(0.972 0.008 250)",
        card: "#ffffff",
        cardElev: "#ffffff",
        text: "oklch(0.18 0.04 268)",
        textMuted: "oklch(0.45 0.02 262)",
        textSubtle: "oklch(0.60 0.02 262)",
        border: "oklch(0.91 0.012 260)",
        borderStrong: "oklch(0.85 0.014 260)",
        primary: "oklch(0.42 0.20 268)",
        primaryFg: "#fff",
        primarySoft: "oklch(0.95 0.04 268)",
        ai: "oklch(0.50 0.18 280)",
        aiSoft: "oklch(0.96 0.03 280)",
        success: "oklch(0.58 0.14 158)",
        warning: "oklch(0.72 0.15 75)",
        danger: "oklch(0.58 0.18 22)",
        planned: "oklch(0.62 0.02 262)",
        sidebar: "oklch(0.985 0.006 256)",
        sidebarActive: "oklch(0.94 0.04 268)",
        input: "#fff",
        tableHead: "oklch(0.97 0.008 256)",
        rowHover: "oklch(0.97 0.012 256)",
        shadowCard: "0 1px 0 rgba(20,30,60,.04), 0 8px 24px -12px rgba(20,30,60,.18)",
        shadowElev: "0 2px 4px rgba(20,30,60,.06), 0 24px 48px -20px rgba(20,30,60,.28)",
        radius: "10px",
        font: "'Inter', system-ui, sans-serif",
      },
      dark: {
        bg: "oklch(0.16 0.03 265)",
        card: "oklch(0.21 0.03 265)",
        cardElev: "oklch(0.24 0.03 265)",
        text: "oklch(0.97 0.005 250)",
        textMuted: "oklch(0.72 0.02 260)",
        textSubtle: "oklch(0.58 0.02 260)",
        border: "rgba(255,255,255,.10)",
        borderStrong: "rgba(255,255,255,.16)",
        primary: "oklch(0.66 0.18 268)",
        primaryFg: "oklch(0.12 0.02 265)",
        primarySoft: "oklch(0.30 0.10 268)",
        ai: "oklch(0.70 0.17 285)",
        aiSoft: "oklch(0.30 0.10 285)",
        success: "oklch(0.72 0.16 158)",
        warning: "oklch(0.80 0.16 75)",
        danger: "oklch(0.66 0.20 25)",
        planned: "oklch(0.55 0.02 260)",
        sidebar: "oklch(0.18 0.03 265)",
        sidebarActive: "oklch(0.30 0.10 268)",
        input: "oklch(0.20 0.03 265)",
        tableHead: "oklch(0.19 0.03 265)",
        rowHover: "oklch(0.22 0.03 265)",
        shadowCard: "0 1px 0 rgba(0,0,0,.4), 0 12px 28px -16px rgba(0,0,0,.6)",
        shadowElev: "0 4px 8px rgba(0,0,0,.4), 0 28px 56px -22px rgba(0,0,0,.7)",
        radius: "10px",
        font: "'Inter', system-ui, sans-serif",
      },
    },
  },
  {
    id: "B",
    name: "Warm Premium SMB",
    tagline: "Warm neutrals, indigo + emerald, friendly premium.",
    best: "Restaurants, salons, clinics, local agencies.",
    modes: {
      light: {
        bg: "oklch(0.972 0.012 80)",
        card: "#ffffff",
        cardElev: "oklch(0.99 0.006 80)",
        text: "oklch(0.22 0.025 60)",
        textMuted: "oklch(0.48 0.02 60)",
        textSubtle: "oklch(0.62 0.018 60)",
        border: "oklch(0.91 0.014 70)",
        borderStrong: "oklch(0.85 0.016 70)",
        primary: "oklch(0.50 0.18 270)",
        primaryFg: "#fff",
        primarySoft: "oklch(0.95 0.04 270)",
        ai: "oklch(0.55 0.17 290)",
        aiSoft: "oklch(0.96 0.03 290)",
        success: "oklch(0.60 0.15 158)",
        warning: "oklch(0.74 0.15 70)",
        danger: "oklch(0.60 0.17 25)",
        planned: "oklch(0.60 0.02 70)",
        sidebar: "oklch(0.965 0.014 75)",
        sidebarActive: "oklch(0.94 0.05 270)",
        input: "#fff",
        tableHead: "oklch(0.96 0.014 75)",
        rowHover: "oklch(0.965 0.018 75)",
        shadowCard: "0 1px 0 rgba(70,55,30,.05), 0 10px 28px -14px rgba(70,55,30,.18)",
        shadowElev: "0 2px 4px rgba(70,55,30,.07), 0 26px 52px -22px rgba(70,55,30,.28)",
        radius: "14px",
        font: "'Plus Jakarta Sans', 'Inter', sans-serif",
      },
      dark: {
        bg: "oklch(0.18 0.018 60)",
        card: "oklch(0.22 0.018 60)",
        cardElev: "oklch(0.25 0.02 60)",
        text: "oklch(0.96 0.008 80)",
        textMuted: "oklch(0.74 0.014 70)",
        textSubtle: "oklch(0.60 0.014 70)",
        border: "rgba(255,240,220,.08)",
        borderStrong: "rgba(255,240,220,.14)",
        primary: "oklch(0.68 0.16 270)",
        primaryFg: "oklch(0.14 0.02 60)",
        primarySoft: "oklch(0.32 0.10 270)",
        ai: "oklch(0.72 0.16 290)",
        aiSoft: "oklch(0.32 0.10 290)",
        success: "oklch(0.74 0.16 158)",
        warning: "oklch(0.80 0.16 75)",
        danger: "oklch(0.68 0.18 25)",
        planned: "oklch(0.55 0.014 70)",
        sidebar: "oklch(0.20 0.018 60)",
        sidebarActive: "oklch(0.32 0.10 270)",
        input: "oklch(0.22 0.018 60)",
        tableHead: "oklch(0.21 0.018 60)",
        rowHover: "oklch(0.24 0.02 60)",
        shadowCard: "0 1px 0 rgba(0,0,0,.4), 0 12px 28px -16px rgba(0,0,0,.55)",
        shadowElev: "0 4px 8px rgba(0,0,0,.4), 0 28px 56px -22px rgba(0,0,0,.65)",
        radius: "14px",
        font: "'Plus Jakarta Sans', 'Inter', sans-serif",
      },
    },
  },
  {
    id: "C",
    name: "AI Operations Pro",
    tagline: "Refined blue/violet AI accents, modern operations cockpit.",
    best: "AI-assisted reception, operator workflows.",
    modes: {
      light: {
        bg: "oklch(0.965 0.012 256)",
        card: "#ffffff",
        cardElev: "oklch(0.99 0.006 256)",
        text: "oklch(0.16 0.04 268)",
        textMuted: "oklch(0.46 0.02 262)",
        textSubtle: "oklch(0.60 0.02 262)",
        border: "oklch(0.91 0.012 260)",
        borderStrong: "oklch(0.85 0.014 260)",
        primary: "oklch(0.48 0.20 268)",
        primaryFg: "#fff",
        primarySoft: "oklch(0.95 0.045 268)",
        ai: "oklch(0.56 0.20 295)",
        aiSoft: "oklch(0.96 0.035 295)",
        success: "oklch(0.60 0.14 158)",
        warning: "oklch(0.74 0.15 75)",
        danger: "oklch(0.60 0.18 22)",
        planned: "oklch(0.60 0.02 262)",
        sidebar: "oklch(0.985 0.008 258)",
        sidebarActive: "oklch(0.94 0.045 268)",
        input: "#fff",
        tableHead: "oklch(0.97 0.010 256)",
        rowHover: "oklch(0.97 0.014 256)",
        shadowCard: "0 1px 0 rgba(30,40,80,.05), 0 12px 28px -14px rgba(30,40,80,.20)",
        shadowElev: "0 2px 4px rgba(30,40,80,.07), 0 28px 56px -22px rgba(30,40,80,.30)",
        radius: "14px",
        font: "'Plus Jakarta Sans', 'Inter', sans-serif",
      },
      dark: {
        bg: "oklch(0.115 0.022 265)",
        card: "oklch(0.175 0.022 265)",
        cardElev: "oklch(0.21 0.024 265)",
        text: "oklch(0.97 0.005 250)",
        textMuted: "oklch(0.72 0.02 260)",
        textSubtle: "oklch(0.58 0.02 260)",
        border: "rgba(255,255,255,.09)",
        borderStrong: "rgba(255,255,255,.16)",
        primary: "oklch(0.66 0.175 268)",
        primaryFg: "oklch(0.115 0.022 265)",
        primarySoft: "oklch(0.30 0.10 268)",
        ai: "oklch(0.72 0.17 295)",
        aiSoft: "oklch(0.30 0.10 295)",
        success: "oklch(0.72 0.16 158)",
        warning: "oklch(0.80 0.16 75)",
        danger: "oklch(0.68 0.20 25)",
        planned: "oklch(0.55 0.02 260)",
        sidebar: "oklch(0.135 0.022 265)",
        sidebarActive: "oklch(0.30 0.10 268)",
        input: "oklch(0.20 0.024 265)",
        tableHead: "oklch(0.19 0.022 265)",
        rowHover: "oklch(0.22 0.024 265)",
        shadowCard: "0 1px 0 rgba(0,0,0,.4), 0 12px 28px -16px rgba(0,0,0,.65)",
        shadowElev: "0 4px 8px rgba(0,0,0,.45), 0 28px 56px -22px rgba(0,0,0,.75)",
        radius: "14px",
        font: "'Plus Jakarta Sans', 'Inter', sans-serif",
      },
    },
  },
];

function tokensToStyle(t: DirTokens): CSSProperties {
  return {
    // expose as locally-scoped CSS vars
    ["--s-bg" as any]: t.bg,
    ["--s-card" as any]: t.card,
    ["--s-card-elev" as any]: t.cardElev,
    ["--s-text" as any]: t.text,
    ["--s-muted" as any]: t.textMuted,
    ["--s-subtle" as any]: t.textSubtle,
    ["--s-border" as any]: t.border,
    ["--s-border-strong" as any]: t.borderStrong,
    ["--s-primary" as any]: t.primary,
    ["--s-primary-fg" as any]: t.primaryFg,
    ["--s-primary-soft" as any]: t.primarySoft,
    ["--s-ai" as any]: t.ai,
    ["--s-ai-soft" as any]: t.aiSoft,
    ["--s-success" as any]: t.success,
    ["--s-warning" as any]: t.warning,
    ["--s-danger" as any]: t.danger,
    ["--s-planned" as any]: t.planned,
    ["--s-sidebar" as any]: t.sidebar,
    ["--s-sidebar-active" as any]: t.sidebarActive,
    ["--s-input" as any]: t.input,
    ["--s-tablehead" as any]: t.tableHead,
    ["--s-row-hover" as any]: t.rowHover,
    ["--s-shadow-card" as any]: t.shadowCard,
    ["--s-shadow-elev" as any]: t.shadowElev,
    ["--s-radius" as any]: t.radius,
    fontFamily: t.font,
    background: t.bg,
    color: t.text,
  };
}

/* ─────────── Reusable mini previews (use scoped vars) ─────────── */

function Card({
  children,
  className = "",
  style,
  accent,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  accent?: string;
}) {
  return (
    <div
      className={"relative " + className}
      style={{
        background: "var(--s-card)",
        border: "1px solid var(--s-border)",
        borderRadius: "var(--s-radius)",
        boxShadow: "var(--s-shadow-card)",
        ...style,
      }}
    >
      {accent && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            borderRadius: "var(--s-radius) var(--s-radius) 0 0",
            background: `linear-gradient(90deg, transparent, ${accent} 18%, ${accent} 82%, transparent)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

function Pill({
  tone = "muted",
  children,
}: {
  tone?: "primary" | "ai" | "success" | "warning" | "danger" | "planned" | "muted";
  children: ReactNode;
}) {
  const map: Record<string, { bg: string; fg: string }> = {
    primary: {
      bg: "color-mix(in oklab, var(--s-primary) 14%, transparent)",
      fg: "var(--s-primary)",
    },
    ai: { bg: "color-mix(in oklab, var(--s-ai) 14%, transparent)", fg: "var(--s-ai)" },
    success: {
      bg: "color-mix(in oklab, var(--s-success) 16%, transparent)",
      fg: "var(--s-success)",
    },
    warning: {
      bg: "color-mix(in oklab, var(--s-warning) 22%, transparent)",
      fg: "var(--s-warning)",
    },
    danger: { bg: "color-mix(in oklab, var(--s-danger) 16%, transparent)", fg: "var(--s-danger)" },
    planned: {
      bg: "color-mix(in oklab, var(--s-planned) 18%, transparent)",
      fg: "var(--s-planned)",
    },
    muted: { bg: "color-mix(in oklab, var(--s-muted) 14%, transparent)", fg: "var(--s-muted)" },
  };
  const c = map[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: c.bg,
        color: c.fg,
        fontSize: 10.5,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 999,
        letterSpacing: ".01em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Btn({
  kind = "primary",
  icon,
  children,
}: {
  kind?: "primary" | "secondary" | "ghost" | "ai";
  icon?: ReactNode;
  children: ReactNode;
}) {
  const styles: Record<string, CSSProperties> = {
    primary: {
      background: "var(--s-primary)",
      color: "var(--s-primary-fg)",
      border: "1px solid transparent",
    },
    secondary: {
      background: "var(--s-card)",
      color: "var(--s-text)",
      border: "1px solid var(--s-border-strong)",
    },
    ghost: { background: "transparent", color: "var(--s-muted)", border: "1px solid transparent" },
    ai: {
      background: "var(--s-ai)",
      color: "var(--s-primary-fg)",
      border: "1px solid transparent",
    },
  };
  return (
    <button
      style={{
        ...styles[kind],
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        padding: "7px 12px",
        borderRadius: 8,
        cursor: "pointer",
        boxShadow:
          kind === "primary" || kind === "ai"
            ? "0 1px 0 rgba(255,255,255,.15) inset, 0 6px 16px -8px var(--s-primary)"
            : "none",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function MiniSidebar({ active = "Inbox" }: { active?: string }) {
  const items = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Inbox", icon: Inbox, badge: 4 },
    { label: "Channels", icon: Radio },
    { label: "Customers", icon: Users },
    { label: "Members", icon: UserCog },
    { label: "Audit", icon: FileCheck2 },
  ];
  return (
    <div
      style={{
        background: "var(--s-sidebar)",
        borderRight: "1px solid var(--s-border)",
        borderRadius: "var(--s-radius) 0 0 var(--s-radius)",
        padding: 10,
        width: 168,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 6px 12px" }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 7,
            background: "var(--s-primary)",
            display: "grid",
            placeItems: "center",
            color: "var(--s-primary-fg)",
          }}
        >
          <Sparkles size={13} />
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--s-text)" }}>Reception</div>
      </div>
      {items.map((it) => {
        const isActive = it.label === active;
        return (
          <div
            key={it.label}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 8px",
              borderRadius: 8,
              marginBottom: 2,
              background: isActive ? "var(--s-sidebar-active)" : "transparent",
              color: isActive ? "var(--s-primary)" : "var(--s-muted)",
              fontSize: 12,
              fontWeight: isActive ? 600 : 500,
            }}
          >
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  left: -10,
                  top: 6,
                  bottom: 6,
                  width: 3,
                  borderRadius: 999,
                  background: "var(--s-primary)",
                }}
              />
            )}
            <it.icon size={14} />
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.badge && (
              <span
                style={{
                  background: "var(--s-primary)",
                  color: "var(--s-primary-fg)",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: 999,
                }}
              >
                {it.badge}
              </span>
            )}
          </div>
        );
      })}
      <div
        style={{
          marginTop: 10,
          padding: 10,
          borderRadius: 10,
          background: "linear-gradient(135deg, var(--s-primary), var(--s-ai))",
          color: "var(--s-primary-fg)",
        }}
      >
        <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 600 }}>AI ACTIVE</div>
        <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>7 drafts ready</div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  deltaUp = true,
  accent,
  icon,
}: {
  label: string;
  value: string;
  delta: string;
  deltaUp?: boolean;
  accent: string;
  icon: ReactNode;
}) {
  return (
    <Card accent={accent} style={{ padding: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `color-mix(in oklab, ${accent} 16%, transparent)`,
            color: accent,
            display: "grid",
            placeItems: "center",
          }}
        >
          {icon}
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            fontSize: 10.5,
            fontWeight: 700,
            color: deltaUp ? "var(--s-success)" : "var(--s-danger)",
          }}
        >
          {deltaUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />} {delta}
        </span>
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "var(--s-text)",
          marginTop: 8,
          letterSpacing: "-.02em",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--s-muted)", marginTop: 2 }}>{label}</div>
    </Card>
  );
}

function DashboardPreview() {
  return (
    <div
      style={{
        display: "flex",
        borderRadius: "var(--s-radius)",
        overflow: "hidden",
        border: "1px solid var(--s-border)",
        background: "var(--s-bg)",
      }}
    >
      <MiniSidebar active="Dashboard" />
      <div
        style={{
          flex: 1,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          minWidth: 0,
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--s-text)" }}>
              Operations Command Center
            </div>
            <div style={{ fontSize: 10.5, color: "var(--s-muted)" }}>
              Tehran Dental Clinic · Owner · Active
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--s-input)",
              border: "1px solid var(--s-border)",
              borderRadius: 8,
              padding: "5px 8px",
              fontSize: 11,
              color: "var(--s-subtle)",
            }}
          >
            <Search size={11} /> Search
          </div>
          <Btn kind="secondary" icon={<Radio size={12} />}>
            Channels
          </Btn>
          <Btn kind="primary" icon={<Inbox size={12} />}>
            Open Inbox
          </Btn>
        </div>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          <KpiCard
            label="Open conversations"
            value="12"
            delta="+3"
            accent="var(--s-primary)"
            icon={<Inbox size={14} />}
          />
          <KpiCard
            label="Waiting for operator"
            value="4"
            delta="+1"
            deltaUp={false}
            accent="var(--s-warning)"
            icon={<Clock size={14} />}
          />
          <KpiCard
            label="Drafts pending"
            value="7"
            delta="+2"
            accent="var(--s-ai)"
            icon={<Sparkles size={14} />}
          />
          <KpiCard
            label="Access alerts"
            value="1"
            delta="0"
            accent="var(--s-danger)"
            icon={<ShieldCheck size={14} />}
          />
        </div>
        {/* Channel command + attention */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 8 }}>
          <Card style={{ padding: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--s-text)" }}>
                Channel Command Center
              </div>
              <Pill tone="muted">7 channels</Pill>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
              {[
                { n: "Web Chat", i: Globe, status: "Active", tone: "success" as const, count: 8 },
                { n: "Email", i: Mail, status: "Active", tone: "success" as const, count: 4 },
                {
                  n: "Instagram",
                  i: Instagram,
                  status: "Planned",
                  tone: "planned" as const,
                  count: 0,
                },
                {
                  n: "WhatsApp",
                  i: MessageCircle,
                  status: "Planned",
                  tone: "planned" as const,
                  count: 0,
                },
              ].map((c) => (
                <div
                  key={c.n}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: 8,
                    borderRadius: 8,
                    border: "1px solid var(--s-border)",
                    background: "var(--s-card-elev)",
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: "color-mix(in oklab, var(--s-primary) 12%, transparent)",
                      color: "var(--s-primary)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <c.i size={12} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--s-text)" }}>
                      {c.n}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--s-subtle)" }}>{c.count} unread</div>
                  </div>
                  <Pill tone={c.tone}>{c.status}</Pill>
                </div>
              ))}
            </div>
          </Card>
          <Card style={{ padding: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--s-text)", marginBottom: 8 }}>
              Attention Queue
            </div>
            {[
              {
                who: "Sara A.",
                txt: "Appointment reschedule",
                tone: "warning" as const,
                t: "Waiting 14m",
              },
              {
                who: "Reza M.",
                txt: "Insurance question",
                tone: "danger" as const,
                t: "High priority",
              },
              {
                who: "Niki P.",
                txt: "Follow-up on quote",
                tone: "ai" as const,
                t: "AI draft ready",
              },
            ].map((r) => (
              <div
                key={r.who}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 0",
                  borderTop: "1px solid var(--s-border)",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    background: "var(--s-primary-soft)",
                    color: "var(--s-primary)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {r.who[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--s-text)" }}>
                    {r.who}
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "var(--s-muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.txt}
                  </div>
                </div>
                <Pill tone={r.tone}>{r.t}</Pill>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

function InboxPreview() {
  return (
    <div
      style={{
        display: "flex",
        borderRadius: "var(--s-radius)",
        overflow: "hidden",
        border: "1px solid var(--s-border)",
        background: "var(--s-bg)",
        height: 380,
      }}
    >
      <MiniSidebar active="Inbox" />
      {/* Conversation list */}
      <div
        style={{
          width: 200,
          borderRight: "1px solid var(--s-border)",
          background: "var(--s-card)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "10px 10px 8px", borderBottom: "1px solid var(--s-border)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--s-text)" }}>Inbox</div>
          <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Pill tone="primary">All 12</Pill>
            <Pill tone="warning">Waiting 4</Pill>
          </div>
        </div>
        {[
          {
            who: "Sara A.",
            sub: "Appointment reschedule",
            ch: Globe,
            t: "2m",
            active: true,
            tone: "warning" as const,
            label: "Waiting",
          },
          {
            who: "Reza M.",
            sub: "Insurance question",
            ch: Mail,
            t: "8m",
            tone: "danger" as const,
            label: "High",
          },
          {
            who: "Niki P.",
            sub: "Follow-up on quote",
            ch: Globe,
            t: "14m",
            tone: "ai" as const,
            label: "Draft",
          },
          {
            who: "Omid S.",
            sub: "Booking next week",
            ch: Mail,
            t: "1h",
            tone: "success" as const,
            label: "Active",
          },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 8,
              padding: 9,
              background: c.active ? "var(--s-sidebar-active)" : "transparent",
              borderLeft: c.active ? "2px solid var(--s-primary)" : "2px solid transparent",
              borderBottom: "1px solid var(--s-border)",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 999,
                background: "var(--s-primary-soft)",
                color: "var(--s-primary)",
                display: "grid",
                placeItems: "center",
                fontSize: 10.5,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {c.who[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--s-text)" }}>
                  {c.who}
                </span>
                <span style={{ fontSize: 10, color: "var(--s-subtle)" }}>{c.t}</span>
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: "var(--s-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {c.sub}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                <c.ch size={10} color="var(--s-subtle)" />
                <Pill tone={c.tone}>{c.label}</Pill>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Thread */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          background: "var(--s-bg)",
        }}
      >
        <div
          style={{
            padding: "10px 12px",
            borderBottom: "1px solid var(--s-border)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--s-card)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "var(--s-primary-soft)",
              color: "var(--s-primary)",
              display: "grid",
              placeItems: "center",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--s-text)" }}>Sara Ahmadi</div>
            <div style={{ fontSize: 10.5, color: "var(--s-muted)" }}>Web Chat · Tehran Dental</div>
          </div>
          <Pill tone="warning">Waiting 14m</Pill>
        </div>
        <div
          style={{
            flex: 1,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              alignSelf: "flex-start",
              maxWidth: "78%",
              background: "var(--s-card)",
              border: "1px solid var(--s-border)",
              padding: "8px 10px",
              borderRadius: "12px 12px 12px 4px",
              fontSize: 11.5,
              color: "var(--s-text)",
              boxShadow: "var(--s-shadow-card)",
            }}
          >
            Hi, can I move my Wednesday cleaning to Friday morning?
          </div>
          <div
            style={{
              alignSelf: "flex-end",
              maxWidth: "78%",
              background: "var(--s-primary)",
              color: "var(--s-primary-fg)",
              padding: "8px 10px",
              borderRadius: "12px 12px 4px 12px",
              fontSize: 11.5,
            }}
          >
            Of course — let me check Friday's openings for you.
          </div>
          {/* AI Draft Panel */}
          <div
            style={{
              marginTop: "auto",
              borderRadius: 12,
              padding: 10,
              border: "1px solid color-mix(in oklab, var(--s-ai) 35%, transparent)",
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--s-ai) 10%, var(--s-card)) 0%, var(--s-card) 100%)",
              boxShadow:
                "0 0 0 4px color-mix(in oklab, var(--s-ai) 8%, transparent), 0 18px 40px -22px color-mix(in oklab, var(--s-ai) 50%, transparent)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Sparkles size={12} color="var(--s-ai)" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--s-ai)" }}>
                AI Draft — Human Review Required
              </span>
              <span style={{ marginLeft: "auto" }}>
                <Pill tone="ai">92% confidence</Pill>
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--s-text)", lineHeight: 1.45 }}>
              Hi Sara — Friday at 10:30 AM is available. Would that time work for you?
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <Btn kind="ai" icon={<Send size={11} />}>
                Review & Send
              </Btn>
              <Btn kind="secondary" icon={<Pencil size={11} />}>
                Edit
              </Btn>
              <Btn kind="ghost" icon={<X size={11} />}>
                Reject
              </Btn>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  color: "var(--s-subtle)",
                  alignSelf: "center",
                }}
              >
                Operator sends final reply · No auto-send
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentsPreview() {
  return (
    <Card style={{ padding: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--s-text)", marginBottom: 10 }}>
        Components
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        <Btn kind="primary" icon={<Send size={11} />}>
          Primary
        </Btn>
        <Btn kind="ai" icon={<Sparkles size={11} />}>
          AI Action
        </Btn>
        <Btn kind="secondary" icon={<Check size={11} />}>
          Secondary
        </Btn>
        <Btn kind="ghost">Ghost</Btn>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        <Pill tone="primary">Owner</Pill>
        <Pill tone="success">Active</Pill>
        <Pill tone="warning">Waiting</Pill>
        <Pill tone="danger">High</Pill>
        <Pill tone="ai">AI Draft</Pill>
        <Pill tone="planned">Planned</Pill>
        <Pill tone="muted">Viewer</Pill>
      </div>
      {/* Mini table */}
      <div style={{ borderRadius: 10, border: "1px solid var(--s-border)", overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 0.8fr 0.6fr",
            background: "var(--s-tablehead)",
            padding: "8px 10px",
            fontSize: 10.5,
            fontWeight: 700,
            color: "var(--s-muted)",
          }}
        >
          <div>Member</div>
          <div>Role</div>
          <div>Status</div>
          <div>Last seen</div>
        </div>
        {[
          { n: "Aria K.", r: "Owner", s: "Active", tone: "success" as const, t: "now" },
          { n: "Mina T.", r: "Operator", s: "Active", tone: "success" as const, t: "5m" },
          { n: "Pouya R.", r: "Operator", s: "Invited", tone: "warning" as const, t: "—" },
        ].map((m, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 0.8fr 0.6fr",
              padding: "8px 10px",
              fontSize: 11.5,
              color: "var(--s-text)",
              borderTop: "1px solid var(--s-border)",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  background: "var(--s-primary-soft)",
                  color: "var(--s-primary)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 9.5,
                  fontWeight: 700,
                }}
              >
                {m.n[0]}
              </div>
              {m.n}
            </div>
            <div style={{ color: "var(--s-muted)" }}>{m.r}</div>
            <div>
              <Pill tone={m.tone}>{m.s}</Pill>
            </div>
            <div style={{ color: "var(--s-subtle)", fontSize: 10.5 }}>{m.t}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─────────── Direction block ─────────── */

function DirectionBlock({ dir, mode }: { dir: Direction; mode: Mode }) {
  const t = dir.modes[mode];
  return (
    <div
      style={{
        ...tokensToStyle(t),
        padding: 18,
        borderRadius: 18,
        border: "1px solid var(--s-border)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <DashboardPreview />
        <InboxPreview />
        <ComponentsPreview />
      </div>
    </div>
  );
}

/* ─────────── Page ─────────── */

function StudioPage() {
  const [mode, setMode] = useState<Mode>("dark");

  return (
    <div className="bg-app min-h-screen">
      {/* top bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          backdropFilter: "blur(12px)",
          background: "color-mix(in oklab, var(--color-background) 70%, transparent)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="mx-auto max-w-[1400px] px-6 py-3 flex items-center gap-3">
          <Link to="/" className="text-xs font-medium text-muted-foreground hover:text-foreground">
            ← App
          </Link>
          <div className="h-4 w-px bg-border mx-1" />
          <div>
            <div className="text-sm font-medium gradient-text-primary">Design Direction Studio</div>
            <div className="text-[11px] text-muted-foreground">
              Compare three premium directions, then pick one to apply globally.
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
            {(["light", "dark"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-2 text-[11px] font-medium rounded-md capitalize transition ${
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m} mode
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8 space-y-12">
        {/* Selected direction banner */}
        <section className="card-premium ai-feature-bg ring-ai-feature p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-ai text-white shadow-ring-ai">
              <Check className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-[260px]">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-ai/30 bg-ai-soft px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-ai">
                  <Sparkles className="h-3 w-3" /> Selected · Applied globally
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-medium tracking-tight text-display gradient-text-primary tracking-tight">
                Warm Premium AI Operations SaaS
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl mt-2">
                A hybrid of Warm Premium SMB and AI Operations Pro. This is the unified visual
                identity used across Dashboard, Inbox, Channels, Customers, Members, Settings, Audit
                Log and States — in both light and dark mode.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[12.5px] font-medium text-primary-foreground shadow-soft hover:opacity-95"
            >
              Open the app <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Intro */}
        <section className="card-premium p-6">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Reference
          </div>
          <h2 className="text-xl font-medium tracking-tight text-display mt-1 tracking-tight">
            Original direction comparison
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl mt-2">
            Three directions previewed side-by-side. The selected hybrid (above) is applied to the
            live app. Toggle Light / Dark to inspect tokens. Mock data only — no production logic.
          </p>
        </section>

        {/* Three directions */}
        {DIRECTIONS.map((dir) => (
          <section key={dir.id} className="space-y-3">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Option {dir.id}
                </div>
                <h2 className="text-xl font-medium text-display tracking-tight">{dir.name}</h2>
                <p className="text-sm text-muted-foreground max-w-2xl">{dir.tagline}</p>
              </div>
              <div className="text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">Best for:</span> {dir.best}
              </div>
            </div>
            <DirectionBlock dir={dir} mode={mode} />
          </section>
        ))}

        {/* Recommendation */}
        <section className="card-premium p-6 ai-feature-bg ring-ai-feature">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-ai" />
            <div className="text-[11px] font-medium uppercase tracking-wider text-ai">
              Recommended Direction
            </div>
          </div>
          <h2 className="text-2xl font-medium text-display tracking-tight">
            Warm Premium AI Operations SaaS
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl mt-2">
            A hybrid of <span className="font-medium text-foreground">Warm Premium SMB</span> (warm
            neutrals, friendly typography, calm cards) and{" "}
            <span className="font-medium text-foreground">AI Operations Pro</span> (refined
            blue/violet AI accents, elevated AI surfaces, dark mode discipline). Friendly enough for
            small businesses, premium enough for B2B SaaS, modern enough for AI, calm enough for
            support operations.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            {[
              {
                t: "Positioning",
                d: "Human-first, AI-assisted reception for SMB and service teams.",
              },
              {
                t: "Trust",
                d: "Crisp cards, layered shadows, predictable hierarchy — investor-demo ready.",
              },
              {
                t: "AI accent",
                d: "Violet→blue gradient reserved for AI surfaces only. Never decorative.",
              },
              {
                t: "Responsive",
                d: "Sidebar → icon rail → bottom nav. Context panels become drawers and sheets.",
              },
            ].map((x) => (
              <div key={x.t} className="rounded-xl border border-border bg-card p-4">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {x.t}
                </div>
                <div className="text-sm text-foreground mt-1">{x.d}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-5">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:opacity-90"
            >
              Back to app <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground">
              Reply with "Apply C+B" to roll out globally
            </span>
          </div>
        </section>

        {/* Token reference */}
        <section className="card-premium p-6">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Design system — recommended direction
          </div>
          <h2 className="text-xl font-medium text-display mt-1 tracking-tight">
            Tokens, type, spacing, radius, elevation
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mt-5">
            <div>
              <div className="text-xs font-medium text-foreground mb-2">
                Light mode color tokens
              </div>
              <TokenGrid t={DIRECTIONS[2].modes.light} />
            </div>
            <div>
              <div className="text-xs font-medium text-foreground mb-2">Dark mode color tokens</div>
              <TokenGrid t={DIRECTIONS[2].modes.dark} />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-6 text-xs">
            <Spec
              title="Typography"
              rows={[
                ["Display / page title", "28–32 / 700 / -0.022em"],
                ["Section title", "18–20 / 700"],
                ["Card title", "14 / 700"],
                ["Body", "13–14 / 500"],
                ["Caption / label", "11 / 600 / uppercase"],
                ["KPI number", "28–32 / 700 tabular"],
              ]}
            />
            <Spec
              title="Spacing & radius"
              rows={[
                ["Page padding", "24 / 32 desktop"],
                ["Section gap", "24"],
                ["Card padding", "16–20"],
                ["Row height", "44–52"],
                ["Radius — chip", "6–8"],
                ["Radius — input/button", "8–10"],
                ["Radius — card", "14"],
                ["Radius — hero", "18–22"],
              ]}
            />
            <Spec
              title="Elevation"
              rows={[
                ["Flat", "border only, no shadow"],
                ["Card", "1px + 12px soft drop"],
                ["Raised", "2px + 24px navy-tinted"],
                ["Floating", "28px diffuse + ring"],
                ["Modal / drawer", "64px + scrim"],
                ["AI surface", "ring + violet glow"],
              ]}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function TokenGrid({ t }: { t: DirTokens }) {
  const swatches: { name: string; v: string }[] = [
    { name: "background", v: t.bg },
    { name: "card", v: t.card },
    { name: "elevated", v: t.cardElev },
    { name: "primary text", v: t.text },
    { name: "muted text", v: t.textMuted },
    { name: "border", v: t.border },
    { name: "primary", v: t.primary },
    { name: "primary soft", v: t.primarySoft },
    { name: "AI", v: t.ai },
    { name: "AI soft", v: t.aiSoft },
    { name: "success", v: t.success },
    { name: "warning", v: t.warning },
    { name: "danger", v: t.danger },
    { name: "planned", v: t.planned },
    { name: "sidebar", v: t.sidebar },
    { name: "sidebar active", v: t.sidebarActive },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {swatches.map((s) => (
        <div
          key={s.name}
          className="flex items-center gap-2 rounded-md border border-border bg-card p-2"
        >
          <div className="h-7 w-7 rounded-md border border-border" style={{ background: s.v }} />
          <div className="text-[11px] leading-tight">
            <div className="font-medium text-foreground">{s.name}</div>
            <div className="text-muted-foreground font-mono text-[10px] truncate max-w-[140px]">
              {s.v}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Spec({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs font-medium text-foreground mb-2">{title}</div>
      <div className="divide-y divide-border">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 gap-2">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-mono text-[11px] text-foreground text-right">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
