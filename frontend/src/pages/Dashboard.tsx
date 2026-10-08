import { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [resources, setResources] = useState<any>(null);
  const [utilization, setUtilization] = useState<any>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/resources');
        const data = await res.json();
        setResources(data);
      } catch (e) {}
    };

    const fetchUtilization = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/resources/utilization');
        const data = await res.json();
        setUtilization(data);
      } catch (e) {}
    };

    fetchResources();
    fetchUtilization();
    const interval = setInterval(() => {
      fetchResources();
      fetchUtilization();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!resources || !utilization) return <div>Loading...</div>;

  const activeCpu = resources.cpu.filter((c: any) => c.status === 'ACTIVE').length;
  const activeGpu = resources.gpu.filter((g: any) => g.status === 'ACTIVE').length;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Resource Overview</h1>
      
      <div className={styles.grid}>
        {/* CPU Card */}
        <div className="card">
          <h3>CPU</h3>
          <div className={styles.statLine}>
            <span className={styles.label}>Cores</span>
            <span className={styles.value}>{resources.cpu.length} cores</span>
          </div>
          <div className={styles.statLine}>
            <span className={styles.label}>Active</span>
            <span className={styles.value}>{activeCpu} active</span>
          </div>
          <div className={styles.utilization}>
            <div className={styles.utilBar}>
              <div 
                className={styles.utilFill} 
                style={{ width: `${utilization.cpu}%`, backgroundColor: utilization.cpu > 80 ? 'var(--accent-danger)' : 'var(--accent-primary)' }}
              />
            </div>
            <div className={styles.utilText}>{utilization.cpu.toFixed(1)}% utilization</div>
          </div>
        </div>

        {/* GPU Card */}
        <div className="card">
          <h3>GPU</h3>
          <div className={styles.statLine}>
            <span className={styles.label}>Devices</span>
            <span className={styles.value}>{resources.gpu.length} devices</span>
          </div>
          <div className={styles.statLine}>
            <span className={styles.label}>Active</span>
            <span className={styles.value}>{activeGpu} active</span>
          </div>
          <div className={styles.utilization}>
            <div className={styles.utilBar}>
              <div 
                className={styles.utilFill} 
                style={{ width: `${utilization.gpu}%`, backgroundColor: utilization.gpu > 80 ? 'var(--accent-danger)' : '#8b5cf6' }}
              />
            </div>
            <div className={styles.utilText}>{utilization.gpu.toFixed(1)}% utilization</div>
          </div>
        </div>

        {/* RAM Card */}
        <div className="card">
          <h3>RAM</h3>
          <div className={styles.statLine}>
            <span className={styles.label}>Total</span>
            <span className={styles.value}>{resources.ram.total} GB</span>
          </div>
          <div className={styles.statLine}>
            <span className={styles.label}>Allocated</span>
            <span className={styles.value}>{resources.ram.allocated.toFixed(1)} GB</span>
          </div>
          <div className={styles.utilization}>
            <div className={styles.utilBar}>
              <div 
                className={styles.utilFill} 
                style={{ width: `${utilization.ram}%`, backgroundColor: utilization.ram > 80 ? 'var(--accent-danger)' : 'var(--accent-success)' }}
              />
            </div>
            <div className={styles.utilText}>{utilization.ram.toFixed(1)}% utilization</div>
          </div>
        </div>

        {/* Storage Card */}
        <div className="card">
          <h3>Storage</h3>
          <div className={styles.statLine}>
            <span className={styles.label}>Total</span>
            <span className={styles.value}>{resources.storage.total} GB</span>
          </div>
          <div className={styles.statLine}>
            <span className={styles.label}>Allocated</span>
            <span className={styles.value}>{resources.storage.allocated.toFixed(1)} GB</span>
          </div>
          <div className={styles.utilization}>
            <div className={styles.utilBar}>
              <div 
                className={styles.utilFill} 
                style={{ width: `${utilization.storage}%`, backgroundColor: 'var(--text-secondary)' }}
              />
            </div>
            <div className={styles.utilText}>{utilization.storage.toFixed(1)}% utilization</div>
          </div>
        </div>
      </div>
    </div>
  );
}
