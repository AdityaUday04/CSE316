import React, { useState } from 'react';
import Header from './components/Header';
import TaskInputForm from './components/TaskInputForm';
import TaskTable from './components/TaskTable';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [algorithm, setAlgorithm] = useState('RM');

  const handleAddTask = (task) => setTasks((prev) => [...prev, task]);
  const handleRemoveTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const handleClearTasks = () => setTasks([]);

  return (
    <>
      <Header />
      <div className="app-wrapper">
        {/* Hero */}
        <section className="hero">
          <div className="hero-eyebrow">
            <span>🖥</span> Operating Systems — CSE316
          </div>
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

        {/* Simulator Layout */}
        <div className="two-column" id="simulator">
          {/* Left Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Algorithm Selector */}
            <div className="card animate-in">
              <div className="section-header">
                <div className="section-icon">🧮</div>
                <div>
                  <h3>Algorithm</h3>
                  <p style={{ fontSize: '0.78rem', marginTop: '0.1rem' }}>
                    Select scheduling policy
                  </p>
                </div>
              </div>
              <div className="algo-tabs">
                <button
                  id="algo-rm"
                  className={`algo-tab ${algorithm === 'RM' ? 'active' : ''}`}
                  onClick={() => setAlgorithm('RM')}
                >
                  ⚡ Rate Monotonic
                </button>
                <button
                  id="algo-edf"
                  className={`algo-tab ${algorithm === 'EDF' ? 'active' : ''}`}
                  onClick={() => setAlgorithm('EDF')}
                >
                  🎯 EDF
                </button>
              </div>
              <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                <span>ℹ</span>
                {algorithm === 'RM'
                  ? 'Rate Monotonic: shorter period = higher priority (static)'
                  : 'EDF: closest deadline = highest priority (dynamic)'}
              </div>
            </div>

            {/* Task Input */}
            <div className="card animate-in">
              <div className="section-header">
                <div className="section-icon">➕</div>
                <div>
                  <h3>Add Task</h3>
                  <p style={{ fontSize: '0.78rem', marginTop: '0.1rem' }}>
                    Define periodic real-time tasks
                  </p>
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
          </div>

          {/* Right Panel */}
          <div className="card animate-in">
            <div className="section-header">
              <div className="section-icon">📊</div>
              <div>
                <h3>Schedule Visualization</h3>
                <p style={{ fontSize: '0.78rem', marginTop: '0.1rem' }}>
                  Gantt chart — one hyperperiod
                </p>
              </div>
            </div>
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p>Add tasks and click <strong>Run Simulation</strong> to visualize</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
