import { useState, useRef, useEffect } from "react";

// ── Palette ────────────────────────────────────────────────────────────────
const ACCENT = {
  todo:   { from: "#F472B6", to: "#EC4899", glow: "rgba(244,114,182,0.35)", light: "#FDF2F8", text: "#9D174D" },
  doing:  { from: "#34D399", to: "#10B981", glow: "rgba(52,211,153,0.35)", light: "#ECFDF5", text: "#065F46" },
  review: { from: "#FBBF24", to: "#F59E0B", glow: "rgba(251,191,36,0.35)", light: "#FFFBEB", text: "#78350F" },
  done:   { from: "#818CF8", to: "#6366F1", glow: "rgba(129,140,248,0.35)", light: "#EEF2FF", text: "#3730A3" },
};

const CAT = {
  Design:    { emoji: "🎨", bg: "#FDF2F8", fg: "#BE185D" },
  Dev:       { emoji: "💻", bg: "#EFF6FF", fg: "#1E40AF" },
  Marketing: { emoji: "📣", bg: "#FFFBEB", fg: "#B45309" },
  Research:  { emoji: "🔬", bg: "#F0FDF4", fg: "#166534" },
  Writing:   { emoji: "✍️",  bg: "#F5F3FF", fg: "#5B21B6" },
  Ops:       { emoji: "⚙️",  bg: "#F1F5F9", fg: "#334155" },
};

const PRI = {
  critical: { label: "🔥 Critical", color: "#EF4444" },
  high:     { label: "⬆ High",     color: "#F97316" },
  medium:   { label: "➡ Medium",   color: "#F59E0B" },
  low:      { label: "⬇ Low",      color: "#22C55E" },
};

const COLS = ["todo", "doing", "review", "done"];
const COL_LABEL = { todo: "To Do", doing: "Doing", review: "Review", done: "Done" };
const COL_ICON  = { todo: "☀️", doing: "⚡", review: "👁", done: "✅" };

const SEED = [
  { id:1,  title:"Redesign homepage hero",       desc:"Bold new typography and animated gradient",    cat:"Design",    pri:"high",     col:"todo",   due:"2026-04-12", created:5 },
  { id:2,  title:"Fix auth refresh bug",         desc:"Token expiry crashes the session silently",    cat:"Dev",       pri:"critical", col:"doing",  due:"2026-04-09", created:4 },
  { id:3,  title:"Q2 social media calendar",     desc:"Plan 30 posts across IG, X and LinkedIn",     cat:"Marketing", pri:"medium",   col:"todo",   due:"2026-04-20", created:3 },
  { id:4,  title:"Competitor analysis report",   desc:"Deep dive into 5 main competitors",            cat:"Research",  pri:"medium",   col:"review", due:"2026-04-14", created:2 },
  { id:5,  title:"Write onboarding guide",       desc:"Step-by-step for new team members",            cat:"Writing",   pri:"low",      col:"done",   due:"2026-04-05", created:1 },
  { id:6,  title:"Deploy staging environment",   desc:"Set up AWS + Docker Compose stack",            cat:"Ops",       pri:"high",     col:"doing",  due:"2026-04-11", created:0 },
];

function today() { return new Date().toISOString().split("T")[0]; }
function overdue(t) { return t.due && t.due < today() && t.col !== "done"; }

// ── Mini progress bar ──────────────────────────────────────────────────────
function Progress({ tasks }) {
  const total = tasks.length || 1;
  const done  = tasks.filter(t => t.col === "done").length;
  const pct   = Math.round((done / total) * 100);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ flex:1, height:6, background:"#F1F5F9", borderRadius:99, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", borderRadius:99,
          background:"linear-gradient(90deg,#34D399,#818CF8)", transition:"width 0.5s ease" }} />
      </div>
      <span style={{ fontSize:11, fontWeight:700, color:"#64748B", minWidth:32 }}>{pct}%</span>
    </div>
  );
}

