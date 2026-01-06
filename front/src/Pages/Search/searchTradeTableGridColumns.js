import setComma from '../../App/components/setComma.js';

export default [
  { name: 'customer_name', header: '고객(거래처)명', sortable: true, align: 'center' },
  {
    name: 'register_date',
    header: '등록일',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${value.slice(0, 10)}`;
    },
  },
  { name: 'category_name1', header: '구분1', sortable: true, align: 'center', filter: 'select' },
  { name: 'category_name2', header: 'AS(납품)상태', sortable: true, align: 'center', filter: 'select' },
  { name: 'category_name3', header: '출장/내방', sortable: true, align: 'center' },
  { name: 'content', header: '거래내역/접수내용', sortable: true, align: 'center', ellipsis: true },
  { name: 'symptom', header: '고장증상', sortable: true, align: 'center', ellipsis: true },
  { name: 'completed_content', header: '완료내역', sortable: true, align: 'center', ellipsis: true },
  { name: 'memo', header: '메모', sortable: true, align: 'center', ellipsis: true },
  {
    name: 'visit_date',
    header: '방문일',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${value.slice(0, 10)}`;
    },
  },
  {
    name: 'complete_date',
    header: '완료일',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${value.slice(0, 10)}`;
    },
  },
  { name: 'engineer_name', header: '담당자', sortable: true, align: 'center' },
  {
    name: 'transaction',
    header: '거래금액',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },
  {
    name: 'collect',
    header: '수금금액',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },
  {
    name: 'payment',
    header: '지불금액',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(value)}`;
    },
  },
  {
    name: 'total_receivable',
    header: '총미수금',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(Math.round(value))}`;
    },
  },
  {
    name: 'receivable',
    header: '당일미수금',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(Math.round(value))}`;
    },
  },
  {
    name: 'payment_2',
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
      return `${setComma(Math.round(value))}`;
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
  { name: 'register_id', header: '등록자ID', sortable: true, align: 'center' },
  { name: 'id', header: 'trade_id', hidden: 'true' },
];
