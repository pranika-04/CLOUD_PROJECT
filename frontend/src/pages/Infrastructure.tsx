import { useEffect, useState } from 'react';
import styles from './Infrastructure.module.css';

export default function Infrastructure() {
  const [resources, setResources] = useState<any>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/resources');
        const data = await res.json();
        setResources(data);
      } catch (e) {}
    };

    fetchResources();
    const interval = setInterval(fetchResources, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!resources) return <div>Loading infrastructure...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Server Topology</h1>

      <section className={styles.section}>
        <h2>CPU Cluster</h2>
        <div className={styles.resourceGrid}>
          {resources.cpu.map((cpu: any) => (
            <div key={cpu.id} className={`${styles.node} ${cpu.status === 'ACTIVE' ? styles.active : styles.idle}`}>
              <div className={styles.nodeHeader}>
                <span className={styles.nodeId}>{cpu.id}</span>
                <span className={styles.nodeStatus}>{cpu.status}</span>
              </div>
              <div className={styles.nodeBody}>
                <div className={styles.bar}>
                  <div className={styles.fill} style={{ width: `${cpu.allocated}%` }} />
                </div>
                <div className={styles.meta}>{cpu.allocated}% Allocated</div>
                {cpu.tasks.length > 0 && (
                  <div className={styles.taskIds}>
                    {cpu.tasks.map((t: any) => <div key={t.taskId}>{t.taskId}</div>)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>GPU Cluster</h2>
        <div className={styles.resourceGrid}>
          {resources.gpu.map((gpu: any) => (
            <div key={gpu.id} className={`${styles.node} ${gpu.status === 'ACTIVE' ? styles.activeGpu : styles.idle}`}>
              <div className={styles.nodeHeader}>
                <span className={styles.nodeId}>{gpu.id}</span>
                <span className={styles.nodeStatus}>{gpu.status}</span>
              </div>
              <div className={styles.nodeBody}>
                <div className={styles.bar}>
                  <div className={`${styles.fill} ${styles.fillGpu}`} style={{ width: `${gpu.allocated}%` }} />
                </div>
                <div className={styles.meta}>{gpu.allocated}% Allocated</div>
                {gpu.tasks.length > 0 && (
                  <div className={styles.taskIds}>
                    {gpu.tasks.map((t: any) => <div key={t.taskId}>{t.taskId}</div>)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.row}>
        <section className={styles.section} style={{flex: 1}}>
          <h2>Memory (RAM)</h2>
          <div className="card">
            <div className={styles.memoryStats}>
              <div>Total: <strong>{resources.ram.total} GB</strong></div>
              <div>Allocated: <strong>{resources.ram.allocated.toFixed(1)} GB</strong></div>
            </div>
            <div className={styles.bar}>
              <div className={`${styles.fill} ${styles.fillRam}`} style={{ width: `${(resources.ram.allocated / resources.ram.total) * 100}%` }} />
            </div>
          </div>
        </section>

        <section className={styles.section} style={{flex: 1}}>
          <h2>Storage</h2>
          <div className="card">
            <div className={styles.memoryStats}>
              <div>Total: <strong>{resources.storage.total} GB</strong></div>
              <div>Allocated: <strong>{resources.storage.allocated.toFixed(1)} GB</strong></div>
            </div>
            <div className={styles.bar}>
              <div className={`${styles.fill} ${styles.fillStorage}`} style={{ width: `${(resources.storage.allocated / resources.storage.total) * 100}%` }} />
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}
