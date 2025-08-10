// frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // URL base de nuestro backend
});

// "Interceptor": Esto es como un guardia que detiene cada petición antes de que salga...
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // ...y si hay un token, le añade la cabecera de autorización.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;