import React from 'react';

/**
 * MetricsPanel — displays scheduling outcome statistics.
 */
export default function MetricsPanel({ metrics, missedDeadlines, tasks, algorithm }) {
  if (!metrics || !metrics.hyperperiod) return null;

  const { hyperperiod, totalJobs, completedJobs, missedCount, scheduledPct, cpuUtilization } = metrics;

  return (
    <div className="card animate-in" id="metrics-panel" style={{ marginTop: '1.5rem' }}>
      <div className="section-header">
        <div className="section-icon">📈</div>
        <div>
          <h3>Simulation Metrics</h3>
          <p style={{ fontSize: '0.78rem', marginTop: '0.1rem' }}>
            {algorithm} — Hyperperiod: <span className="mono">{hyperperiod}</span> ms
          </p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{cpuUtilization}%</div>
          <div className="metric-label">CPU Utilization</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{totalJobs}</div>
          <div className="metric-label">Total Jobs</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{completedJobs}</div>
          <div className="metric-label">Completed</div>
        </div>
        <div className="metric-card">
          <div
            className="metric-value"
            style={{ color: missedCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)',
                     WebkitTextFillColor: missedCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}
          >
            {missedCount}
          </div>
          <div className="metric-label">Missed Deadlines</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{scheduledPct}%</div>
          <div className="metric-label">Success Rate</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{hyperperiod}</div>
          <div className="metric-label">Hyperperiod</div>
        </div>
      </div>

      {/* Per-task utilization breakdown */}
      {tasks.length > 0 && (
        <div style={{ marginTop: '1.2rem' }}>
          <div className="card-title">Per-Task Utilization</div>
          {tasks.map((task) => {
            const u = task.executionTime / task.period;
            const pct = (u * 100).toFixed(1);
            return (
              <div key={task.id} style={{ marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="task-dot" style={{ backgroundColor: task.color }} />
                    <strong>{task.name}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>C={task.executionTime} T={task.period}</span>
                  </span>
                  <span className="mono" style={{ color: 'var(--text-secondary)' }}>{pct}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(u * 100, 100)}%`,
                      background: task.color,
                      borderRadius: '99px',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Missed deadline details */}
      {missedDeadlines.length > 0 && (
        <div style={{ marginTop: '1.2rem' }}>
          <div className="card-title" style={{ color: 'var(--accent-red)' }}>⚠ Missed Deadlines</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {missedDeadlines.map((m, i) => (
              <div key={i} className="alert alert-danger" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                <span className="task-dot" style={{ backgroundColor: m.color, flexShrink: 0 }} />
                <span>
                  <strong>{m.taskName}</strong> missed deadline at <span className="mono">t={m.deadlineTime}</span>
                  &nbsp;(released at <span className="mono">t={m.release}</span>)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
