import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '' });
  const navigate = useNavigate();

  const onChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'email' ? value.toLowerCase() : value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error registering user');
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={onChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={onChange} required />
        <input type="password" name="password" placeholder="Password (8-16 chars, 1 uppercase, 1 special)" value={formData.password} onChange={onChange} required minLength="8" maxLength="16" pattern="^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$" />
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={onChange} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
