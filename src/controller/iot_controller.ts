import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { db } from '../utils/firebase';

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

    // console.log('🔄 Received data:', payload);
    // console.log('🕒 Last data:', lastData);
    // console.log('✅ Has changed:', hasChanged);

    // 🔥 Use the timestamp from ESP32 instead of creating new Date()
    const esp32Timestamp = payload.timestamp; // example "2023-12-07T14:30:45.123Z"
    
    // Remove the 'Z' since it's actually Jakarta time, not UTC
    const timestampWithoutZ = esp32Timestamp.replace('Z', '');
    
    // Convert to Date object for Supabase/Prisma - now it's treated as local time
    const timestamp = new Date(timestampWithoutZ);

    // Untuk Firebase, gunakan timestamp tanpa 'Z' untuk konsistensi
    const firebaseTimestamp = timestampWithoutZ;

    // Jika berubah, simpan ke Supabase
    if (hasChanged) {
      console.log('⚡ Detected change, saving to Supabase');

      try {
        const result = await prisma.powerLog.create({
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
        console.log('✅ Successfully saved to Supabase. ID:', result);
      } catch (supabaseError) {
        console.error('❌ Supabase save failed:', supabaseError);
        // Don't throw here if you want Firebase to still work
      }
    }

    // Perbarui Firebase realtime data (pakai string yang sama)
    await firebaseRef.set({
      timestamp: firebaseTimestamp,
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
