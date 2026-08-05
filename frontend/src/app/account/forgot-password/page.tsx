"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { AuthBackdrop } from '@/components/account/AuthBackdrop';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } } & Error)
              ?.response?.data?.message || err.message
          : null;
      // Even if email doesn't exist, show success (security best practice — don't leak email existence)
      if ((err as { response?: { status?: number } })?.response?.status === 404) {
        setSubmitted(true);
      } else {
        setError(msg || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#111111] px-5 py-10 pt-24">
      <AuthBackdrop />

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
            Quên Mật Khẩu
          </h1>
          <p className="text-muted-foreground text-sm">
            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
          </p>
        </div>

        <div className="border border-white/70 bg-card/90 p-8 shadow-[0_24px_80px_rgba(17,17,17,0.14)] backdrop-blur-md">
          {/* Success State */}
          {submitted ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <h2 className="font-heading text-xl font-medium text-primary mb-2">
                Email đã được gửi!
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Nếu email{' '}
                <span className="font-medium text-primary">{email}</span>{' '}
                tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu trong vài phút.
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Không thấy email? Hãy kiểm tra thư mục Spam hoặc thử lại sau 5 phút.
              </p>
              <button
                onClick={() => { setSubmitted(false); setEmail(''); }}
                className="text-sm text-primary hover:underline"
              >
                Thử email khác
              </button>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                  Địa chỉ email
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required
                    placeholder="email@example.com"
                    autoComplete="email"
                    autoFocus
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full h-12 font-heading text-sm tracking-wider uppercase"
              >
                {loading ? 'Đang gửi...' : 'Gửi Hướng Dẫn'}
              </Button>
            </form>
          )}
        </div>

        {/* Back to login */}
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
    </div>
  );
}
