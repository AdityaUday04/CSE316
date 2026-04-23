import React from 'react';
import './App.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <a href="/" className="logo">
          <div className="logo-icon">⏱</div>
          <div className="logo-text">
            <span className="logo-name">RT Scheduler</span>
            <span className="logo-sub">Real-Time Simulator</span>
          </div>
        </a>
        <div className="header-badges">
          <span className="badge badge-blue">RM</span>
          <span className="badge badge-purple">EDF</span>
          <span className="badge badge-green">OS Project</span>
        </div>
      </div>
    </header>
  );
}
