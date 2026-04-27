import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTransactions, addTransaction, deleteTransaction, getSummary } from '../api/transactions';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Rent', 'Transport', 'Shopping', 'Health', 'Education', 'Entertainment', 'Other']
};

const BUDGET_KEY = 'vaulttrack_budget';
const COLORS = ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [monthlyBudget, setMonthlyBudget] = useState(() => Number(localStorage.getItem(BUDGET_KEY)) || 0);
  const [budgetInput, setBudgetInput] = useState('');
  const [form, setForm] = useState({
    type: 'expense', amount: '', category: 'Food', description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const bg = {
    page: '#030712', nav: '#0f172a', card: '#0f172a', input: '#1e293b',
    border: '#1e293b', text: '#f1f5f9', muted: '#64748b', accent: '#7c3aed'
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [txRes, sumRes] = await Promise.all([getTransactions(), getSummary()]);
      setTransactions(txRes.data);
      setSummary(sumRes.data);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await addTransaction(form);
      setForm({ ...form, amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Failed to add'); }
  };

  const handleDelete = async (id) => {
    try { await deleteTransaction(id); fetchData(); }
    catch { setError('Failed to delete'); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const exportCSV = () => {
    const rows = [['Date', 'Type', 'Category', 'Description', 'Amount']];
    transactions.forEach(t => rows.push([
      new Date(t.date).toLocaleDateString(), t.type, t.category, t.description, t.amount
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'vaulttrack_transactions.csv'; a.click();
  };

  const filtered = transactions.filter(t => {
    const matchSearch = t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    const matchCat = filterCategory === 'all' || t.category === filterCategory;
    return matchSearch && matchType && matchCat;
  });

  const pieData = Object.entries(
    transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount; return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const monthlyData = () => {
    const map = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!map[month]) map[month] = { month, income: 0, expense: 0 };
      map[month][t.type] += t.amount;
    });
    return Object.values(map).slice(-6);
  };

  const thisMonthExpenses = () => {
    const m = new Date().getMonth();
    const y = new Date().getFullYear();
    return transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === m && d.getFullYear() === y;
    });
  };

  const s = {
    page: { minHeight: '100vh', background: bg.page, color: bg.text, fontFamily: 'system-ui,sans-serif' },
    nav: { background: bg.nav, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${bg.border}`, position: 'sticky', top: 0, zIndex: 10 },
    logo: { fontSize: '18px', fontWeight: '700' },
    tabs: { display: 'flex', gap: '4px', background: bg.input, padding: '4px', borderRadius: '10px' },
    tab: (active) => ({ padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: active ? bg.accent : 'transparent', color: active ? '#fff' : bg.muted }),
    container: { maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '20px' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
    card: { background: bg.card, border: `1px solid ${bg.border}`, borderRadius: '12px', padding: '20px', marginBottom: '0px' },
    cardLabel: { fontSize: '12px', color: bg.muted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    cardValue: { fontSize: '26px', fontWeight: '700' },
    sectionTitle: { fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: bg.text },
    input: { background: bg.input, border: `1px solid ${bg.border}`, color: bg.text, padding: '10px 14px', borderRadius: '8px', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' },
    select: { background: bg.input, border: `1px solid ${bg.border}`, color: bg.text, padding: '10px 14px', borderRadius: '8px', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    typeToggle: { display: 'flex', gap: '8px', marginBottom: '16px' },
    typeBtn: (active, type) => ({ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', background: active ? (type === 'income' ? '#16a34a' : '#dc2626') : bg.input, color: active ? '#fff' : bg.muted }),
    addBtn: { background: bg.accent, color: '#fff', border: 'none', padding: '11px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', marginTop: '12px' },
    txItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: bg.input, padding: '12px 16px', borderRadius: '10px', marginBottom: '8px' },
    txAmount: (type) => ({ fontSize: '15px', fontWeight: '700', color: type === 'income' ? '#4ade80' : '#f87171' }),
    deleteBtn: { background: 'transparent', border: `1px solid ${bg.border}`, color: bg.muted, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginLeft: '12px' },
    badge: (type) => ({ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: type === 'income' ? '#14532d' : '#450a0a', color: type === 'income' ? '#4ade80' : '#f87171', marginLeft: '8px' }),
    csvBtn: { background: '#0f172a', border: `1px solid ${bg.border}`, color: bg.text, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
    filterRow: { display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' },
    logoutBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.logo}>VaultTrack</div>
        <div style={s.tabs}>
          {['dashboard', 'transactions', 'budget'].map(tab => (
            <button key={tab} style={s.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: bg.muted, fontSize: '13px' }}>Hi, {user?.name}</span>
          <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={s.container}>
        {error && (
          <div style={{ background: '#450a0a', border: '1px solid #dc2626', color: '#f87171', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={s.grid3}>
              <div style={s.card}>
                <div style={s.cardLabel}>Total Balance</div>
                <div style={{ ...s.cardValue, color: summary.balance >= 0 ? '#4ade80' : '#f87171' }}>
                  ₹{summary.balance.toLocaleString()}
                </div>
              </div>
              <div style={s.card}>
                <div style={s.cardLabel}>Total Income</div>
                <div style={{ ...s.cardValue, color: '#4ade80' }}>₹{summary.income.toLocaleString()}</div>
              </div>
              <div style={s.card}>
                <div style={s.cardLabel}>Total Expenses</div>
                <div style={{ ...s.cardValue, color: '#f87171' }}>₹{summary.expense.toLocaleString()}</div>
              </div>
            </div>

            <div style={s.grid2}>
              <div style={s.card}>
                <div style={s.sectionTitle}>Expenses by Category</div>
                {pieData.length === 0 ? (
                  <div style={{ color: bg.muted, fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No expense data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} contentStyle={{ background: bg.card, border: `1px solid ${bg.border}`, borderRadius: '8px', color: bg.text }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div style={s.card}>
                <div style={s.sectionTitle}>Monthly Overview</div>
                {monthlyData().length === 0 ? (
                  <div style={{ color: bg.muted, fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlyData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke={bg.border} />
                      <XAxis dataKey="month" stroke={bg.muted} fontSize={11} />
                      <YAxis stroke={bg.muted} fontSize={11} />
                      <Tooltip contentStyle={{ background: bg.card, border: `1px solid ${bg.border}`, borderRadius: '8px', color: bg.text }} formatter={(v) => `₹${v.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div style={s.card}>
              <div style={s.sectionTitle}>Add Transaction</div>
              <div style={s.typeToggle}>
                <button style={s.typeBtn(form.type === 'expense', 'expense')} onClick={() => setForm({ ...form, type: 'expense', category: 'Food' })}>Expense</button>
                <button style={s.typeBtn(form.type === 'income', 'income')} onClick={() => setForm({ ...form, type: 'income', category: 'Salary' })}>Income</button>
              </div>
              <form onSubmit={handleAdd}>
                <div style={s.formGrid}>
                  <input style={s.input} type="number" placeholder="Amount (₹)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                  <select style={s.select} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES[form.type].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input style={s.input} type="text" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  <input style={s.input} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <button style={s.addBtn} type="submit">+ Add Transaction</button>
              </form>
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={s.sectionTitle}>All Transactions</div>
              <button style={s.csvBtn} onClick={exportCSV}>Export CSV</button>
            </div>
            <div style={s.filterRow}>
              <input style={{ ...s.input, maxWidth: '220px' }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
              <select style={{ ...s.select, maxWidth: '140px' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select style={{ ...s.select, maxWidth: '160px' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {[...CATEGORIES.income, ...CATEGORIES.expense].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {loading ? (
              <div style={{ color: bg.muted, textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={{ color: bg.muted, textAlign: 'center', padding: '40px' }}>No transactions found</div>
            ) : filtered.map(tx => (
              <div key={tx._id} style={s.txItem}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                    {tx.category}
                    <span style={s.badge(tx.type)}>{tx.type}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: bg.muted, marginTop: '3px' }}>
                    {tx.description && `${tx.description} · `}
                    {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={s.txAmount(tx.type)}>{tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}</div>
                  <button style={s.deleteBtn} onClick={() => handleDelete(tx._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BUDGET TAB */}
        {activeTab === 'budget' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={s.card}>
              <div style={s.sectionTitle}>Set Monthly Budget</div>
              <p style={{ color: bg.muted, fontSize: '13px', marginBottom: '16px' }}>
                Set your total spending limit for this month
              </p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  style={{ ...s.input, maxWidth: '260px' }}
                  type="number"
                  placeholder="Enter your monthly budget (₹)"
                  value={budgetInput}
                  onChange={e => setBudgetInput(e.target.value)}
                />
                <button style={s.addBtn} onClick={() => {
                  const val = Number(budgetInput);
                  if (val > 0) {
                    setMonthlyBudget(val);
                    localStorage.setItem(BUDGET_KEY, val);
                    setBudgetInput('');
                  }
                }}>
                  Save Budget
                </button>
              </div>
              {monthlyBudget > 0 && (
                <p style={{ color: bg.muted, fontSize: '13px', marginTop: '10px' }}>
                  Current budget: <span style={{ color: '#4ade80', fontWeight: '600' }}>₹{monthlyBudget.toLocaleString()}</span>
                </p>
              )}
            </div>

            {monthlyBudget > 0 && (() => {
              const monthlyExpense = thisMonthExpenses().reduce((s, t) => s + t.amount, 0);
              const remaining = monthlyBudget - monthlyExpense;
              const pct = Math.min((monthlyExpense / monthlyBudget) * 100, 100);
              return (
                <div style={s.card}>
                  <div style={s.sectionTitle}>This Month's Spending</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span style={{ color: bg.muted }}>Spent</span>
                    <span style={{ fontWeight: '700', color: '#f87171' }}>₹{monthlyExpense.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span style={{ color: bg.muted }}>Budget</span>
                    <span style={{ fontWeight: '700' }}>₹{monthlyBudget.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px' }}>
                    <span style={{ color: bg.muted }}>Remaining</span>
                    <span style={{ fontWeight: '700', color: remaining >= 0 ? '#4ade80' : '#f87171' }}>
                      {remaining >= 0 ? `₹${remaining.toLocaleString()}` : `-₹${Math.abs(remaining).toLocaleString()}`}
                    </span>
                  </div>
                  <div style={{ background: bg.input, borderRadius: '8px', height: '14px', overflow: 'hidden' }}>
                    <div style={{ height: '14px', borderRadius: '8px', transition: 'width 0.5s', width: `${pct}%`, background: pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981' }} />
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '13px', color: pct > 90 ? '#f87171' : pct > 70 ? '#f59e0b' : '#4ade80' }}>
                    {pct > 90 ? '🚨 Danger! Almost out of budget!' : pct > 70 ? '⚠️ Slow down — 70% used' : '✅ You are on track!'} — {pct.toFixed(0)}% used
                  </div>
                </div>
              );
            })()}

            {monthlyBudget > 0 && (() => {
              const catMap = {};
              thisMonthExpenses().forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
              const entries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
              if (entries.length === 0) return null;
              return (
                <div style={s.card}>
                  <div style={s.sectionTitle}>Spending Breakdown This Month</div>
                  {entries.map(([cat, amt], i) => {
                    const pct = (amt / monthlyBudget) * 100;
                    return (
                      <div key={cat} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '600' }}>{cat}</span>
                          <span style={{ color: bg.muted }}>₹{amt.toLocaleString()} ({pct.toFixed(0)}% of budget)</span>
                        </div>
                        <div style={{ background: bg.input, borderRadius: '4px', height: '8px' }}>
                          <div style={{ height: '8px', borderRadius: '4px', width: `${Math.min(pct, 100)}%`, background: COLORS[i % COLORS.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}