// ── Task Card ──────────────────────────────────────────────────────────────
function Card({ task, onEdit, onDelete, onMove }) {
  const ac = ACCENT[task.col];
  const cat = CAT[task.cat] || { emoji:"📌", bg:"#F8FAFC", fg:"#475569" };
  const pri = PRI[task.pri];
  const od  = overdue(task);
  const ci  = COLS.indexOf(task.col);

  return (
    <div style={{
      background:"#fff",
      borderRadius:16,
      border:`1.5px solid ${od ? "#FECACA" : "#F1F5F9"}`,
      padding:"15px 16px",
      marginBottom:10,
      boxShadow: od ? "0 2px 12px rgba(239,68,68,0.08)" : "0 2px 10px rgba(0,0,0,0.04)",
      transition:"all 0.18s",
      position:"relative",
      overflow:"hidden",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 10px 28px ${ac.glow}`; }}
    onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=od?"0 2px 12px rgba(239,68,68,0.08)":"0 2px 10px rgba(0,0,0,0.04)"; }}>

      {/* Left accent bar */}
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:4, borderRadius:"16px 0 0 16px",
        background:`linear-gradient(180deg,${ac.from},${ac.to})` }} />

      {/* Top row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginBottom:8, paddingLeft:8 }}>
        <p style={{ margin:0, fontSize:13.5, fontWeight:700, color: task.col==="done" ? "#94A3B8" : "#0F172A",
          textDecoration: task.col==="done" ? "line-through" : "none", lineHeight:1.4, flex:1 }}>
          {task.title}
        </p>
        <span style={{ fontSize:10, fontWeight:700, color:pri.color, whiteSpace:"nowrap",
          background:pri.color+"18", padding:"3px 8px", borderRadius:20 }}>
          {pri.label}
        </span>
      </div>

      {task.desc && (
        <p style={{ margin:"0 0 10px", paddingLeft:8, fontSize:11.5, color:"#94A3B8", lineHeight:1.5 }}>{task.desc}</p>
      )}

      {/* Footer */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingLeft:8, flexWrap:"wrap", gap:6 }}>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <span style={{ background:cat.bg, color:cat.fg, fontSize:10, fontWeight:600,
            padding:"3px 8px", borderRadius:20 }}>
            {cat.emoji} {task.cat}
          </span>
          {task.due && (
            <span style={{ fontSize:10, fontWeight:600,
              color: od ? "#EF4444" : "#94A3B8",
              background: od ? "#FEF2F2" : "#F8FAFC",
              padding:"3px 7px", borderRadius:20 }}>
              {od ? "⚠️ " : "📅 "}{task.due}
            </span>
          )}
        </div>
        <div style={{ display:"flex", gap:3 }}>
          <button onClick={() => onMove(task.id,-1)} disabled={ci===0}
            title="Move left"
            style={{ width:25, height:25, borderRadius:7, border:"1px solid #E2E8F0",
              background: ci===0 ? "#F8FAFC" : "#fff", cursor: ci===0 ? "not-allowed" : "pointer",
              fontSize:12, color: ci===0 ? "#CBD5E1" : "#64748B",
              display:"flex", alignItems:"center", justifyContent:"center" }}>◀</button>
          <button onClick={() => onMove(task.id,1)} disabled={ci===COLS.length-1}
            title="Move right"
            style={{ width:25, height:25, borderRadius:7, border:"1px solid #E2E8F0",
              background: ci===COLS.length-1 ? "#F8FAFC" : "#fff",
              cursor: ci===COLS.length-1 ? "not-allowed" : "pointer",
              fontSize:12, color: ci===COLS.length-1 ? "#CBD5E1" : "#64748B",
              display:"flex", alignItems:"center", justifyContent:"center" }}>▶</button>
          <button onClick={() => onEdit(task)} title="Edit"
            style={{ width:25, height:25, borderRadius:7, border:"1px solid #E0E7FF",
              background:"#EEF2FF", cursor:"pointer", fontSize:11, color:"#6366F1",
              display:"flex", alignItems:"center", justifyContent:"center" }}>✎</button>
          <button onClick={() => onDelete(task.id)} title="Delete"
            style={{ width:25, height:25, borderRadius:7, border:"1px solid #FFE4E6",
              background:"#FFF1F2", cursor:"pointer", fontSize:13, color:"#F43F5E",
              display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
      </div>
    </div>
  );
}

// ── Column ─────────────────────────────────────────────────────────────────
function Column({ colId, tasks, onEdit, onDelete, onMove, onAdd }) {
  const ac = ACCENT[colId];
  return (
    <div style={{ display:"flex", flexDirection:"column", minWidth:0 }}>
      {/* Column header */}
      <div style={{ background:`linear-gradient(135deg,${ac.from},${ac.to})`,
        borderRadius:16, padding:"12px 16px", marginBottom:12,
        boxShadow:`0 4px 16px ${ac.glow}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:18 }}>{COL_ICON[colId]}</span>
          <span style={{ fontSize:13, fontWeight:800, color:"#fff", letterSpacing:"0.02em" }}>
            {COL_LABEL[colId]}
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ background:"rgba(255,255,255,0.3)", color:"#fff", fontSize:11, fontWeight:700,
            padding:"2px 9px", borderRadius:20 }}>{tasks.length}</span>
          <button onClick={() => onAdd(colId)}
            style={{ width:24, height:24, borderRadius:7, border:"none",
              background:"rgba(255,255,255,0.3)", cursor:"pointer", fontSize:16, color:"#fff",
              display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>+</button>
        </div>
      </div>

      {/* Cards */}
      <div style={{ flex:1 }}>
        {tasks.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 16px", color:"#CBD5E1", fontSize:13,
            border:"2px dashed #E2E8F0", borderRadius:16 }}>
            <div style={{ fontSize:32, marginBottom:8, opacity:0.5 }}>{COL_ICON[colId]}</div>
            Drop tasks here
          </div>
        ) : tasks.map(t => (
          <Card key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} onMove={onMove} />
        ))}
      </div>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
