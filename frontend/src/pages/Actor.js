import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Typography, Box, CircularProgress } from '@mui/material';
import axios from 'axios';

const Actor = () => {
  const { id, actorId } = useParams();
  const [actor, setActor] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchActor = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/movies/${id}/actors/${actorId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
        });
        setActor(response.data);
      } catch (error) {
        console.error('Error fetching actor:', error);
      }
    };

    fetchActor();
  }, [id, actorId]);

  if (!actor) {
    return  (<div style={{ position: 'fixed', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '1000',}}>
    <CircularProgress />
    </div>);
  }

  return (
    <Container sx={{ textAlign: 'center', marginTop: '32px', }}>
      <Box sx={{ padding: '16px' }}>
        <Typography variant="h4" gutterBottom>
          {`${actor.name} ${actor.surname}`}
        </Typography>
        <Grid container spacing={2} direction="column" alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={6}>
            <img src="https://static.thenounproject.com/png/538846-200.png" alt={`${actor.name} ${actor.surname}`} style={{ maxWidth: '100%' }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <div style={{textAlign: 'center'}}>
              <Typography variant="body1" color="text.secondary">
                <strong>Age:</strong> {actor.age} years old
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong>Country:</strong> {actor.country}
              </Typography>
            </div>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Actor;
