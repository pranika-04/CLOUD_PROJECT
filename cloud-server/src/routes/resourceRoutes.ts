import { Router } from 'express';
import { resourceManager } from '../resources/resourceManager';

const router = Router();

router.get('/', (req, res) => {
  res.json(resourceManager.getState());
});

router.get('/cpu', (req, res) => {
  res.json(resourceManager.getState().cpu);
});

router.get('/gpu', (req, res) => {
  res.json(resourceManager.getState().gpu);
});

router.get('/memory', (req, res) => {
  res.json(resourceManager.getState().ram);
});

router.get('/storage', (req, res) => {
  res.json(resourceManager.getState().storage);
});

router.get('/utilization', (req, res) => {
  res.json(resourceManager.getUtilization());
});

router.post('/allocate', (req, res) => {
  const allocation = resourceManager.allocate(req.body);
  if (allocation) {
    res.status(200).json(allocation);
  } else {
    res.status(400).json({ error: 'Insufficient resources' });
  }
});

router.post('/release', (req, res) => {
  const { taskId } = req.body;
  const success = resourceManager.release(taskId);
  if (success) {
    res.status(200).json({ success: true });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

export default router;
