"use client";

import * as React from "react";
import { motion } from "framer-motion";

export function ResultReveal({
  scorePct,
  children,
}: {
  scorePct: number;
  children: React.ReactNode;
}) {
  const message =
    scorePct >= 80
      ? "Excellent work! 🎉"
      : scorePct >= 60
        ? "Good job — keep it up!"
        : scorePct >= 40
          ? "Decent attempt. Review and retry."
          : "Keep practising — you'll get there.";

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-4 text-center"
      >
        <motion.p
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="font-mono text-5xl font-extrabold tabular-nums text-primary"
        >
          {scorePct}%
        </motion.p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
