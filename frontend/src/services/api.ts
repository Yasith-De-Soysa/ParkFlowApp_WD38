import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';

const defaultApiHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.REACT_NATIVE_API_BASE_URL ||
  `http://${defaultApiHost}:5000/api`;

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('parkflow.auth.token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      },
    );
  }

  public async getHealth() {
    return this.api.get('/health');
  }

  public async register(payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    vehicleType: 'Car' | 'Bike';
    vehicleNumber: string;
    avatar?: string;
  }) {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('email', payload.email);
    formData.append('phone', payload.phone);
    formData.append('password', payload.password);
    formData.append('vehicleType', payload.vehicleType);
    formData.append('vehicleNumber', payload.vehicleNumber);
    appendImage(formData, payload.avatar);

    const response = await this.api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const data = unwrapResponse(response);
    await AsyncStorage.setItem('parkflow.auth.token', data.token);
    return data;
  }

  public async login(payload: { email: string; password: string }) {
    const response = await this.api.post('/auth/login', payload);
    const data = unwrapResponse(response);
    await AsyncStorage.setItem('parkflow.auth.token', data.token);
    return data;
  }

  public async getCurrentUser() {
    return this.api.get('/auth/me');
  }

  public async getMyReservations() {
    const response = await this.api.get<{ reservations: Array<{
      _id: string;
      reservationCode: string;
      facilityName: string;
      facilityAddress?: string;
      date: string;
      time: string;
      slot: string;
      vehicleType: 'Car' | 'Bike';
      amount: number;
      status: 'confirmed' | 'cancelled';
    }> }>('/reservations/me');
    return unwrapResponse(response);
  }

  public async createReservation(payload: {
    facilityName: string;
    facilityAddress?: string;
    date: string;
    time: string;
    slot: string;
    vehicleType: 'Car' | 'Bike';
    amount: number;
  }) {
    const response = await this.api.post<{ reservation: { reservationCode: string } }>('/reservations', payload);
    return unwrapResponse(response);
  }

  public async updateCurrentUser(payload: {
    name: string;
    email: string;
    phone: string;
    vehicleType: 'Car' | 'Bike';
    vehicleNumber: string;
    avatar?: string;
    password?: string;
    confirmPassword?: string;
  }) {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('email', payload.email);
    formData.append('phone', payload.phone);
    formData.append('vehicleType', payload.vehicleType);
    formData.append('vehicleNumber', payload.vehicleNumber);
    if (payload.password) formData.append('password', payload.password);
    if (payload.confirmPassword) formData.append('confirmPassword', payload.confirmPassword);
    appendImage(formData, payload.avatar);

    return this.api.put('/auth/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  public async checkFacilityName(name: string) {
    return this.api.get<{ available: boolean }>('/facilities/check-name', { params: { name } });
  }

  public async registerFacility(payload: {
    ownerName: string;
    ownerEmail: string;
    contactNumber: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    carSlots: number;
    bikeSlots: number;
    carAvailableSlots: number;
    bikeAvailableSlots: number;
    carHourlyRate: number;
    bikeHourlyRate: number;
    pricingCurrency: 'LKR';
    imageUri?: string;
  }) {
    const formData = new FormData();
    formData.append('ownerName', payload.ownerName);
    formData.append('ownerEmail', payload.ownerEmail);
    formData.append('contactNumber', payload.contactNumber);
    formData.append('name', payload.name);
    formData.append('address', payload.address);
    formData.append('latitude', String(payload.latitude));
    formData.append('longitude', String(payload.longitude));
    formData.append('carSlots', String(payload.carSlots));
    formData.append('bikeSlots', String(payload.bikeSlots));
    formData.append('carAvailableSlots', String(payload.carAvailableSlots));
    formData.append('bikeAvailableSlots', String(payload.bikeAvailableSlots));
    formData.append('carHourlyRate', String(payload.carHourlyRate));
    formData.append('bikeHourlyRate', String(payload.bikeHourlyRate));
    appendImage(formData, payload.imageUri, 'image');

    return this.api.post('/facilities', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  public async getFacilities(search = '') {
    return this.api.get<{ facilities: Array<{
      _id: string;
      ownerName: string;
      ownerEmail: string;
      contactNumber: string;
      name: string;
      address: string;
      latitude: number;
      longitude: number;
      carSlots: number;
      bikeSlots: number;
      carAvailableSlots: number;
      bikeAvailableSlots: number;
      carHourlyRate: number;
      bikeHourlyRate: number;
      pricingCurrency: 'LKR';
      availableSlots: number;
      status: string;
      imageUri?: string;
      ratingAverage: number;
      ratingCount: number;
    }> }>('/facilities', { params: search.trim() ? { q: search.trim() } : undefined });
  }

  public async getOwnerFacilities() {
    return this.api.get<{ facilities: Array<{
      _id: string;
      ownerName: string;
      ownerEmail: string;
      contactNumber: string;
      name: string;
      address: string;
      carSlots: number;
      bikeSlots: number;
      carAvailableSlots: number;
      bikeAvailableSlots: number;
      totalCapacity: number;
      availableSlots: number;
      status: string;
      imageUri?: string;
      pendingChanges?: Record<string, unknown>;
    }> }>('/facilities/owner/me');
  }

  public async updateOwnerFacility(facilityId: string, payload: {
    ownerName: string;
    contactNumber: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    carSlots: number;
    bikeSlots: number;
    carHourlyRate: number;
    bikeHourlyRate: number;
    imageUri?: string;
    imageFileUri?: string;
  }) {
    const formData = new FormData();
    formData.append('ownerName', payload.ownerName);
    formData.append('contactNumber', payload.contactNumber);
    formData.append('name', payload.name);
    formData.append('address', payload.address);
    formData.append('latitude', String(payload.latitude));
    formData.append('longitude', String(payload.longitude));
    formData.append('carSlots', String(payload.carSlots));
    formData.append('bikeSlots', String(payload.bikeSlots));
    formData.append('carHourlyRate', String(payload.carHourlyRate));
    formData.append('bikeHourlyRate', String(payload.bikeHourlyRate));
    if (payload.imageUri) {
      formData.append('imageUri', payload.imageUri);
    }
    appendImage(formData, payload.imageFileUri, 'image');

    return this.api.put(`/facilities/${facilityId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  public async updateSlotAvailability(
    facilityId: string,
    payload: { carAvailableSlots: number; bikeAvailableSlots: number },
  ) {
    return this.api.patch(`/facilities/${facilityId}/availability`, payload);
  }

  public async adminLogin(payload: { email: string; password: string }) {
    const response = await this.api.post('/admin/login', payload);
    const data = unwrapResponse(response);
    await AsyncStorage.setItem('parkflow.auth.token', data.token);
    return data;
  }

  public async createOwnerAccount(payload: { email: string; password: string }) {
    return this.api.post('/admin/owners', payload);
  }

  public async getPendingFacilities() {
    return this.api.get('/admin/facilities/pending');
  }

  public async reviewFacility(facilityId: string, action: 'approve' | 'decline') {
    return this.api.patch(`/admin/facilities/${facilityId}/review`, { action });
  }

  public async getFacilityReviews(facilityId: string) {
    return this.api.get<{
      reviews: Array<{
        _id: string;
        reviewerId: string;
        reviewerName: string;
        rating: number;
        comment: string;
        createdAt: string;
      }>;
      ratingAverage: number;
      ratingCount: number;
    }>(`/facilities/${facilityId}/reviews`);
  }

  public async addFacilityReview(facilityId: string, payload: { rating: number; comment: string }) {
    return this.api.post(`/facilities/${facilityId}/reviews`, payload);
  }

  public async updateFacilityReview(
    facilityId: string,
    reviewId: string,
    payload: { rating: number; comment: string },
  ) {
    return this.api.put(`/facilities/${facilityId}/reviews/${reviewId}`, payload);
  }

  public async deleteFacilityReview(facilityId: string, reviewId: string) {
    return this.api.delete<{ ratingAverage: number; ratingCount: number }>(
      `/facilities/${facilityId}/reviews/${reviewId}`,
    );
  }
}

function appendImage(formData: FormData, uri?: string, fieldName = 'avatar') {
  if (!uri || uri.startsWith('http://') || uri.startsWith('https://')) {
    return;
  }

  const fileName = uri.split('/').pop() || `avatar-${Date.now()}.jpg`;
  const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  formData.append(fieldName, {
    uri,
    name: fileName,
    type: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
  } as any);
}

function unwrapResponse<T>(response: T | { data: T }): T {
  if (typeof response === 'object' && response !== null && 'data' in response) {
    return response.data;
  }
  return response;
}

export default new ApiService();
