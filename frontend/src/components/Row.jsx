import React, { useState, useEffect } from 'react';
import { getMovies } from '../api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Row = ({ title, genre, onMovieClick }) => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await getMovies(genre);
            setMovies(response.data);
        } catch (error) {
            console.error("Error fetching row:", title, error);
        }
    };
    fetchData();
  }, [genre, title]);

  const rowId = title.replace(/\s+/g, '');

  const scrollLeft = () => {
    const slider = document.getElementById('slider' + rowId);
    slider.scrollLeft = slider.scrollLeft - 500;
  };
  const scrollRight = () => {
    const slider = document.getElementById('slider' + rowId);
    slider.scrollLeft = slider.scrollLeft + 500;
  };

  return (
    <div className="pl-4 md:pl-16 py-4 relative group">
      <h2 className="text-white font-bold md:text-xl mb-4">{title}</h2>
      
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
              <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 text-white flex flex-col justify-center items-center whitespace-normal rounded-md transition-opacity duration-300 p-2">
                  <p className="text-xs md:text-sm font-bold text-center">{item.title}</p>
                  <p className="text-xs text-gray-300 mt-2">{item.year}</p>
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

export default Row;
