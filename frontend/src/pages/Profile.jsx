import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';
import {
  User, Mail, Phone, MapPin, Calendar, Shield, Edit3, Save, X,
  AlertTriangle, Trash2, Loader2, CheckCircle, Search, FileText,
  Cpu, Bell, ChevronRight, Sparkles, Clock, TrendingUp, Award
} from 'lucide-react';

/* ─── Skeleton Loader ──────────────────────────────────────────── */
const Skeleton = ({ width = '100%', height = '20px', radius = '8px', style = {} }) => (
  <div style={{
    width, height, borderRadius: radius,
    background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
    ...style
  }} />
);

/* ─── Toast ────────────────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === 'success'
    ? 'linear-gradient(135deg, #059669, #10B981)'
    : 'linear-gradient(135deg, #DC2626, #EF4444)';

  return (
    <div style={{
      position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
      background: bg, color: '#fff',
      padding: '14px 24px', borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      display: 'flex', alignItems: 'center', gap: '10px',
      fontWeight: 600, fontSize: '0.9rem',
      animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      fontFamily: 'Inter, sans-serif'
    }}>
      {type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
      {message}
    </div>
  );
};

/* ─── Stat Card ────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, loading }) => (
  <div style={{
    flex: '1 1 140px',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '10px',
    transition: 'all 0.25s ease',
    cursor: 'default'
  }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,0.08)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div style={{
      width: '40px', height: '40px', borderRadius: '12px',
      background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Icon size={20} color={color} />
    </div>
    {loading ? <Skeleton width="60px" height="28px" /> : (
      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
        {value}
      </span>
    )}
    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', letterSpacing: '0.3px' }}>
      {label}
    </span>
  </div>
);

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Stats
  const [stats, setStats] = useState({ lostItems: 0, foundItems: 0, matches: 0, notifications: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit form
  const [formData, setFormData] = useState({ full_name: '', phone: '', location: '' });

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      const data = await apiFetch('/api/auth/me');
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        location: data.location || ''
      });
    } catch (err) {
      setToast({ message: 'Failed to load profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const [lost, found, matches, notifs] = await Promise.all([
        apiFetch('/api/items/lost').catch(() => []),
        apiFetch('/api/items/found').catch(() => []),
        apiFetch('/api/matches').catch(() => []),
        apiFetch('/api/notifications').catch(() => []),
      ]);
      setStats({
        lostItems: Array.isArray(lost) ? lost.length : 0,
        foundItems: Array.isArray(found) ? found.length : 0,
        matches: Array.isArray(matches) ? matches.length : 0,
        notifications: Array.isArray(notifs) ? notifs.length : 0,
      });
    } catch { /* ignore */ }
    finally { setStatsLoading(false); }
  }, []);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchProfile();
    fetchStats();
  }, [user, navigate, fetchProfile, fetchStats]);

  // Save profile
  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await apiFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      setProfile(updated);
      setEditing(false);
      setToast({ message: 'Profile updated successfully', type: 'success' });
      // Update stored user name in localStorage
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.full_name = updated.full_name;
      localStorage.setItem('user', JSON.stringify(stored));
    } catch (err) {
      setToast({ message: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await apiFetch('/api/auth/account', { method: 'DELETE' });
      logout();
      navigate('/login');
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete account', type: 'error' });
      setDeleting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const memberDuration = (dateStr) => {
    if (!dateStr) return '';
    const created = new Date(dateStr);
    const now = new Date();
    const days = Math.floor((now - created) / 86400000);
    if (days < 1) return 'Today';
    if (days === 1) return '1 day';
    if (days < 30) return `${days} days`;
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month' : `${months} months`;
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes avatarPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.25); }
          50% { box-shadow: 0 0 0 12px rgba(37, 99, 235, 0); }
        }
        .profile-input {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          font-size: 0.92rem;
          font-family: Inter, sans-serif;
          font-weight: 500;
          color: #0F172A;
          background: #FFFFFF;
          transition: all 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }
        .profile-input:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .profile-input::placeholder {
          color: #94A3B8;
        }
        .profile-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 700;
          font-family: Inter, sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          outline: none;
        }
        .profile-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .profile-btn-primary {
          background: linear-gradient(135deg, #2563EB, #3B82F6);
          color: #fff;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
        }
        .profile-btn-primary:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
          transform: translateY(-1px);
        }
        .profile-btn-secondary {
          background: #F8FAFC;
          color: #475569;
          border: 1.5px solid #E2E8F0;
        }
        .profile-btn-secondary:hover:not(:disabled) {
          background: #F1F5F9;
          border-color: #CBD5E1;
        }
        .profile-btn-danger {
          background: #FEF2F2;
          color: #DC2626;
          border: 1.5px solid #FECACA;
        }
        .profile-btn-danger:hover:not(:disabled) {
          background: #FEE2E2;
          border-color: #FCA5A5;
        }
        .profile-section-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          overflow: hidden;
          animation: fadeInUp 0.5s ease both;
        }
        .delete-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(6px);
          z-index: 9998;
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 40%, #F8FAFC 100%)',
        fontFamily: 'Inter, sans-serif',
        paddingBottom: '60px'
      }}>
        {/* ── Page Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
          padding: '48px 24px 80px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative dots */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            pointerEvents: 'none'
          }} />
          <div style={{
            maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 1
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={16} color="rgba(255,255,255,0.7)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                Account Settings
              </span>
            </div>
            <h1 style={{
              fontSize: '2rem', fontWeight: 800, color: '#FFFFFF',
              letterSpacing: '-0.5px', margin: 0
            }}>
              My Profile
            </h1>
            <p style={{
              fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)',
              marginTop: '6px', fontWeight: 500
            }}>
              Manage your account information and preferences
            </p>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={{
          maxWidth: '960px', margin: '-50px auto 0', padding: '0 24px',
          position: 'relative', zIndex: 2
        }}>
          {/* ── Profile Card ── */}
          <div className="profile-section-card" style={{ animationDelay: '0.05s' }}>
            <div style={{ padding: '32px' }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '28px',
                flexWrap: 'wrap'
              }}>
                {/* Avatar */}
                <div style={{ position: 'relative' }}>
                  {loading ? (
                    <Skeleton width="96px" height="96px" radius="50%" />
                  ) : (
                    <div style={{
                      width: '96px', height: '96px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '2rem', fontWeight: 800, color: '#FFFFFF',
                      boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
                      animation: 'avatarPulse 3s ease-in-out infinite',
                      flexShrink: 0
                    }}>
                      {getInitials(profile?.full_name)}
                    </div>
                  )}
                  <div style={{
                    position: 'absolute', bottom: '2px', right: '2px',
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: '#10B981', border: '3px solid #FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <CheckCircle size={12} color="#fff" />
                  </div>
                </div>

                {/* User info / Edit form */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <Skeleton width="200px" height="28px" />
                      <Skeleton width="260px" height="18px" />
                      <Skeleton width="140px" height="18px" />
                    </div>
                  ) : editing ? (
                    /* ── Edit Mode ── */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748B', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                          Full Name
                        </label>
                        <div style={{ position: 'relative' }}>
                          <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            className="profile-input"
                            style={{ paddingLeft: '40px' }}
                            value={formData.full_name}
                            onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))}
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748B', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                          Phone Number
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Phone size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            className="profile-input"
                            style={{ paddingLeft: '40px' }}
                            value={formData.phone}
                            onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748B', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                          Location
                        </label>
                        <div style={{ position: 'relative' }}>
                          <MapPin size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            className="profile-input"
                            style={{ paddingLeft: '40px' }}
                            value={formData.location}
                            onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                            placeholder="Enter your city or campus"
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <button className="profile-btn profile-btn-primary" onClick={handleSave} disabled={saving}>
                          {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                          {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                        <button className="profile-btn profile-btn-secondary" onClick={() => {
                          setEditing(false);
                          setFormData({
                            full_name: profile?.full_name || '',
                            phone: profile?.phone || '',
                            location: profile?.location || ''
                          });
                        }}>
                          <X size={16} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── View Mode ── */
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                          {profile?.full_name}
                        </h2>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 700,
                          background: profile?.role === 'admin' ? '#FEF3C7' : '#EFF6FF',
                          color: profile?.role === 'admin' ? '#92400E' : '#2563EB',
                          border: `1px solid ${profile?.role === 'admin' ? '#FDE68A' : '#BFDBFE'}`,
                          padding: '2px 10px', borderRadius: '8px',
                          textTransform: 'uppercase', letterSpacing: '0.5px',
                          display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}>
                          <Shield size={11} /> {profile?.role}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                          <Mail size={16} color="#64748B" /> {profile?.email}
                        </div>
                        {profile?.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                            <Phone size={16} color="#64748B" /> {profile.phone}
                          </div>
                        )}
                        {profile?.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                            <MapPin size={16} color="#64748B" /> {profile.location}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                          <Calendar size={16} color="#64748B" />
                          Joined {formatDate(profile?.created_at)}
                          <span style={{
                            fontSize: '0.75rem', background: '#F1F5F9', padding: '2px 8px',
                            borderRadius: '6px', color: '#64748B', fontWeight: 600
                          }}>
                            {memberDuration(profile?.created_at)}
                          </span>
                        </div>
                      </div>

                      <button
                        className="profile-btn profile-btn-primary"
                        style={{ marginTop: '20px' }}
                        onClick={() => setEditing(true)}
                      >
                        <Edit3 size={16} /> Edit Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Activity Stats ── */}
          <div style={{ marginTop: '24px', animation: 'fadeInUp 0.5s ease 0.15s both' }}>
            <h3 style={{
              fontSize: '0.82rem', fontWeight: 700, color: '#64748B',
              letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <TrendingUp size={15} /> Activity Overview
            </h3>
            <div style={{
              display: 'flex', gap: '16px', flexWrap: 'wrap'
            }}>
              <StatCard icon={AlertTriangle} label="Lost Reports" value={stats.lostItems} color="#DC2626" loading={statsLoading} />
              <StatCard icon={Search} label="Found Reports" value={stats.foundItems} color="#059669" loading={statsLoading} />
              <StatCard icon={Cpu} label="AI Matches" value={stats.matches} color="#2563EB" loading={statsLoading} />
              <StatCard icon={Bell} label="Notifications" value={stats.notifications} color="#7C3AED" loading={statsLoading} />
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div className="profile-section-card" style={{ marginTop: '24px', animationDelay: '0.25s' }}>
            <div style={{ padding: '24px 32px' }}>
              <h3 style={{
                fontSize: '0.82rem', fontWeight: 700, color: '#64748B',
                letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '18px',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <Sparkles size={15} /> Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { label: 'Report a Lost Item', desc: 'Submit a new lost item report for AI matching', icon: AlertTriangle, color: '#DC2626', path: '/report-lost' },
                  { label: 'Report a Found Item', desc: 'Help reunite someone with their belongings', icon: Search, color: '#059669', path: '/report-found' },
                  { label: 'View My Reports', desc: 'Track all your submitted reports and statuses', icon: FileText, color: '#2563EB', path: '/my-reports' },
                  { label: 'Check AI Matches', desc: 'See AI-powered matches for your items', icon: Cpu, color: '#7C3AED', path: '/ai-matches' },
                ].map((action) => (
                  <div
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '14px 16px', borderRadius: '14px',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      background: 'transparent'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: `${action.color}10`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <action.icon size={18} color={action.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>{action.label}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>{action.desc}</div>
                    </div>
                    <ChevronRight size={18} color="#CBD5E1" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Account Info ── */}
          <div className="profile-section-card" style={{ marginTop: '24px', animationDelay: '0.35s' }}>
            <div style={{ padding: '24px 32px' }}>
              <h3 style={{
                fontSize: '0.82rem', fontWeight: 700, color: '#64748B',
                letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '18px',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <Shield size={15} /> Account Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Account ID</div>
                  {loading ? <Skeleton width="60px" height="18px" /> : (
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace' }}>#{profile?.id}</div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Email Address</div>
                  {loading ? <Skeleton width="180px" height="18px" /> : (
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0F172A' }}>{profile?.email}</div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Account Role</div>
                  {loading ? <Skeleton width="80px" height="18px" /> : (
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0F172A', textTransform: 'capitalize' }}>{profile?.role}</div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Member Since</div>
                  {loading ? <Skeleton width="140px" height="18px" /> : (
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0F172A' }}>{formatDate(profile?.created_at)}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Danger Zone ── */}
          <div className="profile-section-card" style={{
            marginTop: '24px', animationDelay: '0.45s',
            border: '1px solid #FECACA'
          }}>
            <div style={{ padding: '24px 32px' }}>
              <h3 style={{
                fontSize: '0.82rem', fontWeight: 700, color: '#DC2626',
                letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <AlertTriangle size={15} /> Danger Zone
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500, margin: '0 0 18px' }}>
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                className="profile-btn profile-btn-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 size={16} /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF', borderRadius: '20px',
              padding: '32px', maxWidth: '440px', width: '90%',
              boxShadow: '0 20px 60px rgba(15,23,42,0.2)',
              animation: 'fadeInUp 0.3s ease'
            }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <AlertTriangle size={28} color="#DC2626" />
            </div>
            <h3 style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
              Delete Account?
            </h3>
            <p style={{ textAlign: 'center', fontSize: '0.88rem', color: '#64748B', fontWeight: 500, margin: '0 0 28px', lineHeight: 1.6 }}>
              This will permanently delete your account, all your reports, matches, and notifications.
              <strong style={{ color: '#DC2626' }}> This action cannot be undone.</strong>
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="profile-btn profile-btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="profile-btn"
                style={{
                  flex: 1, justifyContent: 'center',
                  background: 'linear-gradient(135deg, #DC2626, #EF4444)',
                  color: '#fff', border: 'none',
                  boxShadow: '0 4px 14px rgba(220,38,38,0.25)'
                }}
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? <Loader2 size={16} /> : <Trash2 size={16} />}
                {deleting ? 'Deleting…' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
