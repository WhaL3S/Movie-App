import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import {
  Typography,
  Container,
  Box,
  CircularProgress,
  Grid,
  Button,
  IconButton,
  TextField,
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const Actors = ({ isAdmin }) => {
  const [actors, setActors] = useState([]);
  const token = localStorage.getItem("token");
  const { id } = useParams();

  const fetchActors = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/movies/${id}/actors`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      setActors(response.data);
    } catch (error) {
      console.error("Error fetching actors:", error);
    }
  };

  useEffect(() => {
    fetchActors();
  }, [token, id]);

  const handleDelete = async (actorId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/movies/${id}/actors/${actorId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      setActors((prevActors) =>
        prevActors.filter((actor) => actor._id !== actorId)
      );
    } catch (error) {
      console.error(`Error deleting actor with ID ${actorId}:`, error);
    }
  };

  const [isAddActorModalOpen, setIsAddActorModalOpen] = useState(false);
  const [newActorData, setNewActorData] = useState({
    name: "",
    surname: "",
    age: "",
    country: "",
  });

  const handleInputChange = (field) => (event) => {
    setNewActorData({ ...newActorData, [field]: event.target.value });
  };

  const handleAddActorSubmit = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/movies/${id}/actors`,
        newActorData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      fetchActors();

      setIsAddActorModalOpen(false);
    } catch (error) {
      console.error("Error adding actor:", error);
    }
  };

  const handleAddActorModalClose = () => {
    setNewActorData({
      name: "",
      surname: "",
      age: "",
      country: "",
    });

    setIsAddActorModalOpen(false);
  };

  const handleAddActorModalOpen = () => {
    setIsAddActorModalOpen(true);
  };

  const [isEditActorModalOpen, setIsEditActorModalOpen] = useState(false);
  const [editingActor, setEditingActor] = useState(null);

  const handleEdit = (actor) => {
    setEditingActor(actor);
    setNewActorData({
      name: actor.name,
      surname: actor.surname,
      age: actor.age,
      country: actor.country,
    });
    setIsEditActorModalOpen(true);
  };

  const handleEditActorSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/movies/${id}/actors/${editingActor._id}`,
        newActorData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      // Fetch updated actors after editing
      fetchActors();

      // Close the edit modal
      setIsEditActorModalOpen(false);
      // Clear the editingActor state
      setEditingActor(null);
    } catch (error) {
      console.error("Error editing actor:", error);
    }
  };

  const handleEditActorModalClose = () => {
    // Close the edit modal and clear the editingActor state
    setIsEditActorModalOpen(false);
    setEditingActor(null);
  };

  if (!actors) {
    return (
      <div
        style={{
          position: "fixed",
          top: "45%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: "1000",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <Container sx={{ textAlign: "center" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ marginTop: "32px", marginBottom: "32px" }}
      >
        Actors
      </Typography>
      <Grid container spacing={2}>
        {actors.map((actor) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={actor._id}>
            <Box
              sx={{
                position: "relative",
                padding: "48px 24px 24px 24px",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <Link
                to={`/movies/${id}/actors/${actor._id}`}
                style={{ textDecoration: "none" }}
                className="actor-link"
              >
                <Typography variant="h6" gutterBottom>
                  {`${actor.name} ${actor.surname}`}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  className="actor-text"
                >
                  <span>{actor.age} years old</span>
                  <br />
                  <span>From {actor.country}</span>
                </Typography>
              </Link>
              <Box
                sx={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  display: "flex",
                  gap: "4px",
                }}
              >
                {isAdmin && (
                  <IconButton color="primary" onClick={() => handleEdit(actor)}>
                    <EditIcon />
                  </IconButton>
                )}
                {isAdmin && (
                  <IconButton
                    color="default"
                    onClick={() => handleDelete(actor._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Grid>
        ))}
        {isAdmin && (
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Box
              sx={{
                padding: "32px 20px 20px 20px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                cursor: "pointer",
                textDecoration: "none",
                color: "inherit",
                "&:hover": {
                  borderColor: "#aaa",
                },
              }}
            >
              <IconButton
                onClick={handleAddActorModalOpen}
                style={{ textDecoration: "none" }}
              >
                <Typography variant="h6" gutterBottom>
                  Add Actor
                </Typography>
                <Box sx={{ color: "#aaa" }}>
                  <AddIcon />
                </Box>
              </IconButton>
            </Box>
          </Grid>
        )}
      </Grid>

      <Dialog open={isAddActorModalOpen} onClose={handleAddActorModalClose}>
        <DialogTitle>Add Actor</DialogTitle>
        <DialogContent>
          <form>
            <TextField
              sx={{ margin: "10px 0" }}
              label="Name"
              value={newActorData.name}
              onChange={handleInputChange("name")}
              required
              fullWidth
            />
            <TextField
              sx={{ margin: "10px 0" }}
              label="Surname"
              value={newActorData.surname}
              onChange={handleInputChange("surname")}
              required
              fullWidth
            />
            <TextField
              sx={{ margin: "10px 0" }}
              label="Age"
              type="number"
              value={newActorData.age}
              onChange={handleInputChange("age")}
              required
              fullWidth
            />
            <TextField
              sx={{ margin: "10px 0" }}
              label="Country"
              value={newActorData.country}
              onChange={handleInputChange("country")}
              required
              fullWidth
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleAddActorSubmit}
            color="primary"
            sx={{ margin: "10px" }}
          >
            Add Actor
          </Button>
          <Button onClick={handleAddActorModalClose} sx={{ margin: "10px" }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isEditActorModalOpen} onClose={handleEditActorModalClose}>
        <DialogTitle>Edit Actor</DialogTitle>
        <DialogContent>
          <form>
            <TextField
              sx={{ margin: "10px 0" }}
              label="Name"
              value={newActorData.name}
              onChange={handleInputChange("name")}
              required
              fullWidth
            />
            <TextField
              sx={{ margin: "10px 0" }}
              label="Surname"
              value={newActorData.surname}
              onChange={handleInputChange("surname")}
              required
              fullWidth
            />
            <TextField
              sx={{ margin: "10px 0" }}
              label="Age"
              type="number"
              value={newActorData.age}
              onChange={handleInputChange("age")}
              required
              fullWidth
            />
            <TextField
              sx={{ margin: "10px 0" }}
              label="Country"
              value={newActorData.country}
              onChange={handleInputChange("country")}
              required
              fullWidth
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleEditActorSubmit}
            color="primary"
            sx={{ margin: "10px" }}
          >
            Save Changes
          </Button>
          <Button onClick={handleEditActorModalClose} sx={{ margin: "10px" }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Actors;
