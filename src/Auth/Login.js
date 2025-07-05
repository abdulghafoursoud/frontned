import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthProvider';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // For password visibility
    const { login } = useContext(AuthContext);
    const [error, setError] = useState('');

    const baseUrl = process.env.REACT_APP_BACKEND_URL;

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${baseUrl}/login/`, { username, password });
            const token = response.data.access;
            localStorage.setItem('token', token);

            const userResponse = await axios.get(`${baseUrl}/users/me/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            login(token, userResponse.data);

        } catch (error) {
            console.error('Login error:', error);
            setError('Invalid Credentials');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Username"
                    />
                </div>
                <div>
                    <input
                        type={showPassword ? "text" : "password"} // Toggle between text and password
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Password"
                    />
                    <button type="button" onClick={togglePasswordVisibility}>
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                </div>
                {error && <p>{error}</p>}
                <button type="submit">Login</button>
            </form>
            <div>
                <a href="/forgot-password">Forgot password?</a>
            </div>
        </div>
    );
};

export default Login;
