import { Router, Request, Response } from 'express';
import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { checkLoginAttempts, resetLoginAttempts } from '../middleware/auth.js';

// Password complexity requirements
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Define the login function
export const login = async (req: Request, res: Response) => {
	const { username, password } = req.body;

	try {
		// Check login attempts
		if (!checkLoginAttempts(username)) {
			return res.status(429).json({
				message: 'Too many login attempts. Please try again later.',
				code: 'TOO_MANY_ATTEMPTS'
			});
		}

		// Find the user in the database by username
		const user = await User.findOne({ where: { username } });

		// If the user does not exist, respond with a 401 status
		if (!user) {
			return res.status(401).json({
				message: 'Invalid credentials',
				code: 'INVALID_CREDENTIALS'
			});
		}

		// Compare the provided password with the hashed password
		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(401).json({
				message: 'Invalid credentials',
				code: 'INVALID_CREDENTIALS'
			});
		}

		// Reset login attempts on successful login
		resetLoginAttempts(username);

		// Generate access token
		const accessToken = jwt.sign(
			{
				username,
				userId: user.id.toString(),
				role: 'user'
			},
			process.env.JWT_SECRET_KEY || '',
			{ expiresIn: '1h' }
		);

		// Generate refresh token
		const refreshToken = jwt.sign(
			{
				username,
				userId: user.id.toString()
			},
			process.env.JWT_REFRESH_SECRET_KEY || '',
			{ expiresIn: '7d' }
		);

		// Store refresh token in database
		await user.update({ refreshToken });

		// Set refresh token in HTTP-only cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
		});

		// Respond with access token
		return res.status(200).json({
			token: accessToken,
			user: {
				id: user.id,
				username: user.username
			}
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: 'Internal server error',
			code: 'SERVER_ERROR'
		});
	}
};

// Refresh token endpoint
export const refreshToken = async (req: Request, res: Response) => {
	const { refreshToken } = req.cookies;

	if (!refreshToken) {
		return res.status(401).json({
			message: 'Refresh token required',
			code: 'REFRESH_TOKEN_REQUIRED'
		});
	}

	try {
		const decoded = jwt.verify(
			refreshToken,
			process.env.JWT_REFRESH_SECRET_KEY || ''
		) as { username: string; userId: string };

		const user = await User.findOne({
			where: {
				username: decoded.username,
				refreshToken
			}
		});

		if (!user) {
			return res.status(401).json({
				message: 'Invalid refresh token',
				code: 'INVALID_REFRESH_TOKEN'
			});
		}

		const accessToken = jwt.sign(
			{
				username: user.username,
				userId: user.id.toString(),
				role: 'user'
			},
			process.env.JWT_SECRET_KEY || '',
			{ expiresIn: '1h' }
		);

		return res.status(200).json({ token: accessToken });
	} catch (error) {
		return res.status(401).json({
			message: 'Invalid refresh token',
			code: 'INVALID_REFRESH_TOKEN'
		});
	}
};

// Logout endpoint
export const logout = async (req: Request, res: Response) => {
	const { refreshToken } = req.cookies;

	if (refreshToken) {
		try {
			const decoded = jwt.verify(
				refreshToken,
				process.env.JWT_REFRESH_SECRET_KEY || ''
			) as { username: string };

			const user = await User.findOne({
				where: { username: decoded.username }
			});

			if (user) {
				await user.update({ refreshToken: null });
			}
		} catch (error) {
			console.error('Error during logout:', error);
		}
	}

	res.clearCookie('refreshToken');
	return res.status(200).json({
		message: 'Logged out successfully',
		code: 'LOGOUT_SUCCESS'
	});
};

const router = Router();

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;
