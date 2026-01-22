export default [
  { name: 'customer_name', header: '고객명', sortable: true, align: 'center' },
  { name: 'tel', header: '전화번호', sortable: true, align: 'center' },
  { name: 'phone', header: '휴대폰번호', sortable: true, align: 'center' },
  { name: 'address', header: '주소', sortable: true, align: 'center' },
  { name: 'category_name2', header: `상태`, sortable: true, align: 'center', filter: 'select' },
  { name: 'engineer_name', header: '담당자', sortable: true, align: 'center' },
  { name: 'content', header: '거래내역/접수내용', sortable: true, align: 'center', ellipsis: true },
  {
    name: 'register_date',
    header: '등록일',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${value.slice(0, 10)}`;
    },
  },
  {
    name: 'visit_date',
    header: '방문일',
    sortable: true,
    align: 'center',
    ellipsis: true,
    formatter({ value }) {
      return `${value.slice(0, 10)}`;
    },
  },
  {
    name: 'complete_date',
    header: '완료일',
    sortable: true,
    align: 'center',
    ellipsis: true,
    formatter({ value }) {
      return `${value.slice(0, 10)}`;
    },
  },
  { name: 'completed_content', header: '완료내역', sortable: true, align: 'center', ellipsis: true },
  { name: 'memo', header: '메모', sortable: true, align: 'center', ellipsis: true },
  { name: 'register_id', header: '등록자ID', sortable: true, align: 'center' },
  { name: 'id', header: 'trade_id', hidden: 'true' },
];
