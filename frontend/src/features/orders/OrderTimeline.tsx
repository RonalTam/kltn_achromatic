import {
  Check,
  ClipboardCheck,
  PackageCheck,
  Truck,
} from 'lucide-react';
import type { OrderDetail } from './order-types';
import { buildOrderTimeline, formatOrderDate } from './order-utils';

const STAGE_ICONS = [ClipboardCheck, PackageCheck, Truck, Check];

export function OrderTimeline({ order }: { order: OrderDetail }) {
  const stages = buildOrderTimeline(order);

  return (
    <section
      aria-labelledby="order-progress-heading"
      className="border border-border bg-card p-5 md:p-7"
    >
      <div className="mb-7">
        <h2
          id="order-progress-heading"
          className="font-heading text-xl font-medium text-primary"
        >
          Hành trình đơn hàng
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Theo dõi từng mốc từ lúc đặt hàng đến khi nhận sản phẩm.
        </p>
      </div>

      <ol className="grid grid-cols-1 gap-0 md:grid-cols-4">
        {stages.map((stage, index) => {
          const Icon = STAGE_ICONS[index];
          const isComplete = stage.state === 'complete';
          const isCurrent = stage.state === 'current';

          return (
            <li
              key={stage.id}
              aria-current={isCurrent ? 'step' : undefined}
              className={`relative border-l pb-7 pl-6 last:pb-0 md:border-l-0 md:border-t md:pb-0 md:pl-0 md:pt-6 ${
                isComplete || isCurrent
                  ? 'border-[#0F4C81]'
                  : 'border-border'
              }`}
            >
              <div
                className={`absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center border md:-top-[17px] md:left-0 ${
                  isComplete
                    ? 'border-[#0F4C81] bg-[#0F4C81] text-white'
                    : isCurrent
                      ? 'border-[#0F4C81] bg-background text-[#0F4C81]'
                      : 'border-border bg-background text-muted-foreground'
                }`}
                aria-hidden="true"
              >
                <Icon className="h-4 w-4 stroke-[1.8]" />
              </div>

              <div className="md:pr-5">
                <p
                  className={`text-sm font-semibold ${
                    isComplete || isCurrent
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {stage.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {stage.description}
                </p>
                {stage.timestamp && (
                  <time
                    dateTime={stage.timestamp}
                    className="mt-2 block text-[11px] text-[#0F4C81]"
                  >
                    {formatOrderDate(stage.timestamp)}
                  </time>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

