'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, AlertCircle, Eye, EyeOff, Zap, Shield, UserPlus } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/admin/register' : '/api/auth/admin/login';
      const body = isRegister
        ? { email, password, fullName, schoolName }
        : { email, password };

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

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_data', JSON.stringify(data.data));
      router.push('/admin-dashboard');
    } catch {
      setError('Terjadi kesalahan jaringan. Coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Math Battle Arena</h1>
          <p className="text-muted-foreground text-sm">Panel Guru & Administrator</p>
        </div>

        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="flex justify-center">
              <div className="p-2 bg-primary/10 rounded-xl">
                {isRegister ? (
                  <UserPlus className="w-6 h-6 text-primary" />
                ) : (
                  <Shield className="w-6 h-6 text-primary" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {isRegister ? 'Daftar Admin' : 'Masuk Admin'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isRegister
                ? 'Buat akun guru/admin baru untuk sekolah Anda'
                : 'Masuk untuk mengelola ujian dan siswa'}
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

              {isRegister && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Nama Lengkap</label>
                    <Input
                      placeholder="Nama guru/admin"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-input border-border text-foreground"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Nama Sekolah</label>
                    <Input
                      placeholder="mis. SMA Negeri 1 Jakarta"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
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
                  placeholder="guru@sekolah.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input border-border text-foreground"
                  disabled={loading}
                  required
                  autoFocus={!isRegister}
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
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
              >
                <Lock className="w-4 h-4 mr-2" />
                {loading
                  ? isRegister ? 'Mendaftar...' : 'Masuk...'
                  : isRegister ? 'Daftar Sekarang' : 'Masuk ke Panel Admin'}
              </Button>
            </form>

            <div className="mt-5 space-y-4">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-border" />
                <span className="px-3 text-xs text-muted-foreground">atau</span>
                <div className="flex-grow border-t border-border" />
              </div>

              <button
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="w-full text-sm text-center text-primary hover:underline"
              >
                {isRegister
                  ? 'Sudah punya akun admin? Masuk di sini'
                  : 'Belum punya akun? Daftar sebagai guru/admin'}
              </button>

              <div className="text-center">
                <Link href="/user-login" className="text-xs text-muted-foreground hover:text-foreground">
                  Login sebagai Siswa
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
