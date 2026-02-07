import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    Button, 
    Card,
    CardBody,
    Input, 
    Divider 
} from '@heroui/react';
import { ShieldCheck, User, Lock, ArrowRight, Github } from 'lucide-react';
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
                'Invalid credentials. Please verify your identity and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-[var(--bg-dark)] flex items-center justify-center p-4">
            {/* Ambient Background */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.6 }}>
                    <LightPillar
                        topColor="#3b82f6"
                        bottomColor="#a855f7"
                        intensity={0.8}
                        rotationSpeed={0.2}
                        glowAmount={0.001}
                        pillarWidth={4}
                        pillarHeight={0.6}
                        noiseIntensity={0.4}
                        pillarRotation={15}
                        interactive={false}
                        mixBlendMode="screen"
                        quality="high"
                    />
                </div>
                {/* Grid Overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'url("https://grainy-gradients.vercel.app/noise.svg")', opacity: 0.2, pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-dark), transparent, transparent)' }}></div>
            </div>

            <Card className="admin-card animate-fade-in-up w-full max-w-[440px] z-10" style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(40px)', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)' }}>
                <CardBody className="p-12">
                    <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '2.5rem' }}>
                        <div style={{ 
                            width: '4rem', 
                            height: '4rem', 
                            borderRadius: '1.25rem', 
                            background: 'linear-gradient(135deg, var(--primary), #4f46e5)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
                            marginBottom: '1.5rem',
                            transition: 'transform 0.5s ease'
                        }} className="login-logo">
                            <ShieldCheck size={32} color="white" />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.04em' }}>
                            Things<span style={{ color: 'var(--primary)' }}>NXT</span>
                        </h1>
                        <p className="text-tactical" style={{ color: 'var(--primary)', marginTop: '0.5rem', letterSpacing: '0.3em' }}>Intelligence Node</p>
                    </div>

                    {error && (
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="animate-fade-in">
                            <div className="status-dot" style={{ background: 'var(--danger)' }} />
                            <p style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 500, margin: 0, lineHeight: 1.4 }}>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <Input
                            label="Security Principal"
                            placeholder="username or email"
                            labelPlacement="outside"
                            variant="bordered"
                            isRequired
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            startContent={<User size={18} className="text-muted" />}
                            classNames={{
                                label: "text-tactical",
                                inputWrapper: "h-12 border-divider/10 hover:border-divider/20 focus-within:border-blue-500/50 bg-content2/5",
                            }}
                        />

                        <Input
                            label="Identity Secret"
                            type="password"
                            placeholder="••••••••"
                            labelPlacement="outside"
                            variant="bordered"
                            isRequired
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            startContent={<Lock size={18} className="text-muted" />}
                            classNames={{
                                label: "text-tactical",
                                inputWrapper: "h-12 border-divider/10 hover:border-divider/20 focus-within:border-blue-500/50 bg-content2/5",
                            }}
                        />

                        <div style={{ paddingTop: '0.5rem' }}>
                            <Button 
                                type="submit" 
                                color="primary" 
                                style={{ 
                                    width: '100%', 
                                    height: '3rem', 
                                    fontWeight: 900, 
                                    fontSize: '0.875rem', 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '0.1em', 
                                    background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                                    boxShadow: '0 20px 40px rgba(37, 99, 235, 0.25)',
                                    borderRadius: '0.75rem'
                                }}
                                isLoading={loading}
                                endContent={!loading && <ArrowRight size={18} />}
                            >
                                Authorize Session
                            </Button>
                        </div>
                    </form>

                    <div style={{ marginTop: '2.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-dim)', opacity: 0.1 }} />
                        <span className="text-tactical" style={{ fontSize: '9px', opacity: 0.4 }}>Enterprise Link</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-dim)', opacity: 0.1 }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
                        <Button 
                            variant="bordered" 
                            style={{ 
                                width: '100%', 
                                height: '2.75rem', 
                                border: '1px solid var(--border-dim)', 
                                background: 'rgba(255,255,255,0.02)',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                borderRadius: '0.75rem'
                            }}
                            className="hover:bg-content2"
                            startContent={<Github size={18} />}
                        >
                            Github SSO
                        </Button>
                    </div>

                    <p className="text-tactical" style={{ marginTop: '2.5rem', textAlign: 'center', opacity: 0.3, lineHeight: 2 }}>
                        &copy; {new Date().getFullYear()} ThingsNXT Systems<br/>
                        All Access Attempts are Monitored
                    </p>
                </CardBody>
            </Card>

            {/* Floating Elements */}
            <div style={{ position: 'absolute', bottom: '2.5rem', left: '2.5rem', opacity: 0.2 }} className="hidden lg:block hover:opacity-100 transition-opacity">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="status-dot" style={{ background: 'var(--primary)' }} />
                    <span className="text-tactical" style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-main)' }}>System Version 4.8.2</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
