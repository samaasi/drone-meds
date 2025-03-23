import app from './app';
import { startBatteryCheckService } from './services/checkBatteryService';

const PORT = process.env.PORT || 5005;

startBatteryCheckService();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});