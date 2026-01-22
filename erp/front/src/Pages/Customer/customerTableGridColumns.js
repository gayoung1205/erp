import setComma from '../../App/components/setComma.js';

export default [
  { name: 'name', header: '고객(거래처)명', sortable: true, align: 'center' },
  { name: 'tel', header: 'Tel', sortable: true, align: 'center' },
  { name: 'phone', header: 'Phone', sortable: true, align: 'center' },
  { name: 'address', header: '주소', sortable: true, align: 'center' },
  { name: 'fax_number', header: 'Fax', sortable: true, align: 'center' },
  { name: 'email', header: 'Email', sortable: true, align: 'center' },
  {
    name: 'created_date',
    header: '등록일',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${value.slice(0, 10)}`;
    },
  },
  {
    name: 'receivable',
    header: '총미수금',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return `${setComma(Math.round(value))}`;
    },
  },
  { name: 'customer_grade', header: '고객분류', sortable: true, align: 'center' },
  { name: 'price_grade', header: '가격분류', sortable: true, align: 'center' },
  {
    name: 'memo',
    header: '메모',
    sortable: true,
    align: 'left',  // ⭐ 왼쪽 정렬 (읽기 편하게)
    width: 250,     // ⭐ 너비 증가
    ellipsis: true,
    // ⭐ 툴팁으로 전체 메모 표시
    formatter({ value }) {
      if (!value) return '';
      // HTML title 속성으로 툴팁 표시
      return `<span title="${value.replace(/"/g, '&quot;').replace(/\n/g, '&#10;')}">${value}</span>`;
    },
  },
  { name: 'register_id', header: '등록자ID', sortable: true, align: 'center' },
];