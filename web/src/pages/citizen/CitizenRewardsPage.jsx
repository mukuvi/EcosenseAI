import { useEffect, useState } from 'react';
import { Gift, Loader2, Package, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

export default function CitizenRewardsPage() {
  const user = useAuthStore((state) => state.user);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState('');

  useEffect(() => {
    api
      .get('/rewards')
      .then(({ data }) => setRewards(data.rewards))
      .catch(() => toast.error('Could not load rewards'))
      .finally(() => setLoading(false));
  }, []);

  const balance = user?.points_balance || 0;

  const handleRedeem = async (reward) => {
    setRedeeming(reward.id);
    try {
      await api.post(`/rewards/${reward.id}/redeem`);
      const { data } = await api.get('/auth/me');
      useAuthStore.setState({ user: data.user });
      const refreshed = await api.get('/rewards');
      setRewards(refreshed.data.rewards);
      toast.success(`${reward.title} is yours. Check your notifications for collection details.`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not redeem this reward');
    } finally {
      setRedeeming('');
    }
  };

  return (
    <div>
      <PageHeader
        title="Rewards"
        description="Spend the points you earned from reports that were verified and cleaned up. Redeem while stock is available."
      />

      <Card className="mb-5 overflow-hidden">
        <div className="border-b border-line bg-bone p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">Your balance</p>
              <p className="tabular mt-2 text-4xl font-semibold tracking-tight">{balance} pts</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white/50">
              <Trophy className="h-6 w-6" />
            </span>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-48" />
          ))}
        </div>
      ) : rewards.length === 0 ? (
        <Card>
          <EmptyState
            icon={Gift}
            title="No rewards available"
            description="Once an organization publishes rewards, they will appear here with their point cost."
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rewards.map((reward) => {
            const affordable = balance >= reward.points_cost;
            const inStock = reward.quantity_available > 0;
            const missing = reward.points_cost - balance;

            return (
              <Card key={reward.id} className="flex flex-col transition hover:shadow-lift">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-ink/45">
                      <Gift className="h-5 w-5" />
                    </span>
                    {reward.category && <Badge variant="neutral">{reward.category}</Badge>}
                  </div>

                  <h3 className="mt-4 font-display text-base font-semibold">{reward.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted">
                    {reward.description || 'No description provided.'}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
                    <span className="font-display text-sm font-semibold text-primary-700">
                      {reward.points_cost} pts
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                      <Package className="h-3.5 w-3.5" />
                      {reward.quantity_available} left
                    </span>
                  </div>

                  <Button
                    className="mt-4 w-full"
                    variant={affordable && inStock ? 'default' : 'outline'}
                    disabled={!affordable || !inStock || redeeming === reward.id}
                    onClick={() => handleRedeem(reward)}
                  >
                    {redeeming === reward.id && <Loader2 className="h-4 w-4 animate-spin" />}
                    {redeeming === reward.id
                      ? 'Redeeming'
                      : !inStock
                        ? 'Out of stock'
                        : affordable
                          ? 'Redeem reward'
                          : `Need ${missing} more points`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
