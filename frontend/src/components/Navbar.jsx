import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';
import { Search, PlusCircle, AlertCircle, Bell, User, LogOut, ShieldCheck, Cpu, Layers, Sparkles, HelpCircle, Zap } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      apiFetch('/api/notifications')
        .then((notifs) => {
          const unread = notifs.filter((n) => !n.is_read).length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.94)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #E2E8F0',
      padding: '12px 24px',
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            position: 'relative'
          }}>
            <Cpu size={24} color="#ffffff" />
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#10b981',
              border: '2px solid #ffffff'
            }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontWeight: 800,
                fontSize: '1.3rem',
                letterSpacing: '-0.5px',
                color: '#0F172A',
                fontFamily: 'Inter, sans-serif'
              }}>
                FindBack<span style={{ color: '#2563EB' }}>.AI</span>
              </span>
              <span style={{
                fontSize: '0.65rem',
                background: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #BFDBFE',
                padding: '1px 6px',
                borderRadius: '6px',
                fontWeight: 700
              }}>
                PRO
              </span>
            </div>
            <span style={{
              display: 'block',
              fontSize: '0.66rem',
              color: '#64748B',
              fontWeight: 600,
              letterSpacing: '0.8px',
              marginTop: '-3px'
            }}>
              NEURAL LOST & FOUND ENGINE
            </span>
          </div>
        </Link>

        {/* Navigation Section */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/" className={`btn btn-sm ${isActive('/') ? 'btn-primary' : 'btn-secondary'}`}>
              <Search size={16} /> Explore Items
            </Link>

            <Link to="/report-lost" className={`btn btn-sm ${isActive('/report-lost') ? 'btn-primary' : 'btn-secondary'}`} style={{ color: isActive('/report-lost') ? '#FFFFFF' : '#DC2626' }}>
              <AlertCircle size={16} /> Report Lost
            </Link>

            <Link to="/report-found" className={`btn btn-sm ${isActive('/report-found') ? 'btn-primary' : 'btn-secondary'}`} style={{ color: isActive('/report-found') ? '#FFFFFF' : '#059669' }}>
              <PlusCircle size={16} /> Report Found
            </Link>

            <Link to="/my-reports" className={`btn btn-sm ${isActive('/my-reports') ? 'btn-primary' : 'btn-secondary'}`}>
              <Layers size={16} /> My Reports
            </Link>

            <Link to="/ai-matches" className={`btn btn-sm ${isActive('/ai-matches') ? 'btn-primary' : 'btn-secondary'}`}>
              <Cpu size={16} /> AI Matches
            </Link>

            <Link to="/notifications" className={`btn btn-sm ${isActive('/notifications') ? 'btn-primary' : 'btn-secondary'}`} style={{ position: 'relative' }}>
              <Bell size={16} /> Notifications
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadCount}
                </span>
              )}
            </Link>

            {user.role === 'admin' && (
              <Link to="/admin" className={`btn btn-sm ${isActive('/admin') ? 'btn-primary' : 'btn-secondary'}`} style={{ borderColor: '#BFDBFE', color: isActive('/admin') ? '#FFFFFF' : '#2563EB' }}>
                <ShieldCheck size={16} /> Admin Panel
              </Link>
            )}

            <div style={{ height: '24px', width: '1px', background: '#E2E8F0', margin: '0 4px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/profile" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 12px', borderRadius: '10px',
                transition: 'background 0.2s ease', cursor: 'pointer'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 800, color: '#FFFFFF'
                }}>
                  {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>
                  {user.full_name}
                </span>
              </Link>
              <button onClick={handleLogout} className="btn btn-sm btn-secondary" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="nav-mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '0.92rem', fontWeight: 600, color: '#475569' }}>
              <a href="/#how-it-works" style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#2563EB'} onMouseOut={(e) => e.target.style.color = '#475569'}>
                How It Works
              </a>
              <a href="/#features" style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#2563EB'} onMouseOut={(e) => e.target.style.color = '#475569'}>
                Features
              </a>
              <a href="/#ai-demo" style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#2563EB'} onMouseOut={(e) => e.target.style.color = '#475569'}>
                AI Demo
              </a>
              <a href="/#stats" style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#2563EB'} onMouseOut={(e) => e.target.style.color = '#475569'}>
                Stats
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn btn-sm btn-secondary" style={{ padding: '8px 18px', fontWeight: 600 }}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary" style={{ padding: '8px 18px', fontWeight: 600 }}>
                Create Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

