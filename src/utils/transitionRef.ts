// Shared mutable ref for animation-frame transition updates.
// This bypasses React context to avoid cascading re-renders on every frame.
export const transitionRef = { current: 0 };
