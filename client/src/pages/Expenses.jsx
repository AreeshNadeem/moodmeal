import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getExpenses, addExpense, deleteExpense, getExpenseSummary, getProfile } from '../services/api';
import './Expenses.css';

const COLORS = ['#84582B', '#9D9167', '#E8D1A7'];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary]   = useState([]);
  const [budget, setBudget]     = useState(null);
  const [form, setForm] = useState({ category: 'grocery', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0] });

  const fetchAll = () => {
    getExpenses().then(r => setExpenses(r.data)).catch(() => {});
    getExpenseSummary().then(r => setSummary(r.data)).catch(() => {});
    getProfile().then(r => {
      if (r.data.preferences?.weekly_budget) {
        setBudget(Number(r.data.preferences.weekly_budget) * 4);
      }
    }).catch(() => {});
  };
  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addExpense(form);
    setForm({ ...form, amount: '', description: '' });
    fetchAll();
  };

  const handleDelete = async (id) => {
    await deleteExpense(id);
    fetchAll();
  };

  const chartData = summary.map(s => ({ name: s.category, value: Number(s.total) }));
  const total = summary.reduce((s, r) => s + Number(r.total), 0);

  return (
    <div className="page">
      <h1 className="page-title">Expense Tracker</h1>

      <div className="expense-layout">
        <div>
          <div className="card expense-form">
            <h3>Log Expense</h3>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="grocery">Grocery</option>
                  <option value="takeaway">Takeaway</option>
                  <option value="restaurant">Restaurant</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount (PKR)</label>
                <input required type="number" min="1" max="50000" placeholder="e.g. 250" value={form.amount}
                  onChange={e => {
                    let val = e.target.value;
                    if (val !== '' && Number(val) > 50000) val = '50000';
                    if (val !== '' && Number(val) < 0) val = '1';
                    setForm({...form, amount: val});
                  }} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input placeholder="e.g. Vegetables from market" value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={form.expense_date}
                  onChange={e => setForm({...form, expense_date: e.target.value})} />
              </div>
              <button className="btn btn-primary" type="submit" style={{width:'100%'}}>+ Add Expense</button>
            </form>
          </div>

          {chartData.length > 0 && (
            <div className="card" style={{marginTop:'1rem'}}>
              <h3 style={{marginBottom:'0.5rem'}}>This Month: PKR {total.toLocaleString()}</h3>
              
              {budget && budget > 0 ? (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface-2)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600' }}>
                        <span>Budget Progress</span>
                        <span>{((total / budget) * 100).toFixed(1)}% (PKR {budget.toLocaleString()} Limit)</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ 
                            height: '100%', 
                            width: `${Math.min((total / budget) * 100, 100)}%`, 
                            background: total > budget ? 'var(--danger)' : 'var(--success)',
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                    {total > budget && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 'bold' }}>You have exceeded your estimated monthly budget!</p>}
                </div>
              ) : (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#FFF8F1', borderLeft: '4px solid var(--primary)', borderRadius: '4px', fontSize: '0.9rem', color: 'var(--text)' }}>
                  <strong>Want to track your goal?</strong> Set a Weekly Budget in your Settings to unlock the smart budget progress bar!
                </div>
              )}

              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value}) => `${name}: PKR ${value}`}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => `PKR ${v}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="expense-list">
          {expenses.length === 0 && <div className="card empty-state">No expenses logged yet.</div>}
          {expenses.map(e => (
            <div key={e.id} className="expense-item card">
              <div>
                <div className="expense-top">
                  <span className="cat-badge">{e.category}</span>
                  <strong>PKR {Number(e.amount).toLocaleString()}</strong>
                </div>
                {e.description && <p className="expense-desc">{e.description}</p>}
                <span className="expense-date">{e.expense_date?.split('T')[0]}</span>
              </div>
              <button className="btn btn-danger" style={{padding:'0.3rem 0.7rem',fontSize:'0.8rem'}} onClick={() => handleDelete(e.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
