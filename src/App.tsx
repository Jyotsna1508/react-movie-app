import { useState, useEffect } from "react"
import Search from "./components/search"
import type { Movie } from "./type";
import Spinner from "./components/spinner";
import MovieCard from "./components/MovieCard";
import { getTrendingMovies, updateSearchCount } from "./appwrite";
const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}
function App() {
  const[searchTerm, setSearchTerm]= useState('');
  const[errorMessage, setErrorMessage]= useState('');
  const[isLoading, setIsLoading]= useState(false);
  const[movieList, setMovieList]= useState<Movie[]>([]);
  const[trendingMovies, setTrendingMovies]= useState<any[]>([]);
  const fetchMovies = async(query = '')=> {
    setIsLoading(true);
    setErrorMessage('');
    try{
     const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`:
     `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
     const response = await fetch(endpoint, API_OPTIONS);
     if(!response.ok){
      throw new Error('Failed to fetch data');
     } 
     const data = await response.json();
     
     if(data.response === 'False'){
      setErrorMessage(data.Error || 'Failed to fetch movies');
      setMovieList([]);
      return;
     }
      setMovieList(data.results || []);
      if(query && data.results.length > 0){
      await updateSearchCount(searchTerm, data.results[0]);

      }
    } catch(error){
      console.error(`Error in fetching movie: ${error}`);
    } finally{
      setIsLoading(false);
    }
  };
  const loadTrendingMovies = async () => {
    try{
      const movies:any = await getTrendingMovies();
      setTrendingMovies(movies);
    }catch(error){
      console.log(`Error fetching trending moves: ${error}`)
    }
  }
  useEffect(()=>{
    fetchMovies(searchTerm);
    // return () => {
    //   // removelisterner
    // }
  },[searchTerm])
   useEffect(()=>{
   loadTrendingMovies();
  },[])
  
  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
            <header>
              <img src ="./hero.png" alt="Hero Banner"/>
              <h1>Find <span className="text-gradient">Movies</span> You'll enjoy without the hassle.</h1>
            </header>
            {trendingMovies.length > 0 && (
              <section className="trending">
                <h2>Trending Movies</h2>
                <ul>
                   {trendingMovies.map((movie, index) => (
                    <li key={movie.$id}>
                      <p>{index + 1}</p>
                      <img src={movie.poster_url} alt={movie.title}></img>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
            <section className="all-movies">
              <h2 className="mt-[20px]">All Movies</h2>

              {isLoading ? (
                <Spinner />
              ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p> 
              ) : (
                <ul>
                  {movieList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </ul>
              )}

            </section>
        </div>
      </div>
    </main>
  )
}

export default App
