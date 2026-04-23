import React, { useState } from 'react';

// Predefined color palette for tasks
const TASK_COLORS = [
  '#4f8ef7', '#9b59f7', '#22d3a5', '#ff7c45',
  '#ffd166', '#00d4ff', '#ff4d6d', '#a8ff78',
];

export default function TaskInputForm({ tasks, onAddTask, onRemoveTask, onClearTasks }) {
  const [form, setForm] = useState({ name: '', executionTime: '', period: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const C = parseFloat(form.executionTime);
    const T = parseFloat(form.period);
    const name = form.name.trim() || `T${tasks.length + 1}`;

    if (!C || !T || C <= 0 || T <= 0) {
      setError('Execution time and period must be positive numbers.');
      return;
    }
    if (C > T) {
      setError('Execution time (C) cannot exceed period (T). Task would miss every deadline.');
      return;
    }
    if (tasks.length >= 8) {
      setError('Maximum 8 tasks supported for clear visualization.');
      return;
    }
    if (tasks.some(t => t.name === name)) {
      setError(`Task name "${name}" already exists. Use a unique name.`);
      return;
    }

    onAddTask({
      id: Date.now(),
      name,
      executionTime: C,
      period: T,
      deadline: T, // Assume Di = Ti (implicit deadline)
      color: TASK_COLORS[tasks.length % TASK_COLORS.length],
    });

    setForm({ name: '', executionTime: '', period: '' });
    setError('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit} id="task-form">
        <div className="form-group">
          <label className="form-label" htmlFor="task-name">Task Name</label>
          <input
            id="task-name"
            className="form-input"
            type="text"
            name="name"
            placeholder={`T${tasks.length + 1}`}
            value={form.name}
            onChange={handleChange}
            maxLength={6}
          />
          <div className="helper-text">Optional — auto-named if blank</div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="exec-time">
              Exec. Time (C)
            </label>
            <input
              id="exec-time"
              className="form-input"
              type="number"
              name="executionTime"
              placeholder="e.g. 2"
              value={form.executionTime}
              onChange={handleChange}
              min="0.1"
              step="0.5"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="period">
              Period (T = D)
            </label>
            <input
              id="period"
              className="form-input"
              type="number"
              name="period"
              placeholder="e.g. 5"
              value={form.period}
              onChange={handleChange}
              min="1"
              step="1"
              required
            />
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-full" id="add-task-btn">
          <span>＋</span> Add Task
        </button>
      </form>

      {tasks.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-danger btn-full btn-sm"
            id="clear-tasks-btn"
            onClick={onClearTasks}
          >
            🗑 Clear All Tasks
          </button>
        </div>
      )}
    </div>
  );
}
