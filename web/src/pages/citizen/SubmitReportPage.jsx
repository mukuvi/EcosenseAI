import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ImagePlus, Loader2, LocateFixed, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { parseApiError } from '../../utils/apiError';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { cn } from '../../lib/utils';

const wasteTypes = [
  'plastic',
  'organic',
  'electronic',
  'hazardous',
  'construction',
  'medical',
  'textile',
  'mixed',
  'other',
];

const severities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function SubmitReportPage() {
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const previews = useRef([]);
  const [form, setForm] = useState({
    latitude: '',
    longitude: '',
    address: '',
    description: '',
    waste_type: 'mixed',
    severity: 'medium',
  });
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(
    () => () => {
      previews.current.forEach((url) => URL.revokeObjectURL(url));
    },
    []
  );

  const replaceImages = (nextImages) => {
    previews.current.forEach((url) => URL.revokeObjectURL(url));
    const urls = nextImages.map((file) => URL.createObjectURL(file));
    previews.current = urls;
    setImages(nextImages);
    setPreviewUrls(urls);
  };

  const handleFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    const next = [...images, ...selected].slice(0, 5);
    replaceImages(next);
    event.target.value = '';
  };

  const removeImage = (index) => {
    replaceImages(images.filter((_, position) => position !== index));
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError('This browser does not support location access. Enter the coordinates instead.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((previous) => ({
          ...previous,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setLocating(false);
        toast.success('Location added');
      },
      () => {
        setLocating(false);
        toast.error('Could not read your location. Enter the coordinates instead.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const body = new FormData();
      body.append('latitude', form.latitude);
      body.append('longitude', form.longitude);
      if (form.address) body.append('address', form.address);
      if (form.description) body.append('description', form.description);
      body.append('waste_type', form.waste_type);
      body.append('severity', form.severity);
      images.forEach((image) => body.append('images', image));

      await api.post('/reports', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Report submitted. Points will be credited to your account.');
      navigate('/citizen/reports');
    } catch (err) {
      const message = parseApiError(err, 'Could not submit this report').message;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600">New report</p>
        <h1 className="mt-2 font-display text-[clamp(1.5rem,2.6vw,1.9rem)] font-semibold leading-tight">
          Report a waste site
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">
          A photo and a location are enough for the team to act. Add detail if it helps someone find the site.
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1.55fr_1fr]" noValidate>
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button type="button" variant="secondary" onClick={handleLocate} disabled={locating}>
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                {locating ? 'Finding you' : 'Use my current location'}
              </Button>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(event) => setForm({ ...form, latitude: event.target.value })}
                    placeholder="-1.292100"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(event) => setForm({ ...form, longitude: event.target.value })}
                    placeholder="36.821900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address or landmark <span className="font-normal text-ink-muted">(optional)</span>
                </Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                  placeholder="Next to the market on Tom Mboya Street"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What is there</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-medium">Waste type</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {wasteTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, waste_type: type })}
                      className={cn(
                        'rounded-xl border px-3 py-2 text-sm capitalize transition',
                        form.waste_type === type
                          ? 'border-primary-500 bg-primary-50 font-medium text-primary-800'
                          : 'border-ink/12 bg-white text-ink-muted hover:border-ink/25'
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Severity</p>
                <div className="grid grid-cols-4 gap-2">
                  {severities.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setForm({ ...form, severity: level.value })}
                      className={cn(
                        'rounded-xl border px-2 py-2 text-sm transition',
                        form.severity === level.value
                          ? 'border-primary-500 bg-primary-50 font-medium text-primary-800'
                          : 'border-ink/12 bg-white text-ink-muted hover:border-ink/25'
                      )}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="font-normal text-ink-muted">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="How big is the pile, what is nearby, and anything that would help the crew."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <p className="text-sm text-ink-muted">Up to 5 images. A clear photo helps the classification.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                className="hidden"
              />

              {previewUrls.length === 0 ? (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 bg-surface/60 px-4 py-8 text-center transition hover:border-primary-400 hover:bg-primary-50/40"
                >
                  <span className="text-primary-700">
                    <ImagePlus className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium">Add photos</span>
                  <span className="text-xs text-ink-muted">Tap to choose from your device</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {previewUrls.map((url, index) => (
                    <div key={url} className="group relative overflow-hidden rounded-xl border border-ink/10">
                      <img src={url} alt={`Selected photo ${index + 1}`} className="aspect-square w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-red-600 shadow-sm transition hover:bg-white"
                        aria-label="Remove photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {previewUrls.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-ink/20 text-ink-muted transition hover:border-primary-400 hover:text-primary-700"
                      aria-label="Add more photos"
                    >
                      <ImagePlus className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-2.5 text-sm text-ink-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                <p className="leading-relaxed">
                  The report goes to the agency covering this location. You will be notified at every status change.
                </p>
              </div>
              <Button type="submit" size="lg" className="mt-5 w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                {loading ? 'Submitting' : 'Submit report'}
              </Button>
              <p className="mt-3 text-center text-xs text-ink-muted">Points are credited once the report is accepted.</p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
