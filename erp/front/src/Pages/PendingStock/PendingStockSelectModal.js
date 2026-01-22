import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import cloneDeep from 'lodash/cloneDeep';
import requestPendingStockGet from '../../Axios/PendingStock/requestPendingStockGet';
import setComma from '../../App/components/setComma';

const gridColumns = [
    { name: 'id', header: 'No', sortable: true, align: 'center', width: 60 },
    { name: 'product_name', header: '제품명', sortable: true, align: 'center' },
    { name: 'product_category', header: '제품분류', sortable: true, align: 'center' },
    {
        name: 'amount',
        header: '수량',
        sortable: true,
        align: 'center',
        formatter({ value }) {
            return `${setComma(value)}`;
        },
    },
    {
        name: 'price',
        header: '매입단가',
        sortable: true,
        align: 'center',
        formatter({ value }) {
            return `${setComma(value)}`;
        },
    },
    { name: 'supplier_name', header: '구입처', sortable: true, align: 'center' },
    { name: 'register_name', header: '등록자', sortable: true, align: 'center' },
    {
        name: 'created_date',
        header: '등록일',
        sortable: true,
        align: 'center',
        formatter({ value }) {
            if (!value) return '';
            return value.substring(0, 10);
        },
    },
];

const PendingStockSelectModal = ({ visible, onClose, onSelect }) => {
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);

    const gridRef = React.createRef();

    // 데이터 로드
    const loadData = async () => {
        try {
            const res = await requestPendingStockGet(1, '0');
            if (res) {
                setData(res.results || []);
            }
        } catch (err) {
            console.error('입고대기 데이터 로드 오류:', err);
        }
    };

    // visible이 true가 될 때 데이터 로드
    useEffect(() => {
        if (visible) {
            loadData();
        }
    }, [visible]);

    useEffect(() => {
        let dummyColumns = cloneDeep(gridColumns);
        for (const i in dummyColumns) {
            dummyColumns[i].minWidth = 80;
            dummyColumns[i].ellipsis = true;
        }
        setColumns(dummyColumns);
    }, []);

    // 행 더블클릭 시 선택
    const handleDblClick = (e) => {
        if (e.rowKey !== undefined && data[e.rowKey]) {
            const selectedItem = data[e.rowKey];
            onSelect(selectedItem);
            onClose();  // ★ 바로 onClose 호출
        }
    };

    return (
        <Modal
            title="입고대기 제품 선택"
            visible={visible}  // ★ 직접 visible prop 사용
            onCancel={onClose}  // ★ 직접 onClose 호출
            footer={null}
            width={900}
            centered
            destroyOnClose={true}  // ★ 모달 닫힐 때 내용 초기화
        >
            <p style={{ color: '#888', marginBottom: '15px' }}>
                바로 판매할 입고대기 제품을 더블클릭하여 선택하세요.
                <br />
                <small>(선택 후 수량을 수정할 수 있습니다)</small>
            </p>

            {data.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    입고대기 중인 제품이 없습니다.
                </div>
            ) : (
                <Grid
                    ref={gridRef}
                    data={data}
                    columns={columns}
                    rowHeight={35}
                    bodyHeight={300}
                    rowHeaders={['rowNum']}
                    onDblclick={handleDblClick}
                />
            )}
        </Modal>
    );
};

export default PendingStockSelectModal;