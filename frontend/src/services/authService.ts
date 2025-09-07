// frontend/src/services/authService.ts
import axios from 'axios';

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

export default {
    login,
};