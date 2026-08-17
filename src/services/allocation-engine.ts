export interface Coordinates { latitude: number; longitude: number }
export const ASSUMED_URBAN_SPEED_KMH=24;
export function normalizedCoverageGap(requiredOfficers:number,assignedOfficers:number){if(requiredOfficers<=0)return 0;return Math.min(1,Math.max(0,(requiredOfficers-assignedOfficers)/requiredOfficers))}

export function haversineKm(a: Coordinates, b: Coordinates): number {
  const radians = (value: number) => value * Math.PI / 180;
  const earthRadiusKm = 6371;
  const dLat = radians(b.latitude - a.latitude);
  const dLng = radians(b.longitude - a.longitude);
  const value = Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function rankAvailableOfficers<T extends Coordinates & { status: string; assignments_completed?: number }>(
  junction: Coordinates,
  officers: T[],
): Array<T & { distance_km: number; travel_time_minutes: number }> {
  return officers
    .filter((officer) => officer.status === 'AVAILABLE')
    .map((officer) => {
      const distance = haversineKm(junction, officer);
      return { ...officer, distance_km: distance, travel_time_minutes: Math.max(2, Math.ceil(distance / (ASSUMED_URBAN_SPEED_KMH/60))) };
    })
    .sort((a, b) => a.distance_km - b.distance_km || (a.assignments_completed ?? 0) - (b.assignments_completed ?? 0));
}
