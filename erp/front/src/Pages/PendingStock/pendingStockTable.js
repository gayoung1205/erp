import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { message, Popconfirm } from 'antd';
import 'antd/dist/antd.css';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import cloneDeep from 'lodash/cloneDeep';

import Aux from '../../hoc/_Aux';
import pendingStockTableGridColumns from './pendingStockTableGridColumns';
import PendingStockSellModal from './pendingStockSellModal';
import requestPendingStockGet from '../../Axios/PendingStock/requestPendingStockGet';
import requestPendingStockConfirm from '../../Axios/PendingStock/requestPendingStockConfirm';
import requestPendingStockDelete from '../../Axios/PendingStock/requestPendingStockDelete';

const PendingStockTable = () => {
    const [data, setData] = useState([]);
    const [gridColumns, setGridColumns] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);  // ★ 단일 → 배열로 변경
    const [statusFilter, setStatusFilter] = useState('0');
    const [sellModalVisible, setSellModalVisible] = useState(false);
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [processing, setProcessing] = useState(false);  // ★ 일괄 처리 중 상태

    const gridRef = React.createRef();

    // 데이터 로드
    const loadData = async () => {
        try {
            const res = await requestPendingStockGet(page, statusFilter);
            if (res) {
                setData(res.results || []);
                setMaxPage(res.max_page || 1);
            }
        } catch (err) {
            message.error('데이터 로드 중 오류가 발생했습니다.');
        }
    };

    useEffect(() => {
        setSelectedRows([]);  // 페이지/필터 변경 시 선택 초기화
        loadData();
    }, [page, statusFilter]);

    useEffect(() => {
        let dummyColumns = cloneDeep(pendingStockTableGridColumns);
        for (const i in dummyColumns) {
            dummyColumns[i].minWidth = 80;
            dummyColumns[i].ellipsis = true;
        }
        setGridColumns(dummyColumns);
    }, []);

    const handleCheck = (e) => {
        if (e.rowKey === undefined) return;

        const grid = gridRef.current ? gridRef.current.getInstance() : null;
        if (!grid) return;

        const rowData = grid.getRow(e.rowKey);
        if (rowData) {
            setSelectedRows((prev) => {
                // 이미 있으면 추가 안 함
                if (prev.find((r) => r.id === rowData.id)) return prev;
                return [...prev, rowData];
            });
        }
    };

    const handleUncheck = (e) => {
        if (e.rowKey === undefined) return;

        const grid = gridRef.current ? gridRef.current.getInstance() : null;
        if (!grid) return;

        const rowData = grid.getRow(e.rowKey);
        if (rowData) {
            setSelectedRows((prev) => prev.filter((r) => r.id !== rowData.id));
        }
    };

    const handleCheckAll = () => {
        const grid = gridRef.current ? gridRef.current.getInstance() : null;
        if (!grid) return;

        const allRows = data.filter((row) => row.status === 0);  // 입고대기 상태만
        setSelectedRows(allRows);
    };

    const handleUncheckAll = () => {
        setSelectedRows([]);
    };

    const handleConfirm = async () => {
        const pendingItems = selectedRows.filter((row) => row.status === 0);

        if (pendingItems.length === 0) {
            message.warning('입고 확정할 항목을 선택해주세요. (입고대기 상태만 가능)');
            return;
        }

        setProcessing(true);

        let successCount = 0;
        let failCount = 0;

        for (const item of pendingItems) {
            try {
                await requestPendingStockConfirm(item.id);
                successCount++;
            } catch (err) {
                failCount++;
                console.error(`입고 확정 실패: ${item.product_name}`, err);
            }
        }

        setProcessing(false);

        if (successCount > 0) {
            message.success(`${successCount}건 입고 확정 완료!`);
        }
        if (failCount > 0) {
            message.error(`${failCount}건 입고 확정 실패`);
        }

        setSelectedRows([]);
        loadData();
    };

    const handleSellModal = () => {
        if (selectedRows.length === 0) {
            message.warning('바로판매할 항목을 선택해주세요.');
            return;
        }

        if (selectedRows.length > 1) {
            message.warning('바로판매는 한 번에 1개만 처리할 수 있습니다. 1개만 선택해주세요.');
            return;
        }

        const selected = selectedRows[0];
        if (selected.status !== 0) {
            message.warning('입고대기 상태에서만 바로판매가 가능합니다.');
            return;
        }

        setSellModalVisible(true);
    };

    const handleDelete = async () => {
        const pendingItems = selectedRows.filter((row) => row.status === 0);

        if (pendingItems.length === 0) {
            message.warning('삭제할 항목을 선택해주세요. (입고대기 상태만 가능)');
            return;
        }

        setProcessing(true);

        let successCount = 0;
        let failCount = 0;

        for (const item of pendingItems) {
            try {
                await requestPendingStockDelete(item.id);
                successCount++;
            } catch (err) {
                failCount++;
                console.error(`삭제 실패: ${item.product_name}`, err);
            }
        }

        setProcessing(false);

        if (successCount > 0) {
            message.success(`${successCount}건 삭제 완료!`);
        }
        if (failCount > 0) {
            message.error(`${failCount}건 삭제 실패`);
        }

        setSelectedRows([]);
        loadData();
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= maxPage) {
            setPage(newPage);
        }
    };

    const pendingSelectedCount = selectedRows.filter((r) => r.status === 0).length;

    return (
        <Aux>
            <PendingStockSellModal
                visible={sellModalVisible}
                onClose={() => setSellModalVisible(false)}
                pendingData={selectedRows.length === 1 ? selectedRows[0] : null}
                onSuccess={() => {
                    setSelectedRows([]);
                    loadData();
                }}
            />

            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <Card.Title as="h5">입고대기 목록</Card.Title>
                            <p style={{ marginBottom: 0, color: '#888' }}>
                                제품구매 시 입고대기로 등록되며, 입고 버튼을 눌러야 재고가 반영됩니다.
                            </p>
                        </Card.Header>
                        <Card.Body>
                            {/* 필터 및 버튼 영역 */}
                            <Row className="mb-3">
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>상태 필터</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value);
                                                setPage(1);
                                            }}
                                        >
                                            <option value="0">입고대기</option>
                                            <option value="1">입고완료</option>
                                            <option value="2">바로판매</option>
                                            <option value="3">취소</option>
                                            <option value="all">전체</option>
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={9} className="d-flex align-items-end justify-content-end">
                                    <Button
                                        variant="success"
                                        className="mr-2"
                                        onClick={handleConfirm}
                                        disabled={pendingSelectedCount === 0 || processing}
                                    >
                                        <i className="feather icon-check" />{' '}
                                        {processing ? '처리 중...' : `입고 확정 ${pendingSelectedCount > 0 ? `(${pendingSelectedCount}건)` : ''}`}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="mr-2"
                                        onClick={handleSellModal}
                                        disabled={selectedRows.length !== 1 || selectedRows[0]?.status !== 0 || processing}
                                        title={selectedRows.length > 1 ? '바로판매는 1개만 선택해주세요' : ''}
                                    >
                                        <i className="feather icon-shopping-cart" /> 바로판매
                                    </Button>
                                    <Popconfirm
                                        title={`${pendingSelectedCount}건을 삭제하시겠습니까?`}
                                        onConfirm={handleDelete}
                                        okText="삭제"
                                        cancelText="취소"
                                        disabled={pendingSelectedCount === 0 || processing}
                                    >
                                        <Button
                                            variant="danger"
                                            disabled={pendingSelectedCount === 0 || processing}
                                        >
                                            <i className="feather icon-trash-2" />{' '}
                                            삭제 {pendingSelectedCount > 0 ? `(${pendingSelectedCount}건)` : ''}
                                        </Button>
                                    </Popconfirm>
                                </Col>
                            </Row>

                            {selectedRows.length > 0 && (
                                <Row className="mb-3">
                                    <Col>
                                        <div
                                            style={{
                                                padding: '10px 15px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '5px',
                                                border: '1px solid #dee2e6',
                                            }}
                                        >
                                            <strong>선택: {selectedRows.length}건</strong>
                                            {selectedRows.length <= 3 ? (
                                                selectedRows.map((row, idx) => (
                                                    <span key={row.id}>
                                                        {idx > 0 && ' /'} {row.product_name} ({row.amount}개)
                                                    </span>
                                                ))
                                            ) : (
                                                <span>
                                                    {' '}{selectedRows[0].product_name} 외 {selectedRows.length - 1}건
                                                </span>
                                            )}
                                            {selectedRows.length > 1 && (
                                                <span style={{ color: '#888', marginLeft: '15px', fontSize: '12px' }}>
                                                    (바로판매는 1개만 선택 시 가능)
                                                </span>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            )}

                            <Grid
                                ref={gridRef}
                                data={data}
                                columns={gridColumns}
                                rowHeight={35}
                                bodyHeight={400}
                                rowHeaders={['checkbox', 'rowNum']}
                                columnOptions={{ resizable: true }}
                                onCheck={handleCheck}
                                onUncheck={handleUncheck}
                                onCheckAll={handleCheckAll}
                                onUncheckAll={handleUncheckAll}
                            />

                            <Row className="mt-3">
                                <Col className="d-flex justify-content-center align-items-center">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page <= 1}
                                    >
                                        &lt; 이전
                                    </Button>
                                    <span className="mx-3">
                                        {page} / {maxPage} 페이지
                                    </span>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page >= maxPage}
                                    >
                                        다음 &gt;
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Aux>
    );
};

export default PendingStockTable;