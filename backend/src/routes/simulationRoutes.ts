import { Router } from 'express';
import { SimulationManager } from '../simulation/simulationManager';

const router = Router();

router.post('/start', (req, res) => {
  const { loadLevel } = req.body;
  SimulationManager.start(loadLevel || 'LOW');
  res.json(SimulationManager.getStatus());
});

router.post('/pause', (req, res) => {
  SimulationManager.pause();
  res.json(SimulationManager.getStatus());
});

router.post('/stop', (req, res) => {
  SimulationManager.stop();
  res.json(SimulationManager.getStatus());
});

router.get('/status', (req, res) => {
  res.json(SimulationManager.getStatus());
});

export default router;
