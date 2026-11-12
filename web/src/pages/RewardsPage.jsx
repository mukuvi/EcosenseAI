import { useEffect, useState } from 'react';
import { Gift, Loader2, Package, Plus, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { parseApiError } from '../utils/apiError';

const emptyForm = {
  title: '',
  description: '',
  category: '',
  points_cost: '',
  quantity_available: '',
};

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api
      .get('/rewards')
      .then(({ data }) => setRewards(data.rewards))
      .catch(() => toast.error('Could not load rewards'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setFieldErrors({});
    setCreating(true);

    try {
      const { data } = await api.post('/rewards', {
        ...form,
        points_cost: Number(form.points_cost),
        quantity_available: Number(form.quantity_available),
      });
      setRewards((previous) => [...previous, data.reward]);
      setForm(emptyForm);
      setOpen(false);
      toast.success('Reward published');
    } catch (err) {
      const parsed = parseApiError(err, 'Could not create this reward');
      setFieldErrors(parsed.fieldErrors);
      toast.error(parsed.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Rewards"
        description="Publish rewards that citizens can redeem with the points they earn from verified reports."
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              New reward
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Publish a reward</DialogTitle>
            <DialogDescription>Set the point cost and how many are available.</DialogDescription>

            <form onSubmit={handleCreate} className="mt-5 space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="reward_title">Title</Label>
                <Input
                  id="reward_title"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  invalid={Boolean(fieldErrors.title)}
                  placeholder="Reflective safety vest"
                  required
                />
                {fieldErrors.title && <p className="text-[13px] text-red-600">{fieldErrors.title}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reward_points">Points required</Label>
                  <Input
                    id="reward_points"
                    type="number"
                    min="1"
                    value={form.points_cost}
                    onChange={(event) => setForm({ ...form, points_cost: event.target.value })}
                    invalid={Boolean(fieldErrors.points_cost)}
                    placeholder="120"
                    required
                  />
                  {fieldErrors.points_cost && <p className="text-[13px] text-red-600">{fieldErrors.points_cost}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reward_quantity">Quantity</Label>
                  <Input
                    id="reward_quantity"
                    type="number"
                    min="0"
                    value={form.quantity_available}
                    onChange={(event) => setForm({ ...form, quantity_available: event.target.value })}
                    invalid={Boolean(fieldErrors.quantity_available)}
                    placeholder="25"
                    required
                  />
                  {fieldErrors.quantity_available && (
                    <p className="text-[13px] text-red-600">{fieldErrors.quantity_available}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward_category">Category</Label>
                <Input
                  id="reward_category"
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  placeholder="Safety gear"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward_description">Description</Label>
                <Textarea
                  id="reward_description"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="What the person receives and where they collect it."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                {creating ? 'Publishing' : 'Publish reward'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-44" />
          ))}
        </div>
      ) : rewards.length === 0 ? (
        <Card>
          <EmptyState
            icon={Gift}
            title="No rewards published"
            description="Publish a reward and citizens will see it in their portal with the points they have."
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rewards.map((reward) => (
            <Card key={reward.id} className="flex flex-col transition hover:shadow-lift">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-ink/45">
                    <Trophy className="h-5 w-5" />
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
