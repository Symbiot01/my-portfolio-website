'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styled from '@emotion/styled';
import Navbar from '@/sections/home/Navbar';
import { api } from '@/lib/api';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2.5rem;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);

  input {
    padding: 0.7rem 0.85rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
  }

  button {
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    background: ${({ theme }) => theme.primary};
    color: white;
    font-weight: 700;
    cursor: pointer;
  }
`;

const Toggle = styled.button`
  background: transparent !important;
  color: ${({ theme }) => theme.text} !important;
  border: 1px solid ${({ theme }) => theme.border} !important;
`;

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (mode === 'register') {
      try {
        await api.register(email, password, username);
        const ok = await login(email, password);
        if (!ok) setMessage('Registered but login failed.');
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Registration failed');
      }
      return;
    }
    const success = await login(email, password);
    if (!success) setMessage('Login failed. Check credentials or register.');
  };

  return (
    <>
      <Navbar />
      <LoginContainer>
        <Form onSubmit={handleSubmit}>
          <h2 style={{ textAlign: 'center', margin: 0 }}>
            {mode === 'login' ? 'Sign In' : 'Create account'}
          </h2>
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
          <Toggle
            type="button"
            onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}
          >
            {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
          </Toggle>
          {message && <p style={{ color: '#c0392b', margin: 0 }}>{message}</p>}
        </Form>
      </LoginContainer>
    </>
  );
}
