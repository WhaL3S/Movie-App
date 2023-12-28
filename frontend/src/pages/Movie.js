import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { Grid, Typography, Paper, Container, Box, CircularProgress } from '@mui/material';

const Movie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/movies/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
        });

        setMovie(response.data);

        const trailerUrls = [
          'https://www.youtube.com/watch?v=yE27gZckgOQ',
          'https://www.youtube.com/watch?v=fIHH5-HVS9o',
          'https://www.youtube.com/watch?v=u_diRgwPCS8',
          'https://www.youtube.com/watch?v=zSWdZVtXT7E'
        ];

        const randomIndex = Math.floor(Math.random() * trailerUrls.length);
        setSelectedTrailer(trailerUrls[randomIndex]);
      } catch (error) {
        console.error('Error fetching movie:', error);
      }
    };

    fetchMovie();
  }, [id, token]);

  if (!movie) {
    return  (<div style={{ position: 'fixed', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '1000',}}>
      <CircularProgress />
      </div>);
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: { lg: '90vh', md: '95vh', sm: '130vh', xs: '150vh' }, marginTop: { xs: '-400px', sm: '-300px', md: '-150px', lg: '-80px' } }}>
        <Grid item xs={12} md={6} sx={{ width: { lg: '1000px', md: '800px', sm: '600px', xs: '500px' } }}>
          {selectedTrailer && (
            <Box mt={2}>
              <iframe
                title="movie-trailer"
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${selectedTrailer.split('v=')[1]}`}
                allowFullScreen
              ></iframe>
            </Box>
          )}
          <Paper
            style={{
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" gutterBottom>
              {movie.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" className="movie-text">
              Director: {movie.director}
            </Typography>
            <Typography variant="body1" color="text.secondary" className="movie-text">
              Release Year: {new Date(movie.releaseYear).getFullYear()}
            </Typography>
            <Typography variant="body1" color="text.secondary" className="movie-text">
              <Link style={{ textDecoration: 'none' }} to={`/movies/${id}/actors`} className="actors-link">
                Actors
              </Link>
              : {movie.actors.map((actor, index) => (
                <React.Fragment key={actor._id}>
                  <Link style={{ textDecoration: 'none' }} to={`/movies/${id}/actors/${actor._id}`} className="actor-link">
                    {`${actor.name} ${actor.surname}`}
                  </Link>
                  {index === movie.actors.length - 1 ? '' : ', '}
                </React.Fragment>
              ))}
            </Typography>
            <Typography variant="body1" color="text.secondary" className="movie-text">
              <Link style={{ textDecoration: 'none' }} to={`/movies/${id}/genres`} className="genres-link">
                Genres
              </Link>
              : {movie.genres.map((genre, index) => (
                <React.Fragment key={genre.name}>
                  <Link style={{ textDecoration: 'none' }} to={`/movies/${id}/genres/${genre._id}`} className="actor-link">
                    {`${genre.name}`}
                  </Link>
                  {index === movie.genres.length - 1 ? '' : ', '}
                </React.Fragment>
              ))}
            </Typography>
          </Paper>
        </Grid>
      </Box>
    </Container>
  );
  
};

export default Movie;
