import { apiClient } from '@/lib/api';

/**
 * Reservations Service
 * Handles API interactions for inventory reservations
 */
class ReservationsService {
  /**
   * Get all active reservations
   * @returns {Promise<Object>} raw response
   */
  async getActive() {
    try {
      const res = await apiClient.get('/reservations/active');
      return res.data;
    } catch (error) {
      console.error('Active reservations fetch error:', error);
      const msg = error?.response?.data?.error;
      throw new Error(msg || 'Failed to fetch active reservations');
    }
  }

  /**
   * Cleanup expired reservations
   * @returns {Promise<Object>} cleanup result
   */
  async cleanupExpired() {
    try {
      const res = await apiClient.post('/reservations/cleanup');
      return res.data;
    } catch (error) {
      console.error('Cleanup reservations error:', error);
      const msg = error?.response?.data?.error;
      throw new Error(msg || 'Failed to cleanup reservations');
    }
  }

  /**
   * Transform raw active reservations for UI
   * Converts timestamp strings to Date objects.
   */
  transformActiveForUI(raw) {
    if (!raw?.success) return null;

    const { activeReservations = 0, data = [] } = raw;

    return {
      activeReservations,
      reservations: data.map((r) => ({
        ...r,
        reservationTime: r.reservationTime ? new Date(r.reservationTime) : null,
        expiryTime: r.expiryTime ? new Date(r.expiryTime) : null,
        secondsUntilExpiry: Number(r.secondsUntilExpiry ?? 0),
      })),
    };
  }
}

export const reservationsService = new ReservationsService(); 