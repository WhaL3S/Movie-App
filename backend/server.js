const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'test',
  });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const actorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

const Actor = mongoose.model('Actor', actorSchema);


const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  }
});

const Genre = mongoose.model('Genre', genreSchema);

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  releaseYear: {
    type: Number,
    required: true,
  },
  actors: [{
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  }],
  genres: [{
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  }],
});

const Movie = mongoose.model('Movie', movieSchema);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'admin']
  },
});

const User = mongoose.model('User', userSchema);

const authMiddleware = (allowedRoles) => (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!allowedRoles.includes(decodedToken.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

app.post('/api/verify-token', async(req, res) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Missing token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    res.json({ message: 'Token is valid' });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
})

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username is taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  }
  catch {
    res.status(500);
  }

});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    const loginUser = await User.findOne({ username });

    if (!loginUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, loginUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }


    const token = jwt.sign({ userId: loginUser._id, username: loginUser.username, role: loginUser.role }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    const user = { ...loginUser._doc };
    delete user.password;

    res.status(201).json({ token, user });
});

app.get('/api/user', authMiddleware(['user', 'admin']), async (req, res) => {
  try {
    const user = req.user;
    delete user.iat;
    delete user.exp;
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/movies', authMiddleware(['user', 'admin']), async (req, res) => {
try {
  const { fromYear, toYear, title, genre, actorId } = req.query;
  let movies = await Movie.find();

  if (fromYear || toYear) {
    movies = movies.filter(movie => {
      return (!fromYear || movie.releaseYear >= parseInt(fromYear)) &&
             (!toYear || movie.releaseYear <= parseInt(toYear));
    });
  }

  if (title) {
    movies = movies.filter(movie =>
      movie.title.toLowerCase().includes(title.toLowerCase())
    );
  }

  if (genre) {
    movies = movies.filter(movie =>
      movie.genres.some(g => g.name.toLowerCase() === genre.toLowerCase())
    );
  }

  if (actorId) {
    movies = movies.filter(movie =>
      movie.actors.some(a => a._id === actorId))
  }

  res.status(200).json(movies);
} catch (error) {
  res.status(500).json({ error: 'Internal Server Error' });
}

});

app.post('/api/movies', authMiddleware(['admin']), async (req, res) => {
  try {
    const { title, director, releaseYear, actors, genres } = req.body;

    if (!title || !director || !releaseYear || !actors || !genres) {
      return res.status(400).json({ error: 'All parameters are required' });
    }

    if (!Array.isArray(actors) || !Array.isArray(genres)) {
      return res.status(400).json({ error: 'Actors and genres must be arrays' });
    }

    const newMovie = await Movie.create({
      title,
      director,
      releaseYear,
      actors,
      genres,
    });

    res.status(201).json({ message: 'Movie created successfully', movie: newMovie });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/movies/:movieId', authMiddleware(['user', 'admin']), async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId)

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.status(200).json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

  
app.put('/api/movies/:movieId', authMiddleware(['admin']), async (req, res) => {
  try {
    const { actors, genres, ...updateFields } = req.body;

    if (actors && !Array.isArray(actors)) {
      return res.status(400).json({ error: 'Actors must be an array' });
    }

    if (genres && !Array.isArray(genres)) {
      return res.status(400).json({ error: 'Genres must be an array' });
    }

    const updatedMovie = await Movie.findOneAndUpdate(
      { _id: req.params.movieId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    if (actors) {
      updatedMovie.actors = actors;
    }

    if (genres) {
      updatedMovie.genres = genres;
    }

    await updatedMovie.save();

    res.status(200).json({ message: `Movie ${req.params.movieId} updated successfully`, movie: updatedMovie });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

  
app.delete('/api/movies/:movieId', authMiddleware(['admin']), async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.movieId);

    if (!deletedMovie) {
      return res.status(404).json({ error: `Movie ${req.params.movieId} not found` });
    }

    res.status(200).json({ message: `Movie ${req.params.movieId} deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/movies/:movieId/actors', authMiddleware(['user', 'admin']), async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const actors = movie.actors;
    res.status(200).json(actors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/movies/:movieId/actors', authMiddleware(['admin']), async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const { name, surname, age, country } = req.body;
    if (!name || !surname || !age || !country) {
      return res.status(400).json({ error: 'Actor data is incomplete' });
    }

    const newActor = new Actor({
      name,
      surname,
      age,
      country,
    });

    movie.actors.push(newActor);

    await movie.save();

    res.status(201).json({ message: 'Actor created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/movies/:movieId/actors/:actorId', authMiddleware(['user', 'admin']), async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const actor = movie.actors.id(req.params.actorId);

    if (!actor) {
      return res.status(404).json({ error: 'Actor not found' });
    }

    res.status(200).json(actor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

  
app.put('/api/movies/:movieId/actors/:actorId', authMiddleware(['admin']), async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const actor = movie.actors.id(req.params.actorId);

    if (!actor) {
      return res.status(404).json({ error: 'Actor not found' });
    }

    const { age, country, name, surname } = req.body;

    if (age && typeof age !== 'number') {
      return res.status(400).json({ error: 'Age must be a number' });
    }

    if (country && typeof country !== 'string') {
      return res.status(400).json({ error: 'Country must be a string' });
    }

    if (name && typeof name !== 'string') {
      return res.status(400).json({ error: 'Name must be a string' });
    }

    if (surname && typeof surname !== 'string') {
      return res.status(400).json({ error: 'Surname must be a string' });
    }

    actor.set(req.body);

    await movie.save();

    res.status(200).json({ message: 'Actor updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

  
app.delete('/api/movies/:movieId/actors/:actorId', authMiddleware(['admin']), async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const actor = movie.actors.id(req.params.actorId);

    if (!actor) {
      return res.status(404).json({ error: 'Actor not found' });
    }

    actor.deleteOne();

    await movie.save();

    res.status(200).json({ message: 'Actor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/movies/:movieId/genres', authMiddleware(['user', 'admin']), async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.status(200).json(movie.genres);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  
app.post('/api/movies/:movieId/genres', authMiddleware(['admin']), async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const { name, description } = req.body;

    const newGenre = new Genre({
      name,
      description
    });

    movie.genres.push(newGenre);


    await movie.save();
    res.status(201).json({ message: 'Genre added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/movies/:movieId/genres/:genreId', authMiddleware(['user', 'admin']), async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const genre = movie.genres.id(req.params.genreId);

    if (!genre) {
      return res.status(404).json({ error: 'Genre not found' });
    }

    res.status(200).json(genre);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/movies/:movieId/genres/:genreId', authMiddleware(['admin']), async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const genre = movie.genres.id(req.params.genreId);

    if (!genre) {
      return res.status(404).json({ error: 'Genre not found' });
    }

    genre.set(req.body);
    await movie.save();
    res.status(200).json({ message: 'Genre updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  
app.delete('/api/movies/:movieId/genres/:genreId', authMiddleware(['admin']), async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const genre = movie.genres.id(req.params.genreId);

    if (!genre) {
      return res.status(404).json({ error: 'Genre not found' });
    }

    genre.deleteOne();

    await movie.save();

    res.status(200).json({ message: 'Genre deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/genres', authMiddleware(['admin']), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required for a genre' });
    }

    const existingGenre = await Genre.findOne({ name });

    if (existingGenre) {
      return res.status(400).json({ error: 'Genre with this name already exists' });
    }

    const newGenre = new Genre({
      name,
      description,
    });

    await newGenre.save();

    res.status(201).json({ message: 'Genre created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/genres', authMiddleware(['user', 'admin']), async (req, res) => {
  try {
    const genres = await Genre.find();

    res.status(200).json(genres);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/genres/:genreId', authMiddleware(['user', 'admin']), async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.genreId);

    if (!genre) {
      return res.status(404).json({ error: 'Genre not found' });
    }

    res.status(200).json(genre);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/genres/:genreId', authMiddleware(['admin']), async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.genreId);

    if (!genre) {
      return res.status(404).json({ error: 'Genre not found' });
    }

    genre.set(req.body);

    await genre.save();


    res.status(200).json({ message: 'Genre updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/genres/:genreId', authMiddleware(['admin']), async (req, res) => {
  try {
    const deletedGenre = await Genre.findByIdAndDelete(req.params.genreId);

    if (!deletedGenre) {
      return res.status(404).json({ error: 'Genre not found' });
    }

    res.status(200).json({ message: 'Genre deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/actors', authMiddleware(['user', 'admin']), async (req, res) => {
  try {
    const actors = await Actor.find();
    res.status(200).json(actors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/actors', authMiddleware(['admin']), async (req, res) => {
  try {
    const { age, country, name, surname } = req.body;

    if (!age || !country || !name || !surname) {
      return res.status(400).json({ error: 'All parameters are required' });
    }

    const newActor = new Actor({
      age,
      country,
      name,
      surname,
    });

    await newActor.save();

    res.status(201).json({ message: 'Actor created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/actors/:actorId', authMiddleware(['user', 'admin']), async (req, res) => {
  try {
    const actor = await Actor.findById(req.params.actorId);

    if (!actor) {
      return res.status(404).json({ error: 'Actor not found' });
    }

    res.status(200).json(actor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/actors/:actorId', authMiddleware(['admin']), async (req, res) => {
  try {
    const actor = await Actor.findById(req.params.actorId);

    if (!actor) {
      return res.status(404).json({ error: 'Actor not found' });
    }

    actor.set(req.body);

    await actor.save();

    res.status(200).json({ message: 'Actor updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/actors/:actorId', authMiddleware(['admin']), async (req, res) => {
  try {
    const actor = await Actor.findById(req.params.actorId);

    if (!actor) {
      return res.status(404).json({ error: 'Actor not found' });
    }

    await actor.deleteOne();

    res.status(200).json({ message: 'Actor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
