import cors from 'cors';
import express from 'express';
import droneRoutes from './routes/droneRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Load routes
app.use('/api', droneRoutes);

export default app;
