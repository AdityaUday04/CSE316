import React from 'react';
import Header from './components/Header';
import './App.css';

export default function App() {
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

        {/* Main layout placeholder — modules will fill this */}
        <div className="two-column" id="simulator">
          <div className="card animate-in">
            <div className="card-title">Input Panel</div>
            <div className="empty-state">
              <div className="empty-state-icon">⚙️</div>
              <p>Task input form will appear here</p>
            </div>
          </div>
          <div className="card animate-in">
            <div className="card-title">Gantt Chart</div>
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p>Schedule visualization will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
