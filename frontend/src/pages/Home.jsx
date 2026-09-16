import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch, getImageUrl } from '../api/api';
import { 
  Search, Filter, AlertCircle, PlusCircle, Calendar, MapPin, Tag, 
  Image as ImageIcon, Sparkles, CheckCircle2, Cpu, ShieldCheck, 
  ArrowRight, Zap, BellRing, Layers, Eye, RefreshCw, ChevronRight, Lock
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Logged-in Item Explorer states
  const [activeTab, setActiveTab] = useState('lost');
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  // AI Demo Interactive Simulator State
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);

  const demoItems = [
    {
      title: "Blue Nike Backpack",
      lost: {
        name: "Blue Nike Backpack",
        category: "Bags & Backpacks",
        color: "Blue",
        location: "Central Library 2nd Floor",
        desc: "Dark blue Nike sports backpack with laptop sleeve and water bottle pocket.",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80"
      },
      found: {
        name: "Navy Blue Sport Bag",
        category: "Bags & Backpacks",
        color: "Dark Blue",
        location: "Library Reading Room",
        desc: "Found a blue sports backpack near study desk #14 containing notebooks.",
        image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400&auto=format&fit=crop&q=80"
      },
      matchScore: 91.4,
      textScore: 94.2,
      imageScore: 88.6,
      colorScore: 96.0
    },
    {
      title: "MacBook Pro 14-inch",
      lost: {
        name: "MacBook Pro M2 Space Gray",
        category: "Electronics",
        color: "Space Gray",
        location: "Engineering Hall B",
        desc: "14-inch laptop with developer stickers on top lid.",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80"
      },
      found: {
        name: "Silver Laptop Computer",
        category: "Electronics",
        color: "Gray",
        location: "Lab Room 204",
        desc: "Apple laptop left behind after 4 PM lecture.",
        image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&auto=format&fit=crop&q=80"
      },
      matchScore: 88.7,
      textScore: 90.1,
      imageScore: 86.4,
      colorScore: 90.0
    },
    {
      title: "Car Keys with Leather Keychain",
      lost: {
        name: "Toyota Key Fob + Tan Leather Strap",
        category: "Keys",
        color: "Black / Brown",
        location: "Student Center Cafeteria",
        desc: "Set of keys with 3 door keys and brown leather fob.",
        image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&auto=format&fit=crop&q=80"
      },
      found: {
        name: "Car Remote & Key Ring",
        category: "Keys",
        color: "Black",
        location: "Cafeteria Cashier Counter",
        desc: "Found keys turned in at front counter around noon.",
        image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&auto=format&fit=crop&q=80"
      },
      matchScore: 93.8,
      textScore: 95.0,
      imageScore: 92.1,
      colorScore: 94.5
    }
  ];

  const currentDemo = demoItems[selectedDemoIndex];

  const fetchItems = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (categoryFilter) query.append('category', categoryFilter);
    if (colorFilter) query.append('color', colorFilter);
    if (locationFilter) query.append('location', locationFilter);
    if (statusFilter) query.append('status', statusFilter);

    const lostPromise = apiFetch(`/api/items/lost?${query.toString()}`);
    const foundPromise = apiFetch(`/api/items/found?${query.toString()}`);

    Promise.all([lostPromise, foundPromise])
      .then(([lostData, foundData]) => {
        setLostItems(lostData);
        setFoundItems(foundData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user, categoryFilter, colorFilter, locationFilter, statusFilter]);

  // If user is NOT logged in, render the LeetCode-inspired SaaS Landing Page
  if (!user) {
    return (
      <div style={{ background: '#F8FAFC', color: '#0F172A', overflowX: 'hidden' }}>
        
        {/* ================= HERO SECTION ================= */}
        <section style={{
          position: 'relative',
          padding: '80px 24px 100px 24px',
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '48px',
          alignItems: 'center'
        }}>
          {/* Left Hero Content */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              padding: '6px 16px',
              borderRadius: '999px',
              color: '#2563EB',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '24px'
            }}>
              <Sparkles size={16} color="#2563EB" /> Multi-Modal Neural Matching Engine 2.0
            </div>

            <h1 className="hero-heading" style={{
              fontSize: '3.4rem',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-1.5px',
              marginBottom: '20px',
              color: '#0F172A'
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
              fontSize: '1.15rem',
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: '36px',
              maxWidth: '560px',
              fontWeight: 400
            }}>
              <strong style={{ color: '#0F172A' }}>FindBack AI</strong> combines transformer text embeddings and computer vision neural nets to automatically pair lost items with found reports in real-time.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.05rem', fontWeight: 700 }}>
                <AlertCircle size={20} /> Report Lost Item
              </Link>
              <Link to="/register" className="btn btn-accent" style={{ padding: '14px 28px', fontSize: '1.05rem', fontWeight: 700 }}>
                <PlusCircle size={20} /> Report Found Item
              </Link>
              <a href="#ai-demo" className="btn btn-secondary" style={{ padding: '14px 24px', fontSize: '1rem', fontWeight: 600 }}>
                <Sparkles size={18} color="#2563EB" /> Live Demo
              </a>
            </div>

            {/* Quick Metrics */}
            <div style={{
              display: 'flex',
              gap: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #E2E8F0'
            }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>94.2%</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>Match Accuracy</div>
              </div>
              <div style={{ width: '1px', background: '#E2E8F0' }} />
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563EB' }}>&lt; 2 Min</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>Avg Detection</div>
              </div>
              <div style={{ width: '1px', background: '#E2E8F0' }} />
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>8,500+</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>Items Reunited</div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="demo-match-card animate-pulse-glow" style={{ padding: '24px', position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '14px',
              borderBottom: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={20} color="#2563EB" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>Live Neural Scan Radar</span>
              </div>
              <span className="badge badge-score animate-radar">
                <Sparkles size={12} /> SCANNING
              </span>
            </div>

            {/* Comparison Cards Showcase */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              {/* Lost item preview */}
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '12px',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-lost">LOST REPORT</span>
                  <span style={{ fontSize: '0.7rem', color: '#991B1B', fontWeight: 700 }}>Item #104</span>
                </div>
                <div style={{ height: '90px', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
                  <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80" alt="Lost Backpack" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>Blue Nike Backpack</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Library 2nd Floor</div>
              </div>

              {/* Found item preview */}
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '12px',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-found">FOUND REPORT</span>
                  <span style={{ fontSize: '0.7rem', color: '#065F46', fontWeight: 700 }}>Item #109</span>
                </div>
                <div style={{ height: '90px', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
                  <img src="https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400&auto=format&fit=crop&q=80" alt="Found Bag" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>Navy Blue Sport Bag</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Reading Room</div>
              </div>
            </div>

            {/* Neural Match Bar */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '14px',
              border: '1px solid #BFDBFE'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>AI Match Confidence</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#2563EB' }}>91.4% MATCH</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: '91.4%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
                <span>Text Cosine: 94.2%</span>
                <span>Visual CLIP: 88.6%</span>
                <span>Location: 95.0%</span>
              </div>
            </div>
          </div>
        </section>


        {/* ================= HOW IT WORKS SECTION ================= */}
        <section id="how-it-works" style={{
          padding: '80px 24px',
          maxWidth: '1280px',
          margin: '0 auto',
          borderTop: '1px solid #E2E8F0'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 56px auto' }}>
            <span style={{
              color: '#2563EB',
              fontSize: '0.85rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              AUTOMATED WORKFLOW
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '8px', color: '#0F172A' }}>
              How FindBack AI Reconnects You
            </h2>
            <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '10px' }}>
              Four intelligent steps engineered to streamline recovery and reduce manual lost-and-found efforts.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            <div className="saas-step-card">
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                marginBottom: '20px'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px', color: '#0F172A' }}>Submit Item Report</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5 }}>
                Post details of what you lost or found — category, brand, color, location, and optional photo.
              </p>
            </div>

            <div className="saas-step-card">
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#EFF6FF',
                color: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                marginBottom: '20px'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px', color: '#0F172A' }}>Neural Embedding Scan</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5 }}>
                Our backend instantly converts item attributes and photos into high-dimensional vector embeddings.
              </p>
            </div>

            <div className="saas-step-card">
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                marginBottom: '20px'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px', color: '#0F172A' }}>Instant Match Alert</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5 }}>
                When cosine match similarity exceeds 75%, both finder and owner receive instant notifications.
              </p>
            </div>

            <div className="saas-step-card">
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                marginBottom: '20px'
              }}>
                4
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px', color: '#0F172A' }}>Verified Claim</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5 }}>
                Owner validates item proof, coordinates pickup, and marks the report as safely returned.
              </p>
            </div>
          </div>
        </section>


        {/* ================= FEATURES GRID SECTION ================= */}
        <section id="features" style={{
          padding: '80px 24px',
          maxWidth: '1280px',
          margin: '0 auto',
          borderTop: '1px solid #E2E8F0'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 56px auto' }}>
            <span style={{ color: '#2563EB', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
              ENTERPRISE CAPABILITIES
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '8px', color: '#0F172A' }}>
              Engineered For Speed & Precision
            </h2>
            <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '10px' }}>
              Advanced tech stack designed to eliminate lost items across campuses and organizations.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            <div className="saas-feature-card">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Cpu size={22} color="#2563EB" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>Multi-Modal AI Engine</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5 }}>
                Evaluates both natural text descriptions (SentenceTransformers) and visual features (CLIP embeddings) simultaneously.
              </p>
            </div>

            <div className="saas-feature-card">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ImageIcon size={22} color="#3B82F6" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>Visual Similarity Detection</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5 }}>
                Recognizes item photos regardless of lighting, background clutter, or smartphone camera angles.
              </p>
            </div>

            <div className="saas-feature-card">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <BellRing size={22} color="#10B981" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>Real-time Notifications</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5 }}>
                Receive instant alerts the second someone posts an item that matches your lost report parameters.
              </p>
            </div>

            <div className="saas-feature-card">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <MapPin size={22} color="#D97706" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>Geo & Location Proximity</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5 }}>
                Smart spatial scoring ensures items reported near the same building or hall get priority matching scores.
              </p>
            </div>

            <div className="saas-feature-card">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShieldCheck size={22} color="#2563EB" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>Admin Verification Suite</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5 }}>
                Dedicated dashboard for security personnel & campus officers to moderate claims and resolve disputes.
              </p>
            </div>

            <div className="saas-feature-card">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Lock size={22} color="#3B82F6" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>Privacy-First Claims</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5 }}>
                Personal phone numbers and emails are protected until match verification is completed by the user.
              </p>
            </div>
          </div>
        </section>


        {/* ================= INTERACTIVE AI DEMO SECTION ================= */}
        <section id="ai-demo" style={{
          padding: '80px 24px',
          maxWidth: '1280px',
          margin: '0 auto',
          borderTop: '1px solid #E2E8F0'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 40px auto' }}>
            <span style={{ color: '#2563EB', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
              LIVE INTERACTIVE DEMO
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '8px', color: '#0F172A' }}>
              Experience The AI Matcher In Action
            </h2>
            <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '10px' }}>
              Select sample lost-and-found report pairs below to test how our neural algorithm calculates match scores.
            </p>

            {/* Test Pair Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '24px' }}>
              {demoItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDemoIndex(idx)}
                  className={`btn ${selectedDemoIndex === idx ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Showcase Box */}
          <div className="glass-panel" style={{ padding: '36px', border: '1px solid #BFDBFE' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', alignItems: 'center' }}>
              
              {/* Lost Item Card */}
              <div style={{ background: '#FEF2F2', borderRadius: '16px', padding: '20px', border: '1px solid #FCA5A5' }}>
                <span className="badge badge-lost" style={{ marginBottom: '12px' }}>LOST REPORT</span>
                <div style={{ height: '160px', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }}>
                  <img src={currentDemo.lost.image} alt={currentDemo.lost.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>{currentDemo.lost.name}</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '6px 0 12px 0' }}>{currentDemo.lost.desc}</p>
                <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>Category: <strong style={{ color: '#0F172A' }}>{currentDemo.lost.category}</strong></div>
                  <div>Color: <strong style={{ color: '#0F172A' }}>{currentDemo.lost.color}</strong></div>
                  <div>Location: <strong style={{ color: '#0F172A' }}>{currentDemo.lost.location}</strong></div>
                </div>
              </div>

              {/* Match Score Results Column */}
              <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                <div style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                  border: '3px solid #2563EB',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  boxShadow: '0 4px 20px rgba(37, 99, 235, 0.2)'
                }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#2563EB' }}>{currentDemo.matchScore}%</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1E40AF' }}>CONFIDENCE</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '240px', margin: '0 auto', textAlign: 'left' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px', color: '#475569' }}>
                      <span>Text Similarity</span>
                      <strong style={{ color: '#2563EB' }}>{currentDemo.textScore}%</strong>
                    </div>
                    <div className="progress-bar-container" style={{ height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: `${currentDemo.textScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px', color: '#475569' }}>
                      <span>Visual CLIP Match</span>
                      <strong style={{ color: '#3B82F6' }}>{currentDemo.imageScore}%</strong>
                    </div>
                    <div className="progress-bar-container" style={{ height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: `${currentDemo.imageScore}%`, background: '#3B82F6' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px', color: '#475569' }}>
                      <span>Color Feature Match</span>
                      <strong style={{ color: '#10b981' }}>{currentDemo.colorScore}%</strong>
                    </div>
                    <div className="progress-bar-container" style={{ height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: `${currentDemo.colorScore}%`, background: '#10b981' }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <Link to="/register" className="btn btn-sm btn-primary" style={{ padding: '8px 16px' }}>
                    Test With Your Own Item <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Found Item Card */}
              <div style={{ background: '#ECFDF5', borderRadius: '16px', padding: '20px', border: '1px solid #A7F3D0' }}>
                <span className="badge badge-found" style={{ marginBottom: '12px' }}>FOUND REPORT</span>
                <div style={{ height: '160px', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }}>
                  <img src={currentDemo.found.image} alt={currentDemo.found.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>{currentDemo.found.name}</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '6px 0 12px 0' }}>{currentDemo.found.desc}</p>
                <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>Category: <strong style={{ color: '#0F172A' }}>{currentDemo.found.category}</strong></div>
                  <div>Color: <strong style={{ color: '#0F172A' }}>{currentDemo.found.color}</strong></div>
                  <div>Location: <strong style={{ color: '#0F172A' }}>{currentDemo.found.location}</strong></div>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* ================= STATS SECTION ================= */}
        <section id="stats" style={{
          padding: '80px 24px',
          maxWidth: '1280px',
          margin: '0 auto',
          borderTop: '1px solid #E2E8F0'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            textAlign: 'center'
          }}>
            <div className="glass-panel" style={{ padding: '32px 20px' }}>
              <div style={{ fontSize: '2.6rem', fontWeight: 800, color: '#2563EB' }}>10,000+</div>
              <div style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '6px', fontWeight: 500 }}>Items Processed</div>
            </div>
            <div className="glass-panel" style={{ padding: '32px 20px' }}>
              <div style={{ fontSize: '2.6rem', fontWeight: 800, color: '#10B981' }}>8,500+</div>
              <div style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '6px', fontWeight: 500 }}>Items Reunited</div>
            </div>
            <div className="glass-panel" style={{ padding: '32px 20px' }}>
              <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#3B82F6' }}>94.2%</div>
              <div style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '6px', fontWeight: 500 }}>Precision Accuracy</div>
            </div>
            <div className="glass-panel" style={{ padding: '32px 20px' }}>
              <div style={{ fontSize: '2.6rem', fontWeight: 800, color: '#2563EB' }}>&lt; 2 Mins</div>
              <div style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '6px', fontWeight: 500 }}>Average Match Speed</div>
            </div>
          </div>
        </section>


        {/* ================= CTA BANNER ================= */}
        <section style={{
          padding: '80px 24px',
          maxWidth: '1280px',
          margin: '0 auto'
        }}>
          <div className="glass-panel" style={{
            padding: '56px 36px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: '1px solid #BFDBFE',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '14px', color: '#0F172A' }}>
              Ready To Recover Your Lost Belongings?
            </h2>
            <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: '580px', margin: '0 auto 32px auto' }}>
              Join thousands of students and users using FindBack AI to locate lost backpacks, electronics, keys, and valuables.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.05rem', fontWeight: 700 }}>
                Create Free Account
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '1.05rem', fontWeight: 600 }}>
                Sign In To Dashboard
              </Link>
            </div>
          </div>
        </section>


        {/* ================= FOOTER ================= */}
        <footer style={{
          borderTop: '1px solid #E2E8F0',
          padding: '40px 24px',
          background: '#FFFFFF',
          color: '#64748B',
          fontSize: '0.85rem'
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>FindBack.AI</span>
              <p style={{ marginTop: '4px' }}>Neural Lost & Found Matching Engine © 2026</p>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontWeight: 500 }}>
              <span>FastAPI</span> •
              <span>PyTorch</span> •
              <span>SentenceTransformers</span> •
              <span>CLIP</span> •
              <span>React</span> •
              <span>Vite</span>
            </div>
          </div>
        </footer>

      </div>
    );
  }

  // If user IS logged in, render existing Item Explorer dashboard
  const itemsToDisplay = activeTab === 'lost' ? lostItems : foundItems;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Hero Banner for Logged In User */}
      <div className="glass-panel" style={{
        padding: '36px',
        marginBottom: '32px',
        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #BFDBFE'
      }}>
        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#FFFFFF',
            border: '1px solid #93C5FD',
            padding: '4px 12px',
            borderRadius: '999px',
            color: '#1E40AF',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '16px'
          }}>
            <Sparkles size={14} color="#2563EB" /> Multi-Modal Neural Matching Engine Active
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '12px', color: '#0F172A' }}>
            Welcome Back, {user.full_name}! <br />
            <span style={{
              background: 'linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Explore Campus Lost & Found
            </span>
          </h1>
          <p style={{ color: '#475569', fontSize: '1rem', marginBottom: '24px' }}>
            Post lost or found items with text details, brand, color, location, and photos. Our automated AI engine continuously computes match scores.
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/report-lost" className="btn btn-primary" style={{ padding: '10px 20px' }}>
              <AlertCircle size={18} /> Report Lost Item
            </Link>
            <Link to="/report-found" className="btn btn-secondary" style={{ padding: '10px 20px', color: '#059669', borderColor: '#A7F3D0' }}>
              <PlusCircle size={18} /> Report Found Item
            </Link>
            <Link to="/ai-matches" className="btn btn-secondary" style={{ padding: '10px 20px' }}>
              <Sparkles size={18} color="#2563EB" /> View AI Matches
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '28px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#2563EB', fontWeight: 700, fontSize: '0.9rem' }}>
          <Filter size={16} /> Search & Filter Reports
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: '4px' }}>Category</label>
            <select className="form-control" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: '100%' }}>
              <option value="">All Categories</option>
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

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: '4px' }}>Color</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Black, Blue"
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: '4px' }}>Location</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Library, Lab"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: '4px' }}>Status</label>
            <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%' }}>
              <option value="active">Active Only</option>
              <option value="matched">Matched</option>
              <option value="returned">Returned</option>
              <option value="all">All Statuses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('lost')}
            className={`btn ${activeTab === 'lost' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '10px 20px', borderRadius: '12px' }}
          >
            <AlertCircle size={16} /> Lost Reports ({lostItems.length})
          </button>
          <button
            onClick={() => setActiveTab('found')}
            className={`btn ${activeTab === 'found' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '10px 20px', borderRadius: '12px' }}
          >
            <PlusCircle size={16} /> Found Reports ({foundItems.length})
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          <p>Loading items...</p>
        </div>
      ) : itemsToDisplay.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B', background: '#FFFFFF' }}>
          <Search size={40} style={{ opacity: 0.5, marginBottom: '12px', color: '#2563EB' }} />
          <h3 style={{ color: '#0F172A' }}>No {activeTab} reports found matching filters</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Try clearing your filters or create a new report.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {itemsToDisplay.map((item) => (
            <div key={item.id} className="glass-panel glass-panel-hover" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
              {/* Item Image */}
              <div style={{
                height: '180px',
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
                    <ImageIcon size={36} style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '0.75rem' }}>No photo attached</p>
                  </div>
                )}
                <span className={`badge ${activeTab === 'lost' ? 'badge-lost' : 'badge-found'}`} style={{ position: 'absolute', top: '12px', left: '12px' }}>
                  {activeTab === 'lost' ? 'LOST' : 'FOUND'}
                </span>
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: item.status === 'returned' ? '#10B981' : item.status === 'matched' ? '#F59E0B' : '#64748B',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase'
                }}>
                  {item.status}
                </span>
              </div>

              {/* Item Content */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>{item.name}</h3>
                    {item.brand && (
                      <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700, background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: '4px' }}>
                        {item.brand}
                      </span>
                    )}
                  </div>

                  <p style={{ color: '#64748B', fontSize: '0.88rem', marginBottom: '16px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: '#475569', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Tag size={14} color="#2563EB" />
                      <span>{item.category} • Color: <strong style={{ color: '#0F172A' }}>{item.color}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="#3B82F6" />
                      <span>{item.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#10B981" />
                      <span>{item.date_lost || item.date_found}</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  borderTop: '1px solid #E2E8F0',
                  paddingTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem',
                  color: '#64748B'
                }}>
                  <span>Reported by: <strong style={{ color: '#0F172A' }}>{item.user_name}</strong></span>
                  <Link to="/ai-matches" className="btn btn-sm btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                    Check Matches
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

