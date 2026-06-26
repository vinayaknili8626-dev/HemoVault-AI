import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, MapPin, ShieldCheck, Heart, RefreshCw } from 'lucide-react';

const Profile = () => {
  const { user, userDetails, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');
  
  const [ecName, setEcName] = useState('');
  const [ecRel, setEcRel] = useState('');
  const [ecPhone, setEcPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Populate data on mount
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
    if (userDetails) {
      setDob(userDetails.dateOfBirth ? userDetails.dateOfBirth.split('T')[0] : '');
      setGender(userDetails.gender || 'Male');
      setBloodGroup(userDetails.bloodGroup || 'O+');
      setAddress(userDetails.address || '');
      
      if (userDetails.emergencyContact) {
        setEcName(userDetails.emergencyContact.name || '');
        setEcRel(userDetails.emergencyContact.relationship || '');
        setEcPhone(userDetails.emergencyContact.phone || '');
      }
    }
  }, [user, userDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await axios.put('/api/patients/profile', {
        name,
        phone,
        dateOfBirth: dob,
        gender,
        bloodGroup,
        address,
        emergencyContact: {
          name: ecName,
          relationship: ecRel,
          phone: ecPhone
        }
      });

      if (res.data.success) {
        await refreshUser();
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Profile Management</h1>
        <p className="text-xs text-slate-500 mt-1">Review demographics, medical configurations, and emergency contact details</p>
      </div>

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in duration-200">
          <ShieldCheck size={18} />
          <span>Your demographics profile has been successfully saved to the ledger.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core Demographics Card */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
            <User size={18} className="text-primary-500" />
            <span>Demographics & Identity</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input-field"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="input-field"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Residential Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <MapPin size={16} />
              </span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field pl-10"
                placeholder="Address"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
            <Heart size={18} className="text-primary-500" />
            <span>Emergency Care Contact</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={ecName}
                onChange={(e) => setEcName(e.target.value)}
                className="input-field"
                placeholder="Name"
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Relationship
              </label>
              <input
                type="text"
                value={ecRel}
                onChange={(e) => setEcRel(e.target.value)}
                className="input-field"
                placeholder="Spouse, Parent, etc."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Emergency Phone
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  value={ecPhone}
                  onChange={(e) => setEcPhone(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Phone"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Action Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-8 text-xs font-bold"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={16} />
            ) : (
              <span>Save Demographics Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
