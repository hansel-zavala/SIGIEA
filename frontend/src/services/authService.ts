// frontend/src/services/authService.ts
import axios from 'axios';
import api from './api';

const API_URL = 'http://localhost:3001/api/';

const login = async (email: string, password: string) => {
    try {
    const response = await axios.post(API_URL + 'users/login', {
        email,
        password,
    });

    return response.data;
    } catch (error) {
    throw error;
    }
};

const getProfile = async () => {
    try {
        const response = await axios.get(API_URL + 'users/profile');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const forgotPassword = async (email: string): Promise<any> => {
  const response = await api.post('/auth/send-reset-code', { email });
  return response.data;
};

export const resendResetCode = async (email: string): Promise<any> => {
  const response = await api.post('/auth/resend-reset-code', { email });
  return response.data;
};

export const verifyResetCode = async (email: string, code: string): Promise<any> => {
  const response = await api.post('/auth/verify-code', { email, code });
  return response.data;
};

export const resetPassword = async (email: string, code: string, newPassword: string): Promise<any> => {
  const response = await api.post('/auth/reset-password', { email, code, newPassword });
  return response.data;
};

export default {
    login,
    getProfile,
    forgotPassword,
    resetPassword,
    verifyResetCode,
    resendResetCode,
};