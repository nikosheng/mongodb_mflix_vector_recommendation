import React, { useEffect, useState } from 'react';
import { getRecommendations } from '../api';
import { X, Play, Plus, ThumbsUp } from 'lucide-react';

const Modal = ({ movie, onClose }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (movie) {
      const fetchRecommendations = async () => {
        setLoadingRecommendations(true);
        setError(null);
        try {
          const res = await getRecommendations(movie._id);
          setRecommendations(res.data);
        } catch (error) {
          console.error("Error fetching recommendations:", error);
          if (error.response?.status === 400 && error.response?.data?.message === 'Movie does not have embedding data') {
            setError("Recommendations are not available for this movie yet (missing vector embeddings).");
          } else {
            setError(error.response?.data?.hint || "Failed to load recommendations.");
          }
          setRecommendations([]);
        } finally {
          setLoadingRecommendations(false);
        }
      };
      fetchRecommendations();
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div 
        className="fixed inset-0 z-[100] flex justify-center items-start pt-10 bg-black/80 overflow-y-auto"
        onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-[#181818] rounded-md shadow-2xl overflow-hidden mb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-[#181818] rounded-full p-2 hover:bg-white/20 transition"
        >
            <X className="text-white" size={24} />
        </button>

        {/* Hero Section of Modal */}
        <div className="relative h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent z-10" />
            <img 
                src={movie.poster} 
                alt={movie.title} 
                className="w-full h-full object-cover object-top"
            />
            <div className="absolute bottom-10 left-10 space-y-4 z-20">
                <h2 className="text-4xl font-bold text-white">{movie.title}</h2>
                <div className="flex space-x-4">
                    <button className="flex items-center px-8 py-2 bg-white text-black font-bold rounded hover:bg-opacity-80 transition">
                        <Play className="w-6 h-6 mr-2 fill-black" /> Play
                    </button>
                    <button className="flex items-center p-2 border-2 border-gray-400 rounded-full hover:border-white transition">
                        <Plus className="text-white" size={24} />
                    </button>
                    <button className="flex items-center p-2 border-2 border-gray-400 rounded-full hover:border-white transition">
                        <ThumbsUp className="text-white" size={24} />
                    </button>
                </div>
            </div>
        </div>

        {/* Details Section */}
        <div className="px-10 py-8 text-white grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                <div className="flex items-center space-x-4 text-sm font-bold text-gray-400">
                    <span className="text-green-500 text-lg">{movie.imdb?.rating || 'N/A'} Score</span>
                    <span>{movie.year}</span>
                    <span>{movie.runtime ? `${movie.runtime}m` : ''}</span>
                    <span className="border px-1 text-xs">{movie.rated || 'PG-13'}</span>
                </div>
                <p className="text-lg leading-relaxed">{movie.plot}</p>
                <p className="text-gray-400 text-sm">{movie.fullplot}</p>
            </div>
            <div className="text-sm space-y-4 text-gray-400">
                <div>
                    <span className="text-gray-500">Cast:</span> {movie.cast?.slice(0, 5).join(', ')}
                </div>
                <div>
                    <span className="text-gray-500">Genres:</span> {movie.genres?.join(', ')}
                </div>
                 <div>
                    <span className="text-gray-500">Directors:</span> {movie.directors?.join(', ')}
                </div>
            </div>
        </div>

        {/* Recommendations Section */}
        <div className="px-10 pb-10">
            <h3 className="text-2xl font-bold text-white mb-6">More Like This</h3>
            {loadingRecommendations ? (
              <div className="text-white text-center py-10">Loading recommendations...</div>
            ) : error ? (
              <div className="text-red-500 text-center py-10 bg-red-900/20 rounded p-4 border border-red-500/50">
                  <p className="font-bold">Error loading recommendations</p>
                  <p className="text-sm mt-2">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {recommendations.length > 0 ? (
                  recommendations.map((rec) => (
                    <div key={rec._id} className="bg-[#2f2f2f] rounded-md overflow-hidden cursor-pointer hover:bg-[#3f3f3f] transition group">
                        <div className="relative aspect-[16/9] overflow-hidden">
                             <img 
                                src={rec.poster} 
                                alt={rec.title} 
                                className="w-full h-full object-cover object-top"
                            />
                            {rec.score && (
                                <div className="absolute top-2 right-2 bg-green-600 px-2 py-1 rounded text-xs font-bold text-white shadow-md">
                                    {(rec.score * 100).toFixed(0)}% Match
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-white mb-1 truncate">{rec.title}</h4>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                                <span>{rec.year}</span>
                                <span className="border px-1">{rec.genres?.[0]}</span>
                            </div>
                            <p className="text-gray-300 text-xs mt-2 line-clamp-3">{rec.plot}</p>
                        </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 col-span-full text-center">No recommendations found.</div>
                )}
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
