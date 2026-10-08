import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { SocketService } from './services/socketService';
import taskRoutes from './routes/taskRoutes';
import simulationRoutes from './routes/simulationRoutes';
import resourceRoutes from './routes/resourceRoutes';
import { CloudServerClient } from './services/cloudServerClient';

const app = express();
const httpServer = createServer(app);
const PORT = 4000;

app.use(cors());
app.use(express.json());

SocketService.initialize(httpServer);

app.use('/api/tasks', taskRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/resources', resourceRoutes);

app.get('/api/server/status', async (req, res) => {
  try {
    const cloudStatus = await CloudServerClient.getStatus();
    res.json({
      status: 'ONLINE',
      cloudServer: cloudStatus
    });
  } catch (e) {
    res.json({
      status: 'ONLINE',
      cloudServer: 'OFFLINE'
    });
  }
});

httpServer.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
