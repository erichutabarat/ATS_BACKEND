import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma'; // sesuaikan path kamu

const prisma = new PrismaClient();

export async function handleHistoryData(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await prisma.powerLog.findMany({
    orderBy: { timestamp: 'desc' },
    skip: offset,
    take: limit,
    });
    
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('❌ Error fetching history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch history data' });
  }
}
