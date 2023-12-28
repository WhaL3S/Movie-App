import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Box, Divider, ListItemButton, ListItemIcon, useTheme, useMediaQuery, Hidden } from '@mui/material';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import HomeIcon from '@mui/icons-material/Home';

function Header() {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [openDrawer, setOpenDrawer] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };

  const handleDrawerClose = () => {
    setOpenDrawer(false);
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
            {isSmallScreen && (
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={handleDrawerOpen}
                    >
                    <MenuIcon />
                </IconButton>
            )

            }
          {isSmallScreen && (
            <Typography variant="h6" component={Link} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              Movie Web App
            </Typography>
          )}

        {isLargeScreen && (
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <List component="nav" sx={{ display: 'flex',  gap: '64px' }}>
                <ListItem component={Link} to="/" sx={{ color: 'inherit' }}>
                  <ListItemButton sx={{ width: '150px', textAlign: 'center'}}>
                    <ListItemText primary="Home" />
                  </ListItemButton>
                </ListItem>
                <ListItem component={Link} to="/movies" sx={{ color: 'inherit' }}>
                  <ListItemButton sx={{ width: '150px', textAlign: 'center'}}>
                    <ListItemText primary="Movies" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
        )}

          {isMediumScreen && (
            <Box sx={{ flexGrow: 1}}>
              <List component="nav" sx={{ display: 'flex' }}>
                <ListItem component={Link} to="/" sx={{ color: 'inherit' }}>
                  <ListItemButton>
                    <ListItemIcon>
                      <HomeIcon sx={{ color: 'white' }}/>
                    </ListItemIcon>
                    <ListItemText primary="Home" color='white' />
                  </ListItemButton>
                </ListItem>
                <ListItem component={Link} to="/movies" sx={{ color: 'inherit' }}>
                  <ListItemButton>
                    <ListItemIcon>
                      <LocalMoviesIcon sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText primary="Movies" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Hidden smUp>
        <Drawer anchor="left" open={openDrawer} onClose={handleDrawerClose}>
          <Box sx={{ width: '100vh' }}>
            <List>
              <ListItem component={Link} to="/" onClick={handleDrawerClose}>
                <ListItemButton>
                  <ListItemIcon>
                    <HomeIcon />
                  </ListItemIcon>
                  <ListItemText primary="Home" />
                </ListItemButton>
              </ListItem>
            </List>
            <Divider />
            <List>
              <ListItem component={Link} to="/movies" onClick={handleDrawerClose}>
                <ListItemButton>
                  <ListItemIcon>
                    <LocalMoviesIcon />
                  </ListItemIcon>
                  <ListItemText primary="Movies" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>
      </Hidden>
    </div>
  );
}

export default Header;
