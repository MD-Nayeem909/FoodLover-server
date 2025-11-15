import express from 'express';

import { db } from '../dbConnection.js';
import { verifyToken, authUser } from '../middleware/auth/auth.js';

const userRouter = express.Router();

userRouter.get('/favorites', verifyToken, authUser, async (req, res) => {
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

userRouter.get('/me', verifyToken, authUser, async (req, res) => {
	res.send({
		user: req.user,
		success: true,
		message: 'User data fetched successfully',
	});
});

export default userRouter;
