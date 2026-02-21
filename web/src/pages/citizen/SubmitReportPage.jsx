import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const WASTE_TYPES = [
  { value: 'plastic', label: 'Plastic', icon: '♻️' },
  { value: 'organic', label: 'Organic', icon: '🍂' },
  { value: 'electronic', label: 'Electronic', icon: '🔌' },
  { value: 'hazardous', label: 'Hazardous', icon: '☣️' },
  { value: 'construction', label: 'Construction', icon: '🧱' },
  { value: 'medical', label: 'Medical', icon: '🏥' },
  { value: 'textile', label: 'Textile', icon: '👕' },
  { value: 'mixed', label: 'Mixed', icon: '🗑️' },
  { value: 'other', label: 'Other', icon: '📦' },
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 border-red-300' },
];

export default function SubmitReportPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    latitude: '',
    longitude: '',
    address: '',
    description: '',
    waste_type: 'mixed',
    severity: 'medium',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      () => {
        setError('Unable to get your location. Please enter coordinates manually.');
        setLocating(false);
      }
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('latitude', form.latitude);
      formData.append('longitude', form.longitude);
      if (form.address) formData.append('address', form.address);
      if (form.description) formData.append('description', form.description);
      formData.append('waste_type', form.waste_type);
      formData.append('severity', form.severity);
      images.forEach((img) => formData.append('images', img));

      await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/citizen/reports');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">Report Waste</h2>
      <p className="text-gray-500 mb-6">Help keep your community clean by reporting waste. You'll earn points for each valid report!</p>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={locating}
            className="mb-3 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm hover:bg-primary-100 transition disabled:opacity-50"
          >
            {locating ? '📍 Getting location...' : '📍 Use my current location'}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Address or landmark (optional)"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm mt-3"
          />
        </div>

        {/* Waste type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Waste Type</label>
          <div className="grid grid-cols-3 gap-2">
            {WASTE_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setForm({ ...form, waste_type: type.value })}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${
                  form.waste_type === type.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
          <div className="flex gap-2">
            {SEVERITY_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setForm({ ...form, severity: level.value })}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition ${
                  form.severity === level.value
                    ? level.color + ' border-2'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            placeholder="Describe the waste situation (optional)..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            rows={3}
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photos (up to 5)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          {images.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">{images.length} file(s) selected</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
