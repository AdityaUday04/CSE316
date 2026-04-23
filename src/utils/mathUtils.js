/**
 * mathUtils.js
 * Core mathematical utilities for real-time scheduling calculations.
 * Includes GCD, LCM, Hyperperiod, Utilization, and RM schedulability bound.
 */

/**
 * Greatest Common Divisor using Euclidean algorithm.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function gcd(a, b) {
  a = Math.round(a * 100);
  b = Math.round(b * 100);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a / 100;
}

/**
 * Least Common Multiple of two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

/**
 * Hyperperiod: LCM of all task periods.
 * Capped at 200 to keep visualization manageable.
 * @param {Array} tasks - array of task objects with .period
 * @returns {number}
 */
export function computeHyperperiod(tasks) {
  if (!tasks || tasks.length === 0) return 0;
  const periods = tasks.map((t) => t.period);
  const raw = periods.reduce((acc, p) => lcm(acc, p), periods[0]);
  return Math.min(raw, 200); // safety cap
}

/**
 * Total CPU Utilization U = Σ(Ci / Ti)
 * @param {Array} tasks
 * @returns {number}
 */
export function computeUtilization(tasks) {
  if (!tasks || tasks.length === 0) return 0;
  return tasks.reduce((sum, t) => sum + t.executionTime / t.period, 0);
}

/**
 * Rate Monotonic utilization bound: n * (2^(1/n) - 1)
 * As n → ∞, this converges to ln(2) ≈ 0.6931.
 * @param {number} n - number of tasks
 * @returns {number}
 */
export function rmUtilizationBound(n) {
  if (n <= 0) return 0;
  return n * (Math.pow(2, 1 / n) - 1);
}

/**
 * Check schedulability for RM.
 * Returns { schedulable, sufficient, utilization, bound }
 * - schedulable: U <= 1 (necessary condition)
 * - sufficient: U <= bound (sufficient condition for RM)
 * @param {Array} tasks
 * @returns {Object}
 */
export function checkRMSchedulability(tasks) {
  const U = computeUtilization(tasks);
  const n = tasks.length;
  const bound = rmUtilizationBound(n);
  return {
    utilization: U,
    bound,
    sufficient: U <= bound,
    schedulable: U <= 1.0,
  };
}

/**
 * Check schedulability for EDF.
 * EDF is schedulable iff U <= 1.
 * @param {Array} tasks
 * @returns {Object}
 */
export function checkEDFSchedulability(tasks) {
  const U = computeUtilization(tasks);
  return {
    utilization: U,
    schedulable: U <= 1.0,
  };
}

/**
 * Returns job release times within the hyperperiod for a task.
 * @param {Object} task
 * @param {number} hyperperiod
 * @returns {Array<number>}
 */
export function getJobReleaseTimes(task, hyperperiod) {
  const releases = [];
  for (let t = 0; t < hyperperiod; t += task.period) {
    releases.push(t);
  }
  return releases;
}

/**
 * Format a utilization ratio as a percentage string.
 * @param {number} u
 * @returns {string}
 */
export function formatUtilization(u) {
  return `${(u * 100).toFixed(2)}%`;
}
