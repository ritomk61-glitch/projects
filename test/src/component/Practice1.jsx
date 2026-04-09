

import { useState, useEffect, useRef, useCallback } from "react";
 
// ─── Utility helpers ──────────────────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 10);
 
const STORAGE_KEY = "taskflow_tasks_v2";
 
function calcPriority(dueDate, effort) {
  if (!dueDate) return "low";
  const now = new Date();
  const due = new Date(dueDate);
  const daysLeft = Math.ceil((due - now) / 86400000);
  const effortMap = { low: 1, medium: 2, high: 3 };
  const e = effortMap[effort] || 1;
  const score = e * 10 - daysLeft;
  if (score >= 20 || daysLeft <= 1) return "critical";
  if (score >= 10 || daysLeft <= 3) return "high";
  if (score >= 0  || daysLeft <= 7) return "medium";
  return "low";
}
 
const PRIORITY_META = {
  critical: { label: "Critical", color: "#FF4757", bg: "rgba(255,71,87,0.12)", dot: "#FF4757" },
  high:     { label: "High",     color: "#FF6B35", bg: "rgba(255,107,53,0.12)", dot: "#FF6B35" },
  medium:   { label: "Medium",   color: "#FFD93D", bg: "rgba(255,217,61,0.12)", dot: "#FFD93D" },
  low:      { label: "Low",      color: "#6BCB77", bg: "rgba(107,203,119,0.12)", dot: "#6BCB77" },
};
 
const COLUMNS = ["todo", "inprogress", "done"];
const COL_META = {
  todo:       { label: "To-Do",       icon: "○", accent: "#4ECDC4" },
  inprogress: { label: "In Progress", icon: "◐", accent: "#FFD93D" },
  done:       { label: "Done",        icon: "●", accent: "#6BCB77" },
};
 
const EFFORT_OPTIONS = ["low", "medium", "high"];
 
// ─── Pomodoro defaults ────────────────────────────────────────────────────────
const POMO_WORK  = 25 * 60;
const POMO_SHORT = 5  * 60;
const POMO_LONG  = 15 * 60;
 
// ─── Inline styles (dark industrial aesthetic) ───────────────────────────────
const css = {
  root: {
    minHeight: "100vh",
    background: "#0D0D0D",
    color: "#E8E0D5",
    fontFamily: "'DM Mono', 'Courier New', monospace",
    position: "relative",
    overflow: "hidden",
  },
  grain: {
    position: "fixed", inset: 0, zIndex: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
    pointerEvents: "none",
  },
  content: { position: "relative", zIndex: 1 },
};
 
// ─── Sub-components ───────────────────────────────────────────────────────────
 
function PriorityBadge({ priority }) {
  const m = PRIORITY_META[priority] || PRIORITY_META.low;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: m.color, background: m.bg,
      padding: "2px 8px", borderRadius: 3,
      border: `1px solid ${m.color}33`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.dot, display: "inline-block" }} />
      {m.label}
    </span>
  );
}
 
function ProgressRing({ pct, size = 52, stroke = 4, color = "#4ECDC4" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ffffff0a" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease" }} />
    </svg>
  );
}
 
