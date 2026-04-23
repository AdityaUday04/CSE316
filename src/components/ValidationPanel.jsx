import React from 'react';
import {
  checkRMSchedulability,
  checkEDFSchedulability,
  formatUtilization,
  rmUtilizationBound,
} from '../utils/mathUtils';

/**
 * ValidationPanel — displays schedulability analysis for the current task set.
 * Shows RM Liu & Layland bound, EDF optimality check, and per-algorithm warnings.
 */
export default function ValidationPanel({ tasks, algorithm }) {
  if (!tasks || tasks.length === 0) return null;

  const n = tasks.length;
  const rmResult = checkRMSchedulability(tasks);
  const edfResult = checkEDFSchedulability(tasks);
  const bound = rmUtilizationBound(n);

  const utilizationBarPct = Math.min(rmResult.utilization * 100, 100);
  const isCurrentAlgoRM = algorithm === 'RM';

  return (
    <div className="card animate-in" id="validation-panel">
      <div className="section-header">
        <div className="section-icon">📐</div>
        <div>
          <h3>Schedulability Analysis</h3>
          <p style={{ fontSize: '0.78rem', marginTop: '0.1rem' }}>
            Utilization bounds &amp; feasibility check
          </p>
        </div>
      </div>

      {/* CPU Utilization Gauge */}
      <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Total CPU Utilization (U)</span>
          <span className="mono" style={{ fontWeight: 700, color: rmResult.utilization > 1 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
            {formatUtilization(rmResult.utilization)}
          </span>
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', position: 'relative', overflow: 'visible' }}>
          {/* RM bound marker */}
          <div style={{
            position: 'absolute',
            left: `${Math.min(bound * 100, 100)}%`,
            top: '-4px',
            width: '2px',
            height: '16px',
            background: 'var(--accent-yellow)',
            borderRadius: '1px',
            zIndex: 2,
          }} title={`RM bound: ${formatUtilization(bound)}`} />
          {/* EDF bound marker at 100% */}
          <div style={{
            position: 'absolute',
            left: '99%',
            top: '-4px',
            width: '2px',
            height: '16px',
            background: 'var(--accent-blue)',
            borderRadius: '1px',
            zIndex: 2,
          }} title="EDF bound: 100%" />
          {/* Utilization fill */}
          <div style={{
            height: '100%',
            width: `${utilizationBarPct}%`,
            background: rmResult.utilization > 1
              ? 'var(--accent-red)'
              : rmResult.utilization > bound
                ? 'var(--accent-orange)'
                : 'var(--accent-green)',
            borderRadius: '99px',
            transition: 'width 0.6s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>0%</span>
          <span style={{ color: 'var(--accent-yellow)' }}>RM bound: {formatUtilization(bound)}</span>
          <span style={{ color: 'var(--accent-blue)' }}>EDF: 100%</span>
        </div>
      </div>

      <div className="sep" />

      {/* RM Schedulability */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <span className="badge badge-blue">RM</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Rate Monotonic</span>
          {isCurrentAlgoRM && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Active</span>}
        </div>

        {!rmResult.schedulable ? (
          <div className="alert alert-danger">
            <span>✗</span>
            <div>
              <strong>Not Schedulable (U &gt; 1).</strong> Total utilization{' '}
              <span className="mono">{formatUtilization(rmResult.utilization)}</span> exceeds 100%.
              Reduce execution times or increase periods.
            </div>
          </div>
        ) : !rmResult.sufficient ? (
          <div className="alert alert-warning">
            <span>⚠</span>
            <div>
              <strong>Inconclusive.</strong> U = <span className="mono">{formatUtilization(rmResult.utilization)}</span>{' '}
              exceeds RM sufficient bound of{' '}
              <span className="mono">{formatUtilization(bound)}</span> (Liu &amp; Layland, n={n}).
              May or may not be schedulable — run simulation to verify.
            </div>
          </div>
        ) : (
          <div className="alert alert-success">
            <span>✓</span>
            <div>
              <strong>Schedulable.</strong> U = <span className="mono">{formatUtilization(rmResult.utilization)}</span>{' '}
              ≤ RM bound <span className="mono">{formatUtilization(bound)}</span>.
              RM sufficient condition satisfied.
            </div>
          </div>
        )}
      </div>

      {/* EDF Schedulability */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <span className="badge badge-purple">EDF</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Earliest Deadline First</span>
          {!isCurrentAlgoRM && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Active</span>}
        </div>

        {!edfResult.schedulable ? (
          <div className="alert alert-danger">
            <span>✗</span>
            <div>
              <strong>Not Schedulable (U &gt; 1).</strong> EDF cannot schedule a task set with
              utilization above 100%. U = <span className="mono">{formatUtilization(edfResult.utilization)}</span>.
            </div>
          </div>
        ) : (
          <div className="alert alert-success">
            <span>✓</span>
            <div>
              <strong>Schedulable.</strong> U = <span className="mono">{formatUtilization(edfResult.utilization)}</span> ≤ 100%.
              EDF is optimal — it will meet all deadlines if any algorithm can.
            </div>
          </div>
        )}
      </div>

      <div className="sep" />

      {/* Theory note */}
      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text-secondary)' }}>📚 Theory:</strong>{' '}
        Liu &amp; Layland (1973): RM sufficient condition U ≤ n(2^(1/n)−1) → {formatUtilization(bound)} for n={n} tasks.
        For large n, this converges to ln(2) ≈ 69.3%. EDF is optimal for uniprocessor preemptive scheduling.
      </div>
    </div>
  );
}
