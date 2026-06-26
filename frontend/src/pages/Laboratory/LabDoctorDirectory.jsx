import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Stethoscope, Phone, Mail, Landmark, ShieldCheck, RefreshCw } from 'lucide-react';

const LabDoctorDirectory = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('/api/labs/doctors');
        if (res.data.success) {
          setDoctors(res.data.doctors);
        }
      } catch (err) {
        console.error('Failed to load doctors list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-primary-500" size={32} />
        <span className="text-sm font-semibold text-slate-500">Retrieving doctor directory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Physician Directory</h1>
        <p className="text-xs text-slate-500 mt-1">Directory of certified consulting physicians affiliated with HemoVault AI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {doctors.length === 0 ? (
          <div className="text-center p-12 text-xs text-slate-400 col-span-2">
            No certified physicians registered on this network.
          </div>
        ) : (
          doctors.map(d => (
            <div key={d._id} className="glass-card p-6 rounded-3xl space-y-3 flex flex-col justify-between hover:border-slate-350 transition-colors">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                      {d.user?.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100">Dr. {d.user?.name}</h3>
                      <span className="text-3xs bg-teal-500/10 text-teal-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider block mt-1 w-max">
                        {d.specialization}
                      </span>
                    </div>
                  </div>
                  <span className="p-1 rounded bg-slate-100 dark:bg-slate-850">
                    <ShieldCheck size={16} className="text-emerald-500" />
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850 text-2xs text-slate-500">
                  <p className="flex items-center gap-1.5">
                    <Landmark size={14} className="text-slate-400" />
                    <span>Hospital: {d.hospital?.name || 'Metro General Hospital'}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-400" />
                    <span>Contact: {d.user?.phone || 'No Phone Registered'}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail size={14} className="text-slate-400" />
                    <span>Email: {d.user?.email}</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Lic: {d.licenseNumber}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LabDoctorDirectory;
