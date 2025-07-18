import { Router } from 'express';
import { PrismaClient } from '../generated/prisma';
import { handleIOTData } from '../controller/iot_controller';
import { handleHistoryData } from '../controller/history_controller';

const iotRouter = Router();
const prisma = new PrismaClient();

iotRouter.post('/log', handleIOTData);
iotRouter.get('/history', handleHistoryData)

export default iotRouter;
