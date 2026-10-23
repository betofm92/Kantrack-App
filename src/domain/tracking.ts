export interface TrackingGrant {
  verifiedByBackend: true;
  tenantId: string;
  driverId: string;
  shiftId: string;
  expiresAt: number;
}

export function mayTrack(grant: TrackingGrant | null, now: number): boolean {
  return !!grant && grant.verifiedByBackend === true && !!grant.tenantId && !!grant.driverId && !!grant.shiftId &&
    grant.expiresAt > now && grant.expiresAt <= now + 12 * 60 * 60 * 1000;
}
