import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const API_KEY = 'd90bdc';
const API_URL = 'https://www.omdbapi.com/';

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim() || 'movie';
    setLoading(true);
    
    setTimeout(() => {
      navigate(`/explore?search=${encodeURIComponent(query)}`);
      setLoading(false);
    }, 500);
  };

  return (
    <>
      <section className="hero" role="banner" id="home" style={{ minHeight: 'calc(100vh - 150px)' }}>
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Welcome to Notflix</h1>
            <p>Discover movies and shows curated just for you.</p>
            
            <div className="hero-search">
              <form onSubmit={handleSearch} className="search-form">
                <input 
                  className="search-input" 
                  type="search" 
                  placeholder="Search movies, e.g. Inception" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" className="btn search-btn" disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function MovieDetailPage() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  const movieId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_URL, {
          params: {
            apikey: API_KEY,
            i: movieId,
            plot: 'full'
          }
        });

        if (response.data.Response === 'True') {
          setMovie(response.data);
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
      }
      setLoading(false);
    };

    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);

  if (loading) {
    return (
      <section className="movie-detail-section">
        <div className="loading">Loading movie details...</div>
      </section>
    );
  }

  if (!movie) {
    return (
      <section className="movie-detail-section">
        <div className="no-results">Movie not found.</div>
      </section>
    );
  }

  return (
    <section className="movie-detail-section">
      <div className="movie-detail-nav">
        <button className="btn back-btn" onClick={() => navigate(-1)}>← Back</button>
        <button className="btn next-btn" onClick={() => navigate('/explore')}>Explore More →</button>
      </div>
      <div className="movie-detail-container">
        <div className="movie-detail-left">
          <img 
            src={movie.Poster !== 'N/A' && movie.Poster ? movie.Poster : 'https://placehold.co/400x600/1a1a1a/ffffff?text=No+Poster'} 
            alt={`${movie.Title} poster`}
            className="movie-detail-poster"
            onError={(e) => { e.target.src = 'https://placehold.co/400x600/1a1a1a/ffffff?text=No+Poster'; }}
          />
        </div>
        <div className="movie-detail-right">
          <h1 className="movie-detail-title">{movie.Title}</h1>
          <div className="movie-detail-meta">
            <span className="movie-year">{movie.Year}</span>
            {movie.Rated && <span className="movie-rated">{movie.Rated}</span>}
            {movie.Runtime && <span className="movie-runtime">{movie.Runtime}</span>}
          </div>
          
          {movie.imdbRating && movie.imdbRating !== 'N/A' && (
            <div className="movie-rating-large">
              <span className="rating-label">IMDb Rating:</span>
              <span className="rating-value">⭐ {movie.imdbRating}/10</span>
            </div>
          )}
          
          {movie.Genre && (
            <div className="movie-detail-info">
              <strong>Genre:</strong> {movie.Genre}
            </div>
          )}
          
          {movie.Director && (
            <div className="movie-detail-info">
              <strong>Director:</strong> {movie.Director}
            </div>
          )}
          
          {movie.Actors && (
            <div className="movie-detail-info">
              <strong>Cast:</strong> {movie.Actors}
            </div>
          )}
          
          {movie.Plot && movie.Plot !== 'N/A' && (
            <div className="movie-detail-plot">
              <strong>Plot:</strong>
              <p>{movie.Plot}</p>
            </div>
          )}
          
          {movie.Awards && movie.Awards !== 'N/A' && (
            <div className="movie-detail-info">
              <strong>Awards:</strong> {movie.Awards}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ExplorePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [sortOrder, setSortOrder] = useState('sort');
  const navigate = useNavigate();

  const fetchMovies = async (query = 'movie', page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        params: {
          apikey: API_KEY,
          s: query,
          page: page,
          type: 'movie'
        }
      });

      if (response.data.Response === 'True') {
        let results = response.data.Search;
        
        const detailedMovies = await Promise.all(
          results.map(async (movie) => {
            const details = await axios.get(API_URL, {
              params: {
                apikey: API_KEY,
                i: movie.imdbID
              }
            });
            return details.data;
          })
        );

        setMovies(detailedMovies);
        setTotalResults(parseInt(response.data.totalResults));
      } else {
        setMovies([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMovies([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    
    if (searchParam) {
      setSearchQuery(searchParam);
      fetchMovies(searchParam);
    } else {
      fetchMovies('popular');
    }
  }, []);


  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim() || 'movie';
    setCurrentPage(1);
    fetchMovies(query, 1);
  };

  // Handle pagination
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchMovies(searchQuery || 'movie', newPage);
    }
  };

  const handleNextPage = () => {
    const maxPages = Math.ceil(totalResults / 10);
    if (currentPage < maxPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchMovies(searchQuery || 'movie', newPage);
    }
  };

  // Handle sorting
  const handleSort = (e) => {
    const order = e.target.value;
    setSortOrder(order);
    
    if (order === 'sort') {
      return;
    }

    const sortedMovies = [...movies].sort((a, b) => {
      const yearA = parseInt(a.Year);
      const yearB = parseInt(b.Year);
      
      if (order === 'oldest') {
        return yearA - yearB;
      } else {
        return yearB - yearA;
      }
    });
    
    setMovies(sortedMovies);
  };

  const maxPages = Math.ceil(totalResults / 10);

  return (
    <section id="explore" className="explore-section">
      <div className="explore-container">
        <h2>Explore</h2>

        <div className="search-filter-row">
          <form id="search-form" className="search-form" role="search" aria-label="Search movies" onSubmit={handleSearch}>
            <input 
              id="search-input" 
              className="search-input" 
              type="search" 
              placeholder="Search movies, e.g. Inception" 
              aria-label="Search query"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn search-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          <div className="filter-controls" aria-label="Filter movies">
            <label htmlFor="sort-year" className="visually-hidden">Sort by year</label>
            <select id="sort-year" className="sort-select" aria-label="Sort by year" value={sortOrder} onChange={handleSort}>
              <option value="sort">Sort</option>
              <option value="oldest">Oldest to Newest</option>
              <option value="newest">Newest to Oldest</option>
            </select>
          </div>
        </div>

        <div id="loading" className="loading" aria-hidden={!loading}>{loading ? 'Loading...' : ''}</div>
        <div id="results" className="results-grid" aria-live="polite">
          {!loading && movies.length > 0 && movies.map((movie) => (
            <div 
              key={movie.imdbID} 
              className="movie-card"
              onClick={() => navigate(`/movie?id=${movie.imdbID}`)}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={movie.Poster !== 'N/A' && movie.Poster ? movie.Poster : 'https://placehold.co/300x450/1a1a1a/ffffff?text=No+Poster'} 
                alt={`${movie.Title} poster`}
                className="movie-poster"
                onError={(e) => { e.target.src = 'https://placehold.co/300x450/1a1a1a/ffffff?text=No+Poster'; }}
              />
              <div className="movie-info">
                <h3 className="movie-title">{movie.Title}</h3>
                <p className="movie-year">{movie.Year}</p>
                {movie.Genre && <p className="movie-genre">{movie.Genre}</p>}
                {movie.imdbRating && <p className="movie-rating">⭐ {movie.imdbRating}</p>}
              </div>
            </div>
          ))}
          {!loading && movies.length === 0 && (
            <p className="no-results">No movies found. Try a different search!</p>
          )}
        </div>

        <div className="pagination" aria-label="Pagination">
          <button id="prev-page" className="btn" disabled={currentPage === 1} onClick={handlePrevPage}>Prev</button>
          <span id="page-info" className="page-info">Page {currentPage} of {maxPages || 1}</span>
          <button id="next-page" className="btn" disabled={currentPage >= maxPages} onClick={handleNextPage}>Next</button>
        </div>
      </div>
    </section>
  );
}

// Main App Component with Router
function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setShowNavbar(false);
      } else {
        // Scrolling up
        setShowNavbar(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div style={{
      backgroundImage: 'url(/Background.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      backgroundColor: '#0f0f0f',
      minHeight: '100vh'
    }}>
      <nav className="navbar" style={{
        transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-in-out'
      }}>
        <div className="navbar-container">
          <div className="logo">
            <img src="/Netflix.png" alt="Notflix Logo" className="logo-image" />
          </div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><a className="nav-disabled" aria-disabled="true" tabIndex="-1" title="Not available">About</a></li>
            <li><Link to="/explore">Explore</Link></li>
            <li><a className="nav-disabled" aria-disabled="true" tabIndex="-1" title="Not available">Contact Us</a></li>
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/movie" element={<MovieDetailPage />} />
      </Routes>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-left">2025 © Emily Watkins</div>
          <div className="footer-right">
            <a className="footer-link footer-disabled" aria-disabled="true" tabIndex="-1" title="Not available">Contact Us</a>
            {!isHomePage && (
              <button className="footer-link back-to-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to Top</button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
