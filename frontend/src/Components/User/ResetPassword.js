import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LoginStyled } from '../../styles/Layouts';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1/';

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!newPassword || !confirmPassword) {
            setError('Both fields are required.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${BASE_URL}reset-password`, { token, newPassword });
            if (data.status) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.message || 'Something went wrong.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoginStyled className="container">
            <div className="login">
                <div className="container">
                    <h2>Reset Password</h2>

                    {success ? (
                        <div style={{ marginTop: '1.2rem' }}>
                            <p style={{ color: '#228B22', marginBottom: '1rem', lineHeight: '1.5' }}>
                                ✓ Your password has been reset successfully! Redirecting you to login...
                            </p>
                            <Link to="/login" style={{ color: 'rgb(80, 98, 255)', fontWeight: '600' }}>
                                ← Go to Login now
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Enter new password (min. 6 characters)"
                                    value={newPassword}
                                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                                    autoFocus
                                    autoComplete="new-password"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                    autoComplete="new-password"
                                />
                            </div>

                            {error && (
                                <p style={{ color: '#dc3545', fontSize: '0.9rem', margin: '-0.5rem 0 0' }}>
                                    {error}
                                </p>
                            )}

                            <button type="submit" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>

                            <span>
                                <Link to="/login">← Back to Login</Link>
                            </span>
                        </form>
                    )}
                </div>
            </div>
        </LoginStyled>
    );
}

export default ResetPassword;
