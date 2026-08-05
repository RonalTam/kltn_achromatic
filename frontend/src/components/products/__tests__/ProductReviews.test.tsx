import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductReviews } from "@/components/products/ProductReviews";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { createProduct } from "@/test/fixtures";

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const reviewPayload = {
  data: [
    {
      id: "review-1",
      productId: "product-1",
      userId: "customer-1",
      rating: 5,
      title: "Chất liệu rất tốt",
      body: "Áo mặc thoáng và đường may chắc chắn.",
      isVerified: true,
      isApproved: true,
      helpfulCount: 2,
      createdAt: "2026-07-17T10:00:00.000Z",
      user: { firstName: "Minh", lastName: "Anh" },
      images: [],
    },
  ],
  meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
  ratingBreakdown: [{ rating: 5, _count: 1 }],
};

const authenticatedCustomer = {
  id: "customer-1",
  email: "minh.anh@example.com",
  firstName: "Minh",
  lastName: "Anh",
  role: "CUSTOMER",
};

function renderReviews(product = createProduct()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProductReviews product={product} />
    </QueryClientProvider>,
  );
}

describe("ProductReviews", () => {
  beforeAll(() => {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: jest.fn(() => "blob:review-preview"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: jest.fn(),
    });
  });

  beforeEach(() => {
    window.localStorage.clear();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
    jest.restoreAllMocks();
  });

  it("renders paginated verified reviews from the API", async () => {
    jest.spyOn(api, "get").mockResolvedValue({
      data: { data: reviewPayload },
    });

    renderReviews(createProduct({ avgRating: 5, reviewCount: 1 }));

    expect(await screen.findByText("Chất liệu rất tốt")).toBeVisible();
    expect(
      screen.getByText("Áo mặc thoáng và đường may chắc chắn."),
    ).toBeVisible();
    expect(screen.getByText("Đã mua hàng")).toBeVisible();
    expect(api.get).toHaveBeenCalledWith("/reviews/product/product-1", {
      params: { page: 1, limit: 5 },
    });
  });

  it("prefers the current API rating summary over product fallbacks", async () => {
    jest.spyOn(api, "get").mockResolvedValue({
      data: {
        data: {
          ...reviewPayload,
          summary: {
            averageRating: 4.25,
            reviewCount: 9,
            ratingBreakdown: [{ rating: 5, _count: 7 }],
          },
        },
      },
    });

    renderReviews(createProduct({ avgRating: 1, reviewCount: 1 }));

    expect(await screen.findByText("4.3")).toBeVisible();
    expect(screen.getByText("9 đánh giá đã xác minh")).toBeVisible();
  });

  it("allows an eligible customer to submit a text review", async () => {
    useAuthStore.setState({
      user: authenticatedCustomer,
      accessToken: "token",
      isAuthenticated: true,
      isLoading: false,
    });

    jest.spyOn(api, "get").mockImplementation((url) => {
      if (String(url).includes("eligibility")) {
        return Promise.resolve({
          data: {
            data: { eligible: true, orderId: "order-1", hasReviewed: false },
          },
        });
      }
      return Promise.resolve({ data: { data: reviewPayload } });
    });
    const postSpy = jest.spyOn(api, "post").mockResolvedValue({
      data: { data: { id: "review-2" } },
    });

    const user = userEvent.setup();
    renderReviews();

    await screen.findByRole("heading", { name: "Viết đánh giá" });
    await user.click(screen.getByRole("button", { name: "5 sao" }));
    await user.type(
      screen.getByLabelText("Nội dung đánh giá"),
      "Sản phẩm vừa vặn và chất liệu dễ chịu.",
    );
    await user.click(screen.getByRole("button", { name: "Gửi đánh giá" }));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith("/reviews", {
        productId: "product-1",
        orderId: "order-1",
        rating: 5,
        title: undefined,
        body: "Sản phẩm vừa vặn và chất liệu dễ chịu.",
        imageUrls: [],
      });
    });
  });

  it("sends the product ID with a supported review image upload", async () => {
    useAuthStore.setState({
      user: authenticatedCustomer,
      accessToken: "token",
      isAuthenticated: true,
      isLoading: false,
    });

    jest.spyOn(api, "get").mockImplementation((url) => {
      if (String(url).includes("eligibility")) {
        return Promise.resolve({
          data: {
            data: { eligible: true, orderId: "order-1", hasReviewed: false },
          },
        });
      }
      if (String(url).includes("helpful-votes")) {
        return Promise.resolve({ data: { data: { reviewIds: [] } } });
      }
      return Promise.resolve({ data: { data: reviewPayload } });
    });
    const postSpy = jest.spyOn(api, "post").mockImplementation((url) => {
      if (url === "/reviews/images") {
        return Promise.resolve({
          data: { data: { url: "https://images.example/review.webp" } },
        });
      }
      return Promise.resolve({ data: { data: { id: "review-2" } } });
    });

    const user = userEvent.setup();
    renderReviews();

    await screen.findByRole("heading", { name: "Viết đánh giá" });
    await user.click(screen.getByRole("button", { name: "5 sao" }));
    await user.type(
      screen.getByLabelText("Nội dung đánh giá"),
      "Sản phẩm vừa vặn và chất liệu dễ chịu.",
    );
    const image = new File(["review-image"], "fit.webp", {
      type: "image/webp",
    });
    await user.upload(screen.getByLabelText("Chọn ảnh đánh giá"), image);
    await user.click(screen.getByRole("button", { name: "Gửi đánh giá" }));

    await waitFor(() => {
      const uploadCall = postSpy.mock.calls.find(
        ([url]) => url === "/reviews/images",
      );
      expect(uploadCall).toBeDefined();
      const formData = uploadCall?.[1] as FormData;
      expect(formData.get("productId")).toBe("product-1");
      expect(formData.get("file")).toBe(image);
    });
  });

  it("loads and coherently toggles the authenticated user's helpful votes", async () => {
    useAuthStore.setState({
      user: authenticatedCustomer,
      accessToken: "token",
      isAuthenticated: true,
      isLoading: false,
    });

    const getSpy = jest.spyOn(api, "get").mockImplementation((url) => {
      if (String(url).includes("helpful-votes")) {
        return Promise.resolve({
          data: { data: { reviewIds: ["review-1"] } },
        });
      }
      if (String(url).includes("eligibility")) {
        return Promise.resolve({
          data: {
            data: { eligible: false, hasReviewed: true, reason: "ALREADY_REVIEWED" },
          },
        });
      }
      return Promise.resolve({ data: { data: reviewPayload } });
    });
    jest.spyOn(api, "post").mockResolvedValue({
      data: {
        data: { helpfulCount: 1, helpful: false },
      },
    });

    const user = userEvent.setup();
    renderReviews();

    const helpfulButton = await screen.findByRole("button", {
      name: "Hữu ích (2)",
    });
    await waitFor(() => expect(helpfulButton).toHaveAttribute("aria-pressed", "true"));
    expect(getSpy).toHaveBeenCalledWith("/reviews/helpful-votes", {
      params: { reviewIds: "review-1" },
    });

    await user.click(helpfulButton);

    await waitFor(() => {
      expect(helpfulButton).toHaveAttribute("aria-pressed", "false");
      expect(helpfulButton).toHaveTextContent("Hữu ích (1)");
    });
  });
});
