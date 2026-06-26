import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // wait, react-router-dom!
import { useAuth } from '../../context/AuthContext';
import { UserPlus, UserRound, Stethoscope, Landmark, ShieldAlert, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Patient fields
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');

  // Doctor/Lab fields
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successToken, setSuccessToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const payload = {
      name,
      email,
      password,
      role,
      phone
    };

    if (role === 'patient') {
      payload.dateOfBirth = dob;
      payload.gender = gender;
      payload.bloodGroup = bloodGroup;
      payload.address = address;
    } else if (role === 'doctor') {
      payload.specialization = specialization;
      payload.licenseNumber = licenseNumber;
    } else if (role === 'laboratory') {
      payload.licenseNumber = licenseNumber;
      payload.address = address;
    }

    try {
      const res = await register(payload);
      if (res.success) {
        setSuccessToken(res.verificationToken);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (successToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
        <div className="max-w-md w-full glass-card p-8 rounded-3xl text-center space-y-6">
          <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Verify Your Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            HemoVault AI is running offline. To complete verification, click the simulated verification link below:
          </p>
          <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850">
            <Link 
              to={`/api/auth/verify/${successToken}`} 
              onClick={async (e) => {
                e.preventDefault();
                try {
                  const axios = (await import('axios')).default;
                  const res = await axios.get(`/api/auth/verify/${successToken}`);
                  if (res.data.success) {
                    alert('Email verified successfully! You will be redirected to your dashboard.');
                    navigate('/login');
                  }
                } catch (err) {
                  alert('Verification failed: ' + err.message);
                }
              }}
              className="text-xs font-semibold text-primary-500 hover:underline break-all"
            >
              Verify account: /api/auth/verify/{successToken}
            </Link>
          </div>
          <div>
            <Link to="/login" className="btn-primary w-full py-2.5">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 px-4 py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-xl w-full space-y-8 glass-card p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -z-10" />

        <div className="text-center">
          <span className="text-3xl">🛡️</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-teal-500 dark:from-primary-400 dark:to-teal-400 bg-clip-text text-transparent">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Join HemoVault AI - Blood Test Report Vault
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3 text-sm">
            <ShieldAlert className="flex-shrink-0" size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Role Select Buttons */}
        <div className="grid grid-cols-3 gap-3 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`py-3 text-xs font-bold rounded-xl flex flex-col items-center gap-1.5 transition-all ${
              role === 'patient' 
                ? 'bg-white dark:bg-slate-900 text-primary-500 shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserRound size={16} />
            <span>Patient</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`py-3 text-xs font-bold rounded-xl flex flex-col items-center gap-1.5 transition-all ${
              role === 'doctor' 
                ? 'bg-white dark:bg-slate-900 text-primary-500 shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope size={16} />
            <span>Doctor</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('laboratory')}
            className={`py-3 text-xs font-bold rounded-xl flex flex-col items-center gap-1.5 transition-all ${
              role === 'laboratory' 
                ? 'bg-white dark:bg-slate-900 text-primary-500 shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Landmark size={16} />
            <span>Laboratory</span>
          </button>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {role === 'laboratory' ? 'Laboratory Name' : 'Full Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder={role === 'laboratory' ? 'Apex Diagnostics' : 'John Doe'}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          {/* Patient Details */}
          {role === 'patient' && (
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
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
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field"
                  placeholder="123 Main St, Boston, MA"
                />
              </div>
            </div>
          )}

          {/* Doctor Details */}
          {role === 'doctor' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  required
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="input-field"
                  placeholder="Cardiology, General, etc."
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Medical License Number
                </label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="input-field"
                  placeholder="LIC-12345678"
                />
              </div>
            </div>
          )}

          {/* Lab Details */}
          {role === 'laboratory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Lab License ID
                </label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="input-field"
                  placeholder="LAB-12345678"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field"
                  placeholder="78 Oak St, Boston, MA"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-primary-500 hover:text-primary-400 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
