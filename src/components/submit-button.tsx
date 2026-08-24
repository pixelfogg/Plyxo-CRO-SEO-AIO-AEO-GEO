"use client";

import { useFormStatus } from "react-dom";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends ButtonProps {
  loadingText?: string;
}

export function SubmitButton({ children, loadingText, className, variant, size, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      disabled={pending || props.disabled} 
      className={className}
      variant={variant}
      size={size}
      {...props}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText || children}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
