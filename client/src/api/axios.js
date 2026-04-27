import axios from 'axios';

const API = axios.create({
  baseURL: 'https://vaulttrack-api.onrender.com/api'
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('vaulttrack_token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;