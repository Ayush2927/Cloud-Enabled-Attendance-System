import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Save, Shield, UserCircle2, Mail, ShieldCheck, Fingerprint, Settings, ArrowRight, Activity, Key, LogOut } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '../../components/ui/MagicCard';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { Meteors } from '../../components/ui/Meteors';
import { cn } from '../../lib/utils';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('The new passwords you entered do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Passcodes must be at least 6 characters long');
      return;
    }
    setIsSaving(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Your security key has been updated!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'We could not update your password right now');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: <User size={18} /> },
    { id: 'security', label: 'Safety & Keys', icon: <Lock size={18} /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200 } }
  };

  return (
    <div className="container mx-auto px-6 py-10 md:p-14 w-full max-w-7xl relative z-10 overflow-hidden min-h-screen">
      <Meteors number={15} />

      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 mb-20 relative"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <Settings size={12} className="animate-pulse" />
            System Preferences
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 text-white uppercase">
            Your Account
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            Your workspace, your rules. Personalize your experience and keep your account secure.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Navigation Sidebar for Settings */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-4 space-y-4"
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-6 p-6 rounded-[2rem] transition-all duration-500 group border text-left",
                activeTab === tab.id 
                  ? "bg-white/10 border-white/10 text-white shadow-2xl shadow-indigo-500/10" 
                  : "bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-2xl",
                activeTab === tab.id ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-500"
              )}>
                {tab.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tighter uppercase antialiased">{tab.label}</span>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-0.5 opacity-60">
                   Manage {tab.id} settings
                </span>
              </div>
              {activeTab === tab.id && (
                <div className="ml-auto">
                  <ArrowRight size={16} className="text-white/40" />
                </div>
              )}
            </button>
          ))}
          
          <div className="p-8 mt-12 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 shadow-2xl">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <ShieldCheck size={14} /> Security status
            </h3>
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
               <span className="text-sm font-bold text-slate-400">Identity Verified</span>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-8"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'profile' ? (
              <motion.div 
                key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <MagicCard className="p-10 md:p-14" gradientColor="rgba(99, 102, 241, 0.05)">
                  <h2 className="text-2xl font-black text-white mb-12 flex items-center gap-4 tracking-tighter uppercase">
                     <UserCircle2 className="text-indigo-400" size={28} /> About You
                  </h2>
                  
                  <div className="flex items-center gap-10 mb-16 px-4">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-[3.5rem] bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-4xl font-black text-black shadow-2xl group-hover:scale-110 transition-transform duration-500">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-black border-2 border-white/10 flex items-center justify-center text-white shadow-2xl">
                         <Fingerprint size={18} className="text-cyan-400" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{user?.name}</h3>
                      <p className="text-slate-500 text-lg font-bold tracking-tight mt-1">{user?.email}</p>
                      <div className="mt-4 flex items-center gap-4">
                        <span className="px-5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/10">
                          {user?.role} Access
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest antialiased">
                          <Shield size={12} className="text-emerald-400/40" /> Verified Member
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col gap-2 hover:bg-white/[0.08] transition-all">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</span>
                      <span className="text-lg font-black text-white tracking-tighter uppercase">{user?.name}</span>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col gap-2 hover:bg-white/[0.08] transition-all">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Connection</span>
                      <span className="text-lg font-black text-white tracking-tighter antialiased">{user?.email}</span>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col gap-2 hover:bg-white/[0.08] transition-all">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Assigned Role</span>
                      <span className="text-lg font-black text-white tracking-tighter uppercase">{user?.role}</span>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col gap-2 hover:bg-white/[0.08] transition-all">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Digital Identifier</span>
                      <span className="text-xs font-black text-indigo-400 font-mono tracking-tight opacity-60 uppercase">{user?._id || user?.id || '—'}</span>
                    </div>
                  </div>
                </MagicCard>
              </motion.div>
            ) : (
              <motion.div 
                key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl"
              >
                <MagicCard className="p-10 md:p-14" gradientColor="rgba(244, 63, 94, 0.05)">
                  <div className="flex items-center gap-4 mb-12">
                     <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 shadow-2xl shadow-rose-500/5">
                        <Key size={24} />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Security Keys</h2>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-60">Authentication protocols</span>
                     </div>
                  </div>
                  
                  <form className="space-y-8" onSubmit={handlePasswordChange}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Current secure key</label>
                      <input
                        type="password"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-4 focus:ring-rose-500/10 transition-all hover:bg-black/60 shadow-inner"
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                        disabled={isSaving}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">New secure key</label>
                      <input
                        type="password"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-4 focus:ring-rose-500/10 transition-all hover:bg-black/60 shadow-inner"
                        placeholder="Min 6 characters recommended"
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                        disabled={isSaving}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm new key</label>
                      <input
                        type="password"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-4 focus:ring-rose-500/10 transition-all hover:bg-black/60 shadow-inner"
                        placeholder="Re-enter your new key"
                        value={passwordData.confirmPassword}
                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                        disabled={isSaving}
                      />
                    </div>

                    <div className="pt-6">
                      <ShimmerButton 
                        type="submit" 
                        className={cn("w-full h-14 font-black uppercase tracking-[0.1em] text-xs shadow-2xl", isSaving ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-white text-black")}
                        shimmerColor="rgba(255, 255, 255, 0.4)"
                        borderRadius="1.5rem"
                        disabled={isSaving}
                      >
                         {isSaving ? 'Updating...' : 'Update Security Key'}
                      </ShimmerButton>
                    </div>
                  </form>

                  <div className="mt-10 p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                     <p className="text-[10px] text-slate-500 font-bold leading-relaxed antialiased flex gap-3">
                        <AlertCircle className="shrink-0 text-rose-500" size={14} />
                        Changing your security key will secure your account across all active sessions. 
                        Please ensure you can remember your new key before updating.
                     </p>
                  </div>
                </MagicCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function AlertCircle({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} height={size} 
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
