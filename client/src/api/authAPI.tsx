import { UserLogin } from '../interfaces/UserLogin';

interface LoginResponse {
	token: string;
	user: {
		id: number;
		username: string;
	};
}

const login = async (userInfo: UserLogin): Promise<LoginResponse> => {
	// TODO: make a POST request to the login route

	try {
		const response = await fetch('/auth/login', {
			// The login route is specified here
			method: 'POST', // The HTTP method is set to POST
			headers: {
				'Content-Type': 'application/json', // The content type is set to JSON
			},
			body: JSON.stringify(userInfo), // The user information is converted to a JSON string and sent in the request body
			credentials: 'include'
		});

		const data = await response.json(); // The response is parsed as JSON

		if (!response.ok) {
			throw new Error(data.message || 'Login failed'); // An error is thrown if the response status is not OK
		}

		return data; // The parsed data is returned
	} catch (err) {
		return Promise.reject(err instanceof Error ? err.message : 'Login failed'); // If an error occurs, a rejected promise with a custom error message is returned
	}
};

const refreshToken = async (): Promise<{ token: string }> => {
	try {
		const response = await fetch('/auth/refresh', {
			method: 'POST',
			credentials: 'include'
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || 'Token refresh failed');
		}

		return data;
	} catch (err) {
		return Promise.reject(err instanceof Error ? err.message : 'Token refresh failed');
	}
};

const logout = async (): Promise<void> => {
	try {
		const response = await fetch('/auth/logout', {
			method: 'POST',
			credentials: 'include'
		});

		if (!response.ok) {
			throw new Error('Logout failed');
		}
	} catch (err) {
		return Promise.reject(err instanceof Error ? err.message : 'Logout failed');
	}
};

export { login, refreshToken, logout };
