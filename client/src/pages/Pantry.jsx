import { useEffect, useState } from 'react';
import { getPantry, addPantryItem, deletePantryItem } from '../services/api';
import './Pantry.css';

export default function Pantry() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', quantity: '', unit: '', expiry_date: '' });
  const [loading, setLoading] = useState(true);

  const fetchItems = () => getPantry().then(r => { setItems(r.data); setLoading(false); });
  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addPantryItem(form);
    setForm({ name: '', quantity: '', unit: '', expiry_date: '' });
    fetchItems();
  };

  const handleDelete = async (id) => {
    await deletePantryItem(id);
    setItems(items.filter(i => i.id !== id));
  };

  const isExpiringSoon = (date) => {
    if (!date) return false;
    const diff = (new Date(date) - new Date()) / (1000*60*60*24);
    return diff <= 3;
  };

  return (
    <div className="page">
      <h1 className="page-title">Pantry</h1>

      <div className="card pantry-form">
        <h3>Add Ingredient</h3>
        <form onSubmit={handleAdd} className="pantry-form-grid">
          <div className="form-group">
            <label>Name</label>
            <input required placeholder="e.g. Eggs" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input required type="number" min="0" placeholder="e.g. 6" value={form.quantity}
              onChange={e => setForm({...form, quantity: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Unit</label>
            <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
              <option value="">—</option>
              <option>g</option><option>kg</option><option>ml</option>
              <option>L</option><option>tbsp</option><option>tsp</option>
              <option>pieces</option><option>cups</option>
            </select>
          </div>
          <div className="form-group">
            <label>Expiry Date</label>
            <input type="date" value={form.expiry_date}
              onChange={e => setForm({...form, expiry_date: e.target.value})} />
          </div>
          <button className="btn btn-primary" type="submit">+ Add</button>
        </form>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="pantry-list">
          {items.length === 0 && <div className="card empty-state">Your pantry is empty. Add some ingredients!</div>}
          {items.map(item => (
            <div key={item.id} className={`pantry-item card ${isExpiringSoon(item.expiry_date) ? 'expiring' : ''}`}>
              <div className="item-info">
                <strong>{item.name}</strong>
                <span>{item.quantity} {item.unit}</span>
                {item.expiry_date && (
                  <span className="expiry-tag">
                    Exp: {item.expiry_date.split('T')[0]}
                  </span>
                )}
              </div>
              <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
