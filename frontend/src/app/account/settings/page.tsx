"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const { user, accessToken, setUser } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/account/login');
    } else {
      const frame = requestAnimationFrame(() => {
        setFormData({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone ?? '',
        });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setLoading(true);
    setMessage('');

    try {
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      const res = await api.patch('/users/me', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });
      setUser(res.data.data, accessToken);
      setMessage('Đã cập nhật thông tin tài khoản.');
      toast.success('Cập nhật thành công!', {
        description: 'Thông tin tài khoản của bạn đã được lưu.',
        duration: 3000,
      });
    } catch {
      const errMsg = 'Không thể cập nhật thông tin. Vui lòng thử lại.';
      setMessage(errMsg);
      toast.error('Cập nhật thất bại', { description: errMsg, duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-5 md:px-20 pt-28 pb-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại tài khoản
        </Link>

        <h1 className="font-heading text-3xl md:text-4xl font-light tracking-tight text-primary mb-8">
          Cài Đặt Tài Khoản
        </h1>

        <div className="border border-border bg-card p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="font-heading text-lg uppercase tracking-wide text-primary mb-6">
                Thông Tin Cá Nhân
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Họ
                    </label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Nguyễn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Tên
                    </label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="Văn A"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Địa chỉ email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled
                    className="bg-accent cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Địa chỉ email không thể thay đổi
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Số điện thoại
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0912 345 678"
                  />
                </div>
              </div>
            </div>

            {message && (
              <p className="border border-border bg-accent p-3 text-sm text-primary">
                {message}
              </p>
            )}

            <div className="pt-6 border-t border-border flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/account')}>
                Hủy
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
