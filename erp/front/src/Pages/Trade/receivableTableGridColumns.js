import setComma from '../../App/components/setComma.js';

const getDaysOverdue = (dateStr) => {
  if (!dateStr) return '';
  const lastDate = new Date(dateStr);
  const today = new Date();
  const diffTime = today - lastDate;
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return days;
};

export default [
  { name: 'name', header: '고객(거래처)명', sortable: true, align: 'center' },
  { name: 'customer_grade', header: '고객분류', sortable: true, align: 'center' },
  { name: 'tel', header: 'Tel', sortable: true, align: 'center' },
  { name: 'phone', header: 'Phone', sortable: true, align: 'center' },
  {
    name: 'receivable',
    header: `총미수금`,
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },

  {
    name: 'last_receivable_date',
    header: '마지막 거래일',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      if (!value) return '-';
      return value.slice(0, 10);
    },
  },

  {
    name: 'days_overdue',
    header: '경과일',
    sortable: true,
    align: 'center',
    formatter({ row }) {
      const days = getDaysOverdue(row.last_receivable_date);
      if (days === '' || days <= 0) return '-';

      if (days >= 14) {
        return `<span style="color: #c62828; font-weight: bold;">${days}일</span>`;
      } else if (days >= 7) {
        return `<span style="color: #dc3545; font-weight: bold;">${days}일</span>`;
      }
      return `${days}일`;
    },
  },
];