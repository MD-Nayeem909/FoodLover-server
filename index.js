import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';

import { connectDB, db } from './dbConnection.js';
import { ObjectId } from 'mongodb';

import router from './router/userRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function authUser(req, res, next) {
	try {
		const email = req.user.email;
		const user = await db.collection('users').findOne({ email });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		req.user = user;
		next();
	} catch (err) {
		res.status(401).json({ message: 'Invalid token' });
	}
}
function verifyToken(req, res, next) {
	const authHeader = req.headers.authorization;
	const token = authHeader?.split(' ')[1];

	if (!token) return res.status(403).json({ message: 'No token provided' });

	try {
		const decoded = jwt.verify(token, 'secret');
		req.user = decoded; // attach user info
		next();
	} catch (err) {
		res.status(401).json({ message: 'Invalid token' });
	}
}

app.use('/auth', router);

app.get('/api/reviews', async (req, res) => {
	try {
		const collection = await db.collection('reviews');
		let reviews = await collection.find().toArray();
		res.status(200).send({
			data: reviews,
			success: true,
			message: 'Reviews fetched successfully',
		});
	} catch (err) {
		console.error('Reviews data fetch error:', err);
		res.status(500).send({
			data: [],
			success: false,
			message: 'Reviews data fetch error',
		});
	}
});

app.get('/api/reviews/me', verifyToken, authUser, async (req, res) => {
	try {
		const collection = await db.collection('reviews');
		const reviews = await collection.find({ author: req.user._id }).toArray();
		res.status(200).send({
			data: reviews,
			success: true,
			message: 'Reviews fetched successfully',
		});
	} catch (err) {
		console.error('Reviews data fetch error:', err);
		res.status(500).send({
			data: [],
			success: false,
			message: 'Reviews data fetch error',
		});
	}
});

app.get('/api/favorites', verifyToken, authUser, async (req, res) => {
	try {
		// search array of favorites
		const collection = await db.collection('reviews');
		const reviews = await collection.find({ _id: { $in: req.user.favorites } }).toArray();

		res.status(200).send({
			data: reviews,
			success: true,
			message: 'Reviews fetched successfully',
		});
	} catch (err) {
		console.error('Reviews data fetch error:', err);
		res.status(500).send({
			data: [],
			success: false,
			message: 'Reviews data fetch error',
		});
	}
});

app.get('/api/reviews/:id', async (req, res) => {
	try {
		const id = new ObjectId(req.params.id);
		const collection = await db.collection('reviews');
		const review = await collection.findOne({ _id: id });
		if (!review) {
			return res.status(404).send({
				data: {},
				success: false,
				message: 'Reviews data not found',
			});
		}
		res.status(200).send({
			data: review,
			success: true,
			message: 'Review fetched successfully',
		});
	} catch (err) {
		console.error('Review data fetch error:', err);
		res.status(500).send({
			data: {},
			success: false,
			message: 'Review data fetch error',
		});
	}
});

function parseTags(input) {
	if (typeof input !== 'string') return [];

	return input
		.split(',')
		.map((tag) => tag.trim())
		.filter((tag) => tag.length > 0);
}

