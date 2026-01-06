import setComma from '../../App/components/setComma';

export default [
  { name: 'name', header: '제품명', sortable: true, align: 'center' },
  { name: 'category', header: '제품분류', sortable: true, align: 'center' },
  { name: 'supplier', header: '제조사', sortable: true, align: 'center' },
  { name: 'container', header: '보관장소', sortable: true, align: 'center' },
  { name: 'purchase', header: '주매입처', sortable: true, align: 'center' },
  { name: 'code', header: '코드', sortable: true, align: 'center' },
  {
    name: 'stock',
    header: '재고량',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },
  { name: 'memo', header: '메모', sortable: true, align: 'center' },
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
  { name: 'register_id', header: '등록자ID', sortable: true, align: 'center' },
];
