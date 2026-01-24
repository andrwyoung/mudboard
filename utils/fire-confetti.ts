import confetti from "canvas-confetti";

export const fireConfetti = (e?: React.MouseEvent) => {
  const x = e ? e.clientX / window.innerWidth : 0.5;
  const y = e ? e.clientY / window.innerHeight : 0.5;

  confetti({
    particleCount: 100,
    spread: 360,

    origin: { x, y },
  });
};

export const log = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(...args);
  }
};

export const miniConfetti = () => {
  confetti({
    particleCount: 50,
    spread: 180,
    startVelocity: 40,
    origin: { x: 0.5, y: 0.45 },
  });
};
