import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/api';
import { AlertCircle, Upload, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ReportLost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    description: '',
    color: '',
    brand: '',
    location: '',
    date_lost: new Date().toISOString().split('T')[0],
    additional_details: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (imageFile) {
        data.append('image', imageFile);
      }

      await apiFetch('/api/items/lost', {
        method: 'POST',
        body: data,
      });

      // Redirect to AI Matches view
      navigate('/ai-matches');
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please check fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '36px', background: '#FFFFFF', border: '1px solid #E2E8F0' }} className="glass-panel">
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', padding: '4px 12px', borderRadius: '999px' }}>
          <AlertCircle size={16} color="#DC2626" /> LOST ITEM REPORT
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>Report a Lost Item</h2>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
          Provide item features below. Our AI engine will automatically scan all reported found items for potential matches.
        </p>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label style={{ color: '#0F172A', fontWeight: 600 }}>Item Name *</label>
          <input
            type="text"
            required
            className="form-control"
            placeholder="e.g. Black Leather Wallet, Apple MacBook Air"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label style={{ color: '#0F172A', fontWeight: 600 }}>Category *</label>
            <select
              className="form-control"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Electronics">Electronics</option>
              <option value="ID & Cards">ID & Cards</option>
              <option value="Bags & Backpacks">Bags & Backpacks</option>
              <option value="Keys">Keys</option>
              <option value="Clothing & Accessories">Clothing & Accessories</option>
              <option value="Books & Notebooks">Books & Notebooks</option>
              <option value="Water Bottles">Water Bottles</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ color: '#0F172A', fontWeight: 600 }}>Primary Color *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Black, Navy Blue, Silver"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label style={{ color: '#0F172A', fontWeight: 600 }}>Brand / Manufacturer</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Apple, Nike, Samsung, Fossil"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label style={{ color: '#0F172A', fontWeight: 600 }}>Date Lost *</label>
            <input
              type="date"
              required
              className="form-control"
              value={formData.date_lost}
              onChange={(e) => setFormData({ ...formData, date_lost: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label style={{ color: '#0F172A', fontWeight: 600 }}>Last Known Location *</label>
          <input
            type="text"
            required
            className="form-control"
            placeholder="e.g. Main Library 2nd Floor, Cafeteria, Science Block B"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label style={{ color: '#0F172A', fontWeight: 600 }}>Detailed Item Description *</label>
          <textarea
            required
            className="form-control"
            placeholder="Include distinctive scratches, stickers, contents, case type, or specific markings..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label style={{ color: '#0F172A', fontWeight: 600 }}>Upload Item Image (Optional - Enhances Visual AI Score by +25%)</label>
          <div style={{
            border: '2px dashed #CBD5E1',
            borderRadius: '14px',
            padding: '24px',
            textAlign: 'center',
            background: '#F8FAFC',
            cursor: 'pointer'
          }}>
            <input
              type="file"
              accept="image/*"
              id="lost-image-input"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <label htmlFor="lost-image-input" style={{ cursor: 'pointer', display: 'block' }}>
              {imagePreview ? (
                <div>
                  <img src={imagePreview} alt="Preview" style={{ maxHeight: '160px', borderRadius: '10px', marginBottom: '10px' }} />
                  <p style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                    <CheckCircle2 size={16} inline /> Image Selected — Click to change
                  </p>
                </div>
              ) : (
                <div>
                  <Upload size={32} color="#2563EB" style={{ marginBottom: '8px' }} />
                  <p style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.95rem' }}>Click or drop photo here</p>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>PNG, JPG, WEBP up to 5MB</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', marginTop: '12px', fontSize: '1rem', fontWeight: 700 }}
        >
          {loading ? 'Submitting & Running AI Matching...' : (
            <>
              Submit Report & Scan Matches <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
