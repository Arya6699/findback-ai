import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, getImageUrl } from '../api/api';
import { AlertCircle, PlusCircle, Calendar, MapPin, Tag, Sparkles, Layers, CheckCircle } from 'lucide-react';

export default function MyReports() {
  const [reports, setReports] = useState({ lost_items: [], found_items: [] });
  const [activeTab, setActiveTab] = useState('lost');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/items/my-reports')
      .then((data) => setReports(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const itemsToDisplay = activeTab === 'lost' ? reports.lost_items : reports.found_items;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A' }}>My Reported Items</h2>
        <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '4px' }}>
          Manage your lost and found submissions and track AI potential match statuses.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('lost')}
          className={`btn ${activeTab === 'lost' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '12px', padding: '10px 20px' }}
        >
          <AlertCircle size={16} /> My Lost Items ({reports.lost_items.length})
        </button>
        <button
          onClick={() => setActiveTab('found')}
          className={`btn ${activeTab === 'found' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '12px', padding: '10px 20px' }}
        >
          <PlusCircle size={16} /> My Found Items ({reports.found_items.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>Loading your reports...</div>
      ) : itemsToDisplay.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B', background: '#FFFFFF' }}>
          <Layers size={40} style={{ opacity: 0.5, marginBottom: '12px', color: '#2563EB' }} />
          <h3 style={{ color: '#0F172A' }}>No {activeTab} item reports submitted yet</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px', marginBottom: '20px' }}>
            Report an item to start receiving automated AI match notifications.
          </p>
          <Link to={activeTab === 'lost' ? '/report-lost' : '/report-found'} className="btn btn-primary">
            Submit New {activeTab === 'lost' ? 'Lost' : 'Found'} Report
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {itemsToDisplay.map((item) => (
            <div key={item.id} className="glass-panel glass-panel-hover" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
              <div style={{
                height: '160px',
                background: '#F1F5F9',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid #E2E8F0'
              }}>
                {item.image_url ? (
                  <img
                    src={getImageUrl(item.image_url)}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                    <Layers size={36} style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '0.75rem' }}>No photo attached</p>
                  </div>
                )}
                <span className={`badge ${activeTab === 'lost' ? 'badge-lost' : 'badge-found'}`} style={{ position: 'absolute', top: '12px', left: '12px' }}>
                  {activeTab === 'lost' ? 'LOST' : 'FOUND'}
                </span>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>{item.name}</h3>
                    <span className={`badge ${item.status === 'returned' ? 'badge-found' : item.status === 'matched' ? 'badge-score' : 'badge-lost'}`}>
                      {item.status}
                    </span>
                  </div>

                  <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '16px' }}>{item.description}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#475569', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Tag size={14} color="#2563EB" /> Category: <strong style={{ color: '#0F172A' }}>{item.category}</strong></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} color="#3B82F6" /> Location: <strong style={{ color: '#0F172A' }}>{item.location}</strong></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} color="#10B981" /> Date: <strong style={{ color: '#0F172A' }}>{item.date_lost || item.date_found}</strong></div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    ID: #{item.id}
                  </span>
                  <Link to="/ai-matches" className="btn btn-sm btn-primary" style={{ fontSize: '0.8rem' }}>
                    <Sparkles size={14} /> View AI Matches
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
