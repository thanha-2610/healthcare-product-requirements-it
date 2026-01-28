import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, 
});

// Thêm interceptor để debug
api.interceptors.request.use(
  (config) => {
    console.log(' API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error(' Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(' API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error(' Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api;