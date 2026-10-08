import { useEffect, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import styles from './DashboardLayout.module.css';
import { Server, Activity, List, Layers, PieChart, Square, Pause } from 'lucide-react';
import { socketService } from '../services/socketService';

export const DashboardLayout = () => {
  const [serverStatus, setServerStatus] = useState('OFFLINE');
  const [simStatus, setSimStatus] = useState('STOPPED');

  useEffect(() => {
    socketService.connect();
    
    // Poll for status or listen via socket
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/server/status');
        if (res.ok) {
          const data = await res.json();
          setServerStatus(data.status);
        } else {
          setServerStatus('OFFLINE');
        }
      } catch (e) {
        setServerStatus('OFFLINE');
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);

    socketService.on('SIMULATION_STATUS', (data: any) => {
      setSimStatus(data.status);
    });

    return () => clearInterval(interval);
  }, []);

  const startSim = async (level: string) => {
    await fetch('http://localhost:4000/api/simulation/start', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loadLevel: level }) 
    });
  };

  const pauseSim = async () => {
    await fetch('http://localhost:4000/api/simulation/pause', { method: 'POST' });
  };

  const stopSim = async () => {
    await fetch('http://localhost:4000/api/simulation/stop', { method: 'POST' });
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo} />
          <div>
            <h2>SMART CLOUD</h2>
            <span>Resource Allocation</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <NavLink to="/" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} end>
            <Activity size={18} /> Dashboard
          </NavLink>
          <NavLink to="/infrastructure" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Server size={18} /> Infrastructure
          </NavLink>
          <NavLink to="/requests" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <List size={18} /> Requests
          </NavLink>
          <NavLink to="/queue" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Layers size={18} /> Queue
          </NavLink>
          <NavLink to="/allocation" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Layers size={18} /> Allocation Engine
          </NavLink>
          <NavLink to="/analytics" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <PieChart size={18} /> Analytics
          </NavLink>
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.statusBox}>
            <div className={styles.statusRow}>
              <span>Server</span>
              <span className={serverStatus === 'ONLINE' ? styles.online : styles.offline}>
                {serverStatus}
              </span>
            </div>
            <div className={styles.statusRow}>
              <span>Simulation</span>
              <span className={styles.simState}>{simStatus}</span>
            </div>
            
            <div className={styles.controlsGrid} style={{marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <div style={{display: 'flex', gap: '4px'}}>
                <button className={styles.simBtn} onClick={() => startSim('LOW')} title="Low Load">Low</button>
                <button className={styles.simBtn} onClick={() => startSim('MEDIUM')} title="Medium Load">Med</button>
                <button className={styles.simBtn} onClick={() => startSim('HIGH')} title="High Load">High</button>
              </div>
              <div style={{display: 'flex', gap: '4px'}}>
                <button className={styles.simBtn} onClick={() => startSim('STRESS')} title="Stress Test">Stress</button>
                <button className={styles.simBtn} onClick={pauseSim} title="Pause"><Pause size={14}/></button>
                <button className={styles.simBtn} onClick={stopSim} title="Stop"><Square size={14}/></button>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            {/* Context breadcrumb could go here */}
          </div>
          <div className={styles.headerRight}>
            <div className={styles.time}>{new Date().toLocaleTimeString()}</div>
          </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
