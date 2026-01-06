import setComma from '../../App/components/setComma.js';

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
];
