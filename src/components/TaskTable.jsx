import React from 'react';

export default function TaskTable({ tasks, onRemoveTask }) {
  if (tasks.length === 0) return null;

  return (
    <div style={{ marginTop: '1.2rem' }}>
      <div className="card-title">Task Set</div>
      <div className="table-wrapper">
        <table id="task-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>C (ms)</th>
              <th>T (ms)</th>
              <th>D (ms)</th>
              <th>U</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="animate-in">
                <td>
                  <span
                    className="task-dot"
                    style={{ backgroundColor: task.color }}
                  />
                  <strong>{task.name}</strong>
                </td>
                <td>{task.executionTime}</td>
                <td>{task.period}</td>
                <td>{task.deadline}</td>
                <td>
                  <span className="badge badge-blue">
                    {(task.executionTime / task.period).toFixed(3)}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    id={`remove-task-${task.name}`}
                    onClick={() => onRemoveTask(task.id)}
                    title="Remove task"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
