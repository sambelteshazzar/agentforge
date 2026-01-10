import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Collaborator } from "@/hooks/useCollaboration";

interface LiveCursorsProps {
  collaborators: Collaborator[];
  containerRef: React.RefObject<HTMLElement>;
}

export const LiveCursors = ({ collaborators, containerRef }: LiveCursorsProps) => {
  const cursorsWithPosition = collaborators.filter(c => c.cursor);

  return (
    <AnimatePresence>
      {cursorsWithPosition.map((collaborator) => (
        <motion.div
          key={collaborator.id}
          className="pointer-events-none fixed z-50"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: collaborator.cursor!.x,
            y: collaborator.cursor!.y,
          }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ 
            type: "spring", 
            damping: 30, 
            stiffness: 500,
            mass: 0.5,
          }}
        >
          {/* Cursor arrow */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
          >
            <path
              d="M5 3L19 12L12 13L9 20L5 3Z"
              fill={collaborator.color}
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>

          {/* Name label */}
          <motion.div
            className="absolute left-5 top-4 px-2 py-1 rounded-md text-white text-xs font-medium whitespace-nowrap"
            style={{ backgroundColor: collaborator.color }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {collaborator.name}
            {collaborator.isTyping && (
              <span className="ml-1.5 inline-flex gap-0.5">
                <span className="w-1 h-1 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            )}
          </motion.div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

interface CursorTrackerProps {
  onCursorMove: (x: number, y: number) => void;
  throttleMs?: number;
}

export const CursorTracker = ({ onCursorMove, throttleMs = 50 }: CursorTrackerProps) => {
  const lastUpdate = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdate.current >= throttleMs) {
        onCursorMove(e.clientX, e.clientY);
        lastUpdate.current = now;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [onCursorMove, throttleMs]);

  return null;
};
