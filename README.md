# React Window Manager UI - Draggable & Resizable Windows Component

![NPM Downloads](https://img.shields.io/npm/d18m/react-window-manager-ui)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

A powerful and lightweight React component library for creating draggable, resizable, and fully customizable desktop-like window interfaces. Perfect for building admin panels, dashboards, IDEs, or any application requiring windowed interfaces with comprehensive TypeScript support.

## Features

- **Draggable Windows** - Smooth drag functionality with touch support
- **Advanced Resizing** - Comprehensive resize controls with configurable handles
- **Animation System** - Built-in animation types with smooth transitions
- **Fullscreen Support** - Native fullscreen mode with custom animations
- **Touch Compatible** - Full mobile and tablet support
- **Customizable UI** - Custom icons, toolbars, and styling options
- **Flexible Constraints** - Configurable min/max sizes and screen boundaries

## Quick Start

Get started with React Window Manager UI in just 2 steps:

### Step 1: Install the package

```bash
npm install react-window-manager-ui
```

```bash
bun add react-window-manager-ui
```

### Step 2: Import and use

```tsx
import React from "react";
import { Window } from "react-window-manager-ui";

function App() {
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <Window
        id="example-window"
        title="My Application"
        position={{ x: 100, y: 100 }}
        size={{ width: 600, height: 400 }}
      >
        <div style={{ padding: "20px" }}>
          <h2>Welcome to Window Manager</h2>
          <p>This window is draggable, resizable, and fully customizable.</p>
        </div>
      </Window>
    </div>
  );
}
```

## Advanced Usage

### Custom Animations and Styling

```tsx
<Window
  id="animated-window"
  title="Animated Window"
  animation="jellyfish"
  className="custom-window-style"
  icons={{
    fullscreen: <CustomFullscreenIcon />,
    fullscreenExit: <CustomExitIcon />,
    close: <CustomCloseIcon />,
  }}
>
  <div>Content with custom animations</div>
</Window>
```

### Multiple Windows Example

```tsx
import React, { useState } from "react";
import { Window } from "react-window-manager-ui";

function MultiWindowApp() {
  const [windows, setWindows] = useState([
    { id: "app1", title: "Calculator", x: 100, y: 100 },
    { id: "app2", title: "Text Editor", x: 300, y: 150 },
    { id: "app3", title: "File Manager", x: 500, y: 200 },
  ]);

  const removeWindow = (id: string) => {
    setWindows(windows.filter((w) => w.id !== id));
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {windows.map((window) => (
        <Window
          key={window.id}
          id={window.id}
          title={window.title}
          position={{ x: window.x, y: window.y }}
          size={{ width: 400, height: 300 }}
          onClose={() => removeWindow(window.id)}
        >
          <div style={{ padding: "20px" }}>Content for {window.title}</div>
        </Window>
      ))}
    </div>
  );
}
```

## API Reference

### Window Component

#### Props

| Property             | Type                                | Default                       | Description                      |
| -------------------- | ----------------------------------- | ----------------------------- | -------------------------------- |
| `id`                 | `string`                            | **Required**                  | Unique identifier for the window |
| `title`              | `string \| React.ReactNode`         | `"Window"`                    | Window title content             |
| `children`           | `React.ReactNode`                   | -                             | Main window content              |
| `position`           | `{ x: number; y: number }`          | `{ x: 100, y: 100 }`          | Initial window position          |
| `size`               | `{ width: number; height: number }` | `{ width: 800, height: 600 }` | Initial window size              |
| `toolbar`            | `React.ReactNode \| string`         | -                             | Custom toolbar content           |
| `className`          | `string`                            | `""`                          | Additional CSS classes           |
| `animation`          | `WindowAnimationType`               | `undefined`                   | Animation type override          |
| `resize`             | `ResizeOptions`                     | `true`                        | Resize configuration             |
| `minSize`            | `{ width: number; height: number }` | `{ width: 200, height: 150 }` | Minimum window size              |
| `maxSize`            | `{ width: number; height: number }` | -                             | Maximum window size              |
| `allowFullscreen`    | `boolean`                           | `true`                        | Enable fullscreen functionality  |
| `icons`              | `CustomIcons`                       | -                             | Custom icon components           |
| `onClose`            | `() => void`                        | -                             | Close event callback             |
| `onToggleFullscreen` | `(isFullscreen: boolean) => void`   | -                             | Fullscreen toggle callback       |

## TypeScript Support

Full TypeScript definitions are included:

```tsx
import {
  Window,
  WindowProps,
  WindowAnimationType,
} from "react-window-manager-ui";

const CustomWindow: React.FC<WindowProps> = (props) => {
  return <Window {...props} />;
};
```

## License

MIT License - see [LICENSE](LICENSE) file for details.