function Modal({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial || { title:"", desc:"", cat:"Design", pri:"medium", col:"todo", due:"" });
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const ref = useRef();
  useEffect(() => { setTimeout(()=>ref.current?.focus(), 60); }, []);

  const fields = [
    { label:"Title *", key:"title", type:"text", placeholder:"Task name..." },
    { label:"Description", key:"desc", type:"textarea", placeholder:"What needs to happen?" },
  ];

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)",
        zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#fff", borderRadius:24, padding:"2rem", width:"100%", maxWidth:440,
        boxShadow:"0 32px 80px rgba(0,0,0,0.22)", animation:"popIn 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
          <div>
            <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:"#0F172A" }}>
              {initial ? "✏️ Edit Task" : "✨ New Task"}
            </h2>
            <p style={{ margin:"3px 0 0", fontSize:12, color:"#94A3B8" }}>
              {initial ? "Update the details below" : "Fill in the details to add a task"}
            </p>
          </div>
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:10, border:"1.5px solid #E2E8F0",
            background:"#F8FAFC", cursor:"pointer", fontSize:18, color:"#64748B",
            display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>

        {fields.map(({ label, key, type, placeholder }) => (
          <div key={key} style={{ marginBottom:"1rem" }}>
            <label style={{ fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase",
              letterSpacing:"0.07em", display:"block", marginBottom:6 }}>{label}</label>
            {type==="textarea" ? (
              <textarea value={f[key]} onChange={e=>set(key,e.target.value)} placeholder={placeholder} rows={2}
                style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #E2E8F0", borderRadius:12,
                  fontSize:14, fontFamily:"inherit", resize:"vertical", outline:"none",
                  background:"#F8FAFC", color:"#0F172A", transition:"border 0.15s" }}
                onFocus={e=>e.target.style.borderColor="#818CF8"} onBlur={e=>e.target.style.borderColor="#E2E8F0"} />
            ) : (
              <input ref={key==="title"?ref:null} value={f[key]} onChange={e=>set(key,e.target.value)}
                placeholder={placeholder}
                style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #E2E8F0", borderRadius:12,
                  fontSize:14, fontFamily:"inherit", outline:"none", background:"#F8FAFC", color:"#0F172A" }}
                onFocus={e=>e.target.style.borderColor="#818CF8"} onBlur={e=>e.target.style.borderColor="#E2E8F0"} />
            )}
          </div>
        ))}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:"1rem" }}>
          {[
            { label:"Category", key:"cat", opts:Object.keys(CAT) },
            { label:"Priority",  key:"pri", opts:Object.keys(PRI), labels:Object.fromEntries(Object.entries(PRI).map(([k,v])=>[k,v.label])) },
            { label:"Status",   key:"col", opts:COLS, labels:COL_LABEL },
            { label:"Due Date", key:"due", type:"date" },
          ].map(({ label, key, opts, labels, type }) => (
            <div key={key}>
              <label style={{ fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase",
                letterSpacing:"0.07em", display:"block", marginBottom:6 }}>{label}</label>
              {type==="date" ? (
                <input type="date" value={f[key]} onChange={e=>set(key,e.target.value)}
                  style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #E2E8F0", borderRadius:12,
                    fontSize:13, fontFamily:"inherit", outline:"none", background:"#F8FAFC", color:"#0F172A" }}
                  onFocus={e=>e.target.style.borderColor="#818CF8"} onBlur={e=>e.target.style.borderColor="#E2E8F0"} />
              ) : (
                <select value={f[key]} onChange={e=>set(key,e.target.value)}
                  style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #E2E8F0", borderRadius:12,
                    fontSize:13, fontFamily:"inherit", outline:"none", background:"#F8FAFC", color:"#0F172A", cursor:"pointer" }}>
                  {opts.map(o=><option key={o} value={o}>{labels?labels[o]:o}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onClose}
            style={{ padding:"11px 22px", borderRadius:12, border:"1.5px solid #E2E8F0",
              background:"#fff", cursor:"pointer", fontSize:14, color:"#64748B", fontWeight:600 }}>
            Cancel
          </button>
          <button onClick={() => { if(!f.title.trim()) return; onSave(f); }}
            style={{ padding:"11px 24px", borderRadius:12, border:"none", cursor:"pointer",
              fontSize:14, fontWeight:800, color:"#fff",
              background:"linear-gradient(135deg,#F472B6,#818CF8)",
              boxShadow:"0 4px 18px rgba(129,140,248,0.4)" }}>
            {initial ? "Save Changes" : "Add Task ✨"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function ZenTask() {
  const [tasks, setTasks]   = useState(SEED);
  const [nid, setNid]       = useState(SEED.length + 1);
  const [modal, setModal]   = useState(null);
  const [search, setSearch] = useState("");
  const [priF, setPriF]     = useState("all");
  const [view, setView]     = useState("board"); // board | list

  const filtered = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !(t.desc||"").toLowerCase().includes(search.toLowerCase())) return false;
    if (priF !== "all" && t.pri !== priF) return false;
    return true;
  });

  const byCol = col => filtered.filter(t => t.col === col)
    .sort((a,b) => { const o={critical:0,high:1,medium:2,low:3}; return o[a.pri]-o[b.pri]; });

  const moveTask = (id, dir) => {
    setTasks(ts => ts.map(t => {
      if (t.id !== id) return t;
      const i = COLS.indexOf(t.col);
      const ni = Math.max(0, Math.min(COLS.length-1, i+dir));
      return { ...t, col: COLS[ni] };
    }));
  };

  const saveTask = (f) => {
    if (modal.task) {
      setTasks(ts => ts.map(t => t.id===modal.task.id ? {...t,...f} : t));
    } else {
      setTasks(ts => [{id:nid, created:nid, ...f}, ...ts]);
      setNid(n => n+1);
    }
    setModal(null);
  };

  const totals = { total:tasks.length, done:tasks.filter(t=>t.col==="done").length,
    overdue:tasks.filter(t=>overdue(t)).length, critical:tasks.filter(t=>t.pri==="critical").length };

  return (
    <div style={{ minHeight:"100vh", background:"#F0F4FF",
      fontFamily:"'Plus Jakarta Sans','Nunito',system-ui,sans-serif", padding:"1.25rem" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes popIn { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:99px}
        button:active{transform:scale(0.96)!important}
      `}</style>

      <div style={{ maxWidth:1300, margin:"0 auto" }}>

        {/* ── Top bar ── */}
        <div style={{ background:"linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#4C1D95 100%)",
          borderRadius:24, padding:"20px 24px", marginBottom:16,
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12,
          boxShadow:"0 8px 32px rgba(79,70,229,0.35)" }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>
              🚀 ZenTask
            </h1>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", marginTop:2 }}>
              {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
            </p>
          </div>

          <div style={{ flex:1, maxWidth:280, position:"relative" }}>
            <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)",
              fontSize:14, color:"rgba(255,255,255,0.5)" }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks..."
              style={{ width:"100%", padding:"9px 14px 9px 36px", borderRadius:12,
                border:"1.5px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.1)",
                color:"#fff", fontSize:13, outline:"none", fontFamily:"inherit" }}
              onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.4)"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.15)"} />
          </div>

          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {/* View toggle */}
            <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:10, padding:3, display:"flex", gap:2 }}>
              {[["board","⊞"],["list","☰"]].map(([v,icon]) => (
                <button key={v} onClick={()=>setView(v)}
                  style={{ width:34, height:32, borderRadius:8, border:"none", cursor:"pointer",
                    background: view===v ? "rgba(255,255,255,0.25)" : "transparent",
                    color: view===v ? "#fff" : "rgba(255,255,255,0.5)", fontSize:16 }}>
                  {icon}
                </button>
              ))}
            </div>
            <button onClick={() => setModal({ task:null, defaultCol:"todo" })}
              style={{ padding:"9px 18px", borderRadius:12, border:"none", cursor:"pointer",
                background:"linear-gradient(135deg,#F472B6,#EC4899)",
                color:"#fff", fontWeight:800, fontSize:14,
                boxShadow:"0 4px 16px rgba(244,114,182,0.5)" }}>
              + New Task
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
          {[
            { label:"Total Tasks",  val:totals.total,    emoji:"📋", from:"#818CF8", to:"#6366F1" },
            { label:"Completed",    val:totals.done,     emoji:"✅", from:"#34D399", to:"#10B981" },
            { label:"Overdue",      val:totals.overdue,  emoji:"⚠️", from:"#FB923C", to:"#EF4444" },
            { label:"Critical",     val:totals.critical, emoji:"🔥", from:"#F472B6", to:"#EC4899" },
          ].map(({ label, val, emoji, from, to }) => (
            <div key={label} style={{ background:"#fff", borderRadius:16, padding:"14px 16px",
              boxShadow:"0 2px 12px rgba(0,0,0,0.06)", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
                background:`linear-gradient(135deg,${from},${to})`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                {emoji}
              </div>
              <div>
                <div style={{ fontSize:22, fontWeight:800, color:"#0F172A" }}>{val}</div>
                <div style={{ fontSize:11, color:"#94A3B8", fontWeight:500 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Progress + Filters ── */}
        <div style={{ background:"#fff", borderRadius:16, padding:"14px 18px", marginBottom:16,
          boxShadow:"0 2px 12px rgba(0,0,0,0.06)", display:"flex", alignItems:"center",
          justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ flex:1, minWidth:200 }}>
            <p style={{ fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase",
              letterSpacing:"0.07em", marginBottom:6 }}>Overall progress</p>
            <Progress tasks={tasks} />
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {[["all","All"],["critical","🔥"],["high","⬆"],["medium","➡"],["low","⬇"]].map(([v,l]) => (
              <button key={v} onClick={()=>setPriF(v)}
                style={{ fontSize:12, padding:"6px 14px", borderRadius:20, border:"none",
                  background: priF===v ? "linear-gradient(135deg,#818CF8,#6366F1)" : "#F1F5F9",
                  color: priF===v ? "#fff" : "#64748B",
                  cursor:"pointer", fontWeight: priF===v ? 700 : 500,
                  boxShadow: priF===v ? "0 3px 10px rgba(99,102,241,0.35)" : "none",
                  transition:"all 0.15s" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* ── Board view ── */}
        {view === "board" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,minmax(0,1fr))", gap:12 }}>
            {COLS.map(col => (
              <Column key={col} colId={col} tasks={byCol(col)}
                onEdit={task => setModal({ task })}
                onDelete={id => setTasks(ts=>ts.filter(t=>t.id!==id))}
                onMove={moveTask}
                onAdd={colId => setModal({ task:null, defaultCol:colId })} />
            ))}
          </div>
        )}

        {/* ── List view ── */}
        {view === "list" && (
          <div style={{ background:"#fff", borderRadius:20, overflow:"hidden",
            boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 90px",
              padding:"11px 18px", background:"#F8FAFC", borderBottom:"1px solid #F1F5F9" }}>
              {["Task","Category","Priority","Status","Due","Actions"].map(h => (
                <span key={h} style={{ fontSize:11, fontWeight:700, color:"#94A3B8",
                  textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</span>
              ))}
            </div>
            {filtered.length === 0 && (
              <div style={{ textAlign:"center", padding:"40px", color:"#CBD5E1" }}>No tasks found</div>
            )}
            {filtered.map((t, i) => {
              const ac = ACCENT[t.col];
              const cat = CAT[t.cat] || {};
              const pri = PRI[t.pri];
              const od = overdue(t);
              return (
                <div key={t.id} style={{
                  display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 90px",
                  padding:"13px 18px", borderBottom:"1px solid #F8FAFC",
                  alignItems:"center", animation:`fadeSlide 0.2s ease ${i*0.03}s both`,
                  background: i%2===0 ? "#fff" : "#FAFBFF",
                  transition:"background 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#F0F4FF"}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#FAFBFF"}>
                  <div>
                    <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#0F172A",
                      textDecoration:t.col==="done"?"line-through":"none" }}>{t.title}</p>
                    {t.desc && <p style={{ margin:"2px 0 0", fontSize:11, color:"#94A3B8" }}>{t.desc}</p>}
                  </div>
                  <span style={{ background:cat.bg, color:cat.fg, fontSize:10, fontWeight:600,
                    padding:"3px 8px", borderRadius:20, display:"inline-block" }}>
                    {cat.emoji} {t.cat}
                  </span>
                  <span style={{ fontSize:10, fontWeight:700, color:pri.color,
                    background:pri.color+"18", padding:"3px 8px", borderRadius:20, display:"inline-block" }}>
                    {pri.label}
                  </span>
                  <span style={{ background:`linear-gradient(135deg,${ac.from},${ac.to})`,
                    color:"#fff", fontSize:10, fontWeight:700,
                    padding:"3px 8px", borderRadius:20, display:"inline-block" }}>
                    {COL_LABEL[t.col]}
                  </span>
                  <span style={{ fontSize:11, color: od ? "#EF4444" : "#94A3B8", fontWeight: od?700:400 }}>
                    {od ? "⚠️ " : ""}{t.due || "—"}
                  </span>
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={() => setModal({ task:t })}
                      style={{ width:28, height:28, borderRadius:8, border:"1px solid #E0E7FF",
                        background:"#EEF2FF", cursor:"pointer", color:"#6366F1", fontSize:12,
                        display:"flex", alignItems:"center", justifyContent:"center" }}>✎</button>
                    <button onClick={() => setTasks(ts=>ts.filter(x=>x.id!==t.id))}
                      style={{ width:28, height:28, borderRadius:8, border:"1px solid #FFE4E6",
                        background:"#FFF1F2", cursor:"pointer", color:"#F43F5E", fontSize:14,
                        display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <Modal
          initial={modal.task || (modal.defaultCol ? { title:"", desc:"", cat:"Design", pri:"medium", col:modal.defaultCol, due:"" } : null)}
          onSave={saveTask}
          onClose={() => setModal(null)} />
      )}
    </div>
  );
}