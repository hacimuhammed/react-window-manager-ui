import { useEffect, useRef, useState } from "react";

import { Button } from "./components/ui/button";
import { Window } from "./index";
import { useWindowManagerStore } from "./stores/windowManagerStore";
import "./App.css";

const WindowManager = () => {
  const { windows } = useWindowManagerStore();

  return (
    <>
      {windows.map((win) => (
        <Window
          key={win.id}
          id={win.id}
          title={win.title}
          position={win.position}
          size={win.size}
          animation="jellyfish"
          resize={win.data?.resize}
          minSize={win.data?.minSize}
          maxSize={win.data?.maxSize}
          toolbar={win.data?.toolbar}
          allowFullscreen={win.data?.allowFullscreen}
        >
          {win.data?.component}
        </Window>
      ))}
    </>
  );
};

// Task Manager State
interface Task {
  id: number;
  text: string;
  status: "active" | "completed" | "progress";
  priority: "high" | "medium" | "low";
}

const TaskManagerContent = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      text: "Complete window manager documentation",
      status: "completed",
      priority: "high",
    },
    {
      id: 2,
      text: "Review pull requests",
      status: "active",
      priority: "medium",
    },
    {
      id: 3,
      text: "Design new UI components",
      status: "active",
      priority: "low",
    },
    {
      id: 4,
      text: "Test resize functionality",
      status: "progress",
      priority: "high",
    },
    {
      id: 5,
      text: "Optimize performance",
      status: "active",
      priority: "medium",
    },
  ]);

  const [newTaskText, setNewTaskText] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const addTask = () => {
    if (newTaskText.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          text: newTaskText.trim(),
          status: "active",
          priority: "medium",
        },
      ]);
      setNewTaskText("");
      setShowAddForm(false);
    }
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === "completed" ? "active" : "completed",
            }
          : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const activeTasksCount = tasks.filter((t) => t.status === "active").length;
  const completedTasksCount = tasks.filter(
    (t) => t.status === "completed"
  ).length;
  const progressTasksCount = tasks.filter(
    (t) => t.status === "progress"
  ).length;

  return (
    <div className="task-manager-content">
      {/* Header */}
      <div className="task-manager-header">
        <h2 className="task-manager-title">Task Manager Dashboard</h2>
        <p className="task-manager-subtitle">
          Manage your daily tasks efficiently
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-active">
          <div className="stat-number stat-number-active">
            {activeTasksCount}
          </div>
          <div className="stat-label stat-label-active">Active Tasks</div>
        </div>
        <div className="stat-card stat-card-completed">
          <div className="stat-number stat-number-completed">
            {completedTasksCount}
          </div>
          <div className="stat-label stat-label-completed">Completed</div>
        </div>
        <div className="stat-card stat-card-progress">
          <div className="stat-number stat-number-progress">
            {progressTasksCount}
          </div>
          <div className="stat-label stat-label-progress">In Progress</div>
        </div>
      </div>

      {/* Task List */}
      <div className="task-list-container">
        <div className="task-list-header">
          <h3 className="task-list-title">Today's Tasks</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            + Add Task
          </Button>
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="add-task-form">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Enter new task..."
              className="task-input"
              onKeyPress={(e) => e.key === "Enter" && addTask()}
            />
            <div className="form-actions">
              <Button size="sm" onClick={addTask}>
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div>
          {tasks.map((task) => (
            <div key={task.id} className="task-item">
              <input
                type="checkbox"
                checked={task.status === "completed"}
                onChange={() => toggleTask(task.id)}
                className="task-checkbox"
              />
              <span
                className={`task-text ${
                  task.status === "completed" ? "task-text-completed" : ""
                }`}
              >
                {task.text}
              </span>
              <span
                className={`task-priority ${
                  task.priority === "high"
                    ? "priority-high"
                    : task.priority === "medium"
                    ? "priority-medium"
                    : "priority-low"
                }`}
              >
                {task.priority}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteTask(task.id)}
                className="delete-button"
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="task-manager-footer">
        <div className="footer-content">
          <div className="footer-text">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <div className="footer-actions">
            <Button size="sm" variant="outline">
              Settings
            </Button>
            <Button size="sm">Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { addWindow, windows } = useWindowManagerStore();
  const initialized = useRef(false);

  const openTaskManager = () => {
    // Check if Task Manager is already open
    if (windows.find((w) => w.id === "task-manager")) {
      return; // Already open
    }

    addWindow({
      id: "task-manager",
      title: "📱 Task Manager Dashboard",
      type: "component",
      position: { x: 100, y: 100 },
      size: { width: 600, height: 700 },
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
      data: {
        toolbar: (
          <div className="toolbar-item">
            <span className="toolbar-badge">Live Demo</span>
          </div>
        ),
        component: <TaskManagerContent />,
        resize: true,
        minSize: { width: 400, height: 500 },
        maxSize: { width: 900, height: 1000 },
      },
    });
  };

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      // Only open the tutorial window by default
      addWindow({
        id: "resize-guide",
        title: "🎯 Resize Guide - Interactive Tutorial",
        type: "component",
        position: { x: 50, y: 50 },
        size: { width: 700, height: 500 },
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
        data: {
          toolbar: (
            <div className="toolbar-item">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  addWindow({
                    id: `demo-app-${Date.now()}`,
                    title: "Demo Application",
                    type: "component",
                    position: { x: 150, y: 100 },
                    size: { width: 800, height: 600 },
                    isMinimized: false,
                    isMaximized: false,
                    zIndex: 1,
                    data: {
                      component: (
                        <div className="padded-div">New Demo App Window</div>
                      ),
                      resize: true,
                      minSize: { width: 400, height: 300 },
                    },
                  });
                }}
              >
                + New Window
              </Button>
            </div>
          ),
          component: (
            <div className="resize-guide-content">
              <div>
                <h1 className="resize-guide-title">
                  🚀 React Window Manager - Resize Features
                </h1>

                <div className="guide-section-grid">
                  <div className="guide-card guide-card-blue">
                    <h3 className="guide-card-title">📏 Resize Modes</h3>
                    <ul className="guide-list">
                      <li>
                        <code className="code-snippet">resize={true}</code> - All
                        direction resize
                      </li>
                      <li>
                        <code className="code-snippet">
                          resize="horizontal"
                        </code>{" "}
                        - Horizontal only
                      </li>
                      <li>
                        <code className="code-snippet">resize="vertical"</code> - Vertical
                        only
                      </li>
                      <li>
                        <code className="code-snippet">resize="top"</code> - Top edge
                        only
                      </li>
                      <li>
                        <code className="code-snippet">resize={false}</code> - Resize
                        disabled
                      </li>
                    </ul>
                  </div>

                  <div className="guide-card guide-card-green">
                    <h3 className="guide-card-title">📐 Size Constraints</h3>
                    <ul className="guide-list">
                      <li>
                        <code className="code-snippet">
                          minSize={`{width: 200, height: 150}`}
                        </code>
                      </li>
                      <li>
                        <code className="code-snippet">
                          maxSize={`{width: 1000, height: 800}`}
                        </code>
                      </li>
                      <li>This window: Min 600x400, Max 1000x700</li>
                    </ul>
                  </div>

                  <div className="guide-card guide-card-purple">
                    <h3 className="guide-card-title">
                      🎮 Interactive Features
                    </h3>
                    <ul className="guide-list">
                      <li>
                        <code className="code-snippet">allowFullscreen</code>:
                        Double-click header to toggle.
                      </li>
                      <li>
                        <code className="code-snippet">
                          animation="jellyfish"
                        </code>
                        : Fun window animation.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="footer-text" style={{ textAlign: "center" }}>
                  <p>
                    This is a demo of the windowing system's capabilities.
                    <br />
                    Try resizing, moving, and creating new windows!
                  </p>
                </div>
              </div>
            </div>
          ),
          resize: true,
          minSize: { width: 600, height: 400 },
          maxSize: { width: 1000, height: 700 },
        },
      });
    }
  }, [addWindow]);

  return (
    <div className="app-container">
      {/* Top Toolbar */}
      <div className="toolbar">
        <Button size="sm" onClick={openTaskManager}>
          Open Task Manager
        </Button>
      </div>

      {/* Main Content Area */}
      <main className="main-content">
        <WindowManager />
      </main>
    </div>
  );
}

export default App;
