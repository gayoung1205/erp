import setComma from '../setComma';

export default [
  { name: 'name', header: '제품명', sortable: true, align: 'center' },
  { name: 'product_category', header: '제품분류', sortable: true, align: 'center' },
  {
    name: 'amount',
    header: '재고량',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },
  {
    name: 'memo',
    header: '메모',
    minWidth: 200,
    align: 'center',
  },
  {
    name: 'in_price',
    header: '매입금액',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },
  {
    name: 'out_price',
    header: '매출금액',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },
  {
    name: 'sale_price',
    header: '소비자금액',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },
];
