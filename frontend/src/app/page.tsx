import React from "react";
import type { Metadata } from "next";
import { HomepageMerchandising } from "@/lib/types";

// Homepage section components
import { HeroSlider } from "@/components/home/HeroSlider";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { NewArrivals } from "@/components/home/NewArrivals";
import { BestSellers } from "@/components/home/BestSellers";
import { CollectionBanner } from "@/components/home/CollectionBanner";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { LazyHomeSections } from "@/components/home/LazyHomeSections";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const metadata: Metadata = {
  title: "ACHROMATIC | Thời Trang Tối Giản Cao Cấp Việt Nam",
  description:
    "Khám phá áo polo, áo thun, sơ mi, quần và phụ kiện tối giản được thiết kế cho nhịp sống hiện đại tại Việt Nam.",
  alternates: { canonical: "/" },
};

const EMPTY_HOME_SECTIONS: HomepageMerchandising = {
  newArrivals: { products: [], limit: 8, source: "fallback" },
  bestSellers: { products: [], limit: 8, source: "fallback" },
};

async function getHomeSections(): Promise<HomepageMerchandising> {
  try {
    const res = await fetch(`${API_URL}/products/home-sections`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return EMPTY_HOME_SECTIONS;
    const json = await res.json();
    return json.data || EMPTY_HOME_SECTIONS;
  } catch {
    return EMPTY_HOME_SECTIONS;
  }
}

export default async function HomePage() {
  const homeSections = await getHomeSections();

  return (
    <div className="overflow-x-hidden">
      {/* ── SECTION 1: Hero Slider ── */}
      <HeroSlider />

      {/* ── SECTION 2: Featured Categories ── */}
      <FeaturedCategories />

      {/* ── SECTION 3: New Arrivals ── */}
      <NewArrivals products={homeSections.newArrivals.products} />

      {/* ── SECTION 4: Best Sellers Carousel ── */}
      <BestSellers products={homeSections.bestSellers.products} />

      {/* ── SECTION 5: Collection Banner ── */}
      <CollectionBanner />

      {/* ── SECTION 6: Why Choose Us ── */}
      <WhyChooseUs />

      {/* Sections below the fold are split into lazy client chunks. */}
      <LazyHomeSections />
    </div>
  );
}
