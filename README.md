# ⏱ RT Scheduler — Real-Time Scheduling Algorithm Simulator

> **CSE316 Operating Systems Project** — A web-based interactive simulator for real-time scheduling algorithms.

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🎯 Project Overview

This simulator visualizes two fundamental real-time CPU scheduling algorithms on a uniprocessor system:

| Algorithm | Type | Priority | Schedulability Condition |
|-----------|------|----------|--------------------------|
| **Rate Monotonic (RM)** | Static priority, preemptive | Shorter period = higher priority | U ≤ n(2^(1/n) − 1) |
| **Earliest Deadline First (EDF)** | Dynamic priority, preemptive | Closest deadline = highest priority | U ≤ 1 |

### Key Features
- 📊 **Interactive Gantt Chart** — SVG-rendered timeline with per-task colored blocks
- ⚠️ **Deadline Miss Detection** — Red highlights for missed deadlines with timestamps
- ▲▼ **Arrival & Deadline Markers** — Visual markers on the Gantt for each job instance
- 📐 **Utilization Bounds Checker** — Liu & Layland RM sufficient condition + EDF optimality check
- 📈 **Metrics Dashboard** — CPU utilization, job completion rate, missed deadline count
- 🎛 **Quick Presets** — Load example task sets instantly (Classic RM, EDF Demo, Overloaded)
- 🌑 **Premium Dark UI** — Glassmorphism, gradient animations, responsive design

---

## 🗂 Project Structure

```
src/
├── components/
│   ├── Header.jsx           # Sticky navigation header
│   ├── TaskInputForm.jsx    # Task input with validation
│   ├── TaskTable.jsx        # Task set display table
│   ├── GanttChart.jsx       # SVG Gantt chart visualization
│   ├── MetricsPanel.jsx     # Scheduling metrics dashboard
│   └── ValidationPanel.jsx  # Schedulability analysis panel
├── utils/
│   ├── mathUtils.js         # GCD, LCM, Hyperperiod, Utilization bounds
│   ├── rmScheduler.js       # Rate Monotonic algorithm engine
│   └── edfScheduler.js      # Earliest Deadline First algorithm engine
├── App.jsx                  # Main application component
├── App.css                  # Component-specific styles
└── index.css                # Global CSS design system
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation & Running

```bash
# Clone the repository
git clone https://github.com/AdityaUday04/CSE316.git
cd CSE316

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
```

---

## 📖 How to Use

1. **Select an Algorithm** — Choose between Rate Monotonic (RM) or EDF using the tabs
2. **Add Tasks** — Enter task name, execution time (C), and period (T). Deadline D = T (implicit)
3. **Use Quick Presets** — Click "Classic RM", "EDF Demo", or "Overloaded" to load example task sets
4. **Check Schedulability** — The Validation Panel shows real-time utilization bounds analysis
5. **Run Simulation** — Click "▶ Run Simulation" to generate the Gantt chart
6. **Analyze Results** — View execution blocks, deadline markers, and metrics

### Task Parameters

| Parameter | Symbol | Description |
|-----------|--------|-------------|
| Execution Time | C | Worst-case computation time per job |
| Period | T | Time between job releases |
| Deadline | D | Time by which each job must complete (= T) |

---

## 🧮 Algorithms

### Rate Monotonic (RM)
- **Priority Assignment**: Static — task with shortest period gets highest CPU priority
- **Preemption**: A lower-priority task is preempted when a higher-priority task becomes ready
- **Sufficient Schedulability Bound** (Liu & Layland, 1973): U ≤ n(2^(1/n) − 1)
  - For n=1: 100%, n=2: 82.8%, n=3: 78%, n→∞: ln(2) ≈ 69.3%

### Earliest Deadline First (EDF)
- **Priority Assignment**: Dynamic — task with earliest absolute deadline gets the CPU
- **Preemption**: Re-evaluated at every time unit; priorities change as deadlines approach
- **Schedulability**: U ≤ 1 (necessary and sufficient — EDF is optimal)

---

## 📊 Git Revision History

This project follows a strict feature-branch Git workflow with 10 revisions:

| # | Branch | Commit Message |
|---|--------|----------------|
| 1 | `setup/init-react` | `chore: initialize react project with vite` |
| 2 | `feature/ui-layout` | `feat: create basic layout and task input form structure` |
| 3 | `feature/task-state` | `feat: implement state management for task list` |
| 4 | `feature/math-utils` | `feat: implement LCM and hyperperiod calculations` |
| 5 | `feature/rm-scheduler` | `feat: implement Rate Monotonic (RM) scheduling logic` |
| 6 | `feature/edf-scheduler` | `feat: implement Earliest Deadline First (EDF) scheduling logic` |
| 7 | `feature/gantt-chart` | `feat: create Gantt chart visualization component` |
| 8 | `feature/integration` | `feat: integrate scheduler engine with UI and Gantt chart` |
| 9 | `feature/validation` | `feat: add task utilization bounds checking and warnings` |
| 10 | `feature/styling` | `style: polish UI with premium design and animations` |

---

## 📚 References

- Liu, C. L., & Layland, J. W. (1973). *Scheduling Algorithms for Multiprogramming in a Hard-Real-Time Environment*. Journal of the ACM, 20(1), 46–61.
- Buttazzo, G. C. (2011). *Hard Real-Time Computing Systems*. Springer.

---

## 👨‍💻 Author

**Aditya Uday** — CSE316 Operating Systems, 2026

[GitHub Profile](https://github.com/AdityaUday04)
