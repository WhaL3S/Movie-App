import React from 'react';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Box, Container, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const Footer = () => {
  const githubUrl = 'https://github.com/WhaL3S';

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#f0f0f0',
        padding: '20px 0',
        textAlign: 'center',
        position: 'fixed',
        bottom: '0',
        width: '100%',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          <Grid item xs={12} sm={6} md={4} lg={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              About Us
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We are WhaLeS company, dedicated to providing the best service to our customers.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Almaty, Kazakhstan
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: info@example.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: +1 234 567 8901
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={4} lg={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Follow Us
            </Typography>
            <a href={githubUrl} style={{ color: '#0366d6' }}>
              <GitHubIcon />
            </a>
          </Grid>
        </Grid>
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {"Copyright © "}
            Movie Web App
            {", "}
            {new Date().getFullYear()}
            {"."}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
