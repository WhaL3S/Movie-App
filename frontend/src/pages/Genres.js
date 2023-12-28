import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import {
  Grid,
  Typography,
  Container,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";


const Genres = ({ isAdmin }) => {
  const { id } = useParams();
  const [genres, setGenres] = useState(null);
  const [isAddGenreModalOpen, setIsAddGenreModalOpen] = useState(false);
  const [isEditGenreModalOpen, setIsEditGenreModalOpen] = useState(false);
  const [newGenreData, setNewGenreData] = useState({
    name: "",
    description: "",
  });
  const [editGenreId, setEditGenreId] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/movies/${id}/genres`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );

        setGenres(response.data);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, [id, token]);

  const handleAddGenre = () => {
    setIsAddGenreModalOpen(true);
  };

  const handleEditGenre = (genreId) => {
    setEditGenreId(genreId);
    setIsEditGenreModalOpen(true);
  };

  const handleEditGenreSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/movies/${id}/genres/${editGenreId}`,
        newGenreData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      const response = await axios.get(
        `http://localhost:5000/api/movies/${id}/genres`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      setGenres(response.data);

      setIsEditGenreModalOpen(false);
      setEditGenreId(null);
    } catch (error) {
      console.error("Error editing genre:", error);
    }
  };

  const handleDeleteGenre = async (genreId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/movies/${id}/genres/${genreId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      setGenres((prevGenres) =>
        prevGenres.filter((genre) => genre._id !== genreId)
      );
    } catch (error) {
      console.error(`Error deleting genre with ID ${genreId}:`, error);
    }
  };

  const handleAddGenreSubmit = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/movies/${id}/genres`,
        newGenreData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      const response = await axios.get(
        `http://localhost:5000/api/movies/${id}/genres`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      setGenres(response.data);
      setIsAddGenreModalOpen(false);
    } catch (error) {
      console.error("Error adding genre:", error);
    }
  };

  const handleAddGenreModalClose = () => {
    setNewGenreData({
      name: "",
      description: "",
    });

    setIsAddGenreModalOpen(false);
  };

  const handleEditGenreModalClose = () => {
    setIsEditGenreModalOpen(false);
    setEditGenreId(null);
  };

  return (
    <Container sx={{ textAlign: "center" }}>
      <Grid container spacing={3} sx={{ marginTop: "10px" }}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Genres
          </Typography>
        </Grid>
        {genres &&
          genres.map((genre) => (
            <Grid item xs={12} sm={6} md={4} key={genre._id}>
              <Paper
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  {isAdmin && (
                       <IconButton
                       color="primary"
                       onClick={() => handleEditGenre(genre._id)}
                     >
                       <EditIcon />
                     </IconButton>
                  )}
                 
                 {isAdmin && (
                    <IconButton
                    color="default"
                    onClick={() => handleDeleteGenre(genre._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                 )}

                </div>
                <Typography variant="h6">{genre.name}</Typography>
                <Typography variant="body1" color="text.secondary">
                  Description: {genre.description}
                </Typography>
                <Link
                  to={`/movies/${id}/genres/${genre._id}`}
                  className="genre-link"
                >
                  View Details
                </Link>
              </Paper>
            </Grid>
          ))}
          {isAdmin && (
              <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleAddGenre}
                sx={{ width: "100%", height: "100%" }}
              >
                Add Genre
              </Button>
            </Grid>
          )}
      </Grid>

      {/* Add Genre Modal */}
      <Dialog open={isAddGenreModalOpen} onClose={handleAddGenreModalClose}>
        <DialogTitle>Add Genre</DialogTitle>
        <DialogContent>
          <form>
            <TextField
              label="Name"
              value={newGenreData.name}
              onChange={(e) =>
                setNewGenreData({ ...newGenreData, name: e.target.value })
              }
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={newGenreData.description}
              onChange={(e) =>
                setNewGenreData({
                  ...newGenreData,
                  description: e.target.value,
                })
              }
              multiline
              rows={4}
              fullWidth
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddGenreSubmit} color="primary">
            Add Genre
          </Button>
          <Button onClick={handleAddGenreModalClose}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Genre Modal */}
      <Dialog open={isEditGenreModalOpen} onClose={handleEditGenreModalClose}>
        <DialogTitle>Edit Genre</DialogTitle>
        <DialogContent>
          <form>
            <TextField
              label="Name"
              value={newGenreData.name}
              onChange={(e) =>
                setNewGenreData({ ...newGenreData, name: e.target.value })
              }
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={newGenreData.description}
              onChange={(e) =>
                setNewGenreData({
                  ...newGenreData,
                  description: e.target.value,
                })
              }
              multiline
              rows={4}
              fullWidth
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditGenreSubmit} color="primary">
            Edit Genre
          </Button>
          <Button onClick={handleEditGenreModalClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Genres;

