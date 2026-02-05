import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import LightPillar from '../components/LightPillar';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        'Invalid username or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div style={{ width: '100%', height: '600px', position: 'relative' }}>
          <LightPillar
            topColor="#5227FF"
            bottomColor="#FF9FFC"
            intensity={1}
            rotationSpeed={0.3}
            glowAmount={0.002}
            pillarWidth={3}
            pillarHeight={0.4}
            noiseIntensity={0.5}
            pillarRotation={25}
            interactive={false}
            mixBlendMode="screen"
            quality="high"
          />
        </div>
      </div>

      <Card className="login-card animate-fadeInUp">
        <div className="login-header">
          <h1 className="login-logo">
            Things<span>NXT</span>
          </h1>
          <p className="login-subtitle">Sign in to access your dashboard</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            label="Username or Email"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" loading={loading} className="login-submit-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="login-footer">
          (c) {new Date().getFullYear()} ThingsNXT
        </div>
      </Card>
    </div>
  );
};

export default Login;
