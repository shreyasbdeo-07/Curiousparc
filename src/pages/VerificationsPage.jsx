import { useState } from 'react';
import Topbar from '../components/Topbar';
import { employees, interns, rejectionReasons, companyInfo } from '../data/mockData';
import { useApp } from '../context/AppContext';

// ── Helpers ───────────────────────────────────────────────────────────────────
function findRecord(req) {
  if (!req.matchedRecord) return null;
  if (req.matchedRecord.type === 'intern') return interns.find(i => i.id === req.matchedRecord.id);
  if (req.matchedRecord.type === 'employee') return employees.find(e => e.id === req.matchedRecord.id);
  return null;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function buildApiResponse(req, decision, correctedData, rejectionReason, notes) {
  const base = { candidate_id: req.candidateId, company_id: companyInfo.id };
  if (decision === 'verified') {
    return {
      verification_status: 'VERIFIED',
      ...base,
      role: req.claimedRole,
      department: req.claimedDepartment,
      start_date: req.claimedStartDate,
      end_date: req.claimedEndDate,
      employment_type: req.claimedEmploymentType,
      verified_at: new Date().toISOString(),
      verified_by: companyInfo.id,
      verification_method: 'hr_portal_review',
    };
  }
  if (decision === 'verified_with_correction') {
    return {
      verification_status: 'VERIFIED_WITH_CORRECTION',
      ...base,
      corrected_role: correctedData.role,
      corrected_department: correctedData.department,
      corrected_start_date: correctedData.startDate,
      corrected_end_date: correctedData.endDate,
      corrected_employment_type: correctedData.employmentType,
      correction_notes: notes,
      verified_at: new Date().toISOString(),
      verified_by: companyInfo.id,
    };
  }
  return {
    verification_status: 'REJECTED',
    ...base,
    reason: rejectionReasons.find(r => r.value === rejectionReason)?.label ?? rejectionReason,
    rejected_at: new Date().toISOString(),
    reviewed_by: companyInfo.id,
  };
}

// ── API Response Viewer ───────────────────────────────────────────────────────
function ApiResponseViewer({ data }) {
  const json = JSON.stringify(data, null, 2);
  // Colour-coded JSON render
  const lines = json.split('\n').map((line, i) => {
    const keyMatch = line.match(/^(\s*)"([^"]+)":/);
    if (keyMatch) {
      const rest = line.slice(keyMatch[0].length);
      return (
        <div key={i}>
          <span>{keyMatch[1]}</span>
          <span className="key">"{keyMatch[2]}"</span>
          <span>: </span>
          <span className={rest.trim().startsWith('"') ? 'val-string' : rest.trim() === 'true,' || rest.trim() === 'true' ? 'val-bool-true' : rest.trim() === 'false,' || rest.trim() === 'false' ? 'val-bool-false' : 'val-num'}>
            {rest.trim()}
          </span>
        </div>
      );
    }
    return <div key={i}>{line}</div>;
  });
  return <div className="api-panel">{lines}</div>;
}

