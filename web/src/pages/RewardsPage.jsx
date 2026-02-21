import { useEffect, useState } from 'react';
import api from '../services/api';

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', points_cost: '', category: '', quantity_available: '' });

  useEffect(() => {
    api.get('/rewards').then(({ data }) => setRewards(data.rewards)).catch(console.error);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/rewards', {
        ...form,
        points_cost: parseInt(form.points_cost, 10),
        quantity_available: parseInt(form.quantity_available, 10),
      });
      setRewards((prev) => [...prev, data.reward]);
      setForm({ title: '', description: '', points_cost: '', category: '', quantity_available: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create reward', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Rewards</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
        >
          {showForm ? 'Cancel' : '+ New Reward'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm p-6 mb-6 grid grid-cols-2 gap-4">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 border rounded-lg" required />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 border rounded-lg" />
          <input placeholder="Points Cost" type="number" value={form.points_cost} onChange={(e) => setForm({ ...form, points_cost: e.target.value })} className="px-3 py-2 border rounded-lg" required />
          <input placeholder="Quantity" type="number" value={form.quantity_available} onChange={(e) => setForm({ ...form, quantity_available: e.target.value })} className="px-3 py-2 border rounded-lg" required />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-3 py-2 border rounded-lg col-span-2" rows={2} />
          <button type="submit" className="col-span-2 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Create Reward</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <div key={reward.id} className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-lg">{reward.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{reward.description}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-primary-600 font-bold">{reward.points_cost} pts</span>
              <span className="text-sm text-gray-400">{reward.quantity_available} left</span>
            </div>
            {reward.category && (
              <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                {reward.category}
              </span>
            )}
          </div>
        ))}
        {rewards.length === 0 && (
          <p className="col-span-3 text-center text-gray-400 py-12">No rewards configured yet</p>
        )}
      </div>
    </div>
  );
}
