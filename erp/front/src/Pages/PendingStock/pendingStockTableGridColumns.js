import setComma from '../../App/components/setComma';

export default [
    { name: 'id', header: 'No', sortable: true, align: 'center', width: 60, minWidth: 50 },
    { name: 'product_name', header: '제품명', sortable: true, align: 'center', minWidth: 150 },
    { name: 'product_category', header: '제품분류', sortable: true, align: 'center', minWidth: 100 },
    {
        name: 'amount',
        header: '수량',
        sortable: true,
        align: 'center',
        minWidth: 80,
        formatter({ value }) {
            return `${setComma(value)}`;
        },
    },
    {
        name: 'price',
        header: '매입단가',
        sortable: true,
        align: 'center',
        minWidth: 100,
        formatter({ value }) {
            return `${setComma(value)}`;
        },
    },
    {
        name: 'total_price',
        header: '총액',
        sortable: true,
        align: 'center',
        minWidth: 100,
        formatter({ row }) {
            return `${setComma(row.amount * row.price)}`;
        },
    },
    { name: 'supplier_name', header: '구입처', sortable: true, align: 'center', minWidth: 100 },
    { name: 'status_display', header: '상태', sortable: true, align: 'center', minWidth: 80 },
    { name: 'register_name', header: '등록자', sortable: true, align: 'center', minWidth: 80 },
    { name: 'memo', header: '메모', sortable: true, align: 'center', minWidth: 100 },
    {
        name: 'created_date',
        header: '등록일',
        sortable: true,
        align: 'center',
        minWidth: 100,
        formatter({ value }) {
            if (!value) return '';
            return value.substring(0, 10);
        },
    },
    {
        name: 'confirmed_date',
        header: '입고확정일',
        sortable: true,
        align: 'center',
        minWidth: 100,
        formatter({ value }) {
            if (!value) return '-';
            return value.substring(0, 10);
        },
    },
];