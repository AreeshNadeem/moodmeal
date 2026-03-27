import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getExpenses, addExpense, deleteExpense, getExpenseSummary } from '../services/api';
import './Expenses.css';

const COLORS = ['#f97316', '#22c55e', '#3b82f6'];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary]   = useState([]);
  const [form, setForm] = useState({ category: 'grocery', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0] });

  const fetchAll = () => {
    getExpenses().then(r => setExpenses(r.data));
    getExpenseSummary().then(r => setSummary(r.data));
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
                <label>Amount (Rs.)</label>
                <input required type="number" min="0" placeholder="e.g. 250" value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})} />
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
              <h3 style={{marginBottom:'0.5rem'}}>This Month: Rs. {total.toLocaleString()}</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value}) => `${name}: Rs.${value}`}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => `Rs. ${v}`} />
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
                  <strong>Rs. {Number(e.amount).toLocaleString()}</strong>
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
