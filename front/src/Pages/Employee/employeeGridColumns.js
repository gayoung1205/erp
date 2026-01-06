export default [
  {
    name: 'join_date',
    header: '입사일',
    sortable: true,
    align: 'center',
    // formatter({ value }) {
    //   return `${value.slice(0, 10)}`;
    // },
  },
  { name: 'name', header: '이름', sortable: true, align: 'center' },
  { name: 'text_category', header: '부서', sortable: true, align: 'center' },
  { name: 'user_id', header: 'ID', sortable: true, align: 'center' },
  { name: 'ann', header: '연차', sortable: true, align: 'center' },
  {
    name: 'is_active',
    header: '활성여부',
    sortable: true,
    align: 'center',
    formatter({ value }) {
      return value ? '활성' : '비활성';
    },
  },
];
