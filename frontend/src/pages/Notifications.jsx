import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/api';
import { Bell, CheckCheck, Sparkles, ArrowRight, Check } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    setLoading(true);
    apiFetch('/api/notifications')
      .then((data) => setNotifications(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/api/notifications/read-all', { method: 'PUT' });
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A' }}>In-App Notifications</h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
            High-confidence AI matches (Score &ge; 80%) trigger real-time notifications here.
          </p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B', background: '#FFFFFF' }}>
          <Bell size={40} style={{ opacity: 0.5, marginBottom: '12px', color: '#2563EB' }} />
          <h3 style={{ color: '#0F172A' }}>No notifications yet</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>
            When a high confidence match (&ge; 80%) is detected, you will be notified instantly.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="glass-panel"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderLeft: notif.is_read ? '4px solid #CBD5E1' : '4px solid #2563EB',
                background: notif.is_read ? '#FFFFFF' : '#EFF6FF',
                border: '1px solid #E2E8F0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: notif.is_read ? '#F1F5F9' : '#DBEAFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: notif.is_read ? '#64748B' : '#2563EB'
                }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '0.95rem', fontWeight: notif.is_read ? 500 : 700, color: notif.is_read ? '#475569' : '#0F172A' }}>
                    {notif.message}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {!notif.is_read && (
                  <button onClick={() => handleMarkRead(notif.id)} className="btn btn-sm btn-secondary" title="Mark Read">
                    <Check size={14} />
                  </button>
                )}
                <Link to="/ai-matches" className="btn btn-sm btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  View Match <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
