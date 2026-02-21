import { useEffect, useState } from 'react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function CitizenRewardsPage() {
  const user = useAuthStore((s) => s.user);
  const [rewards, setRewards] = useState([]);
  const [redeeming, setRedeeming] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/rewards').then(({ data }) => setRewards(data.rewards)).catch(console.error);
  }, []);

  const handleRedeem = async (rewardId) => {
    setRedeeming(rewardId);
    setMessage('');
    try {
      await api.post(`/rewards/${rewardId}/redeem`);
      setMessage('Reward redeemed successfully! 🎉');
      // Refresh user data to update points
      const { data } = await api.get('/auth/me');
      useAuthStore.setState({ user: data.user });
      // Refresh rewards
      const rewardsRes = await api.get('/rewards');
      setRewards(rewardsRes.data.rewards);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to redeem reward');
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Rewards</h2>
          <p className="text-gray-500 text-sm">Redeem your points for exciting rewards</p>
        </div>
        <div className="bg-primary-50 rounded-lg px-4 py-2">
          <p className="text-xs text-primary-600">Your balance</p>
          <p className="text-xl font-bold text-primary-700">⭐ {user?.points_balance || 0} pts</p>
        </div>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg mb-4 text-sm ${
          message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const canAfford = (user?.points_balance || 0) >= reward.points_cost;
          return (
            <div key={reward.id} className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
              <h3 className="font-semibold text-lg">{reward.title}</h3>
              <p className="text-sm text-gray-500 mt-1 flex-1">{reward.description}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-primary-600 font-bold">{reward.points_cost} pts</span>
                <span className="text-sm text-gray-400">{reward.quantity_available} left</span>
              </div>
              {reward.category && (
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full w-fit">
                  {reward.category}
                </span>
              )}
              <button
                onClick={() => handleRedeem(reward.id)}
                disabled={!canAfford || reward.quantity_available <= 0 || redeeming === reward.id}
                className={`mt-4 py-2 rounded-lg text-sm font-medium transition ${
                  canAfford && reward.quantity_available > 0
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                } disabled:opacity-50`}
              >
                {redeeming === reward.id
                  ? 'Redeeming...'
                  : !canAfford
                  ? `Need ${reward.points_cost - (user?.points_balance || 0)} more pts`
                  : reward.quantity_available <= 0
                  ? 'Out of stock'
                  : 'Redeem'}
              </button>
            </div>
          );
        })}
        {rewards.length === 0 && (
          <p className="col-span-3 text-center text-gray-400 py-12">No rewards available yet</p>
        )}
      </div>
    </div>
  );
}
