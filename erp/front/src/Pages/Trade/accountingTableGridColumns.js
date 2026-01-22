import setComma from '../../App/components/setComma.js';

export default [
  {
    name: 'register_date',
    header: '등록일',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${value.slice(0, 10)}`;
    },
  },
  { name: 'category_name1', header: '구분1', sortable: true, align: 'center' },
  { name: 'content', header: '거래내역/접수내용', sortable: true, align: 'center', ellipsis: true },
  {
    name: 'in_price',
    header: '수입금액',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },
  {
    name: 'out_price',
    header: '지출금액',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },
  {
    name: 'total_price',
    header: '결제금액',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },
  {
    name: 'supply_price',
    header: '공급가액',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },
  {
    name: 'tax_price',
    header: '부가세',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },
  {
    name: 'cash',
    header: '현금결제',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },
  {
    name: 'credit',
    header: '카드결제',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },
  {
    name: 'bank',
    header: '은행입금',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },
  { name: 'memo', header: '메모', sortable: true, align: 'center', ellipsis: true },
  { name: 'register_id', header: '등록자ID', sortable: true, align: 'center' },
  { name: 'id', header: 'trade_id', hidden: 'true' },
];
