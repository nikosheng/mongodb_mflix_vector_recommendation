import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const getMovies = (genre) => api.get('/movies', { params: { genre } });
export const getMovie = (id) => api.get(`/movies/${id}`);
export const getRecommendations = (id) => api.get(`/movies/recommend/${id}`);
export const loginUser = (username) => api.post('/users/login', { username });
export const getUserRecommendations = (userId) => api.get(`/users/${userId}/recommendations`);
export const recordUserHistory = (userId, movieId, browsingTime) => api.post('/users/history', { userId, movieId, browsingTime });
export const analyzeChat = (query) => api.post('/chatbot/analyze', { query });
export const getColdStartMovies = (prompt) => api.post('/movies/cold-start', { prompt });

export default api;
