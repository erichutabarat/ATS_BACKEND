export interface IotPayload {
  timestamp: string; // ISO string
  ats_status: 'hidup' | 'mati';
  current_source: 'grid' | 'solar';
  grid_info: {
    voltage: number;
    frequency: number;
    power: number;
  };
  solar_info: {
    current: number;
    voltage: number;
    power: number;
  };
}
