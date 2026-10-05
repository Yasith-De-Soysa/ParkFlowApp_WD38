import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_NATIVE_API_BASE_URL || 'http://localhost:5000/api';

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
    const response = await this.api.post('/auth/register', payload);
    await AsyncStorage.setItem('parkflow.auth.token', response.token);
    return response;
  }

  public async login(payload: { email: string; password: string }) {
    const response = await this.api.post('/auth/login', payload);
    await AsyncStorage.setItem('parkflow.auth.token', response.token);
    return response;
  }

  public async getCurrentUser() {
    return this.api.get('/auth/me');
  }
}

export default new ApiService();
