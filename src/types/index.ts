export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonVariant {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export interface WindowManagerConfig {
  theme?: "light" | "dark" | "system";
  animations?: boolean;
}

// Window specific types
export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}
