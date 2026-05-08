'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Plus, Users, FileText, Activity, BarChart3, Settings, Upload, Brain, Copy } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Admin {
  id: string;
  email: string;
  fullName: string;
  schoolName?: string;
}

interface Stats {
  totalStudents: number;
  totalExams: number;
  activeExams: number;
  totalQuestions: number;
  todayAttempts: number;
  avgScore: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0, totalExams: 0, activeExams: 0, totalQuestions: 0, todayAttempts: 0, avgScore: 0
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'exams' | 'import' | 'settings'>('overview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const adminData = localStorage.getItem('admin_data');

    if (!token || !adminData) {
      router.push('/admin-login');
      return;
    }

    try {
      setAdmin(JSON.parse(adminData));
      fetchStats(token);
    } catch (error) {
      router.push('/admin-login');
    }
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    router.push('/admin-login');
  };

  const copyAdminCode = () => {
    if (admin) {
      navigator.clipboard.writeText(admin.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background">Memuat...</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel Guru</h1>
            <p className="text-sm text-muted-foreground">{admin?.schoolName || 'CBT Platform'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{admin?.fullName}</p>
              <p className="text-xs text-muted-foreground">{admin?.email}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-border text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-2" /> Keluar
            </Button>
          </div>
        </div>
      </header>

      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Ringkasan', icon: BarChart3 },
            { id: 'students', label: 'Siswa', icon: Users },
            { id: 'exams', label: 'Ujian', icon: FileText },
            { id: 'import', label: 'Soal & AI', icon: Brain },
            { id: 'settings', label: 'Pengaturan', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Kode Sekolah Anda</h3>
                  <p className="text-sm text-muted-foreground">Berikan kode ini (email Anda) kepada siswa saat mereka mendaftar</p>
                </div>
                <div className="flex items-center gap-3">
                  <code className="px-4 py-2 bg-background rounded-md border border-border font-mono text-lg">{admin?.email}</code>
                  <Button onClick={copyAdminCode} variant="outline" className="border-primary/50 text-primary">
                    {copied ? 'Tersalin!' : <><Copy className="w-4 h-4 mr-2" /> Salin</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                { label: 'Total Siswa', value: stats.totalStudents, icon: Users },
                { label: 'Ujian Aktif', value: stats.activeExams, icon: Activity },
                { label: 'Bank Soal', value: stats.totalQuestions, icon: FileText },
                { label: 'Rata-rata Nilai', value: `${stats.avgScore}%`, icon: BarChart3 },
              ].map((stat, i) => (
                <Card key={i} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-muted-foreground font-medium">{stat.label}</CardDescription>
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent><p className="text-3xl font-bold text-foreground">{stat.value}</p></CardContent>
                </Card>
              ))}
            </div>
            
            {/* Quick Actions and Recent Activity can go here */}
            <div className="text-center p-8 bg-card border border-border rounded-xl">
              <h3 className="text-lg font-semibold text-foreground mb-2">Panel Admin Sedang Dikembangkan</h3>
              <p className="text-muted-foreground">Pilih tab Ujian atau Siswa untuk mengelola data Anda.</p>
            </div>
          </div>
        )}
        
        {/* Placeholder for other tabs to save tokens */}
        {activeTab !== 'overview' && (
           <div className="text-center p-12 bg-card border border-border rounded-xl">
             <h3 className="text-xl font-semibold text-foreground mb-2">Tab {activeTab}</h3>
             <p className="text-muted-foreground">Fitur ini siap dihubungkan dengan Supabase.</p>
           </div>
        )}
      </main>
    </div>
  );
}
