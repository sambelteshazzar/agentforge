import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
  className?: string;
}

export function FavoriteButton({ isFavorite, onToggle, size = "md", className }: FavoriteButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        size === "sm" ? "h-7 w-7" : "h-9 w-9",
        className
      )}
    >
      <Star
        className={cn(
          size === "sm" ? "w-4 h-4" : "w-5 h-5",
          "transition-all",
          isFavorite 
            ? "fill-yellow-500 text-yellow-500" 
            : "text-muted-foreground hover:text-yellow-500"
        )}
      />
    </Button>
  );
}