function TaskCard({ task, onMove, onDelete, onFocus, onEdit, isDragging, onDragStart, onDragEnd }) {
  const daysLeft = task.dueDate
    ? Math.ceil((new Date(task.dueDate) - new Date()) / 86400000)
    : null;
  const overdue = daysLeft !== null && daysLeft < 0;
  const accent = COL_META[task.status]?.accent || "#4ECDC4";
 
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        background: isDragging ? "#1E1E1E" : "#161616",
        border: `1px solid ${isDragging ? accent : "#ffffff0f"}`,
        borderLeft: `3px solid ${PRIORITY_META[task.priority]?.color || "#555"}`,
        borderRadius: 8,
        padding: "14px 14px 12px",
        marginBottom: 10,
        cursor: "grab",
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? "scale(0.98)" : "scale(1)",
        transition: "all 0.15s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* shimmer line on hover handled by CSS-in-JS state would be complex, skipped for perf */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <PriorityBadge priority={task.priority} />
        <div style={{ display: "flex", gap: 6 }}>
          <Btn tiny onClick={() => onFocus(task)} title="Focus">⊙</Btn>
          <Btn tiny onClick={() => onEdit(task)} title="Edit">✎</Btn>
          <Btn tiny danger onClick={() => onDelete(task.id)} title="Delete">✕</Btn>
        </div>
      </div>
 
      <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 15, fontWeight: 400, marginBottom: 6, lineHeight: 1.4 }}>
        {task.title}
      </div>
 
      {task.description && (
        <div style={{ fontSize: 11, color: "#8a8478", marginBottom: 8, lineHeight: 1.5 }}>
          {task.description}
        </div>
      )}
 
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {task.tags?.map(t => (
            <span key={t} style={{
              fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase",
              color: "#6a635a", background: "#ffffff08", border: "1px solid #ffffff0a",
              padding: "1px 6px", borderRadius: 2,
            }}>{t}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {task.effort && (
            <span style={{ fontSize: 10, color: "#6a635a" }}>
              Effort: <span style={{ color: "#a09890" }}>{task.effort}</span>
            </span>
          )}
          {daysLeft !== null && (
            <span style={{ fontSize: 10, color: overdue ? "#FF4757" : daysLeft <= 2 ? "#FFD93D" : "#6a635a", fontWeight: overdue ? 700 : 400 }}>
              {overdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
            </span>
          )}
        </div>
      </div>
 
      <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
        {COLUMNS.filter(c => c !== task.status).map(c => (
          <button key={c} onClick={() => onMove(task.id, c)} style={{
            flex: 1, fontSize: 9, letterSpacing: "0.07em", textTransform: "uppercase",
            background: "transparent", border: `1px solid ${COL_META[c].accent}33`,
            color: COL_META[c].accent, padding: "4px 0", borderRadius: 3,
            cursor: "pointer", transition: "all 0.15s",
          }}
            onMouseEnter={e => e.target.style.background = `${COL_META[c].accent}18`}
            onMouseLeave={e => e.target.style.background = "transparent"}
          >
            → {COL_META[c].label}
          </button>
        ))}
      </div>
    </div>
  );
}
 
function Btn({ children, onClick, tiny, danger, primary, title, style: sx }) {
  const [hov, setHov] = useState(false);
  const base = {
    border: "none", cursor: "pointer", borderRadius: 4,
    fontFamily: "inherit", letterSpacing: "0.06em",
    transition: "all 0.15s",
    ...(tiny ? {
      fontSize: 11, padding: "3px 7px",
      background: hov ? (danger ? "#FF475720" : "#ffffff15") : "transparent",
      color: danger ? "#FF4757" : "#8a8478",
      border: `1px solid ${danger ? "#FF475730" : "#ffffff10"}`,
    } : primary ? {
      fontSize: 12, padding: "9px 20px", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.1em",
      background: hov ? "#5fd4cb" : "#4ECDC4",
      color: "#0D0D0D",
    } : {
      fontSize: 12, padding: "8px 16px",
      background: hov ? "#ffffff15" : "#ffffff08",
      color: "#a09890",
      border: "1px solid #ffffff12",
    }),
    ...sx,
  };
  return (
    <button style={base} onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </button>
  );
}
 
function Input({ label, value, onChange, type = "text", placeholder, style: sx }) {
  return (
    <div style={{ marginBottom: 14, ...sx }}>
      {label && <label style={{ display: "block", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6a635a", marginBottom: 5 }}>{label}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", boxSizing: "border-box",
          background: "#0D0D0D", border: "1px solid #ffffff15",
          borderRadius: 5, padding: "8px 11px",
          color: "#E8E0D5", fontFamily: "inherit", fontSize: 13,
          outline: "none",
        }}
      />
    </div>
  );
}
 
function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6a635a", marginBottom: 5 }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: "100%", background: "#0D0D0D", border: "1px solid #ffffff15",
        borderRadius: 5, padding: "8px 11px", color: "#E8E0D5",
        fontFamily: "inherit", fontSize: 13, outline: "none", cursor: "pointer",
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
 
// ─── Task Form Modal ───────────────────────────────────────────────────────────
function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    dueDate: task?.dueDate || "",
    effort: task?.effort || "medium",
    tags: task?.tags?.join(", ") || "",
    status: task?.status || "todo",
  });
 
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
 
  const handleSave = () => {
    if (!form.title.trim()) return;
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    const priority = calcPriority(form.dueDate, form.effort);
    onSave({
      id: task?.id || genId(),
      createdAt: task?.createdAt || new Date().toISOString(),
      ...form, tags, priority,
    });
    onClose();
  };
 
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.75)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#141414", border: "1px solid #ffffff15", borderRadius: 12,
        padding: 28, width: "100%", maxWidth: 480,
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        animation: "slideUp 0.2s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20 }}>
            {task ? "Edit Task" : "New Task"}
          </div>
          <Btn tiny onClick={onClose}>✕</Btn>
        </div>
 
        <Input label="Title *" value={form.title} onChange={set("title")} placeholder="What needs to be done?" />
        <Input label="Description" value={form.description} onChange={set("description")} placeholder="Optional details..." />
        <Input label="Due Date" value={form.dueDate} onChange={set("dueDate")} type="date" />
        <Select label="Effort" value={form.effort} onChange={set("effort")}
          options={EFFORT_OPTIONS.map(e => ({ value: e, label: e.charAt(0).toUpperCase() + e.slice(1) }))} />
        <Select label="Status" value={form.status} onChange={set("status")}
          options={COLUMNS.map(c => ({ value: c, label: COL_META[c].label }))} />
        <Input label="Tags (comma separated)" value={form.tags} onChange={set("tags")} placeholder="design, backend, urgent" />
 
        {form.dueDate && (
          <div style={{ fontSize: 11, color: "#6a635a", marginBottom: 14 }}>
            Auto-priority: <PriorityBadge priority={calcPriority(form.dueDate, form.effort)} />
          </div>
        )}
 
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn primary onClick={handleSave}>Save Task</Btn>
        </div>
      </div>
    </div>
  );
}
 
