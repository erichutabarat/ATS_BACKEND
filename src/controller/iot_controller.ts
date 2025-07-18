import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { db } from '../utils/firebase'; // firebase admin init


const prisma = new PrismaClient();

export async function handleIOTData(req: Request, res: Response) {
  const payload = req.body;

  try {
    // Get real-time Firebase ref
    const firebaseRef = db.ref('realtime_data');

    // Ambil data terakhir dari Firebase
    const snapshot = await firebaseRef.once('value');
    const lastData = snapshot.val();

    const atsStatusNew = payload.ats_status;
    const currentSourceNew = payload.current_source;

    const atsStatusOld = lastData?.ats_status || null;
    const currentSourceOld = lastData?.current_source || null;

    const hasChanged =
      atsStatusNew !== atsStatusOld || currentSourceNew !== currentSourceOld;

    // Jika berubah, simpan ke Supabase
    if (hasChanged) {
      console.log('⚡ Detected change, saving to Supabase');

      const timestamp = new Date(
        new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace(' ', 'T')
      );
      
      await prisma.powerLog.create({
        data: {
          timestamp,
          ats_status: atsStatusNew,
          current_source: currentSourceNew,
          grid_voltage: payload.grid_info.voltage,
          grid_frequency: payload.grid_info.frequency,
          grid_power: payload.grid_info.power,
          solar_current: payload.solar_info.current,
          solar_voltage: payload.solar_info.voltage,
          solar_power: payload.solar_info.power,
        },
      });
    }

    // Perbarui Firebase realtime data (hanya satu entri)
    const nowJakarta = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace(' ', 'T');
    await firebaseRef.set({
      timestamp: nowJakarta,
      ats_status: atsStatusNew,
      current_source: currentSourceNew,
      grid_voltage: payload.grid_info.voltage,
      grid_frequency: payload.grid_info.frequency,
      grid_power: payload.grid_info.power,
      solar_current: payload.solar_info.current,
      solar_voltage: payload.solar_info.voltage,
      solar_power: payload.solar_info.power,
    });

    res.json({ success: true, changed: hasChanged });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}
