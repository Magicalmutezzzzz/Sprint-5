import { useState, useEffect } from "react";
import "./App.css";
import {
  DndContext,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

// -------------------- Task Card --------------------

function TaskCard({ task, children }) {
  const { attributes, listeners, setNodeRef, transform } =
    useDraggable({
      id: task.id,
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px,0)`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task ${task.priority.toLowerCase()}`}
    >
      <div
        className="dragHandle"
        {...listeners}
        {...attributes}
      >
        ⠿ Drag
      </div>
      {children}
    </div>
  );
}

// -------------------- Drop Column --------------------

function DropColumn({ id, children }) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div ref={setNodeRef}>
      {children}
    </div>
  );
}

// -------------------- App --------------------

function App() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // Load Local Storage

  useEffect(() => {
    const saved = localStorage.getItem("tasks");

    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Save Local Storage

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Add Task

  const addTask = () => {
    if (!text.trim()) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text,
        priority,
        status: "todo",
      },
    ]);

    setText("");
    setPriority("Medium");
  };

  // Delete Task

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Edit

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, text: editText }
          : task
      )
    );

    setEditingId(null);
    setEditText("");
  };

  // Drag & Drop

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === active.id
          ? {
              ...task,
              status: over.id,
            }
          : task
      )
    );
  };

  // Search

  const filteredTasks = tasks.filter((task) =>
    task.text.toLowerCase().includes(search.toLowerCase())
  );

  // Render Column

  const renderColumn = (title, status) => (
    <DropColumn id={status}>
      <div className="column">

        <h2>
          {title} (
          {
            filteredTasks.filter(
              (task) => task.status === status
            ).length
          }
          )
        </h2>

        {filteredTasks.filter(
          (task) => task.status === status
        ).length === 0 ? (
          <p className="empty">
            No Tasks Yet 🚀
          </p>
        ) : (
          filteredTasks
            .filter(
              (task) =>
                task.status === status
            )
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
              >
                {editingId === task.id ? (
                  <input
                    className="editInput"
                    value={editText}
                    onChange={(e) =>
                      setEditText(
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <h4>{task.text}</h4>
                )}

                <div
                  className={`priorityBadge ${task.priority.toLowerCase()}`}
                >
                  {task.priority}
                </div>

                <div className="buttons">

                  {editingId === task.id ? (
                    <button
                      onClick={() =>
                        saveEdit(task.id)
                      }
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        startEditing(task)
                      }
                    >
                      Edit
                    </button>
                  )}

                  <button
                    className="delete"
                    onClick={() =>
                      deleteTask(task.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </TaskCard>
            ))
        )}

      </div>
    </DropColumn>
  );

    return (
    <div className="App">
      <h1>🚀 Task Management Board</h1>

      <div className="topBar">
        <input
          type="text"
          placeholder="Enter Task..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addTask();
            }
          }}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="High">🔴 High</option>
          <option value="Medium">🟠 Medium</option>
          <option value="Low">🟢 Low</option>
        </select>

        <button onClick={addTask}>
          ➕ Add Task
        </button>
      </div>

      <input
        className="search"
        type="text"
        placeholder="🔍 Search Task..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DndContext onDragEnd={handleDragEnd}>
        <div className="board">
          {renderColumn("📋 To Do", "todo")}
          {renderColumn("⚡ In Progress", "progress")}
          {renderColumn("✅ Done", "done")}
        </div>
      </DndContext>

      <footer className="footer">
        <p>
          Built with ❤️ using React.js • Sprint 5 • Task Management Board
        </p>
      </footer>
    </div>
  );
}

export default App;