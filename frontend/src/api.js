import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const getMovies = (genre) => api.get('/movies', { params: { genre } });
export const getMovie = (id) => api.get(`/movies/${id}`);
export const getRecommendations = (id) => api.get(`/movies/recommend/${id}`);
export const loginUser = (username) => api.post('/users/login', { username });
export const getUserRecommendations = (userId) => api.get(`/users/${userId}/recommendations`);

export default api;
