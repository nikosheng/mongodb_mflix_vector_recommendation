import React, { useEffect, useState } from 'react';
import { getMovies } from '../api';
import { Play, Info } from 'lucide-react';

const Banner = ({ onMovieClick }) => {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Action movies for the banner
        const response = await getMovies('Action');
        if (response.data && response.data.length > 0) {
          // Pick a random movie
          const randomMovie = response.data[Math.floor(Math.random() * response.data.length)];
          setMovie(randomMovie);
        }
      } catch (error) {
        console.error("Error fetching banner movie:", error);
      }
    };
    fetchData();
  }, []);

  if (!movie) return <div className="h-[60vh] bg-black animate-pulse"></div>;

  return (
    <header 
      className="relative h-[60vh] md:h-[80vh] text-white overflow-hidden"
    >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
            <img 
                src={movie.poster} 
                alt={movie.title} 
                className="w-full h-full object-cover object-top opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

      <div className="relative z-10 flex flex-col justify-center h-full px-4 md:px-16 space-y-4 max-w-2xl pt-20">
        <h1 className="text-4xl md:text-6xl font-bold drop-shadow-xl">
          {movie.title}
        </h1>
        
        <div className="flex items-center space-x-4 text-sm font-bold text-gray-300">
            <span className="text-green-500">{movie.imdb?.rating || 'N/A'} Score</span>
            <span>{movie.year}</span>
            <span className="border border-gray-500 px-1 text-xs uppercase">HD</span>
        </div>

        <p className="text-sm md:text-lg line-clamp-3 drop-shadow-md text-gray-200">
          {movie.plot}
        </p>
        
        <div className="flex space-x-3 pt-4">
          <button className="flex items-center px-6 py-2 bg-white text-black rounded hover:bg-opacity-80 transition font-bold">
            <Play className="w-5 h-5 mr-2 fill-black" /> Play
          </button>
          <button 
            onClick={() => onMovieClick(movie)}
            className="flex items-center px-6 py-2 bg-gray-500/70 text-white rounded hover:bg-gray-500/50 transition font-bold"
          >
            <Info className="w-5 h-5 mr-2" /> More Info
          </button>
        </div>
      </div>
    </header>
  );
};

export default Banner;
