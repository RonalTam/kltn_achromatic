"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Star,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Product, ReviewListResponse } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 5;
const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type ReviewEligibility = {
  eligible: boolean;
  orderId?: string;
  hasReviewed?: boolean;
  reason?: string;
};

type HelpfulVotesState = {
  reviewIds: string[];
};

type ReviewFormState = {
  rating: number;
  title: string;
  body: string;
};

const INITIAL_FORM: ReviewFormState = {
  rating: 0,
  title: "",
  body: "",
};

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response
  ) {
    const responseData = error.response.data as {
      message?: string | string[];
      error?: { message?: string | string[] };
    };
    const message = responseData?.message ?? responseData?.error?.message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === "string") return message;
  }
  return fallback;
}

function unwrapPayload<T>(value: unknown): T {
  const body = value as { data?: T };
  return (body?.data ?? value) as T;
}

function getHelpfulReviewIds(value: unknown): string[] {
  const payload = unwrapPayload<HelpfulVotesState | string[]>(value);
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.reviewIds) ? payload.reviewIds : [];
}

function getEligibilityMessage(eligibility: ReviewEligibility | null) {
  switch (eligibility?.reason) {
    case "ALREADY_REVIEWED":
      return "Cảm ơn bạn đã chia sẻ trải nghiệm về sản phẩm này.";
    case "NOT_PURCHASED_OR_NOT_DELIVERED":
      return "Form sẽ mở khi đơn hàng chứa sản phẩm này đã được giao hoặc hoàn tất.";
    default:
      return eligibility?.reason ?? "Form sẽ mở khi đơn hàng chứa sản phẩm này đã hoàn tất.";
  }
}

function countForRating(
  breakdown: ReviewListResponse["ratingBreakdown"],
  rating: number,
) {
  const entry = breakdown?.find((item) => item.rating === rating);
  if (!entry) return 0;
  if (typeof entry._count === "number") return entry._count;
  return entry._count._all ?? 0;
}

