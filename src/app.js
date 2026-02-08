const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(express.json());

// request logging to stdout (appears in Railway "Logs")
app.use(morgan('combined'));

// routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const socialRoutes = require('./routes/social.routes');
const noticiaRoutes = require('./routes/noticia.routes');
const mediaRoutes = require('./routes/media.routes');
const courseRoutes = require('./routes/course.routes');
const carouselRoutes = require('./routes/carousel.routes');
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/social-links', socialRoutes);
app.use('/noticias', noticiaRoutes);
app.use('/media', mediaRoutes);
app.use('/courses', courseRoutes);
app.use('/carousel-slides', carouselRoutes);

app.get('/', (req, res) => res.json({ ok: true }));

module.exports = app;
