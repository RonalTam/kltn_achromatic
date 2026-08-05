"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { AuthPageShell } from '@/components/account/AuthBackdrop';

function PasswordStrengthIndicator({ password }: { password: string }) {
  const rules = [
    { label: 'Ít nhất 8 ký tự', valid: password.length >= 8 },
    { label: 'Có chữ hoa', valid: /[A-Z]/.test(password) },
    { label: 'Có số', valid: /\d/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      {rules.map((rule) => (
        <div key={rule.label} className="flex items-center gap-2 text-xs">
          {rule.valid ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )}
          <span className={rule.valid ? 'text-green-600' : 'text-muted-foreground'}>
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: formData.password,
      });
      setSuccess(true);
      setTimeout(() => router.push('/account/login'), 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } } & Error)
              ?.response?.data?.message || err.message
          : null;
      setError(msg || 'Liên kết đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // No token → show error
  if (!token) {
    return (
      <div className="relative z-10 w-full max-w-md border border-white/70 bg-card/90 p-8 text-center shadow-[0_24px_80px_rgba(17,17,17,0.14)] backdrop-blur-md">
          <h1 className="font-heading text-2xl text-primary mb-4">Liên kết không hợp lệ</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
          </p>
          <Link
            href="/account/forgot-password"
            className="text-primary hover:underline text-sm font-medium"
          >
            Yêu cầu đặt lại mật khẩu mới
          </Link>
        </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="font-heading text-2xl tracking-[0.15em] uppercase text-primary inline-block mb-6"
          >
            ACHROMATIC
          </Link>
          <h1 className="font-heading text-3xl font-light tracking-tight text-primary mb-2">
            Đặt Lại Mật Khẩu
          </h1>
          <p className="text-muted-foreground text-sm">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <div className="border border-white/70 bg-card/90 p-8 shadow-[0_24px_80px_rgba(17,17,17,0.14)] backdrop-blur-md">
          {/* Success State */}
          {success ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <h2 className="font-heading text-xl font-medium text-primary mb-2">
                Mật khẩu đã được cập nhật!
              </h2>
              <p className="text-muted-foreground text-sm">
                Đang chuyển về trang đăng nhập...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded">
                  {error}
                </div>
              )}

              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="Tối thiểu 8 ký tự"
                    autoComplete="new-password"
                    autoFocus
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrengthIndicator password={formData.password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    placeholder="Nhập lại mật khẩu mới"
                    autoComplete="new-password"
                    className={`pr-10 ${
                      formData.confirmPassword && !passwordsMatch ? 'border-destructive' :
                      formData.confirmPassword && passwordsMatch ? 'border-green-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-destructive mt-1">Mật khẩu không khớp</p>
                )}
                {formData.confirmPassword && passwordsMatch && (
                  <p className="text-xs text-green-600 mt-1">Mật khẩu khớp ✓</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-heading text-sm tracking-wider uppercase"
              >
                {loading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
              </Button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/account/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay về đăng nhập
          </Link>
        </div>
      </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={<div className="relative z-10 text-sm text-primary">Đang tải...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}