function StarRating({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-4 ${
            star <= Math.round(rating)
              ? "fill-[#111111] stroke-[#111111]"
              : "stroke-[#9A9A9A]"
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="space-y-7" aria-label="Đang tải đánh giá">
      {[1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse border-b border-border pb-7">
          <div className="mb-3 h-4 w-40 bg-muted" />
          <div className="mb-4 h-3 w-28 bg-muted" />
          <div className="mb-2 h-3 w-full bg-muted" />
          <div className="h-3 w-3/4 bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function ProductReviews({ product }: { product: Product }) {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<ReviewFormState>(INITIAL_FORM);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [votingReviewId, setVotingReviewId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imagePreviews = useMemo(
    () => images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [images],
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  const reviewsQuery = useQuery({
    queryKey: ["product-reviews", product.id, page, user?.id ?? "guest"],
    queryFn: async () => {
      const response = await api.get(`/reviews/product/${product.id}`, {
        params: { page, limit: PAGE_SIZE },
      });
      return unwrapPayload<ReviewListResponse>(response.data);
    },
  });

  const eligibilityQuery = useQuery({
    queryKey: ["review-eligibility", product.id, user?.id],
    queryFn: async () => {
      const response = await api.get(`/reviews/eligibility/${product.id}`);
      return unwrapPayload<ReviewEligibility>(response.data);
    },
    enabled: isAuthenticated && Boolean(user),
    retry: false,
  });

  const reviews = reviewsQuery.data?.data ?? [];
  const reviewIdsKey = reviews.map((review) => review.id).join(",");
  const helpfulVotesQueryKey = [
    "review-helpful-votes",
    product.id,
    user?.id ?? "guest",
    reviewIdsKey,
  ] as const;
  const helpfulVotesQuery = useQuery({
    queryKey: helpfulVotesQueryKey,
    queryFn: async () => {
      const response = await api.get("/reviews/helpful-votes", {
        params: { reviewIds: reviewIdsKey },
      });
      return { reviewIds: getHelpfulReviewIds(response.data) };
    },
    enabled:
      isAuthenticated &&
      Boolean(user) &&
      reviewIdsKey.length > 0,
    retry: false,
  });
  const votedReviewIds = useMemo(
    () => new Set(helpfulVotesQuery.data?.reviewIds ?? []),
    [helpfulVotesQuery.data?.reviewIds],
  );
  const meta = reviewsQuery.data?.meta ?? {
    total: product.reviewCount ?? 0,
    page,
    limit: PAGE_SIZE,
    totalPages: 1,
  };
  const reviewSummary = reviewsQuery.data?.summary;
  const breakdown =
    reviewSummary?.ratingBreakdown ??
    reviewsQuery.data?.ratingBreakdown ??
    [];
  const eligibility = eligibilityQuery.data ??
    (eligibilityQuery.error
      ? {
          eligible: false,
          reason: getErrorMessage(
            eligibilityQuery.error,
            "Chưa thể kiểm tra quyền đánh giá lúc này.",
          ),
        }
      : null);
  const loading = reviewsQuery.isLoading;
  const loadError = reviewsQuery.error
    ? getErrorMessage(
        reviewsQuery.error,
        "Không thể tải đánh giá. Vui lòng thử lại.",
      )
    : "";
  const checkingEligibility =
    isAuthenticated && Boolean(user) && eligibilityQuery.isLoading;

  const averageRating = Number(
    reviewSummary?.averageRating ?? product.avgRating ?? 0,
  );
  const reviewCount = Number(
    reviewSummary?.reviewCount ?? product.reviewCount ?? meta.total,
  );

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";

    const invalidType = selected.find(
      (file) => !ALLOWED_IMAGE_TYPES.has(file.type),
    );
    if (invalidType) {
      toast.error("Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP");
      return;
    }

    const oversized = selected.find((file) => file.size > MAX_IMAGE_SIZE);
    if (oversized) {
      toast.error("Ảnh vượt quá 5 MB", {
        description: oversized.name,
      });
      return;
    }

    setImages((current) => {
      const availableSlots = MAX_IMAGES - current.length;
      if (selected.length > availableSlots) {
        toast.info(`Bạn chỉ có thể đính kèm tối đa ${MAX_IMAGES} ảnh.`);
      }
      return [...current, ...selected.slice(0, availableSlots)];
    });
  };

  const uploadReviewImages = async () => {
    const imageUrls: string[] = [];
    for (const file of images) {
      const data = new FormData();
      data.append("file", file);
      data.append("productId", product.id);
      const response = await api.post("/reviews/images", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const upload = unwrapPayload<{
        url?: string;
        secure_url?: string;
      }>(response.data);
      const url = upload.url ?? upload.secure_url;
      if (!url) throw new Error("Upload response did not include an image URL");
      imageUrls.push(url);
    }
    return imageUrls;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (form.rating < 1 || form.rating > 5) {
      setFormError("Vui lòng chọn số sao cho đánh giá.");
      return;
    }
    const body = form.body.trim();
    if (body.length < 10) {
      setFormError("Nội dung đánh giá cần ít nhất 10 ký tự.");
      return;
    }

    setSubmitting(true);
    try {
      const imageUrls = images.length > 0 ? await uploadReviewImages() : [];
      await api.post("/reviews", {
        productId: product.id,
        orderId: eligibility?.orderId,
        rating: form.rating,
        title: form.title.trim() || undefined,
        body,
        imageUrls,
      });

      setForm(INITIAL_FORM);
      setImages([]);
      queryClient.setQueryData<ReviewEligibility>(
        ["review-eligibility", product.id, user?.id],
        (current) =>
          current
            ? { ...current, eligible: false, hasReviewed: true }
            : current,
      );
      toast.success("Đã gửi đánh giá", {
        description: "Cảm ơn bạn đã chia sẻ trải nghiệm về sản phẩm.",
      });
      setPage(1);
      await queryClient.invalidateQueries({
        queryKey: ["product-reviews", product.id],
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Không thể gửi đánh giá. Vui lòng thử lại.",
      );
      setFormError(message);
      toast.error("Gửi đánh giá thất bại", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.info("Đăng nhập để bình chọn đánh giá hữu ích.");
      return;
    }

    setVotingReviewId(reviewId);
    try {
      const currentReview = reviews.find((review) => review.id === reviewId);
      const wasHelpful = helpfulVotesQuery.isSuccess
        ? votedReviewIds.has(reviewId)
        : Boolean(currentReview?.isHelpful);
      const response = await api.post(`/reviews/${reviewId}/helpful`);
      const result = unwrapPayload<{
        helpfulCount: number;
        helpful?: boolean;
        isHelpful?: boolean;
      }>(response.data);
      const isHelpful =
        result.helpful ?? result.isHelpful ?? !wasHelpful;
      queryClient.setQueryData<ReviewListResponse>(
        ["product-reviews", product.id, page, user?.id ?? "guest"],
        (current) =>
          current
            ? {
                ...current,
                data: current.data.map((review) =>
                  review.id === reviewId
                    ? {
                        ...review,
                        helpfulCount: result.helpfulCount,
                        isHelpful,
                      }
                    : review,
                ),
              }
            : current,
      );
      queryClient.setQueryData<HelpfulVotesState>(
        helpfulVotesQueryKey,
        (current) => {
          const nextReviewIds = new Set(current?.reviewIds ?? []);
          if (isHelpful) nextReviewIds.add(reviewId);
          else nextReviewIds.delete(reviewId);
          return { reviewIds: Array.from(nextReviewIds) };
        },
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Không thể ghi nhận bình chọn lúc này."),
      );
    } finally {
      setVotingReviewId(null);
    }
  };

  return (
    <section aria-labelledby="reviews-heading" className="space-y-10">
      <div className="grid gap-8 border-b border-border pb-9 md:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <h2 id="reviews-heading" className="font-heading text-xl text-primary">
            Đánh giá khách hàng
          </h2>
          <div className="mt-4 flex items-end gap-2">
            <span className="font-heading text-5xl font-light leading-none text-primary">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </span>
            <span className="pb-1 text-sm text-muted-foreground">/ 5</span>
          </div>
          <div className="mt-3">
            <StarRating
              rating={averageRating}
              label={`${averageRating.toFixed(1)} trên 5 sao`}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {reviewCount} đánh giá đã xác minh
          </p>
        </div>

        <div className="space-y-2.5" aria-label="Phân bố số sao">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = countForRating(breakdown, rating);
            const percentage = meta.total > 0 ? (count / meta.total) * 100 : 0;
            return (
              <div key={rating} className="grid grid-cols-[42px_minmax(0,1fr)_28px] items-center gap-3 text-xs">
                <span className="text-muted-foreground">{rating} sao</span>
                <div className="h-1 overflow-hidden bg-muted" aria-hidden="true">
                  <div
                    className="h-full bg-[#111111] transition-[width] duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border border-border bg-[#FAFAFA] p-5 md:p-7">
        {!isAuthenticated ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-heading text-base text-primary">Bạn đã mua sản phẩm này?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Đăng nhập để chia sẻ đánh giá sau khi đơn hàng hoàn tất.
              </p>
            </div>
            <Link
              href={`/account/login?redirect=${encodeURIComponent(`/products/${product.slug}`)}`}
              className="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap bg-[#111111] px-5 text-sm font-medium text-white transition-colors hover:bg-[#333333] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2"
            >
              Đăng nhập
            </Link>
          </div>
        ) : checkingEligibility ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Đang kiểm tra đơn hàng của bạn...
          </div>
        ) : eligibility?.eligible ? (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <h3 className="font-heading text-lg text-primary">Viết đánh giá</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Chia sẻ cảm nhận thực tế để giúp khách hàng khác chọn đúng sản phẩm.
              </p>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-primary">Mức độ hài lòng</legend>
              <div
                className="flex w-fit gap-1"
                onMouseLeave={() => setHoveredRating(0)}
              >
                {[1, 2, 3, 4, 5].map((rating) => {
                  const active = rating <= (hoveredRating || form.rating);
                  return (
                    <button
                      key={rating}
                      type="button"
                      onMouseEnter={() => setHoveredRating(rating)}
                      onFocus={() => setHoveredRating(rating)}
                      onBlur={() => setHoveredRating(0)}
                      onClick={() => setForm((current) => ({ ...current, rating }))}
                      className="flex size-11 items-center justify-center text-[#111111] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                      aria-label={`${rating} sao`}
                      aria-pressed={form.rating === rating}
                    >
                      <Star
                        className={`size-7 ${active ? "fill-current" : "stroke-[#9A9A9A]"}`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <label htmlFor="review-title" className="space-y-2 text-sm font-medium text-primary">
                Tiêu đề <span className="font-normal text-muted-foreground">(không bắt buộc)</span>
                <Input
                  id="review-title"
                  value={form.title}
                  maxLength={100}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Điều bạn ấn tượng nhất"
                  className="mt-2 h-11 rounded-none bg-white"
                />
              </label>
              <div className="space-y-2">
                <span className="block text-sm font-medium text-primary">
                  Hình ảnh <span className="font-normal text-muted-foreground">(tối đa 3 ảnh)</span>
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  onChange={handleFiles}
                  aria-label="Chọn ảnh đánh giá"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= MAX_IMAGES}
                  className="h-11 w-full justify-start rounded-none bg-white px-4"
                >
                  <ImagePlus className="size-4" aria-hidden="true" />
                  Chọn ảnh từ thiết bị
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="review-body" className="block text-sm font-medium text-primary">
                Nội dung đánh giá
              </label>
              <textarea
                id="review-body"
                value={form.body}
                minLength={10}
                maxLength={1000}
                rows={5}
                onChange={(event) =>
                  setForm((current) => ({ ...current, body: event.target.value }))
                }
                placeholder="Sản phẩm vừa vặn thế nào, chất liệu và trải nghiệm sử dụng ra sao?"
                className="mt-2 w-full resize-y rounded-none border border-input bg-white px-3 py-3 text-sm text-primary outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                aria-describedby="review-body-help"
              />
              <span id="review-body-help" className="flex justify-between text-xs font-normal text-muted-foreground">
                <span>Tối thiểu 10 ký tự</span>
                <span>{form.body.length}/1000</span>
              </span>
            </div>

            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3" aria-label="Ảnh đã chọn">
                {imagePreviews.map((preview, index) => (
                  <div key={`${preview.file.name}-${preview.file.lastModified}`} className="relative size-24 overflow-hidden border border-border bg-white">
                    <Image
                      src={preview.url}
                      alt={`Ảnh đánh giá ${index + 1}`}
                      fill
                      unoptimized
                      sizes="96px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      className="absolute right-1 top-1 flex size-11 items-center justify-center bg-white/95 text-[#111111] shadow-sm transition-colors hover:bg-[#111111] hover:text-white"
                      aria-label={`Xóa ảnh ${index + 1}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {formError && (
              <p role="alert" className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {formError}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Chỉ hiển thị đánh giá từ đơn hàng đã hoàn tất.
              </p>
              <Button type="submit" disabled={submitting} className="h-11 px-6">
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Đang gửi
                  </>
                ) : (
                  "Gửi đánh giá"
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-start gap-3">
            <Camera className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <h3 className="font-heading text-base text-primary">
                {eligibility?.hasReviewed ? "Bạn đã đánh giá sản phẩm này" : "Đánh giá dành cho khách đã mua hàng"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {getEligibilityMessage(eligibility)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div aria-live="polite">
        {loading ? (
          <ReviewSkeleton />
        ) : loadError ? (
          <div className="border border-destructive/30 bg-destructive/5 p-5">
            <p className="text-sm text-destructive">{loadError}</p>
            <Button variant="outline" onClick={() => void reviewsQuery.refetch()} className="mt-4 h-11 rounded-none">
              Thử lại
            </Button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-10 text-center">
            <Star className="mx-auto size-9 stroke-[#9A9A9A]" aria-hidden="true" />
            <h3 className="mt-4 font-heading text-lg text-primary">Chưa có đánh giá</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Đánh giá đầu tiên sẽ xuất hiện sau khi khách hàng hoàn tất đơn hàng.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {reviews.map((review) => {
              const displayName = `${review.user.firstName} ${review.user.lastName}`.trim();
              const initials = `${review.user.firstName?.[0] ?? ""}${review.user.lastName?.[0] ?? ""}`.toUpperCase();
              const isHelpful = helpfulVotesQuery.isSuccess
                ? votedReviewIds.has(review.id)
                : Boolean(review.isHelpful);
              return (
                <article key={review.id} className="border-b border-border py-7 first:pt-0 last:border-b-0">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="flex min-w-0 items-center gap-3 sm:w-48 sm:shrink-0">
                      {review.user.avatarUrl ? (
                        <span className="relative size-10 shrink-0 overflow-hidden rounded-full">
                          <Image
                            src={review.user.avatarUrl}
                            alt={`Ảnh đại diện của ${displayName}`}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </span>
                      ) : (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#111111] text-xs font-semibold text-white" aria-hidden="true">
                          {initials || "KH"}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-primary">{displayName}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(review.createdAt))}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <StarRating rating={review.rating} label={`${review.rating} trên 5 sao`} />
                        {review.isVerified && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#22603A]">
                            <CheckCircle2 className="size-3.5" aria-hidden="true" />
                            Đã mua hàng
                          </span>
                        )}
                      </div>
                      {review.title && (
                        <h3 className="mt-3 font-heading text-base font-medium text-primary">{review.title}</h3>
                      )}
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#4A4A4A]">{review.body}</p>

                      {review.images && review.images.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {review.images.map((image, index) => (
                            <a
                              key={image.id}
                              href={image.url}
                              target="_blank"
                              rel="noreferrer"
                              className="relative block size-20 overflow-hidden border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                              aria-label={`Mở ảnh đánh giá ${index + 1}`}
                            >
                              <Image
                                src={image.url}
                                alt={`Ảnh đánh giá của ${displayName}`}
                                fill
                                sizes="80px"
                                className="object-cover transition-transform duration-300 hover:scale-105"
                              />
                            </a>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => void handleHelpful(review.id)}
                        disabled={votingReviewId === review.id}
                        className={`mt-5 inline-flex min-h-11 items-center gap-2 border px-3 text-xs transition-colors active:translate-y-px disabled:opacity-50 ${
                          isHelpful
                            ? "border-[#111111] bg-[#111111] text-white"
                            : "border-border text-muted-foreground hover:border-[#111111] hover:text-[#111111]"
                        }`}
                        aria-pressed={isHelpful}
                      >
                        {votingReviewId === review.id ? (
                          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <ThumbsUp className={`size-3.5 ${isHelpful ? "fill-current" : ""}`} aria-hidden="true" />
                        )}
                        Hữu ích ({review.helpfulCount})
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {!loading && !loadError && meta.totalPages > 1 && (
        <nav className="flex items-center justify-between border-t border-border pt-5" aria-label="Phân trang đánh giá">
          <Button
            variant="outline"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="h-11 rounded-none px-3"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Trang trước
          </Button>
          <span className="text-xs text-muted-foreground">
            Trang {page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))}
            disabled={page >= meta.totalPages}
            className="h-11 rounded-none px-3"
          >
            Trang sau
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </nav>
      )}
    </section>
  );
}
