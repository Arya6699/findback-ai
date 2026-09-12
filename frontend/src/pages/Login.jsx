import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Cpu, ArrowLeft, CheckCircle2, Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react';

// Google "G" logo SVG component
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    let clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || window.__GOOGLE_CLIENT_ID__ || '';

    if (!clientId) {
      try {
        const configResp = await fetch('/api/auth/config');
        if (configResp.ok) {
          const configData = await configResp.json();
          clientId = configData.google_client_id || '';
        }
      } catch (e) {
        // ignore fetch failure
      }
    }

    if (!clientId) {
      setError('Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID in backend/.env.');
      setGoogleLoading(false);
      return;
    }

    if (!window.google?.accounts?.id) {
      setError('Google Identity Services SDK is loading. Please refresh the page in a moment.');
      setGoogleLoading(false);
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response.credential) {
            setError('Google authentication was cancelled.');
            setGoogleLoading(false);
            return;
          }
          try {
            await googleLogin(response.credential);
            navigate('/');
          } catch (err) {
            setError(err.message || 'Google authentication failed.');
            setGoogleLoading(false);
          }
        },
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isDismissedMoment()) {
          const reason = notification.getDismissReason();
          if (reason !== 'credential_returned') {
            setError('Google sign-in prompt was closed.');
            setGoogleLoading(false);
          }
        } else if (notification.isNotDisplayed()) {
          setError('Google Sign-In prompt is suppressed. Check your popup/cookie settings.');
          setGoogleLoading(false);
        }
      });
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      background: 'radial-gradient(circle at 80% 20%, #EFF6FF 0%, #F8FAFC 60%, #F1F5F9 100%)',
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        maxWidth: '1160px',
        width: '100%',
        margin: '0 auto',
      }}>
        {/* Back Link */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem',
            color: '#64748B',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }} onMouseEnter={(e) => e.currentTarget.style.color = '#2563EB'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}>
            <ArrowLeft size={16} /> Back to Landing Page
          </Link>
        </div>

        {/* 2-Column Responsive Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '48px',
          alignItems: 'center'
        }}>

          {/* LEFT PRODUCT SHOWCASE SECTION */}
          <div style={{ paddingRight: '12px' }}>
            {/* Brand Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              padding: '6px 14px',
              borderRadius: '999px',
              color: '#1E40AF',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '20px'
            }}>
              <Cpu size={16} color="#2563EB" /> FindBack.AI • Neural Loss Recovery
            </div>

            <h1 style={{
              fontSize: '2.8rem',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.15,
              marginBottom: '16px',
              letterSpacing: '-0.02em'
            }}>
              Lost Something? <br />
              <span style={{
                background: 'linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Let AI Find It.
              </span>
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '480px'
            }}>
              AI-powered visual matching that helps connect lost belongings with their rightful owners across campus.
            </p>

            {/* AI Matching Visualization Box */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 12px 30px -10px rgba(37, 99, 235, 0.08)',
              marginBottom: '32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #F1F5F9'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#2563EB" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Live AI Scan Radar
                  </span>
                </div>
                <span className="badge badge-score animate-pulse" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                  ACTIVE SCAN
                </span>
              </div>

              {/* Step-by-step match flow card */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center' }}>
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '12px' }}>
                  <span className="badge badge-lost" style={{ fontSize: '0.65rem', marginBottom: '6px' }}>LOST REPORT</span>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>Blue Nike Backpack</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Royal Blue • Bags</div>
                </div>

                <div style={{ textAlign: 'center', padding: '0 4px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                    color: '#FFF',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    padding: '6px 10px',
                    borderRadius: '99px',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
                  }}>
                    91% MATCH
                  </div>
                </div>

                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '12px' }}>
                  <span className="badge badge-found" style={{ fontSize: '0.65rem', marginBottom: '6px' }}>FOUND REPORT</span>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>Navy Blue Sport Bag</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Dark Blue • Bags</div>
                </div>
              </div>
            </div>

            {/* Compact Trust Indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#334155', fontWeight: 600 }}>
                <CheckCircle2 size={18} color="#10B981" /> AI-powered visual matching
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#334155', fontWeight: 600 }}>
                <ShieldCheck size={18} color="#2563EB" /> Secure authentication & privacy protection
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#334155', fontWeight: 600 }}>
                <Zap size={18} color="#F59E0B" /> Fast lost & found discovery alerts
              </div>
            </div>
          </div>


          {/* RIGHT LOGIN CARD */}
          <div>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '40px 36px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)'
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                  margin: '0 auto 14px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)'
                }}>
                  <Cpu size={26} color="#ffffff" />
                </div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>Welcome Back</h2>
                <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '6px' }}>
                  Sign in to FindBack AI to track and match your items
                </p>
              </div>

              {/* Inline Error Message Component */}
              {error && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px',
                  fontWeight: 500
                }}>
                  <AlertCircle size={18} style={{ shrink: 0 }} />
                  <div>{error}</div>
                </div>
              )}

              {/* Google OAuth Button */}
              <button
                id="google-login-btn"
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  background: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  color: '#1F2937',
                  cursor: googleLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: googleLoading ? 0.7 : 1,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  marginBottom: '20px'
                }}
                onMouseEnter={(e) => { if (!googleLoading) { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
              >
                {googleLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <GoogleLogo />}
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </button>

              {/* OR Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              </div>

              {/* Quick Demo Sign-In options */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '10px 12px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
                  ⚡ Quick Demo Accounts
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('alice@college.edu', 'alice123')}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '8px' }}
                  >
                    Alice (User)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('bob@college.edu', 'bob123')}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '8px' }}
                  >
                    Bob (User)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@college.edu', 'admin123')}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '8px', color: '#2563EB', fontWeight: 700 }}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Email Login Form */}
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '6px' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      required
                      className="form-control"
                      placeholder="alex@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: '100%', paddingLeft: '40px', height: '46px', borderRadius: '12px', fontSize: '0.92rem' }}
                    />
                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ margin: 0, color: '#0F172A', fontWeight: 600, fontSize: '0.88rem' }}>Password</label>
                    <span style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>Forgot password?</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      required
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: '100%', paddingLeft: '40px', height: '46px', borderRadius: '12px', fontSize: '0.92rem' }}
                    />
                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    height: '48px',
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              {/* Footer */}
              <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '18px' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
                  Create Account
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
