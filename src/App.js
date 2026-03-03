import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const [dark, setDark] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [popup, setPopup] = useState(null);
  const [toasts, setToasts] = useState([]); // queue of reminders



  // Load saved data
  useEffect(() => {
    const t = JSON.parse(localStorage.getItem("todos"));
    const d = JSON.parse(localStorage.getItem("darkMode"));
    if (t) setTodos(t);
    if (d !== null) setDark(d);
  }, []);

  // Save todos
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Save dark mode
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(dark));
  }, [dark]);

  // 🔔 Due date reminder (runs on app load & todo change)
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    // Find all due todos that haven't been alerted
    const dueTodos = todos.filter(
      (t) => t.date === today && !t.completed && !t.alerted
    );

    if (dueTodos.length > 0) {
      const updated = todos.map((t) =>
        dueTodos.includes(t) ? { ...t, alerted: true } : t
      );
      setTodos(updated);

      setPopup(dueTodos[0].text);
      setToasts((prev) => [...prev, ...dueTodos.map((t) => t.text)]);

      const audio = new Audio(
        "https://www.soundjay.com/buttons/sounds/button-3.mp3"
      );
      audio.play().catch(() => { });
    }
  }, [todos]);

  const addTodo = () => {
    if (!text.trim()) return;

    if (editIndex !== null) {
      const updated = [...todos];
      updated[editIndex] = {
        ...updated[editIndex],
        text,
        date
      };
      setTodos(updated);
      setEditIndex(null);
    } else {
      setTodos([
        ...todos,
        { text, date, completed: false, alerted: false }
      ]);
    }

    setText("");
    setDate("");
  };

  const toggleTodo = (index) => {
    const updated = [...todos];
    updated[index].completed = !updated[index].completed;
    setTodos(updated);
  };

  const deleteTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  const editTodo = (index) => {
    setText(todos[index].text);
    setDate(todos[index].date);
    setEditIndex(index);
  };

  // Drag & drop
  const onDragStart = (index) => setDragIndex(index);

  const onDrop = (index) => {
    const updated = [...todos];
    const dragged = updated.splice(dragIndex, 1)[0];
    updated.splice(index, 0, dragged);
    setTodos(updated);
  };

  // Filter + Search
  const filteredTodos = todos.filter(todo => {
    if (filter === "completed" && !todo.completed) return false;
    if (filter === "pending" && todo.completed) return false;
    if (!todo.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // 📊 Stats
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const pending = total - completed;

  return (
    <div className={dark ? "app dark" : "app"}>
      <div className="container">
        <header>
          <h1>Todo App</h1>
          <button className="mode" onClick={() => setDark(!dark)}>
            {dark ? "☀️" : "🌙"}
          </button>
        </header>

        {/* 📊 Stats */}
        <div className="stats">
          <span>Total: {total}</span>
          <span>Done: {completed}</span>
          <span>Pending: {pending}</span>
        </div>

        <div className="input-box">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Task..."
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button onClick={addTodo}>
            {editIndex !== null ? "💾" : "➕"}
          </button>
        </div>

        <input
          className="search"
          placeholder="Search todos..."
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filters">
          <button onClick={() => setFilter("all")}>All</button>
          <button onClick={() => setFilter("completed")}>Completed</button>
          <button onClick={() => setFilter("pending")}>Pending</button>
        </div>

        <ul className="todo-list">
          {filteredTodos.map((todo, index) => (
            <li
              key={index}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(index)}
              className={`todo-item ${todo.completed ? "done" : ""}`}
            >
              <span onClick={() => toggleTodo(index)}>
                {todo.text}
                {todo.date && <small> 📅 {todo.date}</small>}
              </span>
              <div>
                <button onClick={() => editTodo(index)}>✏️</button>
                <button onClick={() => deleteTodo(index)}>🗑</button>
              </div>


            </li>
          ))}
        </ul>
        {popup && (
          <div className="popup-overlay">
            <div className="popup">
              <h3>⏰ Reminder</h3>
              <p>{popup} is due today!</p>
              <button onClick={() => setPopup(null)}>OK</button>
            </div>
          </div>
        )}

        <div className="toast-container">
          {toasts.map((msg, idx) => (
            <div key={idx} className="toast">
              <span>⏰ {msg} is due today!</span>
              <div>
                <button
                  onClick={() => setToasts(toasts.filter((_, i) => i !== idx))}
                >
                  ✅
                </button>
                <button
                  onClick={() => {
                    // snooze: put it back after 5 min
                    setToasts(toasts.filter((_, i) => i !== idx));
                    setTimeout(() => setToasts((prev) => [...prev, msg]), 300000);
                  }}
                >
                  💤
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
