import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
	username: string;
	userId: string;
	role: string;
	iat: number;
	exp: number;
}

interface AuthRequest extends Request {
	user?: {
		username: string;
		userId: string;
		role: string;
	};
}

// Rate limiting map to track login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

export const authenticateToken = (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): void => {
	const authHeader = req.get('authorization');

	if (!authHeader) {
		res.status(401).json({ 
			message: 'Authentication required',
			code: 'AUTH_REQUIRED'
		});
		return;
	}

	const token = authHeader.split(' ')[1];
	let decodedToken: JwtPayload;

	try {
		decodedToken = jwt.verify(
			token,
			process.env.JWT_SECRET_KEY ?? ''
		) as JwtPayload;

		// Add user information to request
		req.user = {
			username: decodedToken.username,
			userId: decodedToken.userId,
			role: decodedToken.role
		};

		// Check if token is about to expire (within 5 minutes)
		const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
		const currentTime = Date.now();
		const timeUntilExpiry = expirationTime - currentTime;

		if (timeUntilExpiry < 5 * 60 * 1000) { // 5 minutes
			// Generate new token
			const newToken = jwt.sign(
				{
					username: decodedToken.username,
					userId: decodedToken.userId,
					role: decodedToken.role
				},
				process.env.JWT_SECRET_KEY ?? '',
				{ expiresIn: '1h' }
			);

			// Set new token in response header
			res.setHeader('X-New-Token', newToken);
		}

		next();
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			res.status(401).json({ 
				message: 'Token expired',
				code: 'TOKEN_EXPIRED'
			});
			return;
		}
		res.status(401).json({ 
			message: 'Invalid token',
			code: 'INVALID_TOKEN'
		});
		return;
	}
};

export const checkLoginAttempts = (username: string): boolean => {
	const now = Date.now();
	const attempt = loginAttempts.get(username);

	if (!attempt) {
		loginAttempts.set(username, { count: 1, lastAttempt: now });
		return true;
	}

	if (now - attempt.lastAttempt > LOCKOUT_TIME) {
		loginAttempts.set(username, { count: 1, lastAttempt: now });
		return true;
	}

	if (attempt.count >= MAX_ATTEMPTS) {
		return false;
	}

	attempt.count++;
	attempt.lastAttempt = now;
	return true;
};

export const resetLoginAttempts = (username: string): void => {
	loginAttempts.delete(username);
};
