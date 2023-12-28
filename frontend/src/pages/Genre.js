import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { Typography, Container, Box, CircularProgress, Grid, Paper } from '@mui/material';

const Genre = () => {
  const { id, genreId } = useParams();
  const [genre, setGenre] = useState(null);
  const [movies, setMovies] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchGenre = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/movies/${id}/genres/${genreId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
        });
        setGenre(response.data);

        const moviesResponse = await axios.get(`http://localhost:5000/api/movies/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          params: {
            'genre': response.data.name,
          },
        });
          setMovies(moviesResponse.data);

      } catch (error) {
        console.error('Error fetching genre:', error);
      }
    };

    fetchGenre();
  }, [genreId, token]);

  if (!genre || !movies) {
    return  (<div style={{ position: 'fixed', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '1000',}}>
    <CircularProgress />
    </div>);
  }

  return (
    <Container sx={{ textAlign: 'center'}}>
    <Box sx={{ padding: '16px' }}>
      <Typography variant="h4" gutterBottom sx={{ marginTop: '14px'}}>
        {genre.name} Movies
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {genre.description}
      </Typography>

      <Typography variant="body1" color="text.secondary" className="movie-text">
        Movies in this genre:
      </Typography>
      
      <Grid container spacing={3} sx={{marginTop: '10px'}}>
        {movies.map((movie) => (
          <Grid item key={movie._id} xs={12} md={6} lg={4}>
            <Paper style={{ padding: '16px', borderRadius: '8px' }}>
              <Typography variant="h6" gutterBottom>
                <Link style={{ textDecoration: 'none' }} to={`/movies/${movie._id}`} className="movie-link">
                  {movie.title}
                </Link>
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Director: {movie.director}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Release Year: {movie.releaseYear}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  </Container>
  );
};

export default Genre;
