import { SkeletonProductGrid } from "@/components/common/Skeletons";

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] px-5 pb-20 pt-32 md:px-10 md:pt-40 lg:px-20">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-12 max-w-[1120px] space-y-4">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-12 w-56" />
          <div className="skeleton h-[72px] w-full" />
        </div>
        <SkeletonProductGrid count={8} />
      </div>
    </div>
  );
}
