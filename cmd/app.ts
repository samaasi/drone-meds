import cors from 'cors';
import express from 'express';
import droneRoutes from './routes/droneRoutes';
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

// Load routes
app.use('/api/v1', droneRoutes);

app.use(errorHandler);

export default app;
