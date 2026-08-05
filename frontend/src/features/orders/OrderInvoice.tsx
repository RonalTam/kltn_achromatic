import { formatPrice } from '@/lib/utils';
import type { OrderDetail } from './order-types';
import {
  formatOrderDate,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from './order-utils';
import styles from './order-invoice.module.css';

function invoiceAddress(order: OrderDetail): string {
  const { address } = order;
  return [
    address.addressLine1,
    address.addressLine2,
    address.ward,
    address.district,
    address.province,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
}

export function OrderInvoice({ order }: { order: OrderDetail }) {
  const discount = Number(order.discount);
  const tax = Number(order.tax);

  return (
    <div
      id="order-invoice"
      className={styles.invoice}
      aria-hidden="true"
    >
      <div className={styles.sheet}>
        <header className={styles.header}>
          <div>
            <p className={styles.brand}>ACHROMATIC</p>
            <p className={styles.brandLine}>Thời trang đương đại Việt Nam</p>
          </div>
          <div className={styles.invoiceTitle}>
            <h1>HÓA ĐƠN MUA HÀNG</h1>
            <p>Mã đơn {order.orderNumber}</p>
          </div>
        </header>

        <section className={styles.metaGrid}>
          <div>
            <h2>Thông tin đơn hàng</h2>
            <dl>
              <div>
                <dt>Ngày đặt</dt>
                <dd>{formatOrderDate(order.createdAt)}</dd>
              </div>
              <div>
                <dt>Trạng thái</dt>
                <dd>{ORDER_STATUS_LABELS[order.status]}</dd>
              </div>
              <div>
                <dt>Thanh toán</dt>
                <dd>
                  {order.payment
                    ? PAYMENT_METHOD_LABELS[order.payment.method] ||
                      order.payment.method
                    : 'Chưa có thông tin'}
                </dd>
              </div>
              {order.payment && (
                <div>
                  <dt>Tình trạng</dt>
                  <dd>
                    {PAYMENT_STATUS_LABELS[order.payment.status] ||
                      order.payment.status}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h2>Người nhận</h2>
            <p className={styles.customerName}>{order.address.fullName}</p>
            <p>{order.address.phone}</p>
            <address>{invoiceAddress(order)}</address>
          </div>
        </section>

        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Đơn giá</th>
              <th>Số lượng</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.productName}</strong>
                  {item.variantName && <span>{item.variantName}</span>}
                  <small>SKU {item.sku}</small>
                </td>
                <td>{formatPrice(item.unitPrice)}</td>
                <td>{item.quantity}</td>
                <td>{formatPrice(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className={styles.totals}>
          <dl>
            <div>
              <dt>Tạm tính</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div>
              <dt>Phí vận chuyển</dt>
              <dd>
                {Number(order.shippingFee) === 0
                  ? 'Miễn phí'
                  : formatPrice(order.shippingFee)}
              </dd>
            </div>
            {discount > 0 && (
              <div>
                <dt>
                  Giảm giá{order.couponCode ? ` (${order.couponCode})` : ''}
                </dt>
                <dd>-{formatPrice(discount)}</dd>
              </div>
            )}
            {tax > 0 && (
              <div>
                <dt>Thuế</dt>
                <dd>{formatPrice(tax)}</dd>
              </div>
            )}
            <div className={styles.grandTotal}>
              <dt>Tổng cộng</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        {order.notes && (
          <section className={styles.notes}>
            <h2>Ghi chú đơn hàng</h2>
            <p>{order.notes}</p>
          </section>
        )}

        <footer className={styles.footer}>
          <p>Cảm ơn bạn đã mua sắm tại Achromatic.</p>
          <p>
            Đây là chứng từ xác nhận mua hàng, không thay thế hóa đơn thuế theo
            quy định.
          </p>
        </footer>
      </div>
    </div>
  );
}

