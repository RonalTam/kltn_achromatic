import { api } from '@/lib/api';
import type { OrderDetail } from './order-types';

type ApiEnvelope<T> = {
  data: T;
};

function unwrapApiData<T>(payload: T | ApiEnvelope<T>): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload
  ) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

function requestConfig(accessToken: string | null, signal?: AbortSignal) {
  return {
    signal,
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined,
  };
}

export async function getOrderDetail(
  orderId: string,
  accessToken: string | null,
  signal?: AbortSignal,
): Promise<OrderDetail> {
  const response = await api.get<OrderDetail | ApiEnvelope<OrderDetail>>(
    `/orders/${encodeURIComponent(orderId)}`,
    requestConfig(accessToken, signal),
  );

  return unwrapApiData(response.data);
}

export async function cancelOrder(
  orderId: string,
  reason: string,
  accessToken: string | null,
): Promise<void> {
  await api.patch(
    `/orders/${encodeURIComponent(orderId)}/cancel`,
    { reason: reason.trim() || undefined },
    requestConfig(accessToken),
  );
}

export function getOrderErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return null;
  }

  const response = (error as { response?: { status?: unknown } }).response;
  return typeof response?.status === 'number' ? response.status : null;
}

export function getOrderErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  const response = (
    error as { response?: { data?: { message?: unknown } } }
  ).response;
  return typeof response?.data?.message === 'string'
    ? response.data.message
    : fallback;
}

