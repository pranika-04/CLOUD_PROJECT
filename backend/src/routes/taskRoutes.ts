import { Router } from 'express';
import { CloudServerClient } from '../services/cloudServerClient';
import { SimulationManager } from '../simulation/simulationManager';

const router = Router();

router.get('/', async (req, res) => {
  const tasks = await CloudServerClient.getTasks();
  res.json(tasks);
});

router.post('/', async (req, res) => {
  const result = await SimulationManager.processManualRequest(req.body);
  res.json(result);
});

router.get('/queue', async (req, res) => {
  const queue = await CloudServerClient.getQueue();
  res.json(queue);
});

export default router;
