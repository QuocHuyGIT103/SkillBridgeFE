// src/components/ui/LoadingSpinner.tsx
import { Spinner } from "@heroui/react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md", 
  color = "primary" 
}) => {
  return (
    <div className="flex justify-center items-center p-4">
      <Spinner size={size} color={color} />
    </div>
  );
};
