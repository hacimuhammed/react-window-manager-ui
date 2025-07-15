import { useEffect, useRef, useState } from "react";

import { Button } from "./components/ui/button";
import { Window } from "./index";
import { useWindowManagerStore } from "./stores/windowManagerStore";

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
    <div className="h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">
          Task Manager Dashboard
        </h2>
        <p className="text-sm text-gray-600">
          Manage your daily tasks efficiently
        </p>
      </div>

      {/* Stats Cards */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {activeTasksCount}
          </div>
          <div className="text-xs text-blue-800">Active Tasks</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {completedTasksCount}
          </div>
          <div className="text-xs text-green-800">Completed</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {progressTasksCount}
          </div>
          <div className="text-xs text-purple-800">In Progress</div>
        </div>
      </div>

      {/* Task List */}
      <div className="p-4 flex-1 overflow-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800">Today's Tasks</h3>
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
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Enter new task..."
              className="w-full p-2 border rounded mb-2"
              onKeyPress={(e) => e.key === "Enter" && addTask()}
            />
            <div className="flex gap-2">
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

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-2 bg-gray-50 rounded"
            >
              <input
                type="checkbox"
                checked={task.status === "completed"}
                onChange={() => toggleTask(task.id)}
                className="w-4 h-4"
              />
              <span
                className={`flex-1 text-sm ${
                  task.status === "completed"
                    ? "line-through text-gray-500"
                    : "text-gray-800"
                }`}
              >
                {task.text}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  task.priority === "high"
                    ? "bg-red-100 text-red-800"
                    : task.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {task.priority}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteTask(task.id)}
                className="text-red-600 hover:bg-red-50"
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <div className="flex gap-2">
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
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 px-2 py-1 rounded">
              Live Demo
            </span>
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
            <div className="flex items-center gap-2">
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
                      component: <div className="p-4">New Demo App Window</div>,
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
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 h-full overflow-auto">
              <div className="max-w-full">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">
                  🚀 React Window Manager - Resize Features
                </h1>

                <div className="grid gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                    <h3 className="font-semibold text-lg mb-2">
                      📏 Resize Modes
                    </h3>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>
                        <code className="bg-gray-100 px-2 py-1 rounded">
                          resize={true}
                        </code>{" "}
                        - All direction resize
                      </li>
                      <li>
                        <code className="bg-gray-100 px-2 py-1 rounded">
                          resize="horizontal"
                        </code>{" "}
                        - Horizontal only
                      </li>
                      <li>
                        <code className="bg-gray-100 px-2 py-1 rounded">
                          resize="vertical"
                        </code>{" "}
                        - Vertical only
                      </li>
                      <li>
                        <code className="bg-gray-100 px-2 py-1 rounded">
                          resize="top"
                        </code>{" "}
                        - Top edge only
                      </li>
                      <li>
                        <code className="bg-gray-100 px-2 py-1 rounded">
                          resize={false}
                        </code>{" "}
                        - Resize disabled
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                    <h3 className="font-semibold text-lg mb-2">
                      📐 Size Constraints
                    </h3>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>
                        <code className="bg-gray-100 px-2 py-1 rounded">
                          minSize={`{width: 200, height: 150}`}
                        </code>
                      </li>
                      <li>
                        <code className="bg-gray-100 px-2 py-1 rounded">
                          maxSize={`{width: 1000, height: 800}`}
                        </code>
                      </li>
                      <li>This window: Min 600x400, Max 1000x700</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                    <h3 className="font-semibold text-lg mb-2">
                      🎮 Interactive Features
                    </h3>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>✅ Corner and edge resize handles</li>
                      <li>✅ Window dragging</li>
                      <li>✅ Fullscreen toggle (double-click header)</li>
                      <li>✅ Smooth animations</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
                    <h3 className="font-semibold text-lg mb-2">
                      🔧 Try It Out!
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Try resizing this window. You'll see different cursors on
                      corners and edges.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    💡 <strong>Tip:</strong> Double-click the header to toggle
                    fullscreen mode!
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-8">
      <WindowManager />

      {/* Desktop Shortcut - Windows 11 Style */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <button
            onClick={openTaskManager}
            className="group flex flex-col items-center p-4 rounded-lg hover:bg-white/20 transition-all duration-200 hover:scale-105"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-300 to-purple-400 rounded-lg flex items-center justify-center text-white text-2xl shadow-lg group-hover:shadow-xl transition-shadow">
              📱
            </div>
            <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-gray-900">
              Task Manager
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
