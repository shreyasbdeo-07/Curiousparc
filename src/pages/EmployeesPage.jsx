import { useState } from 'react';
import Topbar from '../components/Topbar';
import { employees } from '../data/mockData';

function fmtDate(d) {
  if (!d) return 'Present';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const departments = [...new Set(employees.map(e => e.department))];

  const filtered = employees.filter(e => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    if (filterDept !== 'all' && e.department !== filterDept) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!e.name.toLowerCase().includes(q) && !e.role.toLowerCase().includes(q) && !e.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      <Topbar title="Employee Records" subtitle="Internal full-time employee database — authoritative source for employment verification." />
      <main className="page anim-fade">
        <div className="ph-row ph">
          <div>
            <h2>Full-Time Employees</h2>
            <p>{employees.filter(e => e.status === 'active').length} active · {employees.filter(e => e.status === 'separated').length} separated</p>
          </div>
        </div>

        <div className="alert alert-info mb-5">
          <span className="alert-icon">🔒</span>
          <div>
            <strong>Authoritative HR Database</strong> — These records are the source of truth used to verify employment claims from EduVerify. This data is owned by ABC Technologies and is NOT shared with EduVerify directly.
          </div>
        </div>

        <div className="sf-bar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input placeholder="Search by name, role, or employee ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="f-select" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="f-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="separated">Separated</option>
          </select>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Employment Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <span style={{ fontFamily: 'Courier New', fontSize: '0.8125rem', color: 'var(--primary-600)', fontWeight: 600 }}>{emp.id}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-500), var(--violet-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="table-name">{emp.name}</div>
                          <div className="table-sub">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{emp.role}</td>
                    <td>{emp.department}</td>
                    <td>{emp.employmentType}</td>
                    <td>{fmtDate(emp.startDate)}</td>
                    <td>{fmtDate(emp.endDate)}</td>
                    <td>
                      <span className={`badge badge-${emp.status}`}>
                        {emp.status === 'active' ? 'Active' : 'Separated'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>No records match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.75rem' }}>
          Showing {filtered.length} of {employees.length} records · Data is confidential and used only for employment verification purposes.
        </p>
      </main>
    </>
  );
}
