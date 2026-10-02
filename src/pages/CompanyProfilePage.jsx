import { useState } from 'react';
import Topbar from '../components/Topbar';
import { companyInfo } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function CompanyProfilePage() {
  const { addToast } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...companyInfo });
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    setEditing(false);
    addToast('Company profile updated ✅', 'success');
  };

  return (
    <>
      <Topbar title="Company Profile" subtitle="ABC Technologies — Verification portal configuration and API settings." />
      <main className="page anim-fade">
        <div className="ph-row ph">
          <div>
            <h2>Company Profile</h2>
            <p>Information used in EduVerify API responses and verification records.</p>
          </div>
          {!editing && <button className="btn btn-primary" onClick={() => setEditing(true)}>✏️ Edit Profile</button>}
        </div>

        {/* Hero */}
        <div className="company-hero mb-6">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--r-xl)', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                AT
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>{form.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>{form.industry}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginTop: 4 }}>📍 {form.location}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>
              <span>🆔 Company ID: <strong style={{ color: 'white' }}>{form.id}</strong></span>
              <span>📅 Founded: <strong style={{ color: 'white' }}>{form.founded}</strong></span>
              <span>👥 Size: <strong style={{ color: 'white' }}>{form.size}</strong></span>
            </div>
          </div>
        </div>

        <div className="two-col">
          <div>
            {/* API / Server Status */}
            <div className="card mb-5">
              <div className="card-hd">
                <div className="card-title">EduVerify API Configuration</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  ['API Endpoint', form.apiEndpoint, true],
                  ['Company ID', form.id, true],
                  ['Verification Key', '●●●●●●●●●●●●●●●●', false],
                  ['API Version', 'v1', false],
                ].map(([label, val, mono]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: 'var(--r-lg)', background: 'var(--gray-50)', border: '1px solid var(--gray-100)' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)', fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-900)', fontFamily: mono ? 'Courier New' : undefined }}>{val}</span>
                  </div>
                ))}

                {/* API Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: 'var(--r-lg)', background: 'var(--success-50)', border: '1px solid var(--success-100)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--success-700)' }}>API Status</span>
                  <div className="api-pill">
                    <div className="api-pill-dot" />
                    Connected · EduVerify API Active
                  </div>
                </div>
              </div>

              {/* Sample API payload */}
              <div style={{ marginTop: '1.25rem' }}>
                <div className="section-label">Sample Verification Request Payload</div>
                <div className="api-panel">
                  <div><span className="val-string">POST</span> {form.apiEndpoint}/verification/request</div>
                  <div>&nbsp;</div>
                  <div>{'{'}</div>
                  <div>&nbsp;&nbsp;<span className="key">"candidate_id"</span>: <span className="val-string">"EV-10243"</span>,</div>
                  <div>&nbsp;&nbsp;<span className="key">"candidate_name"</span>: <span className="val-string">"Rahul Sharma"</span>,</div>
                  <div>&nbsp;&nbsp;<span className="key">"claimed_role"</span>: <span className="val-string">"Software Intern"</span>,</div>
                  <div>&nbsp;&nbsp;<span className="key">"claimed_start"</span>: <span className="val-string">"2025-06-01"</span>,</div>
                  <div>&nbsp;&nbsp;<span className="key">"claimed_end"</span>: <span className="val-string">"2025-08-31"</span>,</div>
                  <div>&nbsp;&nbsp;<span className="key">"consent"</span>: <span className="val-bool-true">true</span></div>
                  <div>{'}'}</div>
                </div>
              </div>
            </div>

            {/* Edit form */}
            {editing ? (
              <div className="card">
                <div className="card-title mb-4">Edit Company Details</div>
                <form onSubmit={handleSave}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Company Name</label>
                      <input className="form-control" value={form.name} onChange={set('name')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Industry</label>
                      <input className="form-control" value={form.industry} onChange={set('industry')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input className="form-control" value={form.location} onChange={set('location')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company Size</label>
                      <input className="form-control" value={form.size} onChange={set('size')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">HR Contact</label>
                      <input className="form-control" value={form.hrContact} onChange={set('hrContact')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">HR Email</label>
                      <input type="email" className="form-control" value={form.hrEmail} onChange={set('hrEmail')} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button type="submit" className="btn btn-primary">💾 Save</button>
                    <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setForm({ ...companyInfo }); }}>Cancel</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="card">
                <div className="card-title mb-4">Contact & Details</div>
                <div className="grid-2" style={{ gap: '0.75rem' }}>
                  {[
                    ['🏢', 'Industry', form.industry],
                    ['📍', 'Location', form.location],
                    ['👥', 'Size', form.size],
                    ['📅', 'Founded', form.founded],
                    ['👤', 'HR Contact', form.hrContact],
                    ['✉️', 'HR Email', form.hrEmail],
                    ['📞', 'HR Phone', form.hrPhone],
                    ['🌐', 'Website', form.website],
                    ['🆔', 'CIN', form.cin],
                  ].map(([icon, label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{icon} {label}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--gray-800)' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div>
            <div className="card mb-5">
              <div className="card-title mb-4">Verification Capabilities</div>
              {[
                ['✅', 'Employment Verification', true],
                ['✅', 'Internship Verification', true],
                ['✅', 'Correction Support', true],
                ['✅', 'Audit Trail', true],
                ['✅', 'API Response (structured JSON)', true],
                ['⬜', 'Background Check Integration', false],
                ['⬜', 'Digital Signature on Responses', false],
              ].map(([icon, label, active]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--r-md)', marginBottom: '0.375rem', background: active ? 'var(--success-50)' : 'var(--gray-50)' }}>
                  <span style={{ color: active ? 'var(--success-600)' : 'var(--gray-300)', fontWeight: 700 }}>{icon}</span>
                  <span style={{ fontSize: '0.875rem', color: active ? 'var(--success-700)' : 'var(--gray-400)', fontWeight: active ? 600 : 400 }}>{label}</span>
                </div>
              ))}
            </div>

            <div className="alert alert-info">
              <span className="alert-icon">🛡️</span>
              <div style={{ fontSize: '0.8125rem' }}>
                <strong>Data Ownership Boundary</strong><br />
                ABC Technologies owns: employee records, internship records, employment dates, roles, departments, internal verification history.<br /><br />
                EduVerify owns: candidate profiles, claims, evidence profiles, and hiring workflow.
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
