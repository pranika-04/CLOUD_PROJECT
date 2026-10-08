import { useEffect, useState } from 'react';
import styles from './Requests.module.css';

export default function Requests() {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/tasks');
        const data = await res.json();
        setTasks(data);
      } catch (e) {}
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'RUNNING': return <span className="badge badge-info">{status}</span>;
      case 'WAITING': return <span className="badge badge-warning">{status}</span>;
      case 'COMPLETED': return <span className="badge badge-success">{status}</span>;
      case 'FAILED': return <span className="badge badge-danger">{status}</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const getPriorityBadge = (prio: string) => {
    switch(prio) {
      case 'HIGH': return <span className="badge badge-danger">{prio}</span>;
      case 'MEDIUM': return <span className="badge badge-warning">{prio}</span>;
      case 'LOW': return <span className="badge badge-neutral">{prio}</span>;
      default: return <span className="badge badge-neutral">{prio}</span>;
    }
  };

  const submitManualTask = async () => {
    const types = ['CPU', 'GPU', 'MIXED'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const taskReq = {
      taskName: `Manual Task ${Math.floor(Math.random() * 1000)}`,
      taskType: type,
      cpuRequired: Math.floor(Math.random() * 80) + 10,
      gpuRequired: type === 'GPU' || type === 'MIXED' ? Math.floor(Math.random() * 90) + 10 : 0,
      ramRequired: Math.floor(Math.random() * 8) + 1,
      storageRequired: Math.floor(Math.random() * 50) + 5,
      estimatedExecutionTime: Math.floor(Math.random() * 15) + 5,
      urgency: Math.floor(Math.random() * 100)
    };

    await fetch('http://localhost:4000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskReq)
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>All Requests</h1>
        <button className={styles.submitBtn} onClick={submitManualTask}>Submit Request</button>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Task</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Score</th>
              <th>CPU</th>
              <th>GPU</th>
              <th>RAM</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.sort((a, b) => b.createdAt - a.createdAt).map(t => (
              <tr key={t.requestId}>
                <td className="mono">{t.requestId}</td>
                <td>{t.taskName}</td>
                <td>{t.taskType}</td>
                <td>{getPriorityBadge(t.priority)}</td>
                <td>{t.priorityScore}</td>
                <td>{t.cpuRequired}%</td>
                <td>{t.gpuRequired}%</td>
                <td>{t.ramRequired} GB</td>
                <td>{getStatusBadge(t.status)}</td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '24px' }}>
                  No requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
