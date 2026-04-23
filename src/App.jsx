import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import TaskInputForm from './components/TaskInputForm';
import TaskTable from './components/TaskTable';
import GanttChart from './components/GanttChart';
import MetricsPanel from './components/MetricsPanel';
import ValidationPanel from './components/ValidationPanel';
import { runRM } from './utils/rmScheduler';
import { runEDF } from './utils/edfScheduler';
import './App.css';

const TASK_COLORS = ['#4f8ef7','#9b59f7','#22d3a5','#ff7c45','#ffd166','#00d4ff','#ff4d6d','#a8ff78'];

const PRESETS = {
  classic: {
    label: 'Classic RM',
    algo: 'RM',
    tasks: [
      { name: 'T1', executionTime: 1, period: 4 },
      { name: 'T2', executionTime: 2, period: 6 },
      { name: 'T3', executionTime: 2, period: 12 },
    ],
  },
  edf: {
    label: 'EDF Demo',
    algo: 'EDF',
    tasks: [
      { name: 'T1', executionTime: 2, period: 5 },
      { name: 'T2', executionTime: 3, period: 7 },
      { name: 'T3', executionTime: 1, period: 10 },
    ],
  },
  stress: {
    label: 'Overloaded',
    algo: 'RM',
    tasks: [
      { name: 'T1', executionTime: 3, period: 4 },
      { name: 'T2', executionTime: 3, period: 5 },
      { name: 'T3', executionTime: 2, period: 8 },
    ],
  },
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [algorithm, setAlgorithm] = useState('RM');
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleAddTask = (task) => setTasks((prev) => [...prev, task]);
  const handleRemoveTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setResult(null);
  };
  const handleClearTasks = () => { setTasks([]); setResult(null); };

  const handleAlgorithmChange = (algo) => {
    setAlgorithm(algo);
    setResult(null);
  };

  const handleLoadPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    const loadedTasks = preset.tasks.map((t, i) => ({
      id: Date.now() + i,
      name: t.name,
      executionTime: t.executionTime,
      period: t.period,
      deadline: t.period,
      color: TASK_COLORS[i % TASK_COLORS.length],
    }));
    setTasks(loadedTasks);
    setAlgorithm(preset.algo);
    setResult(null);
  };

  const handleRunSimulation = useCallback(() => {
    if (tasks.length === 0) return;
    setIsRunning(true);
    setTimeout(() => {
      try {
        const res = algorithm === 'RM' ? runRM(tasks) : runEDF(tasks);
        setResult({ ...res, algorithm });
      } catch (e) {
        console.error('Simulation error:', e);
      }
      setIsRunning(false);
    }, 80);
  }, [tasks, algorithm]);

  const handleReset = () => { setResult(null); };

  return (
    <>
      {/* Ambient background glow orbs */}
      <div className="bg-orb" style={{ width: 500, height: 500, background: '#4f8ef7', top: -100, left: -100 }} />
      <div className="bg-orb" style={{ width: 400, height: 400, background: '#9b59f7', top: 200, right: -150 }} />
      <div className="bg-orb" style={{ width: 300, height: 300, background: '#22d3a5', bottom: 100, left: '40%' }} />
      <Header />
      <div className="app-wrapper">
        {/* Hero */}
        <section className="hero">
          <div className="hero-eyebrow"><span>🖥</span> Operating Systems — CSE316</div>
          <h1>Real-Time Scheduling<br />Algorithm Simulator</h1>
          <p className="hero-description">
            Visualize how <strong>Rate Monotonic (RM)</strong> and{' '}
            <strong>Earliest Deadline First (EDF)</strong> algorithms schedule
            periodic tasks. Observe preemptions, deadline misses, and CPU utilization
            in an interactive Gantt chart.
          </p>
          <div className="hero-pills">
            <span className="hero-pill">⚡ Rate Monotonic</span>
            <span className="hero-pill">🎯 Earliest Deadline First</span>
            <span className="hero-pill">📊 Gantt Chart</span>
            <span className="hero-pill">⚠️ Deadline Detection</span>
            <span className="hero-pill">📐 Utilization Bounds</span>
          </div>
        </section>

        {/* Simulator */}
        <div className="two-column" id="simulator">
          {/* ── Left Panel ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Algorithm Selector */}
            <div className="card animate-in">
              <div className="section-header">
                <div className="section-icon">🧮</div>
                <div>
                  <h3>Algorithm</h3>
                  <p style={{ fontSize: '0.78rem', marginTop: '0.1rem' }}>Select scheduling policy</p>
                </div>
              </div>
              <div className="algo-tabs">
                <button id="algo-rm" className={`algo-tab ${algorithm === 'RM' ? 'active' : ''}`}
                  onClick={() => handleAlgorithmChange('RM')}>
                  ⚡ Rate Monotonic
                </button>
                <button id="algo-edf" className={`algo-tab ${algorithm === 'EDF' ? 'active' : ''}`}
                  onClick={() => handleAlgorithmChange('EDF')}>
                  🎯 EDF
                </button>
              </div>
              <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                <span>ℹ</span>
                {algorithm === 'RM'
                  ? 'Rate Monotonic: shorter period = higher priority (static, preemptive)'
                  : 'EDF: closest absolute deadline = highest priority (dynamic, preemptive)'}
              </div>
            </div>

            {/* Task Input */}
            <div className="card animate-in">
              <div className="section-header">
                <div className="section-icon">➕</div>
                <div>
                  <h3>Add Task</h3>
                  <p style={{ fontSize: '0.78rem', marginTop: '0.1rem' }}>Define periodic real-time tasks</p>
                </div>
              </div>
              {/* Quick Presets */}
              <div style={{ marginBottom: '1rem' }}>
                <div className="card-title">Quick Presets</div>
                <div className="presets-row">
                  {Object.entries(PRESETS).map(([key, p]) => (
                    <button key={key} id={`preset-${key}`} className="preset-btn" onClick={() => handleLoadPreset(key)}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sep" />
              <TaskInputForm
                tasks={tasks}
                onAddTask={handleAddTask}
                onRemoveTask={handleRemoveTask}
                onClearTasks={handleClearTasks}
              />
              <TaskTable tasks={tasks} onRemoveTask={handleRemoveTask} />
            </div>

            {/* Validation Panel */}
            {tasks.length > 0 && (
              <ValidationPanel tasks={tasks} algorithm={algorithm} />
            )}

            {/* Run Button */}
            {tasks.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  id="run-simulation-btn"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={handleRunSimulation}
                  disabled={isRunning}
                >
                  {isRunning ? '⏳ Running…' : '▶ Run Simulation'}
                </button>
                {result && (
                  <button id="reset-btn" className="btn btn-secondary" onClick={handleReset}>
                    ↺ Reset
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Right Panel ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card animate-in" id="gantt-card">
              <div className="section-header">
                <div className="section-icon">📊</div>
                <div>
                  <h3>Schedule Visualization</h3>
                  <p style={{ fontSize: '0.78rem', marginTop: '0.1rem' }}>
                    {result
                      ? `${result.algorithm === 'RM' ? 'Rate Monotonic' : 'Earliest Deadline First'} — Hyperperiod: ${result.hyperperiod} ms`
                      : 'Gantt chart — one hyperperiod'}
                  </p>
                </div>
              </div>
              <GanttChart
                timeline={result?.timeline}
                tasks={tasks}
                missedDeadlines={result?.missedDeadlines || []}
                hyperperiod={result?.hyperperiod}
              />
            </div>

            {result && (
              <MetricsPanel
                metrics={result.metrics}
                missedDeadlines={result.missedDeadlines}
                tasks={tasks}
                algorithm={result.algorithm}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <p>
            <strong style={{ color: 'var(--text-secondary)' }}>RT Scheduler</strong> — Real-Time Scheduling Algorithm Simulator
          </p>
          <p>
            CSE316 Operating Systems Project &nbsp;·&nbsp;
            <a href="https://github.com/AdityaUday04/CSE316" target="_blank" rel="noreferrer">GitHub Repository</a>
            &nbsp;·&nbsp; RM &amp; EDF Algorithms
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.7rem' }}>
            Based on Liu &amp; Layland (1973) — "Scheduling Algorithms for Multiprogramming in a Hard-Real-Time Environment"
          </p>
        </footer>
      </div>
    </>
  );
}
