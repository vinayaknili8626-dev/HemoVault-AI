import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Phone, Landmark, Search, ShieldAlert, Award } from 'lucide-react';

const HospitalFinder = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Sample static hospitals data (since hospitals collection is seeded)
  const hospitals = [
    { name: 'Metro General Hospital', address: '100 Medical Plaza, New York, NY 10001', contact: '+1 (555) 123-4567', email: 'info@metrogeneral.org', rating: '4.8 ★' },
    { name: 'Springfield Community Care', address: '24 Medical Dr, Springfield, IL 62702', contact: '+1 (555) 444-5555', email: 'care@springfield.org', rating: '4.6 ★' }
  ];

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const res = await axios.get('/api/labs/directory');
        if (res.data.success) {
          setLabs(res.data.labs);
        }
      } catch (err) {
        console.error('Failed to load lab directory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLabs();
  }, []);

  const filteredLabs = labs.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Facility Locator</h1>
        <p className="text-xs text-slate-500 mt-1">Locate verified hospitals and laboratory collection centers near you</p>
      </div>

      {/* Emergency Strip */}
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert size={20} className="animate-bounce" />
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider">Emergency Medical Contact</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400">If you are experiencing a life-threatening emergency, call immediately.</p>
          </div>
        </div>
        <a href="tel:911" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm flex items-center gap-2">
          <Phone size={14} />
          <span>Call 911 / Emergency</span>
        </a>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
          <Search size={18} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-11"
          placeholder="Search by city or name..."
        />
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hospitals */}
        <div className="space-y-4">
          <h2 className="text-md font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Landmark size={18} className="text-primary-500" />
            <span>Affiliated Hospitals</span>
          </h2>
          <div className="space-y-4">
            {hospitals.map((h, i) => (
              <div key={i} className="glass-card p-6 rounded-3xl space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">{h.name}</h3>
                  <span className="text-xs font-bold text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded">
                    {h.rating}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MapPin size={14} />
                  <span>{h.address}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Phone size={14} />
                  <span>{h.contact}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Labs */}
        <div className="space-y-4">
          <h2 className="text-md font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Award size={18} className="text-teal-500" />
            <span>Certified Collection Laboratories</span>
          </h2>
          <div className="space-y-4">
            {loading ? (
              <div className="glass-card p-6 rounded-3xl skeleton h-28" />
            ) : filteredLabs.length === 0 ? (
              <div className="text-center p-8 text-xs text-slate-400">No laboratory centers match search criteria.</div>
            ) : (
              filteredLabs.map((l, i) => (
                <div key={i} className="glass-card p-6 rounded-3xl space-y-3">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">{l.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <MapPin size={14} />
                    <span>{l.address}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Phone size={14} />
                    <span>{l.contactNumber}</span>
                  </p>
                  <span className="inline-block text-3xs font-semibold bg-primary-500/10 text-primary-500 px-2.5 py-0.5 rounded">
                    LIC: {l.licenseNumber}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalFinder;
