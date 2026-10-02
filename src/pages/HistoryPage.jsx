import { useState } from 'react';
import Topbar from '../components/Topbar';

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ApiResponseViewer({ data }) {
  if (!data) return null;
  const json = JSON.stringify(data, null, 2);
  return (
    <div className="api-panel" style={{ fontSize: '0.75rem', maxHeight: 200, overflow: 'auto' }}>
      {json.split('\n').map((line, i) => {
        const keyMatch = line.match(/^(\s*)"([^"]+)":/);
        if (keyMatch) {
          const rest = line.slice(keyMatch[0].length);
          return (
            <div key={i}>
              <span>{keyMatch[1]}</span>
              <span className="key">"{keyMatch[2]}"</span>
              <span>: </span>
              <span className={rest.trim().startsWith('"') ? 'val-string' : 'val-num'}>{rest.trim()}</span>
            </div>
          );
        }
        return <div key={i}>{line}</div>;
      })}
    </div>
  );
}

const statusConfig = {
  pending: { label: '⏳ Pending', badge: 'badge-pending' },
  verified: { label: '✅ Verified', badge: 'badge-verified' },
  verified_with_correction: { label: '⚠️ Verified w/ Correction', badge: 'badge-correction' },
  rejected: { label: '❌ Rejected', badge: 'badge-rejected' },
};

export default function HistoryPage({ requests }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const completed = requests.filter(r => r.status !== 'pending');

  const filtered = completed.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.candidateName.toLowerCase().includes(q) && !r.claimedRole.toLowerCase().includes(q) && !r.candidateId.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      <Topbar title="Verification History" subtitle="Complete audit trail of all employment verification decisions." />
      <main className="page anim-fade">
        <div className="ph-row ph">
          <div>
            <h2>Verification History</h2>
            <p>{completed.length} total decisions made</p>
          </div>
        </div>

        <div className="sf-bar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input placeholder="Search by name, role, or ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="f-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Decisions</option>
            <option value="verified">Verified</option>
            <option value="verified_with_correction">Verified w/ Correction</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="empty-icon">🕑</div>
              <h3>No history found</h3>
              <p>Completed verification decisions will appear here.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="card mb-4">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Claimed Role</th>
                      <th>Period</th>
                      <th>Received</th>
                      <th>Decided On</th>
                      <th>Decided By</th>
                      <th>Decision</th>
                      <th>API Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(req => (
                      <>
                        <tr
                          key={req.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                        >
                          <td>
                            <div className="table-name">{req.candidateName}</div>
                            <div className="table-sub" style={{ fontFamily: 'Courier New', fontSize: '0.75rem' }}>{req.candidateId}</div>
                          </td>
                          <td>{req.claimedRole}</td>
                          <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                            {fmtDate(req.claimedStartDate)}<br />
                            <span style={{ color: 'var(--gray-400)' }}>→ {fmtDate(req.claimedEndDate)}</span>
                          </td>
                          <td style={{ fontSize: '0.8125rem' }}>{fmtDate(req.receivedAt)}</td>
                          <td style={{ fontSize: '0.8125rem' }}>{fmtDate(req.decidedAt)}</td>
                          <td style={{ fontSize: '0.875rem' }}>{req.decisionBy}</td>
                          <td>
                            <span className={`badge ${statusConfig[req.status]?.badge}`}>
                              {statusConfig[req.status]?.label}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={e => { e.stopPropagation(); setExpandedId(expandedId === req.id ? null : req.id); }}
                            >
                              {expandedId === req.id ? '▲ Hide' : '▼ View'}
                            </button>
                          </td>
                        </tr>
                        {expandedId === req.id && (
                          <tr key={`${req.id}-expand`}>
                            <td colSpan={8} style={{ background: 'var(--gray-50)', padding: '1rem 1.5rem' }}>
                              <div className="grid-2" style={{ gap: '1rem' }}>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--gray-600)', marginBottom: '0.375rem' }}>Decision Details</div>
                                  {req.correctionNotes && (
                                    <div style={{ fontSize: '0.875rem', color: 'var(--warning-700)', marginBottom: '0.5rem' }}>
                                      <strong>Correction Notes:</strong> {req.correctionNotes}
                                    </div>
                                  )}
                                  {req.rejectionReason && (
                                    <div style={{ fontSize: '0.875rem', color: 'var(--error-600)', marginBottom: '0.5rem' }}>
                                      <strong>Rejection Reason:</strong> {req.rejectionReason.replace(/_/g, ' ')}
                                    </div>
                                  )}
                                  {req.verifiedData && (
                                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                      <strong>Verified as:</strong> {req.verifiedData.role} · {fmtDate(req.verifiedData.startDate)} → {fmtDate(req.verifiedData.endDate)}
                                    </div>
                                  )}
                                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.5rem' }}>
                                    EduVerify Request ID: {req.eduverifyRequestId}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--gray-600)', marginBottom: '0.375rem' }}>API Response (sent to EduVerify)</div>
                                  <ApiResponseViewer data={req.apiResponse} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
              {filtered.length} of {completed.length} records shown · Click any row to expand API response
            </p>
          </>
        )}
      </main>
    </>
  );
}
