import { useState, useEffect } from "react";

// --------------------- UTILITIES -----------------------
const genId = () => Math.random().toString(36).slice(2);

const PRIORITY_COLOR = {
  High: "bg-red-500",
  Medium: "bg-yellow-500",
  Low: "bg-green-500",
};

// Auto priority logic
function autoPriority(date) {
  if (!date) return "Low";

  const diff = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);

  if (diff <= 1) return "High";
  if (diff <= 3) return "Medium";
  return "Low";
}

// --------------------- MAIN APP -----------------------
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [modal, setModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [focusTask, setFocusTask] = useState(null);
  const [timer, setTimer] = useState(1500); // 25 min
  const [running, setRunning] = useState(false);

  // Load from storage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("tasks") || "[]");
    setTasks(saved);
  }, []);

  // Save to storage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Timer logic
  useEffect(() => {
    let t;
    if (running) {
      t = setInterval(() => setTimer((s) => s - 1), 1000);
    }
    return () => clearInterval(t);
  }, [running]);

  // ------------------ CRUD ------------------
  const saveTask = (task) => {
    if (task.id) {
      setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    } else {
      task.id = genId();
      setTasks([...tasks, task]);
    }
    setModal(false);
    setEditTask(null);
  };

  const delTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

  const moveTask = (id, status) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status } : t)));

  // ------------------ UI ------------------
  return (
    <div className="min-h-screen bg-gray-900 text-white p-5">
      <h1 className="text-4xl font-bold mb-5">Task Manager</h1>

      <button
        className="mb-5 px-4 py-2 bg-blue-500 rounded"
        onClick={() => {
          setModal(true);
          setEditTask(null);
        }}
      >
        + New Task
      </button>

      <div className="grid grid-cols-3 gap-5">
        {["todo", "progress", "done"].map((col) => (
          <Column
            key={col}
            title={col}
            tasks={tasks.filter((t) => t.status === col)}
            onEdit={(t) => {
              setEditTask(t);
              setModal(true);
            }}
            onDelete={delTask}
            onMove={moveTask}
            onFocus={setFocusTask}
          />
        ))}
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <TaskModal
          task={editTask}
          onSave={saveTask}
          onClose={() => setModal(false)}
        />
      )}

      {/* Focus Mode */}
      {focusTask && (
        <FocusMode
          task={focusTask}
          timer={timer}
          running={running}
          setRunning={setRunning}
          reset={() => setTimer(1500)}
          close={() => {
            setFocusTask(null);
            setRunning(false);
            setTimer(1500);
          }}
        />
      )}
    </div>
  );
}

// ----------------------- COLUMN -----------------------
function Column({ title, tasks, onEdit, onDelete, onMove, onFocus }) {
  const label =
    title === "todo"
      ? "To Do"
      : title === "progress"
      ? "In Progress"
      : "Completed";

  return (
    <div className="bg-gray-800 p-4 rounded">
      <h2 className="text-xl font-semibold mb-3">{label}</h2>

      {tasks.map((t) => (
        <div key={t.id} className="bg-gray-700 p-3 rounded mb-3">
          <div className="flex justify-between">
            <h3 className="text-lg font-bold">{t.title}</h3>
            <span
              className={`${PRIORITY_COLOR[t.priority]} px-2 py-1 rounded text-sm`}
            >
              {t.priority}
            </span>
          </div>

          <p className="text-sm opacity-80">{t.desc}</p>

          <div className="mt-3 flex gap-2">
            <button
              className="px-2 py-1 bg-blue-500 rounded text-sm"
              onClick={() => onEdit(t)}
            >
              Edit
            </button>
            <button
              className="px-2 py-1 bg-red-500 rounded text-sm"
              onClick={() => onDelete(t.id)}
            >
              Delete
            </button>
            <button
              className="px-2 py-1 bg-green-500 rounded text-sm"
              onClick={() => onFocus(t)}
            >
              Focus
            </button>
          </div>

          <div className="mt-2 flex gap-2">
            {title !== "todo" && (
              <button
                className="text-xs underline"
                onClick={() => onMove(t.id, "todo")}
              >
                To Do
              </button>
            )}
            {title !== "progress" && (
              <button
                className="text-xs underline"
                onClick={() => onMove(t.id, "progress")}
              >
                Progress
              </button>
            )}
            {title !== "done" && (
              <button
                className="text-xs underline"
                onClick={() => onMove(t.id, "done")}
              >
                Done
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ----------------------- MODAL -----------------------
function TaskModal({ task, onSave, onClose }) {
  const [title, setTitle] = useState(task?.title || "");
  const [desc, setDesc] = useState(task?.desc || "");
  const [date, setDate] = useState(task?.date || "");

  const priority = autoPriority(date);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-gray-800 p-5 rounded w-96">
        <h2 className="text-xl font-bold mb-3">
          {task ? "Edit Task" : "New Task"}
        </h2>

        <input
          className="w-full p-2 mb-2 bg-gray-700 rounded"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-2 mb-2 bg-gray-700 rounded"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <input
          type="date"
          className="w-full p-2 mb-2 bg-gray-700 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button
          className="w-full px-4 py-2 bg-blue-500 rounded mb-2"
          onClick={() =>
            onSave({
              id: task?.id,
              title,
              desc,
              date,
              priority,
              status: task?.status || "todo",
            })
          }
        >
          Save
        </button>

        <button className="w-full px-4 py-2 bg-red-600 rounded" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ----------------------- FOCUS MODE -----------------------
function FocusMode({ task, timer, running, setRunning, reset, close }) {
  const minutes = Math.floor(timer / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timer % 60).toString().padStart(2, "0");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col justify-center items-center text-center p-5">
      <h1 className="text-3xl font-bold mb-5">{task.title}</h1>

      <div className="text-6xl font-bold mb-5">
        {minutes}:{seconds}
      </div>

      <div className="flex gap-3">
        <button
          className="px-4 py-2 bg-green-500 rounded"
          onClick={() => setRunning(!running)}
        >
          {running ? "Pause" : "Start"}
        </button>

        <button className="px-4 py-2 bg-yellow-500 rounded" onClick={reset}>
          Reset
        </button>

        <button className="px-4 py-2 bg-red-500 rounded" onClick={close}>
          Exit
        </button>
      </div>
    </div>
  );
}