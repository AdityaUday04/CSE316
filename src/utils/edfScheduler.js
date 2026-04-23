/**
 * edfScheduler.js
 * Earliest Deadline First (EDF) Scheduling Algorithm
 *
 * EDF is a dynamic-priority preemptive algorithm:
 *   - The task with the nearest absolute deadline gets the CPU (dynamic)
 *   - Optimal among all uniprocessor preemptive schedulers
 *   - Schedulable iff U ≤ 1
 */

import { computeHyperperiod } from './mathUtils';

/**
 * Run Earliest Deadline First simulation.
 * @param {Array} tasks - Array of task objects { id, name, executionTime, period, deadline, color }
 * @returns {{ timeline: Array, missedDeadlines: Array, metrics: Object, hyperperiod: number }}
 */
export function runEDF(tasks) {
  if (!tasks || tasks.length === 0) return { timeline: [], missedDeadlines: [], metrics: {}, hyperperiod: 0 };

  const hyperperiod = computeHyperperiod(tasks);

  // Build all job instances within the hyperperiod
  const allJobs = [];
  tasks.forEach((task) => {
    for (let release = 0; release < hyperperiod; release += task.period) {
      allJobs.push({
        taskId: task.id,
        taskName: task.name,
        color: task.color,
        release,
        absoluteDeadline: release + task.deadline,
        remaining: task.executionTime,
        period: task.period,
        completed: false,
        missedDeadline: false,
      });
    }
  });

  const timeline = [];
  const missedDeadlines = [];
  let currentJob = null;

  for (let t = 0; t < hyperperiod; t++) {
    // Check for deadline misses at each tick
    allJobs.forEach((job) => {
      if (
        !job.completed &&
        !job.missedDeadline &&
        job.absoluteDeadline === t &&
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

    // Collect ready jobs: released, not done, not missed
    const readyJobs = allJobs.filter(
      (j) => j.release <= t && !j.completed && !j.missedDeadline && j.remaining > 0
    );

    if (readyJobs.length === 0) {
      // CPU idle slot
      if (
        timeline.length > 0 &&
        timeline[timeline.length - 1].taskName === 'IDLE' &&
        timeline[timeline.length - 1].end === t
      ) {
        timeline[timeline.length - 1].end = t + 1;
      } else {
        timeline.push({
          start: t,
          end: t + 1,
          taskName: 'IDLE',
          color: '#1e2a3a',
          jobRelease: t,
          jobDeadline: t + 1,
          missed: false,
        });
      }
      currentJob = null;
      continue;
    }

    // EDF: pick job with earliest absolute deadline (dynamic priority)
    readyJobs.sort((a, b) => {
      if (a.absoluteDeadline !== b.absoluteDeadline)
        return a.absoluteDeadline - b.absoluteDeadline;
      // Tie-break: earlier release time, then task name lexicographically
      if (a.release !== b.release) return a.release - b.release;
      return a.taskName.localeCompare(b.taskName);
    });

    const selected = readyJobs[0];

    // Track preemption (informational — for future event log extension)
    if (currentJob && currentJob !== selected) {
      // Preemption event could be logged here
    }
    currentJob = selected;

    // Execute for 1 time unit
    selected.remaining -= 1;

    // Merge consecutive ticks of same job-instance into one segment
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
        jobDeadline: selected.absoluteDeadline,
        missed: false,
      });
    }

    if (selected.remaining <= 0) {
      selected.completed = true;
      currentJob = null;
    }
  }

  // Tag timeline segments that correspond to missed deadline jobs
  const missedSet = new Set(
    missedDeadlines.map((m) => `${m.taskName}-${m.release}`)
  );
  timeline.forEach((seg) => {
    if (missedSet.has(`${seg.taskName}-${seg.jobRelease}`)) {
      seg.missed = true;
    }
  });

  const metrics = computeMetrics(tasks, allJobs, missedDeadlines, hyperperiod);
  return { timeline, missedDeadlines, metrics, hyperperiod };
}

/**
 * Compute scheduling metrics.
 */
function computeMetrics(tasks, allJobs, missedDeadlines, hyperperiod) {
  const totalJobs = allJobs.length;
  const completedJobs = allJobs.filter((j) => j.completed).length;
  const missedCount = missedDeadlines.length;
  const cpuUtil = tasks.reduce((s, t) => s + t.executionTime / t.period, 0);

  return {
    hyperperiod,
    totalJobs,
    completedJobs,
    missedCount,
    scheduledPct: totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(1) : '0',
    cpuUtilization: (cpuUtil * 100).toFixed(2),
    algorithm: 'Earliest Deadline First (EDF)',
  };
}
