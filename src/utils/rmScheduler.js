/**
 * rmScheduler.js
 * Rate Monotonic (RM) Scheduling Algorithm
 *
 * RM is a fixed-priority preemptive algorithm:
 *   - Shorter period → Higher priority (static assignment)
 *   - Preempts lower-priority tasks when a higher-priority job arrives
 *   - Schedulability sufficient condition: U ≤ n(2^(1/n) - 1)
 */

import { computeHyperperiod } from './mathUtils';

/**
 * Run Rate Monotonic simulation.
 * @param {Array} tasks - Array of task objects { id, name, executionTime, period, deadline, color }
 * @returns {{ timeline: Array, missedDeadlines: Array, metrics: Object }}
 */
export function runRM(tasks) {
  if (!tasks || tasks.length === 0) return { timeline: [], missedDeadlines: [], metrics: {} };

  const hyperperiod = computeHyperperiod(tasks);

  // Assign static priorities: lower period = higher priority (lower priority number)
  const sortedByPeriod = [...tasks].sort((a, b) => a.period - b.period);
  const priorityMap = {};
  sortedByPeriod.forEach((t, idx) => { priorityMap[t.id] = idx; });

  // Build job queue: all job instances within hyperperiod
  const allJobs = [];
  tasks.forEach((task) => {
    for (let release = 0; release < hyperperiod; release += task.period) {
      allJobs.push({
        taskId: task.id,
        taskName: task.name,
        color: task.color,
        release,
        deadline: release + task.deadline,
        remaining: task.executionTime,
        priority: priorityMap[task.id], // lower = higher priority
        period: task.period,
        completed: false,
        missedDeadline: false,
      });
    }
  });

  const timeline = []; // [{ start, end, taskName, color, jobRelease, jobDeadline }]
  const missedDeadlines = [];
  let currentJob = null;

  for (let t = 0; t < hyperperiod; t++) {
    // Check for newly released jobs and deadline misses at time t
    allJobs.forEach((job) => {
      if (
        !job.completed &&
        !job.missedDeadline &&
        job.deadline === t &&
        job.remaining > 0
      ) {
        job.missedDeadline = true;
        missedDeadlines.push({
          taskName: job.taskName,
          color: job.color,
          deadlineTime: t,
          release: job.release,
        });
      }
    });

    // Get all ready jobs (released, not done, not missed)
    const readyJobs = allJobs.filter(
      (j) => j.release <= t && !j.completed && !j.missedDeadline && j.remaining > 0
    );

    if (readyJobs.length === 0) {
      // CPU idle
      if (
        timeline.length > 0 &&
        timeline[timeline.length - 1].taskName === 'IDLE' &&
        timeline[timeline.length - 1].end === t
      ) {
        timeline[timeline.length - 1].end = t + 1;
      } else {
        timeline.push({ start: t, end: t + 1, taskName: 'IDLE', color: '#1e2a3a', jobRelease: t, jobDeadline: t + 1 });
      }
      currentJob = null;
      continue;
    }

    // RM: pick the job with highest priority (lowest priority number)
    readyJobs.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.release - b.release; // tie-break: earlier release
    });

    const selected = readyJobs[0];

    // Detect preemption
    if (currentJob && currentJob !== selected) {
      // Preemption occurred
    }
    currentJob = selected;

    // Execute for 1 time unit
    selected.remaining -= 1;

    // Append or extend timeline segment
    if (
      timeline.length > 0 &&
      timeline[timeline.length - 1].taskName === selected.taskName &&
      timeline[timeline.length - 1].end === t &&
      timeline[timeline.length - 1].jobRelease === selected.release
    ) {
      timeline[timeline.length - 1].end = t + 1;
    } else {
      timeline.push({
        start: t,
        end: t + 1,
        taskName: selected.taskName,
        color: selected.color,
        jobRelease: selected.release,
        jobDeadline: selected.deadline,
        missed: false,
      });
    }

    if (selected.remaining <= 0) {
      selected.completed = true;
      currentJob = null;
    }
  }

  // Compute metrics
  const metrics = computeMetrics(tasks, allJobs, missedDeadlines, hyperperiod);

  return { timeline, missedDeadlines, metrics, hyperperiod };
}

/**
 * Compute scheduling metrics from job execution results.
 */
function computeMetrics(tasks, allJobs, missedDeadlines, hyperperiod) {
  const totalJobs = allJobs.length;
  const missedCount = missedDeadlines.length;
  const completedJobs = allJobs.filter((j) => j.completed).length;
  const idleTime = allJobs
    .filter((j) => j.completed)
    .reduce((sum, j) => sum, 0);

  const cpuUtil = tasks.reduce((s, t) => s + t.executionTime / t.period, 0);

  return {
    hyperperiod,
    totalJobs,
    completedJobs,
    missedCount,
    scheduledPct: totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(1) : '0',
    cpuUtilization: (cpuUtil * 100).toFixed(2),
    algorithm: 'Rate Monotonic (RM)',
  };
}
