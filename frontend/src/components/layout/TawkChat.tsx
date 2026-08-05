import Script from 'next/script';

export function TawkChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID?.trim();
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID?.trim();
  if (!propertyId || !widgetId) return null;

  return (
    <Script
      id="tawk-chat"
      src={`https://embed.tawk.to/${encodeURIComponent(propertyId)}/${encodeURIComponent(widgetId)}`}
      strategy="lazyOnload"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
