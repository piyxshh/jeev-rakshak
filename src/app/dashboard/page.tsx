// app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient, SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import dynamic from 'next/dynamic'
import toast, { Toaster } from 'react-hot-toast'

// 👇 FIX: Added ALL the necessary icons to this line, including Sparkles
import { 
  LayoutDashboard, LogOut, MapPin, Bell, AlertTriangle, 
  Home, ShieldCheck, BookOpen, AlertCircle, CheckCircle, Video, ArrowRight, ShieldAlert, Sparkles
} from 'lucide-react'

// Import components
import ActionModal from '@/components/ActionModal'

// Define types for our data
type Profile = {
  id: string;
  role: 'admin' | 'farmer';
  full_name: string | null;
}

type GeoJSONPoint = {
  type: 'Point';
  coordinates: [number, number];
}

type Report = {
  id: number;
  location: GeoJSONPoint;
  symptom: string;
  created_at: string;
  reporter_id: string; 
}

// Dynamically import the Map component
const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <p>Loading map...</p>
})

// Use SupabaseClient type for props
type DashboardProps = {
  user: User;
  supabase: SupabaseClient;
}

// --- Placeholder Screen Components ---

const CircularProgress = ({ score }: { score: number }) => {
    const sqSize = 140;
    const strokeWidth = 12;
    const radius = (sqSize - strokeWidth) / 2;
    const viewBox = `0 0 ${sqSize} ${sqSize}`;
    const dashArray = radius * Math.PI * 2;
    const dashOffset = dashArray - (dashArray * score) / 100;

    return (
        <svg width={sqSize} height={sqSize} viewBox={viewBox}>
            <circle className="stroke-current text-gray-200" cx={sqSize / 2} cy={sqSize / 2} r={radius} strokeWidth={`${strokeWidth}px`} fill="none" />
            <circle className="stroke-current text-green-500" cx={sqSize / 2} cy={sqSize / 2} r={radius} strokeWidth={`${strokeWidth}px`} fill="none" strokeLinecap="round" strokeLinejoin="round" transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`} style={{ strokeDasharray: dashArray, strokeDashoffset: dashOffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }} />
            <text className="fill-current text-3xl font-bold text-green-700" x="50%" y="50%" dy=".3em" textAnchor="middle">{`${score}`}</text>
        </svg>
    );
};

const HomeScreen = ({ user, supabase }: DashboardProps) => {
    const [loading, setLoading] = useState(false);
    
    const handleReportSickness = async () => {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            const location = `POINT(${longitude} ${latitude})`;
            const { error } = await supabase.from('reports').insert({ reporter_id: user.id, location: location, symptom: 'Initial Report' });
            if (error) { alert(error.message); } else { toast.success('Report submitted successfully!'); }
            setLoading(false);
        },
        (geoError) => {
            alert(`Error getting location: ${geoError.message}`); setLoading(false);
        }
        );
    };

    return (
        <div className="p-4 space-y-4">
            <div className="p-6 bg-white rounded-xl shadow-md text-center">
                <p className="text-gray-500 font-semibold mb-2">Your Biosecurity Level</p>
                <div className="flex items-center justify-center">
                    <CircularProgress score={85} />
                </div>
                <p className="mt-2 text-lg font-bold text-green-700">Level 5: Guardian</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-xl text-center text-white">
                <div className="flex justify-center items-center">
                    <ShieldAlert size={32} className="text-white" />
                    <h2 className="text-3xl font-bold ml-2">EMERGENCY</h2>
                </div>
                <p className="mt-2 mb-4 opacity-90">Report a suspected disease outbreak immediately.</p>
                <button onClick={handleReportSickness} disabled={loading} className="w-full py-4 bg-white text-red-600 font-bold text-lg rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-95 disabled:opacity-50 animate-pulse">
                    {loading ? 'Submitting...' : 'SUBMIT URGENT REPORT'}
                </button>
            </div>
        </div>
    );
};
const ChecklistScreen = () => {
    const [checkedItems, setCheckedItems] = useState<number[]>([]);
    const checklist = ['Clean water & feed containers', 'Check for pests (rodents, insects)', 'Disinfect footwear before entry', 'Inspect flock for signs of illness', 'Secure the farm perimeter'];

    const toggleCheck = (index: number) => {
        setCheckedItems(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
    };

    return (
    <div className="p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Daily Checklist</h2>
        <div className="space-y-3">
            {checklist.map((item, index) => (
                <div key={index} onClick={() => toggleCheck(index)} className="p-4 bg-white rounded-xl shadow-sm flex items-center justify-between cursor-pointer transition-all duration-200">
                    <span className={`font-medium ${checkedItems.includes(index) ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item}</span>
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-200 ${checkedItems.includes(index) ? 'bg-green-500' : 'bg-gray-200'}`}>
                        {checkedItems.includes(index) && <CheckCircle size={20} className="text-white" />}
                    </div>
                </div>
            ))}
        </div>
    </div>
    );
};
const EducationScreen = () => (
    <div className="p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Learning Center</h2>
        <div className="space-y-4">
            {['Recognizing Avian Flu Symptoms', 'Best Practices for Disinfection', 'Safe Manure Management'].map((title) => (
                <div key={title} className="bg-white rounded-xl shadow-sm overflow-hidden flex items-center p-3 cursor-pointer">
                    <div className="w-20 h-20 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Video size={32} className="text-orange-500" />
                    </div>
                    <div className="pl-4 flex-1">
                        <h3 className="font-bold text-gray-800">{title}</h3>
                        <p className="text-sm text-gray-500 mt-1">Video • 5 mins</p>
                    </div>
                    <ArrowRight size={20} className="text-gray-400" />
                </div>
            ))}
        </div>
    </div>
);
const AlertsScreen = () => (
    <div className="p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Alerts Inbox</h2>
        <div className="space-y-4">
            <div className="p-4 bg-red-100 border-l-4 border-red-500 rounded-r-lg">
                <div className="flex items-center gap-3">
                    <AlertCircle className="text-red-600" />
                    <h3 className="font-bold text-red-800">High Alert: Avian Flu Suspected</h3>
                </div>
                <p className="text-sm text-red-700 mt-2 ml-9">A case has been reported within 10km of your farm. Isolate your flock immediately.</p>
            </div>
            <div className="p-4 bg-orange-100 border-l-4 border-orange-500 rounded-r-lg">
                 <div className="flex items-center gap-3">
                    <AlertCircle className="text-orange-600" />
                    <h3 className="font-bold text-orange-800">Advisory: Increased Monitoring</h3>
                </div>
                <p className="text-sm text-orange-700 mt-2 ml-9">Increase biosecurity checks due to regional reports.</p>
            </div>
        </div>
    </div>
);
// This array is now defined once, outside the component.
const conversationScript = [
    { from: 'ai', text: 'Hello! I am your AI Biosecurity Assistant. How can I help you today?' },
    { from: 'ai', text: 'নমস্কার! আমি আপনার AI বায়োসিকিউরিটি অ্যাসিস্ট্যান্ট। আমি আপনাকে কিভাবে সাহায্য করতে পারি?' },
    { from: 'user', text: 'My chickens look sick. What should I do?' },
    { from: 'ai', text: 'I understand. To help, please describe the symptoms. Are they coughing, lethargic, or showing unusual discharge?' },
    { from: 'ai', text: 'আমি বুঝতে পারছি। সাহায্য করার জন্য, অনুগ্রহ করে লক্ষণগুলি বর্ণনা করুন। তারা কি কাশছে, অলস, বা অস্বাভাবিক স্রাব দেখাচ্ছে?' },
];

const AiGuideScreen = () => {
    const [messages, setMessages] = useState([conversationScript[0], conversationScript[1]]);
    const [step, setStep] = useState(2);

    useEffect(() => {
        if (step >= conversationScript.length) return; // Use >= to prevent out-of-bounds
        const nextMessage = conversationScript[step];
        const timer = setTimeout(() => {
            setMessages(prev => [...prev, nextMessage]);
            setStep(prev => prev + 1);
        }, nextMessage.from === 'ai' ? 1500 : 500); 

        return () => clearTimeout(timer);
    // The dependency array is now stable because conversationScript is defined outside.
    }, [step]);

    return (
        <div className="p-4 h-full flex flex-col">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">AI Guide</h2>
            <div className="flex-1 bg-white rounded-xl shadow-inner p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.from === 'ai' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${
                            msg.from === 'ai' 
                            ? 'bg-green-100 text-gray-800 rounded-bl-none' 
                            : 'bg-orange-500 text-white rounded-br-none'
                        }`}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 p-2 bg-white rounded-xl shadow-md">
                 <p className="text-center text-gray-400 font-semibold">Live chat simulation for demo</p>
            </div>
        </div>
    );
};

