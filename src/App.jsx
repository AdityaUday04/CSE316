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
    }, 80); // slight delay for loading feedback
  }, [tasks, algorithm]);

  const handleReset = () => { setResult(null); };

  return (
    <>
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
      </div>
    </>
  );
}
