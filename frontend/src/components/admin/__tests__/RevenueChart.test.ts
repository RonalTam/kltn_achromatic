import {
  formatRevenueDate,
  normalizeRevenueData,
} from '@/components/admin/RevenueChart';

describe('RevenueChart data helpers', () => {
  it('fills missing days, combines duplicate dates, and keeps chronological order', () => {
    expect(
      normalizeRevenueData(
        [
          { date: '2026-07-20T03:00:00.000Z', revenue: 125_000 },
          { date: '2026-07-20', revenue: 75_000 },
          { date: '2026-07-22', revenue: 300_000 },
        ],
        5,
        '2026-07-22',
      ),
    ).toEqual([
      { date: '2026-07-18', revenue: 0 },
      { date: '2026-07-19', revenue: 0 },
      { date: '2026-07-20', revenue: 200_000 },
      { date: '2026-07-21', revenue: 0 },
      { date: '2026-07-22', revenue: 300_000 },
    ]);
  });

  it('clamps invalid revenue values instead of breaking the chart scale', () => {
    expect(
      normalizeRevenueData(
        [
          { date: '2026-07-21', revenue: Number.NaN },
          { date: '2026-07-22', revenue: -50_000 },
        ],
        2,
        '2026-07-22',
      ),
    ).toEqual([
      { date: '2026-07-21', revenue: 0 },
      { date: '2026-07-22', revenue: 0 },
    ]);
  });

  it('formats a date without shifting it to the browser time zone', () => {
    expect(formatRevenueDate('2026-07-22', true)).toBe('22/07/2026');
  });
});
