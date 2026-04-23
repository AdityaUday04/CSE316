import React, { useRef, useEffect } from 'react';

const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 30;
const LABEL_WIDTH = 60;
const TICK_LABEL_HEIGHT = 24;
const MARKER_AREA = 28;
const PADDING = 16;

/**
 * GanttChart — renders the scheduling timeline as an SVG canvas.
 * Shows:
 *  - Colored execution blocks per task
 *  - ▲ arrival markers
 *  - ▼ deadline markers (red if missed)
 *  - Striped pattern for IDLE slots
 *  - Red outline on missed deadline blocks
 */
export default function GanttChart({ timeline, tasks, missedDeadlines, hyperperiod }) {
  const svgRef = useRef(null);

  if (!timeline || timeline.length === 0 || !hyperperiod) {
    return (
      <div className="empty-state" id="gantt-empty">
        <div className="empty-state-icon">📊</div>
        <p>Add tasks and click <strong>Run Simulation</strong> to visualize</p>
      </div>
    );
  }

  const taskNames = tasks.map((t) => t.name);
  const numTasks = taskNames.length;
  const svgWidth = Math.max(600, hyperperiod * 28 + LABEL_WIDTH + PADDING * 2);
  const svgHeight = HEADER_HEIGHT + numTasks * ROW_HEIGHT + MARKER_AREA + TICK_LABEL_HEIGHT + PADDING;

  // Map task name → row index
  const rowMap = {};
  taskNames.forEach((name, i) => { rowMap[name] = i; });

  // Map task name → color
  const colorMap = {};
  tasks.forEach((t) => { colorMap[t.name] = t.color; });

  const scaleX = (t) => LABEL_WIDTH + (t / hyperperiod) * (svgWidth - LABEL_WIDTH - PADDING * 2);

  // Compute tick interval for clean axis
  const tickInterval = hyperperiod <= 20 ? 1 : hyperperiod <= 50 ? 5 : 10;
  const ticks = [];
  for (let t = 0; t <= hyperperiod; t += tickInterval) ticks.push(t);

  // Build arrival & deadline markers from tasks × hyperperiod
  const arrivals = [];
  const deadlines = [];
  const missedSet = new Set(missedDeadlines.map((m) => `${m.taskName}-${m.deadlineTime}`));

  tasks.forEach((task) => {
    for (let release = 0; release < hyperperiod; release += task.period) {
      const deadlineTime = release + task.deadline;
      if (rowMap[task.name] !== undefined) {
        arrivals.push({ task: task.name, time: release });
        deadlines.push({
          task: task.name,
          time: deadlineTime,
          missed: missedSet.has(`${task.name}-${deadlineTime}`),
        });
      }
    }
  });

  return (
    <div style={{ overflowX: 'auto', overflowY: 'visible', paddingBottom: '0.5rem' }} id="gantt-container">
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        style={{ display: 'block', minWidth: '100%' }}
        id="gantt-svg"
      >
        <defs>
          {/* Idle stripe pattern */}
          <pattern id="idle-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill="#111827" />
            <line x1="0" y1="8" x2="8" y2="0" stroke="#1e2a3a" strokeWidth="1.5" />
          </pattern>
          {/* Missed deadline pattern */}
          <pattern id="missed-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill="rgba(255,77,109,0.12)" />
            <line x1="0" y1="8" x2="8" y2="0" stroke="rgba(255,77,109,0.4)" strokeWidth="1.5" />
          </pattern>
          <filter id="glow-blue">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={svgWidth} height={svgHeight} fill="#0a0e1a" rx="12" />

        {/* Row backgrounds */}
        {taskNames.map((name, i) => (
          <rect
            key={`row-bg-${name}`}
            x={0}
            y={HEADER_HEIGHT + i * ROW_HEIGHT}
            width={svgWidth}
            height={ROW_HEIGHT}
            fill={i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'}
          />
        ))}

        {/* Vertical tick grid lines */}
        {ticks.map((t) => (
          <line
            key={`grid-${t}`}
            x1={scaleX(t)}
            y1={HEADER_HEIGHT}
            x2={scaleX(t)}
            y2={HEADER_HEIGHT + numTasks * ROW_HEIGHT}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Task row labels */}
        {taskNames.map((name, i) => {
          const y = HEADER_HEIGHT + i * ROW_HEIGHT + ROW_HEIGHT / 2;
          return (
            <g key={`label-${name}`}>
              <circle
                cx={10}
                cy={y}
                r={5}
                fill={colorMap[name] || '#4f8ef7'}
              />
              <text
                x={20}
                y={y + 1}
                dominantBaseline="middle"
                fill="#e8eaf0"
                fontSize="12"
                fontFamily="Inter, sans-serif"
                fontWeight="600"
              >
                {name}
              </text>
            </g>
          );
        })}

        {/* Timeline execution blocks */}
        {timeline.map((seg, idx) => {
          if (seg.taskName === 'IDLE') {
            return (
              <rect
                key={`seg-${idx}`}
                x={scaleX(seg.start) + 0.5}
                y={HEADER_HEIGHT + 2}
                width={Math.max(0, scaleX(seg.end) - scaleX(seg.start) - 1)}
                height={numTasks * ROW_HEIGHT - 4}
                fill="url(#idle-pattern)"
                rx="2"
              />
            );
          }

          const row = rowMap[seg.taskName];
          if (row === undefined) return null;

          const x = scaleX(seg.start) + 0.5;
          const y = HEADER_HEIGHT + row * ROW_HEIGHT + 4;
          const w = Math.max(0, scaleX(seg.end) - scaleX(seg.start) - 1);
          const h = ROW_HEIGHT - 8;

          return (
            <g key={`seg-${idx}`}>
              {seg.missed && (
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill="url(#missed-pattern)"
                  rx="3"
                />
              )}
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={seg.missed ? 'rgba(255,77,109,0.25)' : `${seg.color}33`}
                stroke={seg.missed ? '#ff4d6d' : seg.color}
                strokeWidth={seg.missed ? '2' : '1.5'}
                rx="3"
              />
              {w > 16 && (
                <text
                  x={x + w / 2}
                  y={y + h / 2 + 1}
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill={seg.missed ? '#ff4d6d' : '#fff'}
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                >
                  {seg.taskName}
                </text>
              )}
            </g>
          );
        })}

        {/* Arrival markers (▲ up arrows) */}
        {arrivals.map((a, i) => {
          const row = rowMap[a.task];
          if (row === undefined) return null;
          const x = scaleX(a.time);
          const y = HEADER_HEIGHT + row * ROW_HEIGHT + ROW_HEIGHT - 4;
          return (
            <text
              key={`arr-${i}`}
              x={x}
              y={y}
              textAnchor="middle"
              fill={colorMap[a.task] || '#4f8ef7'}
              fontSize="10"
              fontFamily="sans-serif"
              opacity="0.85"
            >
              ▲
            </text>
          );
        })}

        {/* Deadline markers (▼ down arrows — red if missed) */}
        {deadlines.filter(d => d.time <= hyperperiod).map((d, i) => {
          const row = rowMap[d.task];
          if (row === undefined) return null;
          const x = scaleX(d.time);
          const y = HEADER_HEIGHT + row * ROW_HEIGHT + 6;
          return (
            <text
              key={`dl-${i}`}
              x={x}
              y={y}
              textAnchor="middle"
              fill={d.missed ? '#ff4d6d' : colorMap[d.task] || '#4f8ef7'}
              fontSize="10"
              fontFamily="sans-serif"
              opacity={d.missed ? 1 : 0.7}
              filter={d.missed ? 'url(#glow-blue)' : undefined}
            >
              ▼
            </text>
          );
        })}

        {/* Time axis */}
        <line
          x1={LABEL_WIDTH}
          y1={HEADER_HEIGHT + numTasks * ROW_HEIGHT}
          x2={svgWidth - PADDING}
          y2={HEADER_HEIGHT + numTasks * ROW_HEIGHT}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
        />
        {ticks.map((t) => (
          <g key={`tick-${t}`}>
            <line
              x1={scaleX(t)}
              y1={HEADER_HEIGHT + numTasks * ROW_HEIGHT}
              x2={scaleX(t)}
              y2={HEADER_HEIGHT + numTasks * ROW_HEIGHT + 5}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
            <text
              x={scaleX(t)}
              y={HEADER_HEIGHT + numTasks * ROW_HEIGHT + TICK_LABEL_HEIGHT / 2 + 6}
              textAnchor="middle"
              fill="#4a5568"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
            >
              {t}
            </text>
          </g>
        ))}

        {/* Legend */}
        <g transform={`translate(${LABEL_WIDTH}, ${HEADER_HEIGHT + numTasks * ROW_HEIGHT + TICK_LABEL_HEIGHT + 4})`}>
          <text fill="#4a5568" fontSize="9" fontFamily="Inter" y="10">
            ▲ = Arrival &nbsp;&nbsp; ▼ = Deadline &nbsp;&nbsp;
            <tspan fill="#ff4d6d">▼ = Missed Deadline</tspan>
          </text>
        </g>
      </svg>
    </div>
  );
}
