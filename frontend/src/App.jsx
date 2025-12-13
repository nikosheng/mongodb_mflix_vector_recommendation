import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Row from './components/Row';
import Modal from './components/Modal';

function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    // Disable background scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="bg-black min-h-screen pb-10 overflow-x-hidden">
      <Navbar />
      <Banner onMovieClick={handleMovieClick} />
      
      <div className="space-y-4 md:space-y-8 -mt-20 md:-mt-32 relative z-20 pl-4 md:pl-0">
        <Row title="Action Movies" genre="Action" onMovieClick={handleMovieClick} />
        <Row title="Comedy Movies" genre="Comedy" onMovieClick={handleMovieClick} />
        <Row title="Drama Movies" genre="Drama" onMovieClick={handleMovieClick} />
        <Row title="Horror Movies" genre="Horror" onMovieClick={handleMovieClick} />
        <Row title="Romance Movies" genre="Romance" onMovieClick={handleMovieClick} />
        <Row title="Sci-Fi Movies" genre="Sci-Fi" onMovieClick={handleMovieClick} />
      </div>

      {selectedMovie && (
        <Modal movie={selectedMovie} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default App;
