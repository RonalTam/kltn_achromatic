"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDImdqpgfEHItpn3Fr3nXVhnQhcaKyzhwxi2XIB8bOWl9KyNipTTADbjmZtiKi87lX9gOll0688PhmWZvZS1Yv9-gc-YKLPhy-OMfPo4PORy8BEkflLvHVRnhKFRDdohYept57eQ8BGPFHMdfAMWfa61GCwIW44cfuZcy1dfR0peNg-2vBi72hsoh1RYn6ffvbKtb5aLqOdXtuHTSmix3DfvpcJGaX69cWiEzekyGrek_Dw4NPcg_b1wvuGU0Hsm87PblSYbIsX_1s5',
      title: 'The Modern Standard',
      buttonText: 'Explore Collection',
      href: '/collections'
    },
    {
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASe7XJRyyYFpPE6ZPqV4Sr0X3im9MiHkzROGh94ILdtDIUSzIM6yGKVwpRDQsSPr02MSKhG8iLR88gUhh3o48o_zAY-cwys65K9lLgVkL19NikR0zJkw5C1DxTKH9izc3des2679ZIRDRgrRvpJBOJzHyfASs51W0oni5zuGMJ-bn6aP7FVTJ9D2Pp56GFOr1T2JXlsEkSRUqHcqYq4NZ9tAoP7mpZ1WdYJ_WSdT_8xZq9PFlJFnVfAzd_SFP3eWjWLqsSeP4JGj6j',
      title: 'Refined Essentials',
      buttonText: 'Shop Now',
      href: '/category/t-shirt'
    },
    {
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpDWiDbube5wyT2Tz6zI6tPCgwJffW-wF9KrobKIyDtVGWIjQ6_98tP2FXAqxY0ZxS8DSL1tWj1FEcgA7y_TDAM96vLxbmG9FZPMKuLTtL_rBXDl49G6z5n_c6gjmxkUjk1nwiwRFNdJz2IJhKZSJEEb57YXbQWg-fe-dJl2zYa_Ci7cYt6Wsb2pk3RZxkCxuwQDn1aMKm85wFx-DtA5kxqnn1aAu41fWdGQ08ZFKJELYFfxwB6aN64ZnZcKz6OWoyXsa6YZF2fagH',
      title: 'Uncompromising Quality',
      buttonText: 'View Lookbook',
      href: '/collections'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative w-full h-[600px] md:h-[800px] overflow-hidden bg-accent group" id="hero-section">
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              alt={slide.title}
              src={slide.image}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover object-center grayscale contrast-125 brightness-[0.85]"
            />
            <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-center p-8">
              <h1 className="font-heading text-4xl md:text-7xl text-white mb-8 uppercase tracking-tight font-light select-none">
                {slide.title}
              </h1>
              <Link
                href={slide.href}
                className="inline-block border border-white text-white px-8 py-4 font-sans text-xs hover:bg-white hover:text-black transition-all duration-300 rounded-none tracking-[0.2em] uppercase font-bold"
              >
                {slide.buttonText}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Carousel Controls Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-20" id="carousel-indicators">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`w-12 h-1 transition-colors duration-300 ${
              idx === currentSlide ? 'bg-white' : 'bg-white/40 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