// ─── Focus Mode (Pomodoro) ────────────────────────────────────────────────────
function FocusMode({ task, onClose }) {
  const [mode, setMode] = useState("work");       // work | short | long
  const [seconds, setSeconds] = useState(POMO_WORK);
  const [running, setRunning] = useState(false);
  const [session, setSession] = useState(1);
  const [completed, setCompleted] = useState(0);
  const intervalRef = useRef(null);
 
  const durations = { work: POMO_WORK, short: POMO_SHORT, long: POMO_LONG };
 
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "work") {
              setCompleted(c => c + 1);
              const next = session % 4 === 0 ? "long" : "short";
              setMode(next);
              setSeconds(durations[next]);
              setSession(s => s + 1);
            } else {
              setMode("work");
              setSeconds(POMO_WORK);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, session]);
 
  const total = durations[mode];
  const pct = ((total - seconds) / total) * 100;
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
 
  const switchMode = m => { setMode(m); setSeconds(durations[m]); setRunning(false); };
 
  const modeColors = { work: "#4ECDC4", short: "#6BCB77", long: "#FFD93D" };
  const col = modeColors[mode];
 
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Mono', monospace",
    }}>
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <Btn tiny onClick={onClose}>✕ Exit Focus</Btn>
      </div>
 
      <div style={{ textAlign: "center", maxWidth: 420, padding: 20 }}>
        {/* Mode tabs */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 36 }}>
          {[["work","Work"], ["short","Short Break"], ["long","Long Break"]].map(([k, l]) => (
            <button key={k} onClick={() => switchMode(k)} style={{
              padding: "6px 14px", borderRadius: 4, cursor: "pointer",
              fontFamily: "inherit", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
              background: mode === k ? `${modeColors[k]}20` : "transparent",
              color: mode === k ? modeColors[k] : "#4a4540",
              border: `1px solid ${mode === k ? modeColors[k] : "#ffffff10"}`,
              transition: "all 0.2s",
            }}>{l}</button>
          ))}
        </div>
 
        {/* Ring */}
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <ProgressRing pct={pct} size={200} stroke={6} color={col} />
          <div style={{ position: "absolute", textAlign: "center" }}>
            <div style={{ fontSize: 48, letterSpacing: "-0.02em", color: col, lineHeight: 1 }}>
              {mins}:{secs}
            </div>
            <div style={{ fontSize: 10, color: "#4a4540", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>
              {mode === "work" ? "Focus" : "Break"}
            </div>
          </div>
        </div>
 
        {/* Task being focused */}
        {task && (
          <div style={{
            background: "#161616", border: `1px solid ${col}22`,
            borderRadius: 8, padding: "12px 18px", marginBottom: 24,
          }}>
            <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4540", marginBottom: 4 }}>Focusing on</div>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 17 }}>{task.title}</div>
          </div>
        )}
 
        {/* Controls */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 }}>
          <button onClick={() => { setSeconds(durations[mode]); setRunning(false); }} style={{
            background: "transparent", border: "1px solid #ffffff15", borderRadius: 6,
            color: "#8a8478", padding: "10px 20px", cursor: "pointer", fontFamily: "inherit", fontSize: 12,
          }}>⟲ Reset</button>
          <button onClick={() => setRunning(r => !r)} style={{
            background: col, border: "none", borderRadius: 6,
            color: "#0D0D0D", padding: "10px 28px", cursor: "pointer",
            fontFamily: "inherit", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em",
          }}>{running ? "⏸ Pause" : "▶ Start"}</button>
        </div>
 
        {/* Session count */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: i < completed % 4 ? col : "#ffffff12",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
        <div style={{ fontSize: 10, color: "#4a4540", marginTop: 8, letterSpacing: "0.06em" }}>
          Session {session} · {completed} completed
        </div>
      </div>
    </div>
  );
}
 