// ====================================================================
// 🧑‍🌾 FARMER DASHBOARD COMPONENT
// ====================================================================
function FarmerDashboard({ user, supabase }: DashboardProps) {
    const [activeTab, setActiveTab] = useState('home');
    const router = useRouter();
    useEffect(() => {
      const channelName = `farmer-alerts:${user.id}`;
      const channel = supabase.channel(channelName);
      channel.on('broadcast', { event: 'new-alert' }, (payload: { payload: { message: string } }) => {
        toast.error(payload.payload.message, { duration: 10000, icon: '🚨' });
      }).subscribe();
      return () => { supabase.removeChannel(channel); };
    }, [supabase, user.id]);
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };
    const renderContent = () => {
        switch (activeTab) {
            case 'checklist': return <ChecklistScreen />;
            case 'education': return <EducationScreen />;
            case 'alerts': return <AlertsScreen />;
            case 'guide': return <AiGuideScreen />;
            case 'home':
            default:
                return <HomeScreen user={user} supabase={supabase} />;
        }
    };
    return (
        <>
            <Toaster position="top-center" />
            <div className="w-full max-w-lg mx-auto bg-gray-100 font-sans h-screen flex flex-col shadow-2xl">
                <header className="p-4 flex justify-between items-center bg-white border-b border-gray-200">
                    <div><h1 className="text-2xl font-extrabold" style={{color: '#0D2B4D'}}>Jeev Rakshak</h1></div>
                    <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-100"><LogOut size={22} className="text-gray-500" /></button>
                </header>
                <main className="flex-1 overflow-y-auto">{renderContent()}</main>
                <nav className="grid grid-cols-5 gap-1 p-2 bg-white border-t border-gray-200">
                    <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center py-2 rounded-lg transition-colors duration-200 ${activeTab === 'home' ? 'text-green-600 bg-green-50' : 'text-gray-500'}`}><Home size={24} /><span className="text-xs font-bold mt-1">Home</span></button>
                    <button onClick={() => setActiveTab('checklist')} className={`flex flex-col items-center py-2 rounded-lg transition-colors duration-200 ${activeTab === 'checklist' ? 'text-green-600 bg-green-50' : 'text-gray-500'}`}><ShieldCheck size={24} /><span className="text-xs font-bold mt-1">Checklist</span></button>
                    <button onClick={() => setActiveTab('guide')} className={`flex flex-col items-center py-2 rounded-lg transition-colors duration-200 ${activeTab === 'guide' ? 'text-green-600 bg-green-50' : 'text-gray-500'}`}><Sparkles size={24} /><span className="text-xs font-bold mt-1">AI Guide</span></button>
                    <button onClick={() => setActiveTab('education')} className={`flex flex-col items-center py-2 rounded-lg transition-colors duration-200 ${activeTab === 'education' ? 'text-green-600 bg-green-50' : 'text-gray-500'}`}><BookOpen size={24} /><span className="text-xs font-bold mt-1">Learn</span></button>
                    <button onClick={() => setActiveTab('alerts')} className={`flex flex-col items-center py-2 rounded-lg transition-colors duration-200 ${activeTab === 'alerts' ? 'text-green-600 bg-green-50' : 'text-gray-500'}`}><Bell size={24} /><span className="text-xs font-bold mt-1">Alerts</span></button>
                </nav>
            </div>
        </>
    );
}

// ====================================================================
// 🏢 ADMIN DASHBOARD COMPONENT (Restored)
// ====================================================================
function AdminDashboard({ supabase }: DashboardProps) {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const handleOpenModal = (reportId: number) => { setSelectedReportId(reportId); };
  const handleCloseModal = () => { setSelectedReportId(null); };
  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      if (data) setReports(data as Report[]);
      if (error) console.error(error);
    };
    fetchReports();
    const intervalId = setInterval(fetchReports, 5000);
    return () => clearInterval(intervalId);
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
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-green-800 bg-green-100 rounded-lg font-semibold"><LayoutDashboard size={20} /> Dashboard</a>
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"><MapPin size={20} /> Reports</a>
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"><Bell size={20} /> Alerts</a>
            </nav>
            <div className="p-4 border-t">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg"><LogOut size={20} /> Logout</button>
            </div>
        </aside>
        <main className="flex-1 flex flex-col p-6 overflow-y-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Live Threat Dashboard</h2>
          <div className="flex-1 grid grid-cols-3 gap-6">
            <div className="col-span-1 bg-white rounded-xl shadow-md border p-4 flex flex-col">
              <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2"><AlertTriangle className="text-orange-500"/> Incoming Reports</h3>
              <ul className="space-y-3 overflow-y-auto">
                {reports.map(report => (
                  <li key={report.id} onClick={() => handleOpenModal(report.id)} className="p-3 rounded-lg bg-orange-50 border border-orange-200 cursor-pointer hover:bg-orange-100 hover:shadow-sm">
                    <p className="font-bold text-orange-800">Report #{report.id}</p>
                    <p className="text-sm text-gray-600">Symptom: {report.symptom}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(report.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 bg-white rounded-xl shadow-md border"><Map reports={reports} /></div>
          </div>
        </main>
      </div>
      <ActionModal reportId={selectedReportId} isOpen={selectedReportId !== null} onClose={handleCloseModal} />
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
            if (!session) { router.push('/'); return; }
            setUser(session.user);
            const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (error) { console.error("Error fetching profile:", error); } 
            else { setProfile(profileData as Profile); }
            setLoading(false);
        };
        fetchProfile();
    }, [supabase, router]);
    
    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (!user || !profile) { router.push('/'); return null; }
    
    if (profile.role === 'admin') {
        return <AdminDashboard user={user} supabase={supabase} />;
    } else {
        return <FarmerDashboard user={user} supabase={supabase} />;
    }
}