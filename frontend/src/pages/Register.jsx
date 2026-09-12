import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle, Shield, ArrowLeft, Cpu, Loader2 } from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName, role);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: '#64748B', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Landing Page
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '40px 36px', border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
            margin: '0 auto 16px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)'
          }}>
            <UserPlus size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0F172A' }}>Create Account</h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '6px' }}>
            Get started with <strong style={{ color: '#0F172A' }}>FindBack AI</strong> neural match engine
          </p>
        </div>

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
            marginBottom: '20px'
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ color: '#0F172A', fontWeight: 600 }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                className="form-control"
                placeholder="Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px' }}
              />
              <User size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748B' }} />
            </div>
          </div>

          <div className="form-group">
            <label style={{ color: '#0F172A', fontWeight: 600 }}>College / Work Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-control"
                placeholder="alex@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px' }}
              />
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748B' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label style={{ color: '#0F172A', fontWeight: 600 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  minLength={4}
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', paddingLeft: '40px' }}
                />
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748B' }} />
              </div>
            </div>

            <div className="form-group">
              <label style={{ color: '#0F172A', fontWeight: 600 }}>Confirm</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  minLength={4}
                  className="form-control"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', paddingLeft: '40px' }}
                />
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748B' }} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label style={{ color: '#0F172A', fontWeight: 600 }}>Account Role</label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px' }}
              >
                <option value="user">Student / General User</option>
                <option value="admin">Campus Administrator / Officer</option>
              </select>
              <Shield size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748B' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '12px', fontSize: '1rem', fontWeight: 700 }}
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.9rem', color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#2563EB', fontWeight: 700 }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}