app.post('/api/reviews', verifyToken, authUser, async (req, res) => {
	if (!req.body) {
		return res.status(400).send({
			data: {},
			success: false,
			message: 'Review data not found',
		});
	}

	const reviewData = {
		...req.body,
		author: req.user._id,
		tags: parseTags(req.body.tags),
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	try {
		const collection = await db.collection('reviews');

		const review = await collection.insertOne(reviewData);
		res.status(201).send({
			data: review,
			success: true,
			message: 'Review created successfully',
		});
	} catch (err) {
		console.error('Review data create error:', err);
		res.status(500).send({
			data: {},
			success: false,
			message: 'Review data create error',
		});
	}
});

app.put('/api/reviews/:id', verifyToken, async (req, res) => {
	try {
		const id = new ObjectId(req.params.id);
		const collection = await db.collection('reviews');
		const review = await collection.findOne({ _id: id });
		if (!review) {
			return res.status(404).send({
				data: {},
				success: false,
				message: 'Reviews data not found',
			});
		}
		const updatedReview = await collection.updateOne({ _id: id }, { $set: req.body });
		res.status(200).send({
			data: updatedReview,
			success: true,
			message: 'Review updated successfully',
		});
	} catch (err) {
		console.error('Review data update error:', err);
		res.status(500).send({
			data: {},
			success: false,
			message: 'Review data update error',
		});
	}
});

app.delete('/api/reviews/:id', verifyToken, async (req, res) => {
	try {
		const id = new ObjectId(req.params.id);
		const collection = await db.collection('reviews');
		const review = await collection.deleteOne({ _id: id });
		res.status(200).send({
			data: review,
			success: true,
			message: 'Review deleted successfully',
		});
	} catch (err) {
		console.error('Review data delete error:', err);
		res.status(500).send({
			data: {},
			success: false,
			message: 'Review data delete error',
		});
	}
});

app.put('/api/reviews/:id/favorite', verifyToken, authUser, async (req, res) => {
	try {
		const isFavorite = req.body.isFavorite;
		console.log('🚀 ~ index.js:229 ~ isFavorite:', isFavorite);

		const reviewId = req.params.id;
		const userFavorite = req.user.favorites.find((favorite) => favorite.id === reviewId);

		if (!userFavorite && isFavorite) {
			// add favorite
			const collection = await db.collection('users');
			const updatedUser = await collection.updateOne({ _id: req.user._id }, { $addToSet: { favorites: new ObjectId(reviewId) } });
			res.status(200).send({
				data: updatedUser,
				success: true,
				message: 'Favorite added successfully',
			});
			return;
		} else {
			// remove favorite
			const collection = await db.collection('users');
			const updatedUser = await collection.updateOne({ _id: req.user._id }, { $pull: { favorites: new ObjectId(reviewId) } });
			res.status(200).send({
				data: updatedUser,
				success: true,
				message: 'Favorite removed successfully',
			});
			return;
		}
	} catch (err) {
		console.error('Favorite data update error:', err);
		res.status(500).send({
			data: {},
			success: false,
			message: 'Favorite data update error',
		});
	}
});

// // register
// app.post('/auth/signup', async (req, res) => {
// 	if (!req.body || !req.body.email || !req.body.password) {
// 		return res.status(400).send({
// 			data: {},
// 			success: false,
// 			message: 'User data not found',
// 		});
// 	}
// 	try {
// 		const user = {
// 			...req.body,
// 			password: passwordHash(req.body.password),

// 			favorites: [],
// 			createdAt: new Date(),
// 			updatedAt: new Date(),
// 		};
// 		const collection = await db.collection('users');
// 		const newUser = await collection.insertOne(user);
// 		res.status(201).send({
// 			data: newUser,
// 			success: true,
// 			message: 'User created successfully',
// 		});
// 	} catch (err) {
// 		console.error('User data create error:', err);
// 		res.status(500).send({
// 			data: {},
// 			success: false,
// 			message: { error: 'User data create error', errorMessage: err.message },
// 		});
// 	}
// });

// // login
// app.post('/auth/login', async (req, res) => {
// 	const { email, password } = req.body;
// 	if (!email || !password) {
// 		return res.status(400).send({
// 			data: {},
// 			success: false,
// 			message: 'Email and password are required',
// 		});
// 	}
// 	try {
// 		const collection = db.collection('users');
// 		const user = await collection.findOne({ email });

// 		if (!user) {
// 			return res.status(401).send({
// 				data: {},
// 				success: false,
// 				message: 'User not found',
// 			});
// 		}
// 		if (!passwordVerify(password, user.password)) {
// 			return res.status(401).send({
// 				data: {},
// 				success: false,
// 				message: 'Invalid password',
// 			});
// 		}

// 		const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });
// 		res.status(200).send({
// 			token,
// 			user: {
// 				_id: user._id,
// 				email: user.email,
// 				favorites: user.favorites,
// 				photoUrl: user.photoURL,
// 				username: user.username,
// 			},
// 			success: true,
// 			message: 'User logged in successfully',
// 		});
// 	} catch (err) {
// 		res.status(500).send({
// 			data: {},
// 			success: false,
// 			message: 'User data fetch error',
// 		});
// 	}
// });

connectDB(async () => {
	app.listen(port, () => {
		console.log(`FoodLovers app listening at http://localhost:${port}`);
	});
});
