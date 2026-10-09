import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Sparkles, Utensils, Image as ImageIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export const DonorDonate: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form states
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState('VEGETARIAN');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Times: default to now + hours
  const getDefaultTimeString = (offsetHours: number) => {
    const d = new Date();
    d.setHours(d.getHours() + offsetHours);
    // Format to yyyy-MM-ddThh:mm
    return d.toISOString().slice(0, 16);
  };

  const [preparationTime, setPreparationTime] = useState(getDefaultTimeString(0));
  const [expiryTime, setExpiryTime] = useState(getDefaultTimeString(6));
  const [pickupTime, setPickupTime] = useState(getDefaultTimeString(6));

  // Default coordinates from profile
  const [pickupAddress, setPickupAddress] = useState(user?.donorProfile?.address || '');
  const [latitude, setLatitude] = useState(user?.donorProfile?.latitude?.toString() || '40.7128');
  const [longitude, setLongitude] = useState(user?.donorProfile?.longitude?.toString() || '-74.0060');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleLoadLocation = () => {
    if (navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat.toFixed(6));
          setLongitude(lng.toFixed(6));

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'WasteCut-OOAD-Capstone'
              }
            });
            const data = await res.json();
            if (data && data.display_name) {
              setPickupAddress(data.display_name);
            }
          } catch (err) {
            console.error('Reverse geocoding failed', err);
          } finally {
            setLoadingLocation(false);
          }
        },
        (err) => {
          console.error(err);
          alert('Could not retrieve current location. Please type manually.');
          setLoadingLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !quantity || !pickupAddress) return;

    setLoading(true);
    try {
      const payload = {
        foodName,
        category,
        quantity,
        description,
        preparationTime: new Date(preparationTime).toISOString(),
        expiryTime: new Date(expiryTime).toISOString(),
        pickupTime: new Date(pickupTime).toISOString(),
        pickupAddress,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop', // default fallback
      };

      await api.post('/donations', payload);
      alert('Surplus food listing created successfully! Nearby NGOs have been notified.');
      navigate('/donor');
    } catch (err: any) {
      const msg = err?.message || err?.error || JSON.stringify(err);
      alert('Failed to create donation: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'VEGETARIAN',
    'NON_VEGETARIAN',
    'BAKERY',
    'FRUITS',
    'VEGETABLES',
    'RICE',
    'SNACKS',
    'BEVERAGES',
    'DAIRY',
    'DESSERTS',
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/donor')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-primary transition-all"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-premium">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Utensils className="text-primary" size={20} /> Share Surplus Food
        </h1>
        <p className="text-xs text-gray-500 mt-1">Provide accurate details to ensure food safety and smooth pickup logistics.</p>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Food Item Title</label>
              <input
                type="text"
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                placeholder="e.g. Sourdough Bread or Mixed Veg Curry"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Food Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Quantity Available</label>
              <input
                type="text"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                placeholder="e.g. 15 servings or 10 kg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Food Photo (Optional)</label>
              <div className="flex gap-4 items-center">
                {imageUrl ? (
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-gray-200 shadow-xs group">
                    <img src={imageUrl} alt="Food Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                    <ImageIcon size={18} />
                  </div>
                )}
                
                <label className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-50 hover:text-primary transition-all">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Description & Ingredients</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary resize-none"
              placeholder="e.g. Contains dairy. Packed in single-use recyclable food containers."
            />
          </div>

          {/* Time logs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Prepared At</label>
              <input
                type="datetime-local"
                required
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Expiry Limit</label>
              <input
                type="datetime-local"
                required
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Pickup Before</label>
              <input
                type="datetime-local"
                required
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Logistics Address */}
          <div className="space-y-4 pt-4 border-t border-gray-50">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-gray-700">Pickup Address</label>
                <button
                  type="button"
                  onClick={handleLoadLocation}
                  disabled={loadingLocation}
                  className="text-xs text-primary font-bold hover:text-primary-dark transition-all uppercase tracking-wider flex items-center gap-1"
                >
                  <MapPin size={12} />
                  {loadingLocation ? 'Detecting...' : 'Detect Location'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <MapPin size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                  placeholder="Street name and details"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Latitude</label>
                <input
                  type="text"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Longitude</label>
                <input
                  type="text"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Listing surplus food...
                </>
              ) : (
                'List Food Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default DonorDonate;
