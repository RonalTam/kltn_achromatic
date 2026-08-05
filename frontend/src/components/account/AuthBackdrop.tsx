import Image from 'next/image';
import type { ReactNode } from 'react';

const AUTH_DESKTOP_IMAGE = '/hero/hero-vietnam-city-blue-2k.png';
const AUTH_MOBILE_IMAGE = '/hero/hero-vietnam-city-blue-mobile-2k.png';

export function AuthBackdrop() {
  return (
    <>
      <div className="absolute inset-0">
        <Image
          src={AUTH_MOBILE_IMAGE}
          alt=""
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center opacity-80 md:hidden"
        />
        <Image
          src={AUTH_DESKTOP_IMAGE}
          alt=""
          fill
          priority
          quality={90}
          sizes="100vw"
          className="hidden object-cover object-center opacity-80 md:block"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.84)_0%,rgba(255,255,255,0.66)_45%,rgba(255,255,255,0.36)_100%)]" />
      <div className="absolute inset-0 bg-white/10" />
    </>
  );
}

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#111111] px-5 py-10 pt-24">
      <AuthBackdrop />
      {children}
    </div>
  );
}
