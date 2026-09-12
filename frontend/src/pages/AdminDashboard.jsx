import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/api';
import { ShieldCheck, AlertCircle, PlusCircle, Sparkles, CheckCircle2, Trash2, Check, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = () => {
    setLoading(true);
    const statsPromise = apiFetch('/api/admin/stats');
    const matchesPromise = apiFetch('/api/admin/matches');

    Promise.all([statsPromise, matchesPromise])
      .then(([statsData, matchesData]) => {
        setStats(statsData);
        setMatches(matchesData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateMatchStatus = async (matchId, newStatus) => {
    try {
      await apiFetch(`/api/admin/matches/${matchId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
            <ShieldCheck size={16} /> ADMIN MANAGEMENT PORTAL
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A' }}>Admin Dashboard</h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '2px' }}>
            System-wide statistics, automated match verification, and item retrieval management.
          </p>
        </div>
        <button onClick={fetchAdminData} className="btn btn-secondary">
          <RefreshCw size={16} /> Refresh Stats
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '36px' }}>
          <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #EF4444', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#991B1B', fontSize: '0.85rem', fontWeight: 700 }}>
              <AlertCircle size={18} color="#EF4444" /> Total Lost Reports
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: '#0F172A' }}>
              {stats.total_lost_reports}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #10B981', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#065F46', fontSize: '0.85rem', fontWeight: 700 }}>
              <PlusCircle size={18} color="#10B981" /> Total Found Reports
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: '#0F172A' }}>
              {stats.total_found_reports}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #2563EB', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1E40AF', fontSize: '0.85rem', fontWeight: 700 }}>
              <Sparkles size={18} color="#2563EB" /> Potential AI Matches
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: '#0F172A' }}>
              {stats.potential_matches}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #F59E0B', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#92400E', fontSize: '0.85rem', fontWeight: 700 }}>
              <CheckCircle2 size={18} color="#F59E0B" /> Confirmed Matches
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: '#0F172A' }}>
              {stats.confirmed_matches}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #3B82F6', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1E40AF', fontSize: '0.85rem', fontWeight: 700 }}>
              <ShieldCheck size={18} color="#3B82F6" /> Returned Items
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: '#0F172A' }}>
              {stats.returned_items}
            </div>
          </div>
        </div>
      )}

      {/* System Metrics Overview */}
      {stats && (
        <div className="glass-panel" style={{ padding: '28px', marginBottom: '36px', background: '#FFFFFF' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: '#2563EB' }}>
            SYSTEM RETRIEVAL METRICS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px', color: '#475569' }}>
                <span>Item Match & Resolution Rate</span>
                <strong style={{ color: '#0F172A' }}>
                  {stats.total_lost_reports > 0
                    ? `${Math.round(((stats.confirmed_matches + stats.returned_items) / (stats.total_lost_reports || 1)) * 100)}%`
                    : '100%'}
                </strong>
              </div>
              <div className="progress-bar-container" style={{ height: '10px' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${stats.total_lost_reports > 0 ? Math.min(100, Math.round(((stats.confirmed_matches + stats.returned_items) / (stats.total_lost_reports || 1)) * 100)) : 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All AI Matches Table & Action Table */}
      <div className="glass-panel" style={{ padding: '28px', background: '#FFFFFF' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', color: '#0F172A' }}>
          System AI Matches & Status Control
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>Loading system matches...</div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>No matches recorded in system database.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                  <th style={{ padding: '12px' }}>ID</th>
                  <th style={{ padding: '12px' }}>Lost Item</th>
                  <th style={{ padding: '12px' }}>Found Item</th>
                  <th style={{ padding: '12px' }}>Match Score</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: '#0F172A' }}>#{m.id}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {m.lost_item?.image_url && (
                          <img src={m.lost_item.image_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E2E8F0' }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{m.lost_item?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Owner: {m.lost_item?.user_name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {m.found_item?.image_url && (
                          <img src={m.found_item.image_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E2E8F0' }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{m.found_item?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Reporter: {m.found_item?.user_name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span className="badge badge-score" style={{ fontSize: '0.85rem' }}>
                        {m.total_score}%
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: m.status === 'confirmed' ? '#ECFDF5' : m.status === 'returned' ? '#EFF6FF' : '#FEF3C7',
                        color: m.status === 'confirmed' ? '#065F46' : m.status === 'returned' ? '#1E40AF' : '#92400E',
                        border: `1px solid ${m.status === 'confirmed' ? '#A7F3D0' : m.status === 'returned' ? '#BFDBFE' : '#FDE68A'}`
                      }}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        {m.status !== 'confirmed' && (
                          <button
                            onClick={() => handleUpdateMatchStatus(m.id, 'confirmed')}
                            className="btn btn-sm btn-success"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Confirm
                          </button>
                        )}
                        {m.status !== 'returned' && (
                          <button
                            onClick={() => handleUpdateMatchStatus(m.id, 'returned')}
                            className="btn btn-sm btn-primary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Mark Returned
                          </button>
                        )}
                        {m.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateMatchStatus(m.id, 'rejected')}
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#DC2626' }}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
