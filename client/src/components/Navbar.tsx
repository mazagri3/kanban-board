import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import auth from '../utils/auth';

const Navbar = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const location = useLocation();

	const checkLogin = () => {
		setIsLoggedIn(auth.loggedIn());
	};

	useEffect(() => {
		checkLogin();
	}, [isLoggedIn]);

	return (
		<nav className='navbar'>
			<div className='navbar-brand'>
				<Link to='/'>
					<span className='brand-logo'>📋</span>
					<span className='brand-name'>TaskFlow</span>
				</Link>
			</div>
			<div className='navbar-menu'>
				{isLoggedIn && !['/create'].includes(location.pathname) && (
					<button className='btn-primary'>
						<Link to='/create'>Create Task</Link>
					</button>
				)}
				{!isLoggedIn ? (
					<button className='btn-secondary'>
						<Link to='/login'>Sign In</Link>
					</button>
				) : (
					<button
						className='btn-logout'
						onClick={() => {
							auth.logout();
							setIsLoggedIn(false);
						}}>
						Sign Out
					</button>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
