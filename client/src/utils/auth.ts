import { JwtPayload, jwtDecode } from 'jwt-decode';

interface AuthUser {
	id: number;
	username: string;
	role: string;
}

class AuthService {
	private refreshTimeout: NodeJS.Timeout | null = null;

	getProfile(): AuthUser | null {
		const token = this.getToken();
		if (!token) return null;
		try {
			return jwtDecode<JwtPayload & AuthUser>(token);
		} catch (error) {
			console.error('Error decoding token:', error);
			return null;
		}
	}

	loggedIn(): boolean {
		const token = this.getToken();
		if (!token) return false;
		return !this.isTokenExpired(token);
	}

	isTokenExpired(token: string): boolean {
		if (!token) return true;
		try {
			const decodedToken = jwtDecode<JwtPayload>(token);
			const currentTime = Date.now() / 1000;
			if (!decodedToken.exp) return false;
			return decodedToken.exp < currentTime;
		} catch (error) {
			console.error('Error decoding token:', error);
			return true;
		}
	}

	getToken(): string {
		return localStorage.getItem('token') ?? '';
	}

	async refreshToken(): Promise<void> {
		try {
			const response = await fetch('/auth/refresh', {
				method: 'POST',
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error('Failed to refresh token');
			}

			const data = await response.json();
			this.setToken(data.token);
			this.setupRefreshTimeout();
		} catch (error) {
			console.error('Error refreshing token:', error);
			this.logout();
		}
	}

	private setupRefreshTimeout(): void {
		if (this.refreshTimeout) {
			clearTimeout(this.refreshTimeout);
		}

		const token = this.getToken();
		if (!token) return;

		try {
			const decodedToken = jwtDecode<JwtPayload>(token);
			if (!decodedToken.exp) return;

			const expiresIn = decodedToken.exp * 1000 - Date.now();
			const refreshTime = expiresIn - 5 * 60 * 1000; // Refresh 5 minutes before expiry

			if (refreshTime > 0) {
				this.refreshTimeout = setTimeout(() => {
					this.refreshToken();
				}, refreshTime);
			}
		} catch (error) {
			console.error('Error setting up refresh timeout:', error);
		}
	}

	private setToken(token: string): void {
		localStorage.setItem('token', token);
	}

	async login(idToken: string): Promise<void> {
		this.setToken(idToken);
		this.setupRefreshTimeout();
		window.location.assign('/');
	}

	async logout(): Promise<void> {
		try {
			await fetch('/auth/logout', {
				method: 'POST',
				credentials: 'include'
			});
		} catch (error) {
			console.error('Error during logout:', error);
		} finally {
			if (this.refreshTimeout) {
				clearTimeout(this.refreshTimeout);
			}
			localStorage.removeItem('token');
			window.location.assign('/login');
		}
	}
}

export default new AuthService();
