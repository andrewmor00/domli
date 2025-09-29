const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    if (!response.ok) {
      console.error(`API Error ${response.status}:`, data.message || response.statusText);
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  }

  // Authentication methods
  async register(userData) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await this.handleResponse(response);
    
    if (data.success && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data;
  }

  async login(credentials) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await this.handleResponse(response);
    
    if (data.success && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data;
  }

  async logout() {
    try {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseURL}/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  // User management methods
  async updateProfile(userData) {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });

    return this.handleResponse(response);
  }

  async updatePreferences(preferences) {
    const response = await fetch(`${this.baseURL}/users/preferences`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(preferences)
    });

    return this.handleResponse(response);
  }

  async changePassword(passwordData) {
    const response = await fetch(`${this.baseURL}/users/change-password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(passwordData)
    });

    return this.handleResponse(response);
  }

  // Property methods
  async getProperties(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${this.baseURL}/properties?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async getPropertyById(id) {
    const response = await fetch(`${this.baseURL}/properties/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async getPropertyDetails(id) {
    const response = await fetch(`${this.baseURL}/properties/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  // Recommendations methods
  async getRecommendations() {
    const response = await fetch(`${this.baseURL}/properties/recommendations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return this.handleResponse(response);
  }

  async getPersonalizedRecommendations() {
    const response = await fetch(`${this.baseURL}/properties/personalized-recommendations`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  // Admin methods
  async getAllUsers() {
    const response = await fetch(`${this.baseURL}/admin/users`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async updateUserStatus(userId, status) {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    return this.handleResponse(response);
  }

  async updateUserRole(userId, role) {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ role })
    });

    return this.handleResponse(response);
  }

  async deleteUser(userId) {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  // Admin property management
  async createProperty(propertyData) {
    const response = await fetch(`${this.baseURL}/admin/properties`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(propertyData)
    });

    return this.handleResponse(response);
  }

  async updateProperty(propertyId, propertyData) {
    const response = await fetch(`${this.baseURL}/admin/properties/${propertyId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(propertyData)
    });

    return this.handleResponse(response);
  }

  async deleteProperty(propertyId) {
    const response = await fetch(`${this.baseURL}/admin/properties/${propertyId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  // Admin settings
  async getSystemSettings() {
    const response = await fetch(`${this.baseURL}/admin/settings`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async updateSystemSettings(settings) {
    const response = await fetch(`${this.baseURL}/admin/settings`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settings)
    });

    return this.handleResponse(response);
  }

  // Admin analytics and statistics
  async getStatistics() {
    const response = await fetch(`${this.baseURL}/admin/statistics`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async getPropertyRatings() {
    const response = await fetch(`${this.baseURL}/admin/property-ratings`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  // Admin maintenance
  async createBackup() {
    const response = await fetch(`${this.baseURL}/admin/backup`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async exportData(dataType) {
    const response = await fetch(`${this.baseURL}/admin/export/${dataType}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Return blob for file download
    return response.blob();
  }

  async clearCache() {
    const response = await fetch(`${this.baseURL}/admin/clear-cache`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async getSystemStatus() {
    const response = await fetch(`${this.baseURL}/admin/system-status`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  // Utility methods
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  getCurrentUserFromStorage() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken() {
    return localStorage.getItem('token');
  }
}

export default new ApiService();

// Create a separate reservation service instance to use the same API pattern
class ReservationService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    if (!response.ok) {
      console.error(`API Error ${response.status}:`, data.message || response.statusText);
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  }

  async getUserReservations() {
    const response = await fetch(`${this.baseURL}/reservations`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async createReservation(propertyId, notes = '') {
    const response = await fetch(`${this.baseURL}/reservations`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ propertyId, notes })
    });

    return this.handleResponse(response);
  }

  async cancelReservation(reservationId) {
    const response = await fetch(`${this.baseURL}/reservations/${reservationId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async cancelReservationByProperty(propertyId) {
    const response = await fetch(`${this.baseURL}/reservations/property/${propertyId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async checkReservationStatus(propertyId) {
    const response = await fetch(`${this.baseURL}/reservations/status/${propertyId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }
}

export { ReservationService }; 