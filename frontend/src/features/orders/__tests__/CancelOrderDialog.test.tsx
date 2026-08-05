import { useRef, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CancelOrderDialog } from '@/features/orders/OrderDetailClient';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'order-1' }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

function DialogHarness() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
        Hủy đơn hàng
      </button>
      <CancelOrderDialog
        open={open}
        orderNumber="ACH-2026-001"
        loading={false}
        onCancel={async () => undefined}
        onClose={() => setOpen(false)}
        finalFocusRef={triggerRef}
      />
    </>
  );
}

describe('CancelOrderDialog', () => {
  it('manages initial focus, traps focus, closes on Escape and restores focus', async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);

    const trigger = screen.getByRole('button', { name: 'Hủy đơn hàng' });
    await user.click(trigger);

    const dialog = await screen.findByRole('alertdialog', {
      name: 'Hủy đơn hàng',
    });
    const keepOrderButton = screen.getByRole('button', {
      name: 'Giữ đơn hàng',
    });

    await waitFor(() => expect(keepOrderButton).toHaveFocus());

    for (let step = 0; step < 6; step += 1) {
      await user.tab();
      const activeElement = document.activeElement as HTMLElement;
      expect(
        dialog.contains(activeElement) ||
          activeElement.hasAttribute('data-base-ui-focus-guard'),
      ).toBe(true);
      expect(trigger).not.toHaveFocus();
    }

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
  });
});
