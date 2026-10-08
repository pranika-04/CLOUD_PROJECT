import { useEffect, useState } from 'react';
import styles from './Analytics.module.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Collect simulated data for chart over time
    const interval = setInterval(async () => {
      try {
        const utilRes = await fetch('http://localhost:4000/api/resources/utilization');
        const queueRes = await fetch('http://localhost:4000/api/tasks/queue');
        const utilData = await utilRes.json();
        const queueData = await queueRes.json();

        setData(prev => {
          const newData = [...prev, {
            time: new Date().toLocaleTimeString(),
            cpu: utilData.cpu,
            gpu: utilData.gpu,
            ram: utilData.ram,
            queueLength: queueData.length
          }];
          if (newData.length > 20) newData.shift();
          return newData;
        });
      } catch(e) {}
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>System Analytics</h1>

      <div className={styles.grid}>
        <div className="card">
          <h3 className={styles.chartTitle}>CPU Utilization (%)</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="cpu" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className={styles.chartTitle}>GPU Utilization (%)</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="gpu" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{gridColumn: '1 / -1'}}>
          <h3 className={styles.chartTitle}>Queue Length</h3>
          <div className={styles.chartWrapper} style={{height: '250px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="stepAfter" dataKey="queueLength" stroke="#d97706" strokeWidth={2} dot={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
