import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LoginStyled } from '../../styles/Layouts';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1/';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${BASE_URL}forgot-password`, { email });
            setSubmitted(true);
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoginStyled className="container">
            <div className="login">
                <div className="container">
                    <h2>Forgot Password</h2>

                    {submitted ? (
                        <div style={{ marginTop: '1.2rem' }}>
                            <p style={{ color: '#228B22', marginBottom: '1rem', lineHeight: '1.5' }}>
                                ✓ If that email is registered, a password reset link has been sent. Please check your inbox (and spam folder).
                            </p>
                            <Link to="/login" style={{ color: 'rgb(80, 98, 255)', fontWeight: '600' }}>
                                ← Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <p style={{ color: '#dc3545', fontSize: '0.9rem', margin: '-0.5rem 0 0' }}>
                                    {error}
                                </p>
                            )}

                            <button type="submit" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <span>
                                Remember your password?{' '}
                                <Link to="/login">Log in</Link>
                            </span>
                        </form>
                    )}
                </div>
            </div>
        </LoginStyled>
    );
}

export default ForgotPassword;
