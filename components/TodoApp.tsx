"use client";
import React, { useEffect, useMemo, useState } from "react";

type Tag = "work" | "personal" | "health" | "";
type Repeat = "none" | "daily" | "weekly" | "monthly";

type Task = {
  id: string;
  title: string;
  done: boolean;
  due?: string | null;
  tag?: Tag;
  repeat?: Repeat;
  description?: string;
  createdAt: number;
  updatedAt: number;
};

type Filter = "all" | "active" | "done";

const LS_KEY = "vercel_todo_tasks_v2";

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(tasks));
}

function Icon({ name }: { name: "edit"|"trash"|"check"|"x" }) {
  const sz = 16;
  const stroke = "currentColor";
  if (name === "edit") {
    return (
      <svg width={sz} height={sz} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="none" stroke={stroke} strokeWidth="2" d="M3 21l3.9-1 11.5-11.5a2.1 2.1 0 10-3-3L4.9 17 3 21zM14 6l4 4" />
      </svg>
    );
  }
  if (name === "trash") {
    return (
      <svg width={sz} height={sz} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="none" stroke={stroke} strokeWidth="2" d="M4 7h16M9 7V5h6v2m-8 0l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13" />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg width={sz} height={sz} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="none" stroke={stroke} strokeWidth="2" d="M20 6L9 17l-5-5" />
      </svg>
    );
  }
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke={stroke} strokeWidth="2" d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState<string>("");
  const [due, setDue] = useState<string>("");
  const [repeat, setRepeat] = useState<Repeat>("none");
  const [tag, setTag] = useState<Tag>("");
  const [desc, setDesc] = useState<string>("");

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  useEffect(() => { setTasks(loadTasks()); }, []);
  useEffect(() => { saveTasks(tasks); }, [tasks]);

  const filtered = useMemo(() => {
    let t = tasks;
    if (filter === "active") t = tasks.filter(t => !t.done);
    if (filter === "done") t = tasks.filter(t => t.done);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      t = t.filter(x => x.title.toLowerCase().includes(q) || (x.description ?? "").toLowerCase().includes(q));
    }
    return [...t].sort((a,b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const ad = a.due ? Date.parse(a.due) : Infinity;
      const bd = b.due ? Date.parse(b.due) : Infinity;
      if (ad !== bd) return ad - bd;
      return b.createdAt - a.createdAt;
    });
  }, [tasks, filter, query]);

  function addTask() {
    const title = input.trim();
    if (!title) return;
    const now = Date.now();
    const newTask: Task = {
      id: Math.random().toString(36).slice(2),
      title,
      done: false,
      due: due || null,
      repeat,
      tag,
      description: desc.trim() || undefined,
      createdAt: now,
      updatedAt: now
    };
    setTasks(prev => [newTask, ...prev]);
    setInput(""); setDue(""); setRepeat("none"); setTag(""); setDesc("");
  }

  function toggleTask(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done, updatedAt: Date.now() } : t));
  }
  function deleteTask(id: string) { setTasks(prev => prev.filter(t => t.id !== id)); }
  function startEdit(task: Task) { setEditingId(task.id); setEditingText(task.title); }
  function saveEdit(id: string) {
    const text = editingText.trim();
    if (!text) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title: text, updatedAt: Date.now() } : t));
    setEditingId(null); setEditingText("");
  }
  function clearDone() { setTasks(prev => prev.filter(t => !t.done)); }

  const leftCount = tasks.filter(t => !t.done).length;
  const today = new Date().toISOString().slice(0,10);

  function DueChip(task: Task) {
    const due = task.due;
    if (!due) return null;
    const overdue = !task.done && due < today;
    const cls = "pill " + (overdue ? "overdue" : "due");
    return <span className={cls} aria-label={overdue ? "Overdue" : "Due date"}>{overdue ? "Overdue: " : "Due: "}{due}</span>;
  }
  function TagChip(task: Task) {
    if (!task.tag) return null;
    return <span className={"pill tag-" + task.tag}>#{task.tag}</span>;
  }
  function RepeatChip(task: Task) {
    if (!task.repeat || task.repeat === "none") return null;
    return <span className="pill repeat">Repeats: {task.repeat}</span>;
  }

  return (
    <div className="container">
      <div className="card">
        <header className="hero">
          <div>
            <h1>ToDo</h1>
            <div className="muted">Local-first, deploy-ready on Vercel</div>
          </div>
          <div className="row">
            <input
              type="text" placeholder="Search tasks…" value={query}
              onChange={e => setQuery(e.target.value)} aria-label="Search tasks"
            />
            <select value={filter} onChange={e => setFilter(e.target.value as Filter)} aria-label="Filter tasks">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="done">Done</option>
            </select>
          </div>
        </header>

        <div className="grid">
          <div className="input-card">
            <div className="input-grid">
              <div className="input-row-1">
                <div className="field">
                  <label className="label" htmlFor="newTask">Task</label>
                  <input
                    id="newTask"
                    type="text"
                    placeholder="What do you need to do?"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addTask(); }}
                    aria-label="New task title"
                  />
                </div>
              </div>

              <div className="input-row-2">
                <div className="field">
                  <label className="label" htmlFor="due">Due date</label>
                  <input
                    id="due"
                    type="date"
                    value={due}
                    min={today}
                    onChange={(e) => setDue(e.target.value)}
                    aria-label="Due date"
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="repeat">Repeat</label>
                  <select id="repeat" value={repeat} onChange={(e)=>setRepeat(e.target.value as Repeat)}>
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label" htmlFor="tag">Tag</label>
                  <select id="tag" value={tag} onChange={(e)=>setTag(e.target.value as Tag)}>
                    <option value="">None</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="health">Health</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label" htmlFor="desc">Description</label>
                  <textarea
                    id="desc"
                    placeholder="Optional details…"
                    value={desc}
                    onChange={(e)=>setDesc(e.target.value)}
                  />
                </div>
                <div className="field" style={{alignItems:'flex-end'}}>
                  <label className="label" style={{visibility:'hidden'}}>Add</label>
                  <button onClick={addTask} aria-label="Add task">Add</button>
                </div>
              </div>
            </div>
          </div>

          <ul className="tasks" role="list" aria-label="Task list">
            {filtered.map((task) => {
              const status = task.done
                ? <span className="pill status-done" aria-label="Status done">Done</span>
                : <span className="pill status-active" aria-label="Status active">Active</span>;
              return (
                <li key={task.id} className={"task " + (task.done ? "done" : "")}>
                  <input
                    type="checkbox" checked={task.done}
                    onChange={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} ${task.done ? "active" : "done"}`}
                  />

                  <div className="task-title">
                    <div className="task-topline">
                      {editingId === task.id ? (
                        <input
                          className="edit" value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveEdit(task.id); }}
                          aria-label="Edit task title" autoFocus
                        />
                      ) : (
                        <div className={"task-name " + (task.done ? "done" : "")}>{task.title}</div>
                      )}
                    </div>
                    {task.description ? <div className="desc">{task.description}</div> : null}
                    <div className="meta-row">
                      {status}
                      {TagChip(task)}
                      {RepeatChip(task)}
                      {DueChip(task)}
                    </div>
                  </div>

                  <div className="task-actions">
                    {editingId === task.id ? (
                      <>
                        <button className="icon-btn primary" onClick={() => saveEdit(task.id)} aria-label="Save">
                          <Icon name="check" />
                        </button>
                        <button className="icon-btn" onClick={() => { setEditingId(null); setEditingText(""); }} aria-label="Cancel">
                          <Icon name="x" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="icon-btn primary" onClick={() => startEdit(task)} aria-label="Edit">
                          <Icon name="edit" />
                        </button>
                        <button className="icon-btn danger" onClick={() => deleteTask(task.id)} aria-label="Delete">
                          <Icon name="trash" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="footer">
          <span className="muted">{leftCount} left</span>
          <div className="row">
            <button className="secondary" onClick={clearDone}>Clear Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}
