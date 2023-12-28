import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Movies from './pages/Movies';
import Actors from './pages/Actors';
import NoPage from './pages/NoPage';
import Home from './pages/Home';
import Genres from './pages/Genres';
import Register from './pages/Register';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';
import CircularProgress from '@mui/material/CircularProgress';
import Movie from './pages/Movie';
import Actor from './pages/Actor';
import Genre from './pages/Genre';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    setUser(user);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      verifyTokenWithBackend(storedToken)
        .then(() => setData(storedToken))
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false); 
        });
    } else {
      setLoading(false); 
    }
  }, []);

  const setData = async (storedToken) => {
    const res = await axios.get("http://localhost:5000/api/user", {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${storedToken}`,
    }});

    setUser(res?.data?.user);

    if (res?.data?.user?.role === 'admin') {
      setIsAdmin(true);
      setIsUser(false);
    } else if (res?.data?.user?.role === 'user') {
      setIsAdmin(false);
      setIsUser(true);
    } 
    setLoading(false); 
  }

  const verifyTokenWithBackend = async (token) => {
    return new Promise((resolve, reject) => {
      const backendEndpoint = 'http://localhost:5000/api/verify-token';
      fetch(backendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            resolve();
          } else {
            reject();
          }
        })
        .catch(() => reject());
    });
  };

  return (
    <>
      {loading ? (
        <div style={{ position: 'fixed', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '1000',}}>
          <CircularProgress />
        </div>
      ) : (
        <>
          <Header />
          <Routes>
            
            {!user && (
              <>
                <Route path='/login' element={<Login handleLogin={handleLogin} />} />
                <Route path='/register' element={<Register />} />
                <Route path="*" element={<NoPage user={user}/>} /> 
              </>
            )}
            {user && (
              <>
                <Route path='/' element={<Home />} />
                <Route path="/movies" element={<Movies isAdmin={isAdmin} />} />
                <Route path="/movies/:id" element={<Movie />} />

                <Route path="/movies/:id/actors" element={<Actors isAdmin={isAdmin} />} />
                <Route path="/movies/:id/actors/:actorId" element={<Actor />} />

                <Route path="/movies/:id/genres" element={<Genres isAdmin={isAdmin} />}  />
                <Route path="/movies/:id/genres/:genreId" element={<Genre />} />

                <Route path="*" element={<NoPage user={user}/>} />
              </>
            )}
          </Routes>
          {!!user && (
            <div style={{position: 'fixed', bottom: '20px', right: '20px', zIndex: '1'}}>
              <Button onClick={handleLogout} variant="contained" sx={{ borderRadius: '100px'}}>
                <LogoutIcon />
              </Button>
            </div>
            )
          }
          <Footer />
        </>
      )}
    </>
  );
}

export default App;
