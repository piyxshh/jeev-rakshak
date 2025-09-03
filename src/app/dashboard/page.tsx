// app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { User, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { LayoutDashboard, LogOut, MapPin, Bell, AlertTriangle } from 'lucide-react'
import dynamic from 'next/dynamic'
import ActionModal from '@/components/ActionModal'
import toast, { Toaster } from 'react-hot-toast'

// Define types for our data
type Profile = {
  id: string;
  role: 'admin' | 'farmer';
  full_name: string;
}

type Report = {
  id: number;
  location: any;
  symptom: string;
  created_at: string;
  reporter_id: string; 
}

// Dynamically import the Map component
const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <p>Loading map...</p>
})

// ====================================================================
// 🧑‍🌾 FARMER DASHBOARD COMPONENT
// ====================================================================
function FarmerDashboard({ user, supabase }: { user: User, supabase: any }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const channelName = `farmer-alerts:${user.id}`;
      const channel = supabase.channel(channelName);

      channel.on('broadcast', { event: 'new-alert' }, (payload: { payload: { message: string } }) => {
        toast.error(payload.payload.message, {
          duration: 10000,
          icon: '🚨',
        });
      }).subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [supabase, user.id]);

    const handleReportSickness = async () => {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            const location = `POINT(${longitude} ${latitude})`;

            const { error } = await supabase.from('reports').insert({
              reporter_id: user.id,
              location: location,
              symptom: 'Initial Report'
            });

            if (error) {
              alert(error.message);
            } else {
              toast.success('Report submitted successfully!');
            }
            setLoading(false);
        },
        (error) => {
            alert(`Error getting location: ${error.message}`);
            setLoading(false);
        }
        );
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <>
            <Toaster position="top-center" />
            <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
              <div className="w-full max-w-md text-center">
                  <div className="mb-8 p-6 bg-white rounded-2xl shadow-md">
                    <h1 className="text-2xl font-bold text-gray-800">Welcome, Farmer!</h1>
                    <p className="text-gray-500">Your phone: {user.phone}</p>
                  </div>
                  <button
                    onClick={handleReportSickness}
                    disabled={loading}
                    className="w-48 h-48 bg-red-500 text-white rounded-full shadow-2xl flex flex-col items-center justify-center transition-transform transform hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <div className="text-5xl">🚨</div>
                    <span className="mt-2 text-xl font-bold">
                        {loading ? 'Submitting...' : 'Report Sickness'}
                    </span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="mt-8 flex items-center justify-center mx-auto gap-2 text-gray-500 hover:text-red-600"
                  >
                    <LogOut size={16} /> Logout
                  </button>
              </div>
            </main>
        </>
    );
}

// ====================================================================
// 🏢 ADMIN DASHBOARD COMPONENT
// ====================================================================
function AdminDashboard({ user, supabase }: { user: User, supabase: any }) {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const handleOpenModal = (reportId: number) => {
    setSelectedReportId(reportId);
  };

  const handleCloseModal = () => {
    setSelectedReportId(null);
  };

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      if (data) setReports(data);
      if (error) console.error(error);
    };
    fetchReports();

    const channel = supabase.channel('realtime reports').on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'reports' }, 
      (payload: RealtimePostgresChangesPayload<Report>) => {
        setReports(currentReports => [payload.new as Report, ...currentReports]);
        toast.success('New report received!');
      }
    ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      <div className="flex h-screen bg-gray-100 font-sans">
        <aside className="w-64 bg-white shadow-lg flex flex-col">
           <div className="p-6 text-center border-b">
                <h1 className="text-2xl font-bold" style={{ color: '#0D2B4D' }}>Jeev Rakshak</h1>
                <p className="text-sm text-gray-500">Admin Portal</p>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-green-800 bg-green-100 rounded-lg font-semibold">
                    <LayoutDashboard size={20} /> Dashboard
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                    <MapPin size={20} /> Reports
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                    <Bell size={20} /> Alerts
                </a>
            </nav>
            <div className="p-4 border-t">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg"
                >
                    <LogOut size={20} /> Logout
                </button>
            </div>
        </aside>
        <main className="flex-1 flex flex-col p-6 overflow-y-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Live Threat Dashboard</h2>
          <div className="flex-1 grid grid-cols-3 gap-6">
            <div className="col-span-1 bg-white rounded-xl shadow-md border p-4 flex flex-col">
              <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                <AlertTriangle className="text-orange-500"/> Incoming Reports
              </h3>
              <ul className="space-y-3 overflow-y-auto">
                {reports.map(report => (
                  <li 
                    key={report.id} 
                    onClick={() => handleOpenModal(report.id)}
                    className="p-3 rounded-lg bg-orange-50 border border-orange-200 cursor-pointer hover:bg-orange-100 hover:shadow-sm"
                  >
                    <p className="font-bold text-orange-800">Report #{report.id}</p>
                    <p className="text-sm text-gray-600">Symptom: {report.symptom}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(report.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 bg-white rounded-xl shadow-md border">
              <Map reports={reports} />
            </div>
          </div>
        </main>
      </div>
      <ActionModal 
        reportId={selectedReportId} 
        isOpen={selectedReportId !== null} 
        onClose={handleCloseModal} 
      />
      <Toaster position="top-right" />
    </>
  );
}

// ====================================================================
// 🚪 MAIN PAGE COMPONENT
// ====================================================================
export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    
    const supabase = createClientComponentClient();
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            router.push('/');
            return;
        }
        
        setUser(session.user);
        
        const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
        
        if (error) {
            console.error("Error fetching profile:", error);
        } else {
            setProfile(profileData);
        }
        
        setLoading(false);
        };

        fetchProfile();
    }, [supabase, router]);
    
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    
    if (!user || !profile) {
        router.push('/');
        return null;
    }
    
    if (profile.role === 'admin') {
        return <AdminDashboard user={user} supabase={supabase} />;
    } else {
        return <FarmerDashboard user={user} supabase={supabase} />;
    }
}