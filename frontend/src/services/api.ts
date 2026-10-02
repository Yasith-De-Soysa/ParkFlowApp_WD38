import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_NATIVE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for token
    this.api.interceptors.request.use(
      (config) => {
        // Add token from storage if available
        // const token = await AsyncStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Example endpoint methods
  public async getHealth() {
    return this.api.get('/health');
  }

  // Add your API endpoint methods here
  // public async getUser(userId: string) {
  //   return this.api.get(`/users/${userId}`);
  // }
}

export default new ApiService();
