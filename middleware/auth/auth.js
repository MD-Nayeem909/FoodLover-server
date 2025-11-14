import { db } from '../../dbConnection';
import jwt from 'jsonwebtoken';
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
export { verifyToken, authUser };
