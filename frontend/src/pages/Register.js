import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '' });
  const navigate = useNavigate();

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      alert('Error registering user');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <input type="text" name="name" placeholder="Name" onChange={onChange} required />
        <input type="email" name="email" placeholder="Email" onChange={onChange} required />
        <input type="password" name="password" placeholder="Password (8-16 chars, 1 uppercase, 1 special)" onChange={onChange} required minLength="8" maxLength="16" pattern="^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$" />
        <input type="text" name="address" placeholder="Address" onChange={onChange} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
