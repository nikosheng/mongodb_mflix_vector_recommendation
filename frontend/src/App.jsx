import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Row from './components/Row';
import Modal from './components/Modal';
import UserRecommendationRow from './components/UserRecommendationRow';
import ColdStartRow from './components/ColdStartRow';
import Chatbot from './components/Chatbot';
import { loginUser, recordUserHistory } from './api';
import { X } from 'lucide-react';

function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState('Cersei Lannister');
  const [loginError, setLoginError] = useState(null);
  
  // Configuration for Cold Start (Anonymous Users)
  // const coldStartPrompt = "I want to display prioritized movie to be show in the landing page. Besides, the movies are casted by actor Jackie Chan should be prioritized.";
  const coldStartPrompt = "I want to display prioritized movie to be show in the landing page. Besides, the movies are casted by actor Stephen Chow should be prioritized.";
  // const coldStartPrompt = "I want to display prioritized movie to be show in the landing page. I want to display the movies are from Hong Kong.";

  const handleMovieClick = async (movie) => {
    setSelectedMovie(movie);
    // Disable background scrolling when modal is open
    document.body.style.overflow = 'hidden';

    // Record user history if logged in
    if (user && user._id) {
      try {
        // Assuming a default browsing time for now, actual implementation might track this dynamically
        await recordUserHistory(user._id, movie._id, 120); 
        console.log("User history recorded for movie:", movie.title);
      } catch (error) {
        console.error("Failed to record user history:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
    document.body.style.overflow = 'unset';
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    try {
        const res = await loginUser(usernameInput);
        setUser(res.data);
        setShowLoginModal(false);
    } catch (err) {
        console.error("Login failed:", err);
        setLoginError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="bg-black min-h-screen pb-10 overflow-x-hidden">
      <Navbar user={user} onLoginClick={handleLoginClick} onLogout={handleLogout} />
      <Banner onMovieClick={handleMovieClick} />
      
      <div className="space-y-4 md:space-y-8 relative z-20 pl-4 md:pl-0">
        
        {/* User Specific Recommendations */}
        {user ? (
            <UserRecommendationRow 
                userId={user._id} 
                userName={user.name} 
                onMovieClick={handleMovieClick} 
            />
        ) : (
             /* Cold Start / Marketing Row for Anonymous Users */
            <ColdStartRow 
                prompt={coldStartPrompt}
                onMovieClick={handleMovieClick}
            />
        )}

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

      {/* Simple Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/80">
            <div className="bg-[#181818] p-8 rounded-md w-96 relative shadow-xl border border-gray-700">
                <button 
                    onClick={() => setShowLoginModal(false)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                >
                    <X size={20} />
                </button>
                <h2 className="text-2xl font-bold text-white mb-6">Sign In</h2>
                <form onSubmit={submitLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Username</label>
                        <input 
                            type="text" 
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            className="w-full p-3 bg-[#333] rounded text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                            placeholder="e.g. Cersei Lannister"
                        />
                    </div>
                    {loginError && (
                        <p className="text-red-500 text-sm">{loginError}</p>
                    )}
                    <button 
                        type="submit"
                        className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition"
                    >
                        Sign In
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-4">
                        (Test User: Cersei Lannister)
                    </p>
                </form>
            </div>
        </div>
      )}
      <Chatbot />
    </div>
  );
}

export default App;