// ─── Kanban Column ────────────────────────────────────────────────────────────
function KanbanColumn({ col, tasks, onMove, onDelete, onFocus, onEdit, onDrop }) {
  const [dragOver, setDragOver] = useState(false);
  const { label, icon, accent } = COL_META[col];
  const critical = tasks.filter(t => t.priority === "critical").length;
 
  return (
    <div
      style={{
        flex: "1 1 300px", minWidth: 280, maxWidth: 380,
        background: dragOver ? "#1A1A1A" : "#111111",
        border: `1px solid ${dragOver ? accent + "44" : "#ffffff08"}`,
        borderTop: `3px solid ${accent}`,
        borderRadius: 10, padding: "16px 14px",
        transition: "all 0.2s",
      }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); onDrop(col); }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: accent, fontSize: 18 }}>{icon}</span>
          <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 16 }}>{label}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {critical > 0 && (
            <span style={{
              fontSize: 9, color: "#FF4757", background: "rgba(255,71,87,0.12)",
              border: "1px solid rgba(255,71,87,0.3)", borderRadius: 3,
              padding: "1px 6px", letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              {critical} critical
            </span>
          )}
          <span style={{
            fontSize: 11, color: accent, background: `${accent}18`,
            borderRadius: 3, padding: "2px 8px", fontWeight: 700,
          }}>
            {tasks.length}
          </span>
        </div>
      </div>
 
      <div style={{ minHeight: 80 }}>
        {tasks.length === 0 ? (
          <div style={{
            border: "2px dashed #ffffff08", borderRadius: 8,
            padding: "28px 0", textAlign: "center",
            color: "#2a2520", fontSize: 12, letterSpacing: "0.06em",
          }}>
            Drop tasks here
          </div>
        ) : (
          tasks
            .sort((a, b) => {
              const p = ["critical","high","medium","low"];
              return p.indexOf(a.priority) - p.indexOf(b.priority);
            })
            .map(task => (
              <DraggableCard
                key={task.id} task={task}
                onMove={onMove} onDelete={onDelete}
                onFocus={onFocus} onEdit={onEdit}
              />
            ))
        )}
      </div>
    </div>
  );
}
 
function DraggableCard({ task, onMove, onDelete, onFocus, onEdit }) {
  const [dragging, setDragging] = useState(false);
  return (
    <TaskCard
      task={task}
      isDragging={dragging}
      onDragStart={e => { e.dataTransfer.setData("taskId", task.id); setDragging(true); }}
      onDragEnd={() => setDragging(false)}
      onMove={onMove} onDelete={onDelete} onFocus={onFocus} onEdit={onEdit}
    />
  );
}
 
// ─── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ tasks }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "done").length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const critical = tasks.filter(t => t.priority === "critical" && t.status !== "done").length;
 
  return (
    <div style={{
      display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap",
      padding: "12px 0", marginBottom: 6,
    }}>
      {[
        ["Total", total, "#a09890"],
        ["Done", done, "#6BCB77"],
        ["In Progress", tasks.filter(t=>t.status==="inprogress").length, "#FFD93D"],
        ["Critical", critical, "#FF4757"],
        ["Completion", `${pct}%`, "#4ECDC4"],
      ].map(([k, v, c]) => (
        <div key={k} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, color: c, fontWeight: 700, lineHeight: 1 }}>{v}</div>
          <div style={{ fontSize: 9, color: "#4a4540", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{k}</div>
        </div>
      ))}
      <div style={{ flex: 1, minWidth: 120 }}>
        <div style={{ height: 4, background: "#ffffff08", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "#4ECDC4", borderRadius: 2, transition: "width 0.5s ease" }} />
        </div>
      </div>
    </div>
  );
}
 
// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });
  const [modal, setModal] = useState(null);   // null | "new" | task-object
  const [focusTask, setFocusTask] = useState(null);
  const [filter, setFilter] = useState({ priority: "all", search: "" });
  const dragId = useRef(null);
 
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);
 
  // Re-calc priorities daily
  useEffect(() => {
    setTasks(ts => ts.map(t => ({ ...t, priority: calcPriority(t.dueDate, t.effort) })));
  }, []);
 
  const saveTask = useCallback(t => {
    setTasks(ts => {
      const idx = ts.findIndex(x => x.id === t.id);
      return idx >= 0 ? ts.map(x => x.id === t.id ? t : x) : [...ts, t];
    });
  }, []);
 
  const deleteTask = useCallback(id => setTasks(ts => ts.filter(t => t.id !== id)), []);
 
  const moveTask = useCallback((id, status) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status } : t));
  }, []);
 
  const handleDrop = useCallback((col) => {
    if (dragId.current) {
      moveTask(dragId.current, col);
      dragId.current = null;
    }
  }, [moveTask]);
 
  const filtered = tasks.filter(t => {
    const matchPriority = filter.priority === "all" || t.priority === filter.priority;
    const matchSearch = !filter.search || t.title.toLowerCase().includes(filter.search.toLowerCase());
    return matchPriority && matchSearch;
  });
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ffffff15; border-radius: 2px; }
        @keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }
      `}</style>
 
      <div style={css.root}>
        <div style={css.grain} />
        <div style={css.content}>
 
          {/* Header */}
          <div style={{
            borderBottom: "1px solid #ffffff08",
            padding: "18px 28px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 26, letterSpacing: "-0.01em" }}>
                Task<span style={{ color: "#4ECDC4" }}>Flow</span>
              </div>
              <div style={{ fontSize: 10, color: "#4a4540", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Smart Task Management
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Btn onClick={() => setFocusTask({})} style={{ color: "#FFD93D", borderColor: "#FFD93D30" }}>
                ⊙ Focus Mode
              </Btn>
              <Btn primary onClick={() => setModal("new")}>+ New Task</Btn>
            </div>
          </div>
 
          {/* Stats */}
          <div style={{ padding: "14px 28px 0" }}>
            <StatsBar tasks={tasks} />
          </div>
 
          {/* Filters */}
          <div style={{
            padding: "10px 28px 16px",
            display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
          }}>
            <input
              placeholder="Search tasks..."
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
              style={{
                background: "#0D0D0D", border: "1px solid #ffffff12", borderRadius: 5,
                padding: "7px 12px", color: "#E8E0D5", fontFamily: "inherit", fontSize: 12,
                outline: "none", minWidth: 180,
              }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              {["all", "critical", "high", "medium", "low"].map(p => (
                <button key={p} onClick={() => setFilter(f => ({ ...f, priority: p }))} style={{
                  padding: "6px 12px", borderRadius: 4, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase",
                  border: `1px solid ${filter.priority === p ? (PRIORITY_META[p]?.color || "#4ECDC4") : "#ffffff10"}`,
                  background: filter.priority === p ? `${(PRIORITY_META[p]?.color || "#4ECDC4")}18` : "transparent",
                  color: filter.priority === p ? (PRIORITY_META[p]?.color || "#4ECDC4") : "#4a4540",
                  transition: "all 0.15s",
                }}>{p}</button>
              ))}
            </div>
            {tasks.length > 0 && (
              <button onClick={() => {
                if (window.confirm("Clear all completed tasks?"))
                  setTasks(ts => ts.filter(t => t.status !== "done"));
              }} style={{
                marginLeft: "auto", background: "transparent", border: "1px solid #ffffff10",
                color: "#4a4540", padding: "6px 12px", borderRadius: 4, cursor: "pointer",
                fontFamily: "inherit", fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase",
              }}>Clear done</button>
            )}
          </div>
 
          {/* Kanban board */}
          <div style={{
            padding: "0 28px 40px",
            display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start",
          }}>
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col} col={col}
                tasks={filtered.filter(t => t.status === col)}
                onMove={moveTask}
                onDelete={deleteTask}
                onFocus={t => setFocusTask(t)}
                onEdit={t => setModal(t)}
                onDrop={col => handleDrop(col)}
              />
            ))}
          </div>
 
          {/* Empty state */}
          {tasks.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#2a2520" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>◎</div>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: "#3a3530", marginBottom: 8 }}>
                No tasks yet
              </div>
              <div style={{ fontSize: 12, color: "#2a2520", letterSpacing: "0.06em" }}>
                Create your first task to get started
              </div>
            </div>
          )}
        </div>
      </div>
 
      {/* Modals */}
      {modal && (
        <TaskModal
          task={modal === "new" ? null : modal}
          onSave={saveTask}
          onClose={() => setModal(null)}
        />
      )}
      {focusTask !== null && (
        <FocusMode
          task={Object.keys(focusTask).length ? focusTask : null}
          onClose={() => setFocusTask(null)}
        />
      )}
    </>
  );
}