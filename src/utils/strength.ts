/**
 * Estimate one-rep max (1RM) using the Epley formula.
 *
 *   1RM ≈ weight × (1 + reps / 30)
 *
 * Epley is the simplest of the popular formulas and produces values close to
 * the average of the four most-cited estimators (Epley, Brzycki, Lander,
 * Lombardi) at 1–10 reps. Returns 0 when either input is non-positive so
 * callers can hide the estimate cleanly.
 */
export const estimate1RM = (weight: number, reps: number): number => {
  if (weight <= 0 || reps <= 0) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}
