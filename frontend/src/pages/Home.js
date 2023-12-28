import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { useSpring, animated } from 'react-spring';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AnimatedCard = animated(Card);

const Home = () => {
  const [randomMovies, setRandomMovies] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchRandomMovies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/movies', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
        });
        const allMovies = response.data;

        const shuffledMovies = allMovies.sort(() => 0.5 - Math.random());

        const selectedMovies = shuffledMovies.slice(0, 4);
        setRandomMovies(selectedMovies);
      } catch (error) {
        console.error('Error fetching random movies:', error);
      }
    };

    fetchRandomMovies();
  }, []);

  const containerAnimation = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    delay: 500,
  });

  const welcomeAnimation = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    delay: 1000,
  });

  const paragraphAnimation = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    delay: 1500,
  });

  const cardAnimation = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    delay: 2000,
  });

  return (
    <animated.div style={containerAnimation}>
      <Container sx={{ textAlign: 'center', alignItems: 'center', marginTop: '24px' }}>
        <animated.div style={welcomeAnimation}>
          <Typography variant="h4" gutterBottom>
            Welcome to Movie Web App
          </Typography>
        </animated.div>
        <animated.div style={paragraphAnimation}>
          <Typography width="500px" align="center" margin="auto" marginBottom="50px" variant="body1" color="text.secondary" paragraph>
            Discover the world of movies with Movie Web App. Explore a vast collection of movies, learn about your favorite actors, and stay up-to-date with the latest releases.
          </Typography>
        </animated.div>
        <Typography variant="h5" gutterBottom>
          Popular Movies
        </Typography>
        <Grid container spacing={2} sx={{ marginBottom: { sm: '400px', xs: '500px' } }}>
          {randomMovies.map((movie) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={movie._id}>
              <Link to={`/movies/${movie._id}`} style={{ textDecoration: 'none' }}>
                <AnimatedCard
                  style={{ ...cardAnimation, width: '100%', border: '1px solid' }}
                  sx={{
                    transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                      background: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  <CardContent>
                    <img src="https://www.svgrepo.com/show/480325/movie.svg" alt="Movie Icon" style={{ maxWidth: '50%', marginBottom: '8px' }} />
                    <Typography variant="subtitle1" gutterBottom>
                      {movie.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Release Year: {movie.releaseYear}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Director: {movie.director}
                    </Typography>
                  </CardContent>
                </AnimatedCard>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
    </animated.div>
  );
};

export default Home;
