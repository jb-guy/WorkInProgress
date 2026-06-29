import { motion } from "motion/react";

/**
 * Fallback component shown while Three.js scenes are being loaded
 * Keeps viewport height consistent and provides visual feedback
 */
export const SceneLoadingFallback = ({ height = "h-svh" }: { height?: string }) => (
  <div className={`${height} w-full flex items-center justify-center`}>
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="text-xs font-mono text-slate-400 uppercase tracking-widest"
    >
      Loading scene...
    </motion.div>
  </div>
);
