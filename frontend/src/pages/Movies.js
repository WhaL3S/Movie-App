import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import axios from "axios";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";

const Movies = ({ isAdmin }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [fromYear, setFromYear] = useState(null);
  const [toYear, setToYear] = useState(null);
  const [title, setTitle] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/movies/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        });
        const allGenres = response.data.map((movie) => movie.genres).flat();
        const uniqueGenres = allGenres.filter(
          (genre, index, self) =>
            self.findIndex((g) => g.name === genre.name) === index
        );
        setGenres(uniqueGenres);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, [token]);

  const handleGenreChange = (event) => {
    setSelectedGenre(event.target.value);
  };

  const handleFromYearChange = (date) => {
    setFromYear(date);
  };

  const handleToYearChange = (date) => {
    setToYear(date);
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    fetchMovies();
  };

  const fetchMovies = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/movies", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        params: {
          title: title,
          genre: selectedGenre,
          fromYear: fromYear?.$y,
          toYear: toYear?.$y,
        },
      });
      setMovies(response.data);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const [newMovieModalOpen, setNewMovieModalOpen] = useState(false);

  const handleNewMovieModalOpen = () => {
    setNewMovieModalOpen(true);
  };

  const handleNewMovieModalClose = () => {
    setNewMovieModalOpen(false);
  };

  const handleAddMovie = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/movies/",
        movieData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      console.log("Movie added successfully:", response.data);
      handleNewMovieModalClose();
    } catch (error) {
      console.error("Error adding movie:", error);
    }
  };

  const [movieData, setMovieData] = useState({
    title: "",
    releaseYear: "",
    director: "",
    actors: [{ name: "", surname: "", age: "", country: "" }],
    genres: [{ name: "", description: "" }],
  });

  const handleInputChange = (field, index, subfield) => (event) => {
    const updatedData = { ...movieData };
    updatedData[field][index][subfield] = event.target.value;
    setMovieData(updatedData);
  };

  const handleAddField = (field) => {
    setMovieData((prevData) => ({
      ...prevData,
      [field]: [
        ...prevData[field],
        { name: "", surname: "", age: "", country: "" },
      ],
    }));
  };

  const handleAddGenreField = () => {
    setMovieData((prevData) => ({
      ...prevData,
      genres: [...prevData.genres, { name: "", description: "" }],
    }));
  };

  const handleRemoveGenreField = (index) => {
    setMovieData((prevData) => {
      const updatedData = { ...prevData };
      updatedData.genres.splice(index, 1);
      return updatedData;
    });
  };

  const handleRemoveField = (field, index) => {
    setMovieData((prevData) => {
      const updatedData = { ...prevData };
      updatedData[field].splice(index, 1);
      return updatedData;
    });
  };

  const handleDeleteMovie = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/movies/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });

      fetchMovies();
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };


  return (
    <Container>
      <Container sx={{ marginTop: "2rem", marginBottom: "2rem" }}>
        <Typography variant="h4" gutterBottom>
          Movie Search
          <InfoIcon
            color="info"
            onClick={handleModalOpen}
            sx={{ marginLeft: { sm: "5px", md: "10px" } }}
          />
        </Typography>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={3} margin="0.5rem 0 0 0 ">
              <TextField
                label="Movie Title"
                name="title"
                onChange={handleTitleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3} margin="0.5rem 0 0 0 ">
              <FormControl fullWidth>
                <InputLabel htmlFor="genre-select">Genre</InputLabel>
                <Select
                  label="Genre"
                  inputProps={{
                    name: "genre",
                    id: "genre-select",
                  }}
                  value={selectedGenre}
                  onChange={handleGenreChange}
                >
                  <MenuItem value="">All Genres</MenuItem>
                  {genres.map((genre) => (
                    <MenuItem key={genre._id} value={genre.name}>
                      {genre.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer
                  components={["DatePicker", "DatePicker", "DatePicker"]}
                >
                  <DatePicker
                    label={"From Year"}
                    views={["year"]}
                    value={fromYear}
                    onChange={handleFromYearChange}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer
                  components={["DatePicker", "DatePicker", "DatePicker"]}
                >
                  <DatePicker
                    label={"To Year"}
                    views={["year"]}
                    value={toYear}
                    onChange={handleToYearChange}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            color="primary"
            type="submit"
            sx={{
              alignSelf: "flex-end",
              margin: "20px 0",
              width: { xs: "100%", sm: "100%", md: "25%", lg: "24%" },
            }}
          >
            Search
          </Button>
        </form>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "500px",
          }}
        >
          <Grid container spacing={2}>
            {movies.map((movie, index) => (
              <Grid item key={movie._id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    border: "1px solid",
                    transition:
                      "transform 0.2s, box-shadow 0.2s, background 0.2s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      background: "rgba(255, 255, 255, 0.9)",
                    },
                  }}
                >
                  {isAdmin && (
                    <div
                      sx={{
                        marginLeft: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        padding: "8px",
                      }}
                    >
                      <IconButton
                        onClick={() => handleDeleteMovie(movie._id)}
                        color="default"
                      >
                        <DeleteIcon sx={{ margin: "8px 0 0 8px" }} />
                      </IconButton>
                    </div>
                  )}
                  <CardMedia
                    component="img"
                    height="140"
                    image="https://www.svgrepo.com/show/34896/movie.svg"
                    alt={movie.title}
                    sx={{ width: "40%", height: "auto", margin: "auto" }}
                  />

                  <hr />
                  <Link
                    to={`/movies/${movie._id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {movie.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Release Year: {movie.releaseYear}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Director: {movie.director}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Actors:{" "}
                        {movie.actors.map((actor) => actor.name).join(", ")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Genres:{" "}
                        {movie.genres.map((genre) => genre.name).join(", ")}
                      </Typography>
                    </CardContent>
                  </Link>
                </Card>
              </Grid>
            ))}
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              {isAdmin && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleNewMovieModalOpen}
                  fullWidth
                >
                  <AddIcon />
                </Button>
              )}
            </Grid>
          </Grid>
        </div>
      </Container>

      <Dialog open={modalOpen} onClose={handleModalClose}>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          How Movie Search Works
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleModalClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>
            <ol>
              <li>Type title of the movie.</li>
              <li>Choose genre of the movie.</li>
              <li>Select year range of the movie.</li>
            </ol>
            (You can leave them empty if you want to choose all possible
            variations)
          </Typography>
        </DialogContent>
      </Dialog>
      {isAdmin && (
        <>
          <Dialog open={newMovieModalOpen} onClose={handleNewMovieModalClose}>
            <DialogTitle>Add New Movie</DialogTitle>
            <DialogContent>
              <form onSubmit={handleAddMovie}>
                <Box sx={{ position: "absolute", top: "10px", right: "10px" }}>
                  <IconButton onClick={handleNewMovieModalClose}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                <TextField
                  sx={{ margin: "10px 0" }}
                  label="Title"
                  name="title"
                  value={movieData.title}
                  onChange={(event) =>
                    setMovieData({ ...movieData, title: event.target.value })
                  }
                  required
                  fullWidth
                />
                <TextField
                  sx={{ margin: "10px 0" }}
                  label="Release Year"
                  name="releaseYear"
                  type="number"
                  value={movieData.releaseYear}
                  onChange={(event) =>
                    setMovieData({
                      ...movieData,
                      releaseYear: event.target.value,
                    })
                  }
                  required
                  fullWidth
                />
                <TextField
                  sx={{ margin: "10px 0" }}
                  label="Director"
                  name="director"
                  value={movieData.director}
                  onChange={(event) =>
                    setMovieData({ ...movieData, director: event.target.value })
                  }
                  required
                  fullWidth
                />

                {/* Actors TextFields */}
                <Typography variant="h6">Actors</Typography>
                {movieData.actors.map((actor, index) => (
                  <div key={`actor-${index}`}>
                    <TextField
                      sx={{ margin: "10px 0" }}
                      label={`Actor ${index + 1} - Name`}
                      value={actor.name}
                      onChange={handleInputChange("actors", index, "name")}
                      required
                      fullWidth
                    />
                    <TextField
                      sx={{ margin: "10px 0" }}
                      label={`Actor ${index + 1} - Surname`}
                      value={actor.surname}
                      onChange={handleInputChange("actors", index, "surname")}
                      required
                      fullWidth
                    />
                    <TextField
                      sx={{ margin: "10px 0" }}
                      label={`Actor ${index + 1} - Age`}
                      type="number"
                      value={actor.age}
                      onChange={handleInputChange("actors", index, "age")}
                      required
                      fullWidth
                    />
                    <TextField
                      sx={{ margin: "10px 0" }}
                      label={`Actor ${index + 1} - Country`}
                      value={actor.country}
                      onChange={handleInputChange("actors", index, "country")}
                      required
                      fullWidth
                    />

                    <IconButton
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddField("actors")}
                      sx={{ marginTop: "4px" }}
                    >
                      <AddIcon />
                    </IconButton>

                    <IconButton
                      onClick={() => handleRemoveField("actors", index)}
                      color="error"
                      sx={{ marginTop: "4px" }}
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </div>
                ))}

                {/* Genres TextFields */}
                <Typography variant="h6">Genres</Typography>
                {movieData.genres.map((genre, index) => (
                  <div key={`genre-${index}`}>
                    <TextField
                      sx={{ margin: "10px 0" }}
                      label={`Genre ${index + 1} - Name`}
                      value={genre.name}
                      onChange={handleInputChange("genres", index, "name")}
                      required
                      fullWidth
                    />
                    <TextField
                      sx={{ margin: "10px 0" }}
                      label={`Genre ${index + 1} - Description`}
                      value={genre.description}
                      onChange={handleInputChange(
                        "genres",
                        index,
                        "description"
                      )}
                      required
                      fullWidth
                    />
                    <IconButton
                      variant="contained"
                      color="primary"
                      onClick={handleAddGenreField}
                      sx={{ marginTop: "4px" }}
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleRemoveGenreField(index)}
                      color="error"
                      sx={{ marginTop: "4px" }}
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </div>
                ))}

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: "16px" }}
                  >
                    Add Movie
                  </Button>
                </Box>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default Movies;
