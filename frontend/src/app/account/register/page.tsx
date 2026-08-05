"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';

  const { register } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
      });
      toast.success('Tạo tài khoản thành công!', {
        description: 'Chào mừng bạn đến với ACHROMATIC.',
        duration: 3000,
      });
      router.push(redirectTo);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } } & Error)
              ?.response?.data?.message || err.message
          : null;
      const errorMsg = msg || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(errorMsg);
      toast.error('Đăng ký thất bại', { description: errorMsg, duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

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
            Tạo Tài Khoản
          </h1>
          <p className="text-muted-foreground text-sm">
            Đăng ký để nhận ưu đãi độc quyền và theo dõi đơn hàng
          </p>
        </div>

        {/* Form Card */}
        <div className="border border-white/70 bg-card/90 p-5 shadow-[0_24px_80px_rgba(17,17,17,0.14)] backdrop-blur-md sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Error message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded">
                {error}
              </div>
            )}

            {/* Name row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-primary mb-1.5">
                  Họ
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Nguyễn"
                  autoComplete="family-name"
                />
              </div>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-primary mb-1.5">
                  Tên
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="Văn A"
                  autoComplete="given-name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-1.5">
                Địa chỉ email
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="email@example.com"
                autoComplete="email"
              />
            </div>

            {/* Phone (optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-primary mb-1.5">
                Số điện thoại{' '}
                <span className="text-muted-foreground font-normal">(không bắt buộc)</span>
              </label>
              <Input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="0912 345 678"
                autoComplete="tel"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Tối thiểu 8 ký tự"
                  autoComplete="new-password"
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary mb-1.5">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                  className={`pr-10 ${
                    formData.confirmPassword && !passwordsMatch
                      ? 'border-destructive'
                      : formData.confirmPassword && passwordsMatch
                      ? 'border-green-500'
                      : ''
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

            {/* Terms */}
            <p className="text-xs text-muted-foreground">
              Bằng cách đăng ký, bạn đồng ý với{' '}
              <Link href="/policy" className="text-primary hover:underline">
                Điều khoản dịch vụ
              </Link>{' '}
              và{' '}
              <Link href="/policy" className="text-primary hover:underline">
                Chính sách bảo mật
              </Link>{' '}
              của ACHROMATIC.
            </p>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 font-heading text-sm tracking-wider uppercase"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Đã có tài khoản? </span>
            <Link
              href={`/account/login${redirectTo !== '/account' ? `?redirect=${redirectTo}` : ''}`}
              className="text-primary hover:underline font-medium"
            >
              Đăng nhập
            </Link>
          </div>
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay về trang chủ
          </Link>
        </div>
      </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={<div className="relative z-10 text-sm text-primary">Đang tải...</div>}>
        <RegisterForm />
      </Suspense>
    </AuthPageShell>
  );
}
