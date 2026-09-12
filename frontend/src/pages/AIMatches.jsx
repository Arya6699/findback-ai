import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/api';
import { Cpu, CheckCircle2, Image as ImageIcon, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export default function AIMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchMatches = () => {
    setLoading(true);
    apiFetch('/api/matches')
      .then((data) => setMatches(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleStatusChange = async (matchId, newStatus) => {
    setUpdatingId(matchId);
    try {
      await apiFetch(`/api/matches/${matchId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchMatches();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#2563EB', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
            <Cpu size={18} /> MULTI-MODAL WEIGHTED MATCHING ENGINE
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A' }}>AI Match Results</h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '4px' }}>
            Ranked lost & found pairing results generated using semantic text similarity, visual feature vectors, and attribute weighting.
          </p>
        </div>
        <button onClick={fetchMatches} className="btn btn-secondary" style={{ gap: '6px' }}>
          <RefreshCw size={16} /> Refresh AI Engine
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>Running AI similarity calculations...</div>
      ) : matches.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B', background: '#FFFFFF' }}>
          <Cpu size={48} style={{ opacity: 0.5, marginBottom: '16px', color: '#2563EB' }} />
          <h3 style={{ color: '#0F172A' }}>No AI Matches Computed Yet</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>
            Report a lost or found item to trigger automated semantic matching.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {matches.map((match) => {
            const lost = match.lost_item;
            const found = match.found_item;

            return (
              <div key={match.id} className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden', background: '#FFFFFF' }}>
                {/* Score Header Banner */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '20px',
                  marginBottom: '24px',
                  borderBottom: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '1.4rem',
                      boxShadow: '0 6px 18px rgba(37, 99, 235, 0.25)'
                    }}>
                      {Math.round(match.total_score)}%
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
                        Match Score: <span style={{ color: '#2563EB' }}>{match.total_score}%</span>
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                        Pairing ID #{match.id} • Status: <strong style={{ textTransform: 'capitalize', color: match.status === 'confirmed' ? '#059669' : '#D97706' }}>{match.status}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Status buttons */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {match.status !== 'confirmed' && match.status !== 'returned' && (
                      <button
                        onClick={() => handleStatusChange(match.id, 'confirmed')}
                        disabled={updatingId === match.id}
                        className="btn btn-sm btn-success"
                      >
                        <CheckCircle2 size={16} /> Confirm Match
                      </button>
                    )}
                    {match.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusChange(match.id, 'returned')}
                        disabled={updatingId === match.id}
                        className="btn btn-sm btn-primary"
                      >
                        <ShieldCheck size={16} /> Mark as Returned
                      </button>
                    )}
                    {match.status !== 'rejected' && (
                      <button
                        onClick={() => handleStatusChange(match.id, 'rejected')}
                        disabled={updatingId === match.id}
                        className="btn btn-sm btn-secondary"
                        style={{ color: '#DC2626' }}
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>

                {/* Side by Side Image Comparison */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 60px 1fr',
                  gap: '16px',
                  alignItems: 'center',
                  marginBottom: '28px',
                  background: '#F8FAFC',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0'
                }}>
                  {/* Lost Item Photo Card */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      height: '200px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #FCA5A5',
                      marginBottom: '10px'
                    }}>
                      {lost && lost.image_url ? (
                        <img
                          src={lost.image_url}
                          alt="Lost"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ color: '#94A3B8' }}>
                          <ImageIcon size={32} />
                          <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>No photo attached</p>
                        </div>
                      )}
                    </div>
                    <span className="badge badge-lost">LOST ITEM</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', color: '#0F172A' }}>{lost?.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Reported by: {lost?.user_name}</p>
                  </div>

                  {/* Arrow Icon */}
                  <div style={{ textAlign: 'center', color: '#2563EB' }}>
                    <ArrowRight size={28} />
                  </div>

                  {/* Found Item Photo Card */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      height: '200px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #A7F3D0',
                      marginBottom: '10px'
                    }}>
                      {found && found.image_url ? (
                        <img
                          src={found.image_url}
                          alt="Found"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ color: '#94A3B8' }}>
                          <ImageIcon size={32} />
                          <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>No photo attached</p>
                        </div>
                      )}
                    </div>
                    <span className="badge badge-found">FOUND ITEM</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', color: '#0F172A' }}>{found?.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Reported by: {found?.user_name}</p>
                  </div>
                </div>

                {/* AI Feature Score Breakdown & Explanation Bullets */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
                  {/* Left: Progress Bars */}
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2563EB', marginBottom: '16px' }}>
                      FEATURE SIMILARITY BREAKDOWN
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', color: '#475569' }}>
                          <span>Text Similarity (Weight: 30%)</span>
                          <strong style={{ color: '#0F172A' }}>{match.text_score}%</strong>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${match.text_score}%` }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', color: '#475569' }}>
                          <span>Image Similarity (Weight: 25%)</span>
                          <strong style={{ color: '#0F172A' }}>{match.image_score !== null ? `${match.image_score}%` : 'N/A (Weight Redistributed)'}</strong>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${match.image_score || 0}%`, background: match.image_score === null ? '#94A3B8' : undefined }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', color: '#475569' }}>
                          <span>Category (Weight: 15%)</span>
                          <strong style={{ color: '#0F172A' }}>{match.category_score}%</strong>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${match.category_score}%` }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', color: '#475569' }}>
                          <span>Color (Weight: 10%)</span>
                          <strong style={{ color: '#0F172A' }}>{match.color_score}%</strong>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${match.color_score}%` }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', color: '#475569' }}>
                          <span>Brand (Weight: 10%)</span>
                          <strong style={{ color: '#0F172A' }}>{match.brand_score}%</strong>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${match.brand_score}%` }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', color: '#475569' }}>
                          <span>Location (Weight: 5%)</span>
                          <strong style={{ color: '#0F172A' }}>{match.location_score}%</strong>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${match.location_score}%` }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', color: '#475569' }}>
                          <span>Date (Weight: 5%)</span>
                          <strong style={{ color: '#0F172A' }}>{match.date_score}%</strong>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${match.date_score}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Explanation Checkmarks */}
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2563EB', marginBottom: '16px' }}>
                      AI MATCH EXPLANATION & AUDIT
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {match.explanations && match.explanations.map((exp, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: exp.startsWith('✓') ? '#ECFDF5' : '#FEF2F2',
                          border: `1px solid ${exp.startsWith('✓') ? '#A7F3D0' : '#FCA5A5'}`,
                          padding: '10px 14px',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          color: exp.startsWith('✓') ? '#065F46' : '#991B1B',
                          fontWeight: 600
                        }}>
                          {exp}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
