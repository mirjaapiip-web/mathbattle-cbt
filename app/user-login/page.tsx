'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Lock, AlertCircle, Eye, EyeOff, Zap, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function UserLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [attendanceNumber, setAttendanceNumber] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/user/login' : '/api/auth/user/register';
      const body = isLogin
        ? { email, password }
        : { email, password, fullName, className, attendanceNumber, adminCode };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Operasi gagal');
        setLoading(false);
        return;
      }

      localStorage.setItem('user_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.data));
      router.push('/user-dashboard');
    } catch {
      setError('Terjadi kesalahan jaringan. Coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-accent to-primary rounded-2xl shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Math Battle Arena</h1>
          <p className="text-muted-foreground text-sm">Platform CBT Matematika Indonesia</p>
        </div>

        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="flex justify-center">
              <div className="p-2 bg-accent/10 rounded-xl">
                <GraduationCap className="w-6 h-6 text-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {isLogin ? 'Masuk Siswa' : 'Daftar Siswa'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isLogin
                ? 'Masuk untuk mengakses ujian dan latihan'
                : 'Buat akun siswa baru'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {!isLogin && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Nama Lengkap</label>
                    <Input
                      placeholder="Masukkan nama lengkap"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-input border-border text-foreground"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Kelas</label>
                      <Input
                        placeholder="mis. 10A"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="bg-input border-border text-foreground"
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">No. Absen</label>
                      <Input
                        placeholder="mis. 5"
                        value={attendanceNumber}
                        onChange={(e) => setAttendanceNumber(e.target.value)}
                        className="bg-input border-border text-foreground"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Kode Sekolah <span className="text-muted-foreground text-xs">(dari guru)</span>
                    </label>
                    <Input
                      placeholder="Masukkan kode sekolah"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      className="bg-input border-border text-foreground"
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="siswa@sekolah.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input border-border text-foreground"
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Kata Sandi</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input border-border text-foreground pr-10"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11"
              >
                {loading
                  ? isLogin ? 'Masuk...' : 'Mendaftar...'
                  : isLogin ? 'Masuk' : 'Daftar Sekarang'}
              </Button>
            </form>

            <div className="mt-5 space-y-4">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-border" />
                <span className="px-3 text-xs text-muted-foreground">atau</span>
                <div className="flex-grow border-t border-border" />
              </div>

              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="w-full text-sm text-center text-primary hover:underline"
              >
                {isLogin
                  ? 'Belum punya akun? Daftar sekarang'
                  : 'Sudah punya akun? Masuk di sini'}
              </button>

              <div className="text-center">
                <Link href="/admin-login" className="text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  Login sebagai Guru / Admin
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
