import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const UpdatePassword = () => {
    const [formData, setFormData] = useState({ currentPassword: '', newPassword: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const { currentPassword, newPassword } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await api.put('/auth/update-password', { currentPassword, newPassword });
            setMessage(res.data.msg); // Success message
            setTimeout(() => navigate('/'), 2000); // Redirect after 2 seconds
        } catch (err) {
            setMessage(err.response.data.msg || 'An error occurred.');
        }
    };

    return (
        <div>
            <h2>Update Password</h2>
            <form onSubmit={onSubmit}>
                <input
                    type="password"
                    name="currentPassword"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={onChange}
                    required
                />
                <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={onChange}
                    required
                    minLength="8"
                    pattern="^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$"
                />
                <button type="submit">Update Password</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default UpdatePassword;