// ── Compare Row ───────────────────────────────────────────────────────────────
function CmpRow({ label, claimed, record }) {
  const match = record !== null && claimed?.toLowerCase() === record?.toLowerCase();
  const noRecord = record === null || record === undefined;
  return (
    <tr>
      <td style={{ fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.875rem' }}>{label}</td>
      <td style={{ fontSize: '0.875rem' }}>{claimed ?? '—'}</td>
      <td style={{ fontSize: '0.875rem', color: noRecord ? 'var(--gray-400)' : undefined }}>{noRecord ? 'N/A' : record}</td>
      <td style={{ textAlign: 'center', fontSize: '1.125rem' }}>
        {noRecord ? <span style={{ color: 'var(--gray-300)' }}>—</span>
          : match ? <span className="compare-match">✓</span>
            : <span className="compare-diff">≠</span>}
      </td>
    </tr>
  );
}

// ── Review Modal (full detail + decision) ─────────────────────────────────────
function ReviewModal({ req, onClose, onDecide }) {
  const record = findRecord(req);
  const [step, setStep] = useState('review'); // review | decide | confirm | result
  const [decision, setDecision] = useState('');
  const [corrected, setCorrected] = useState({
    role: record?.role ?? req.claimedRole,
    department: record?.department ?? req.claimedDepartment,
    startDate: record?.startDate ?? req.claimedStartDate,
    endDate: record?.endDate ?? req.claimedEndDate,
    employmentType: record?.employmentType ?? req.claimedEmploymentType,
  });
  const [rejReason, setRejReason] = useState('no_record');
  const [rejNotes, setRejNotes] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  const setC = (f) => (e) => setCorrected(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    const resp = buildApiResponse(req, decision, corrected, rejReason, correctionNotes);
    setApiResponse(resp);
    onDecide(req.id, decision, corrected, correctionNotes, rejReason, resp);
    setSubmitting(false);
    setStep('result');
  };

  const statusLabel = {
    verified: { text: '✅ Employment Verified', color: 'var(--success-600)', bg: 'var(--success-50)' },
    verified_with_correction: { text: '⚠️ Verified with Correction', color: 'var(--warning-700)', bg: 'var(--warning-50)' },
    rejected: { text: '❌ Employment Rejected', color: 'var(--error-600)', bg: 'var(--error-50)' },
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && step !== 'result' && onClose()}>
      <div className="modal modal-xl">
        <div className="modal-hd">
          <span className="modal-title">
            {step === 'review' && `Review Verification Request — ${req.candidateName}`}
            {step === 'decide' && `Make Decision — ${req.candidateName}`}
            {step === 'result' && 'Verification Decision Submitted'}
          </span>
          {step !== 'result' && <button className="modal-close" onClick={onClose}>×</button>}
        </div>

        {/* ── STEP: REVIEW ─────────────────────────────── */}
        {step === 'review' && (
          <>
            <div className="modal-body">
              {/* Header info strip */}
              <div className="grid-3 mb-5" style={{ gap: '0.75rem' }}>
                <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--r-lg)', padding: '0.875rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Request Source</div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-700)' }}>EduVerify</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Request ID: {req.eduverifyRequestId}</div>
                </div>
                <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--r-lg)', padding: '0.875rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Candidate Consent</div>
                  <div style={{ fontWeight: 700, color: req.candidateConsent ? 'var(--success-600)' : 'var(--error-600)' }}>
                    {req.candidateConsent ? '✅ Granted' : '❌ Not Granted'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Candidate ID: {req.candidateId}</div>
                </div>
                <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--r-lg)', padding: '0.875rem' }}>
                  <div style={{ fontSize: '0.75rex', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Received</div>
                  <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{new Date(req.receivedAt).toLocaleDateString('en-IN')}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{new Date(req.receivedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>

              {/* Candidate info */}
              <div className="section-label">Candidate Information</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--r-lg)', marginBottom: '1.25rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-500), var(--violet-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                  {req.candidateName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-900)' }}>{req.candidateName}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{req.candidateEmail}</div>
                </div>
              </div>

              {/* Claim vs Record comparison */}
              <div className="section-label">Claim vs. Company Record</div>
              <div className={`match-box mb-5 ${record ? 'found' : 'not-found'}`}>
                <div className="match-box-title">
                  {record ? `✅ Internal record found — ${record.id} (${req.matchedRecord?.type === 'intern' ? 'Intern' : 'Employee'})` : '❌ No matching internal record found for this candidate'}
                </div>
                {!record && <div style={{ fontSize: '0.875rem', color: 'var(--error-600)' }}>No record was found in our HR database matching this candidate's name, email, or claimed role/period.</div>}
              </div>

              <div className="table-wrap mb-5">
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th style={{ width: 140 }}>Field</th>
                      <th>Candidate's Claim</th>
                      <th>Our HR Record</th>
                      <th style={{ width: 80, textAlign: 'center' }}>Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    <CmpRow label="Full Name" claimed={req.candidateName} record={record?.name ?? null} />
                    <CmpRow label="Role" claimed={req.claimedRole} record={record?.role ?? null} />
                    <CmpRow label="Department" claimed={req.claimedDepartment} record={record?.department ?? null} />
                    <CmpRow label="Start Date" claimed={fmtDate(req.claimedStartDate)} record={record ? fmtDate(record.startDate) : null} />
                    <CmpRow label="End Date" claimed={fmtDate(req.claimedEndDate)} record={record ? fmtDate(record.endDate) : null} />
                    <CmpRow label="Employment Type" claimed={req.claimedEmploymentType} record={record?.employmentType ?? null} />
                  </tbody>
                </table>
              </div>

              {req.claimedDescription && (
                <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--r-lg)', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Candidate's Description</div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', lineHeight: 1.6 }}>{req.claimedDescription}</p>
                </div>
              )}

              {record && (
                <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', borderRadius: 'var(--r-lg)', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Internal Record Details ({req.matchedRecord?.type === 'intern' ? 'Intern' : 'Employee'})
                  </div>
                  <div className="grid-2" style={{ gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                    {req.matchedRecord?.type === 'intern' && record.supervisor && <div><strong>Supervisor:</strong> {record.supervisor}</div>}
                    {req.matchedRecord?.type === 'intern' && record.project && <div><strong>Project:</strong> {record.project}</div>}
                    {req.matchedRecord?.type === 'intern' && record.performanceRating && <div><strong>Performance:</strong> {record.performanceRating}</div>}
                    {req.matchedRecord?.type === 'intern' && <div><strong>Letter Issued:</strong> {record.letterIssued ? 'Yes' : 'No'}</div>}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-ft" style={{ justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setStep('decide')}>
                Proceed to Decision →
              </button>
            </div>
          </>
        )}

        {/* ── STEP: DECIDE ─────────────────────────────── */}
        {step === 'decide' && (
          <>
            <div className="modal-body">
              <div className="alert alert-info mb-5">
                <span className="alert-icon">ℹ️</span>
                <div>
                  <strong>You are deciding on: {req.candidateName}</strong>
                  <div style={{ marginTop: 2, fontSize: '0.8125rem' }}>Claimed: {req.claimedRole} · {fmtDate(req.claimedStartDate)} to {fmtDate(req.claimedEndDate)}</div>
                </div>
              </div>

              {/* Decision cards */}
              <div className="section-label">Select Your Decision</div>
              <div className="decision-row mb-5">
                <div className={`decision-card${decision === 'verified' ? ' sel-confirm' : ''}`} onClick={() => setDecision('verified')}>
                  <div className="decision-icon">✅</div>
                  <div className="decision-label">Confirm</div>
                  <div className="decision-desc">All claimed details match our records exactly</div>
                </div>
                <div className={`decision-card${decision === 'verified_with_correction' ? ' sel-correct' : ''}`} onClick={() => setDecision('verified_with_correction')}>
                  <div className="decision-icon">⚠️</div>
                  <div className="decision-label">Confirm with Correction</div>
                  <div className="decision-desc">Employment confirmed but some details need correction</div>
                </div>
                <div className={`decision-card${decision === 'rejected' ? ' sel-reject' : ''}`} onClick={() => setDecision('rejected')}>
                  <div className="decision-icon">❌</div>
                  <div className="decision-label">Reject</div>
                  <div className="decision-desc">This person did not work at our company under these terms</div>
                </div>
              </div>

              {/* Confirm with Correction form */}
              {decision === 'verified_with_correction' && (
                <div style={{ border: '1.5px solid var(--warning-200)', borderRadius: 'var(--r-lg)', padding: '1.25rem', background: 'var(--warning-50)', marginBottom: '1.25rem' }}>
                  <div className="section-label" style={{ color: 'var(--warning-700)' }}>Corrected Employment Details</div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Correct Role</label>
                      <input className="form-control" value={corrected.role} onChange={setC('role')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Correct Department</label>
                      <input className="form-control" value={corrected.department} onChange={setC('department')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Correct Start Date</label>
                      <input type="date" className="form-control" value={corrected.startDate} onChange={setC('startDate')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Correct End Date</label>
                      <input type="date" className="form-control" value={corrected.endDate} onChange={setC('endDate')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Employment Type</label>
                      <select className="form-control" value={corrected.employmentType} onChange={setC('employmentType')}>
                        <option>Internship</option>
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label form-label-req">Correction Notes</label>
                    <textarea className="form-control" rows={3} value={correctionNotes} onChange={e => setCorrectionNotes(e.target.value)} placeholder="Explain what was corrected and why..." />
                  </div>
                </div>
              )}

              {/* Rejection form */}
              {decision === 'rejected' && (
                <div style={{ border: '1.5px solid var(--error-200)', borderRadius: 'var(--r-lg)', padding: '1.25rem', background: 'var(--error-50)', marginBottom: '1.25rem' }}>
                  <div className="section-label" style={{ color: 'var(--error-700)' }}>Rejection Details</div>
                  <div className="form-group">
                    <label className="form-label form-label-req">Reason</label>
                    <select className="form-control" value={rejReason} onChange={e => setRejReason(e.target.value)}>
                      {rejectionReasons.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Additional Notes (optional)</label>
                    <textarea className="form-control" rows={2} value={rejNotes} onChange={e => setRejNotes(e.target.value)} placeholder="Any additional context for the rejection..." />
                  </div>
                </div>
              )}

              {/* API preview */}
              {decision && (
                <div>
                  <div className="section-label">API Response Preview (will be sent to EduVerify)</div>
                  <ApiResponseViewer data={buildApiResponse(req, decision, corrected, rejReason, correctionNotes)} />
                </div>
              )}
            </div>
            <div className="modal-ft" style={{ justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" onClick={() => setStep('review')}>← Back to Review</button>
              <button
                className={`btn ${decision === 'verified' ? 'btn-success' : decision === 'verified_with_correction' ? 'btn-warning' : decision === 'rejected' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleSubmit}
                disabled={!decision || submitting || (decision === 'verified_with_correction' && !correctionNotes)}
              >
                {submitting ? <><span className="spinner" /> Submitting…</> : 'Submit Decision →'}
              </button>
            </div>
          </>
        )}

        {/* ── STEP: RESULT ─────────────────────────────── */}
        {step === 'result' && (
          <>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                {decision === 'verified' ? '✅' : decision === 'verified_with_correction' ? '⚠️' : '❌'}
              </div>
              <div style={{ background: statusLabel[decision]?.bg, color: statusLabel[decision]?.color, display: 'inline-block', padding: '0.5rem 1.5rem', borderRadius: 'var(--r-full)', fontWeight: 700, fontSize: '1.0625rem', marginBottom: '1rem' }}>
                {statusLabel[decision]?.text}
              </div>
              <p style={{ color: 'var(--gray-600)', maxWidth: 460, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                {decision === 'verified' && `You have confirmed the employment claim for ${req.candidateName}. The verification result has been sent to EduVerify and will be reflected on the candidate's evidence profile.`}
                {decision === 'verified_with_correction' && `You have confirmed employment for ${req.candidateName} with corrections. The corrected details have been sent to EduVerify.`}
                {decision === 'rejected' && `You have rejected the employment claim for ${req.candidateName}. The rejection has been sent to EduVerify.`}
              </p>

              <div style={{ textAlign: 'left', maxWidth: 560, margin: '0 auto' }}>
                <div className="section-label">API Response Sent to EduVerify</div>
                {apiResponse && <ApiResponseViewer data={apiResponse} />}
              </div>

              <div className="alert alert-success mt-5" style={{ maxWidth: 560, margin: '1.25rem auto 0', textAlign: 'left' }}>
                <span className="alert-icon">📡</span>
                <div>
                  <strong>Response transmitted to EduVerify</strong>
                  <div style={{ fontSize: '0.8125rem', marginTop: 2 }}>
                    Timestamp: {new Date().toLocaleString('en-IN')} · Verified by: Kavitha Reddy
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-ft">
              <button className="btn btn-primary" onClick={onClose}>Close & Return</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Verification Requests Page ────────────────────────────────────────────────
export default function VerificationsPage({ requests, onUpdate }) {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState('pending');
  const [reviewReq, setReviewReq] = useState(null);
  const [search, setSearch] = useState('');

  const pending = requests.filter(r => r.status === 'pending');
  const completed = requests.filter(r => r.status !== 'pending');

  const displayed = (activeTab === 'pending' ? pending : completed).filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.candidateName.toLowerCase().includes(q) ||
      r.claimedRole.toLowerCase().includes(q) ||
      r.candidateId.toLowerCase().includes(q);
  });

  const handleDecide = (id, decision, correctedData, correctionNotes, rejReason, apiResp) => {
    onUpdate(prev => prev.map(r => r.id !== id ? r : {
      ...r,
      status: decision,
      decisionBy: 'Kavitha Reddy',
      decidedAt: new Date().toISOString(),
      verifiedData: decision !== 'rejected' ? correctedData : null,
      correctionNotes: decision === 'verified_with_correction' ? correctionNotes : null,
      rejectionReason: decision === 'rejected' ? rejReason : null,
      apiResponse: apiResp,
    }));
    const msgs = {
      verified: `Employment for ${reviewReq?.candidateName} verified ✅`,
      verified_with_correction: `Verified with corrections ⚠️`,
      rejected: `Employment claim rejected ❌`,
    };
    addToast(msgs[decision] ?? 'Decision submitted.', decision === 'verified' ? 'success' : decision === 'rejected' ? 'error' : 'warning');
    setReviewReq(null);
  };

  const statusConfig = {
    pending: { label: '⏳ Pending', badge: 'badge-pending' },
    verified: { label: '✅ Verified', badge: 'badge-verified' },
    verified_with_correction: { label: '⚠️ Verified w/ Correction', badge: 'badge-correction' },
    rejected: { label: '❌ Rejected', badge: 'badge-rejected' },
  };

  const priorityIcon = { high: '🔴', normal: '🟡', low: '🟢' };

  return (
    <>
      <Topbar title="Verification Requests" subtitle="Incoming employment verification requests from EduVerify — review and decide." />
      <main className="page anim-fade">
        <div className="ph-row ph">
          <div>
            <h2>Verification Requests</h2>
            <p>Review incoming requests from EduVerify and submit your decision.</p>
          </div>
        </div>

        <div className="alert alert-info mb-5">
          <span className="alert-icon">📡</span>
          <div>
            <strong>How this works:</strong> When a candidate claims prior employment at ABC Technologies on EduVerify, a verification request is sent to this portal. Your decision (Confirm / Correct / Reject) is transmitted back to EduVerify via API and updates the candidate's evidence profile in real-time.
          </div>
        </div>

        <div className="tabs">
          <div className={`tab${activeTab === 'pending' ? ' active' : ''}`} onClick={() => setActiveTab('pending')}>
            ⏳ Pending
            {pending.length > 0 && (
              <span style={{ background: 'var(--error-500)', color: 'white', borderRadius: 'var(--r-full)', padding: '1px 7px', fontSize: '0.75rem', fontWeight: 700, marginLeft: 4 }}>{pending.length}</span>
            )}
          </div>
          <div className={`tab${activeTab === 'completed' ? ' active' : ''}`} onClick={() => setActiveTab('completed')}>
            ✅ Completed
            <span style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', borderRadius: 'var(--r-full)', padding: '1px 7px', fontSize: '0.75rem', fontWeight: 600, marginLeft: 4 }}>{completed.length}</span>
          </div>
        </div>

        <div className="sf-bar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input placeholder="Search by name, role, or ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {displayed.length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="empty-icon">🛡️</div>
              <h3>{activeTab === 'pending' ? 'No pending requests' : 'No completed requests'}</h3>
              <p>{activeTab === 'pending' ? "You're all caught up!" : "Completed verifications will appear here."}</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {displayed.map(req => (
              <div
                key={req.id}
                className="card"
                style={{
                  borderLeft: `4px solid ${req.status === 'pending' ? 'var(--warning-500)' : req.status === 'verified' ? 'var(--success-500)' : req.status === 'rejected' ? 'var(--error-500)' : 'var(--info-500)'}`,
                  cursor: 'pointer',
                }}
                onClick={() => req.status === 'pending' && setReviewReq(req)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-900)' }}>{req.candidateName}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontFamily: 'Courier New' }}>{req.candidateId}</span>
                      {req.status === 'pending' && <span style={{ fontSize: '0.75rem' }}>{priorityIcon[req.priority]} {req.priority}</span>}
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--gray-700)', marginBottom: '0.625rem' }}>
                      <span><strong>Role:</strong> {req.claimedRole}</span>
                      <span><strong>Dept:</strong> {req.claimedDepartment}</span>
                      <span><strong>Period:</strong> {fmtDate(req.claimedStartDate)} – {fmtDate(req.claimedEndDate)}</span>
                      <span><strong>Type:</strong> {req.claimedEmploymentType}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                      <span>📥 Received: {new Date(req.receivedAt).toLocaleDateString('en-IN')}</span>
                      <span>🆔 {req.eduverifyRequestId}</span>
                      {req.matchedRecord ? (
                        <span style={{ color: 'var(--success-600)', fontWeight: 600 }}>✅ Internal record found ({req.matchedRecord.type === 'intern' ? 'Intern' : 'Employee'} {req.matchedRecord.id})</span>
                      ) : (
                        <span style={{ color: 'var(--error-600)', fontWeight: 600 }}>❌ No internal record</span>
                      )}
                    </div>

                    {req.status !== 'pending' && req.correctionNotes && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--warning-700)', background: 'var(--warning-50)', padding: '0.375rem 0.75rem', borderRadius: 'var(--r-sm)', display: 'inline-block' }}>
                        ✏️ {req.correctionNotes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                    <span className={`badge ${statusConfig[req.status]?.badge}`}>{statusConfig[req.status]?.label}</span>
                    {req.decidedAt && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                        Decided: {new Date(req.decidedAt).toLocaleDateString('en-IN')}
                      </span>
                    )}
                    {req.status === 'pending' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={e => { e.stopPropagation(); setReviewReq(req); }}
                      >
                        🔍 Review &amp; Decide
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {reviewReq && (
          <ReviewModal
            req={reviewReq}
            onClose={() => setReviewReq(null)}
            onDecide={handleDecide}
          />
        )}
      </main>
    </>
  );
}
