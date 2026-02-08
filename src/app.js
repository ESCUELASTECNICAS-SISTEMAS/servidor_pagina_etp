const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

// CORS: allow production front and local dev
const allowedOrigins = [
	'https://etp-escuelas-tecnicas-del-peru-production.up.railway.app',
	'https://servidorpaginaetp-production.up.railway.app',
	'http://localhost:3000'
];
app.use(cors({
	origin: function(origin, callback) {
		// allow requests with no origin (like mobile apps or curl)
		if (!origin) return callback(null, true);
		if (allowedOrigins.indexOf(origin) !== -1) {
			return callback(null, true);
		}
		return callback(new Error('CORS policy: origin not allowed'));
	}
}));

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
