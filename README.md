# Smart Cloud Resource Allocation Engine

## Project Overview
This project is a complete working simulation of a cloud resource allocation engine. It models a virtual data center with CPU, GPU, RAM, and Storage resources, and handles incoming computational requests by evaluating their requirements against available resources and priority scores. The system employs a priority-based queueing mechanism with an aging algorithm to prevent starvation, and an allocation engine that determines resource suitability. 

The frontend provides a professional, real-time monitoring dashboard typical of enterprise DevOps/Cloud Infrastructure tools (e.g., AWS CloudWatch, Kubernetes Dashboard).

## Architecture

The system consists of three distinct applications:
1. **Frontend**: React application for the user interface and monitoring.
2. **Backend**: Express.js server that houses the Priority Engine, Queue Engine, Allocation Engine, and coordinates the simulation.
3. **Mock Cloud Server**: A separate process that mathematically represents the cloud infrastructure state (CPU, GPU, RAM, Storage).

```
Frontend (Port: 5173)  <--WebSockets/HTTP-->  Backend (Port: 4000)  <--HTTP-->  Mock Cloud Server (Port: 5000)
```

## Technologies
- **Frontend**: React, Vite, TypeScript, CSS Modules, React Router, Recharts, Socket.io-client.
- **Backend**: Node.js, Express.js, TypeScript, Socket.io, UUID.
- **Cloud Server**: Node.js, Express.js, TypeScript.

## Folder Structure
```
c:/Cloud Project/
├── frontend/             # React UI
│   ├── src/
│   │   ├── components/
│   │   ├── pages/        # Dashboard, Infrastructure, Queue, Requests, Analytics, Allocation Engine
│   │   ├── layouts/
│   │   ├── services/     # WebSocket service
│   │   └── styles/
├── backend/              # Allocation Engine and Request API
│   ├── src/
│   │   ├── engines/      # PriorityEngine, AllocationEngine, QueueEngine
│   │   ├── simulation/   # Workload simulator
│   │   ├── services/     # Cloud API client, WebSockets
│   │   └── routes/
└── cloud-server/         # Mock cloud infrastructure
    ├── src/
    │   ├── resources/    # Resource manager (tracks allocated vs free capacity)
    │   └── routes/
```

## How to Install
Run the following from the root directory to install dependencies for all packages (assuming you have bash or similar, otherwise run `npm install` in each directory individually):
```bash
cd cloud-server && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

## How to Run

1. **Run Cloud Server**:
   ```bash
   cd cloud-server
   npm run start
   ```

2. **Run Backend**:
   ```bash
   cd backend
   npm run start
   ```

3. **Run Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

## Priority Formula
The system assigns a priority score between 0 and 100 based on the following formula:
`Score = (0.30 * CPU Requirement) + (0.30 * GPU Requirement) + (0.20 * Normalized RAM) + (0.20 * Urgency)`

Scores are classified as:
- **LOW**: 0-40
- **MEDIUM**: 41-70
- **HIGH**: 71-100

## Allocation Algorithm
Tasks are checked against current availability:
1. Validate required vs available total capacity.
2. Calculate a Suitability Score: `Priority Score + (Resource Availability % * 0.5)`
3. The queue is continuously sorted by `Priority Score + Waiting Time Bonus (aging)`.
4. Highest suitability task is removed from the queue and assigned resources.

## Queue Algorithm (Aging)
To prevent starvation, tasks that stay in the queue receive a `WaitingTimeBonus`. Every 5 seconds, tasks receive +1 bonus point to their effective priority score, pushing older tasks up the queue dynamically.

## Simulation Explanation
The backend features a `SimulationManager` that generates tasks based on selected load levels:
- **Low**: ~7 requests/min
- **Medium**: ~24 requests/min
- **High**: ~60 requests/min
- **Stress**: Immediate burst of 50 tasks

Tasks have an `estimatedExecutionTime` (5 to 20 seconds). When a task starts, the backend issues an allocation to the Mock Cloud Server. After the time expires, the task completes, freeing up resources and triggering a fresh queue process.

## API Documentation

### Mock Cloud Server
- `GET /resources`: Returns all resources.
- `GET /resources/utilization`: Returns percentage-based utilization of all resources.
- `POST /resources/allocate`: Deducts requested capacity from available.
- `POST /resources/release`: Frees up requested capacity.

### Backend Server
- `GET /api/tasks`: Returns all tasks.
- `GET /api/tasks/queue`: Returns queued tasks and stats.
- `GET /api/resources`: Proxies cloud resources.
- `POST /api/simulation/start`: Starts load generation (body: `{ loadLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'STRESS' }`)
- `POST /api/simulation/pause`: Pauses load generation.
- `POST /api/simulation/stop`: Stops simulation and generation.

## Screenshots
*(Add screenshots here)*

## Future Improvements
- Persistent Database (PostgreSQL/MongoDB) for analytics history.
- Granular CPU core pinning algorithms.
- Node fault-tolerance simulation.
