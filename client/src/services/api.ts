// src/services/api.ts
import axios from 'axios';

// Auth API calls
export const authAPI = {
  googleSignIn: (token: string) => 
    axios.post('/api/auth/google', { token }),
  
  getCurrentUser: () => 
    axios.get('/api/auth/me'),
  
  logout: () => 
    axios.post('/api/auth/logout'),
};

// Course API calls
export const courseAPI = {
  getModules: () => 
    axios.get('/api/course/modules'),
};

// Payment API calls
export const paymentAPI = {
  createCheckout: (productType: string) =>
    axios.post('/api/stripe/create-checkout', { productType }),
  
  verifyPayment: (sessionId: string) =>
    axios.get(`/api/payment/verify/${sessionId}`),
};

// Ebook API calls
export const ebookAPI = {
  download: () =>
    axios.get('/api/ebook/download'),
};