import React, { useState, useEffect } from 'react';
import { getColdStartMovies } from '../api';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const ColdStartRow = ({ prompt, onMovieClick }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getColdStartMovies(prompt);
            // The API returns { meta: {...}, movies: [...] }
            setMovies(response.data.movies || []);
        } catch (error) {
            console.error("Error fetching cold start row:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [prompt]);

  const rowId = 'cold-start-row';

  const scrollLeft = () => {
    const slider = document.getElementById('slider' + rowId);
    slider.scrollLeft = slider.scrollLeft - 500;
  };
  const scrollRight = () => {
    const slider = document.getElementById('slider' + rowId);
    slider.scrollLeft = slider.scrollLeft + 500;
  };

  if (loading) return null; // Or a skeleton loader
  if (movies.length === 0) return null;

  return (
    <div className="pl-4 md:pl-16 py-4 relative group">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-yellow-400" size={24} />
        <h2 className="text-white font-bold md:text-xl">Featured for You</h2>
      </div>
      
      <div className="relative flex items-center">
        <ChevronLeft 
            onClick={scrollLeft}
            className="bg-white left-2 rounded-full absolute opacity-50 hover:opacity-100 cursor-pointer z-10 hidden group-hover:block" 
            size={40} 
            color="black"
        />
        
        <div 
            id={'slider' + rowId} 
            className="w-full h-full overflow-x-scroll whitespace-nowrap scroll-smooth scrollbar-hide relative"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {/* Standard hide scrollbar for webkit */}
            <style>{`
                #slider${rowId}::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

          {movies.map((item, id) => (
            <div 
                key={id} 
                className="w-[160px] sm:w-[200px] md:w-[240px] inline-block cursor-pointer relative p-2 transition-transform duration-300 hover:scale-105"
                onClick={() => onMovieClick(item)}
            >
              <img 
                className="w-full h-auto block rounded-md object-cover aspect-[2/3]" 
                src={item.poster} 
                alt={item.title} 
                loading="lazy"
              />
              {/* Promotion Badge */}
              {item.promotion && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-10">
                      PROMOTED
                  </div>
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 text-white flex flex-col justify-center items-center whitespace-normal rounded-md transition-opacity duration-300 p-2">
                  <p className="text-xs md:text-sm font-bold text-center">{item.title}</p>
                  <p className="text-xs text-gray-300 mt-2">{item.year}</p>
                  {item.score && (
                      <p className="text-[10px] text-green-400 mt-1">Match: {(item.score * 100).toFixed(0)}%</p>
                  )}
              </div>
            </div>
          ))}
        </div>
        
        <ChevronRight 
            onClick={scrollRight}
            className="bg-white right-2 rounded-full absolute opacity-50 hover:opacity-100 cursor-pointer z-10 hidden group-hover:block" 
            size={40}
            color="black"
        />
      </div>
    </div>
  );
};

export default ColdStartRow;
