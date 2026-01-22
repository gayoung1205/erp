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
    const [selectedRow, setSelectedRow] = useState(null);
    const [statusFilter, setStatusFilter] = useState('0'); // 기본: 입고대기
    const [sellModalVisible, setSellModalVisible] = useState(false);
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);

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

    // 행 클릭 시 선택
    const handleRowClick = (e) => {
        if (e.rowKey !== undefined && data[e.rowKey]) {
            setSelectedRow(data[e.rowKey]);
        }
    };

    // 입고 확정
    const handleConfirm = async () => {
        if (!selectedRow) {
            message.warning('입고 확정할 항목을 선택해주세요.');
            return;
        }

        if (selectedRow.status !== 0) {
            message.warning('입고대기 상태에서만 입고 확정이 가능합니다.');
            return;
        }

        try {
            const res = await requestPendingStockConfirm(selectedRow.id);
            message.success(`${selectedRow.product_name} ${selectedRow.amount}개 입고 확정! (현재 재고: ${res.data.new_stock})`);
            setSelectedRow(null);
            loadData();
        } catch (err) {
            message.error('입고 확정 중 오류가 발생했습니다.');
        }
    };

    // 바로판매 모달 열기
    const handleSellModal = () => {
        if (!selectedRow) {
            message.warning('바로판매할 항목을 선택해주세요.');
            return;
        }

        if (selectedRow.status !== 0) {
            message.warning('입고대기 상태에서만 바로판매가 가능합니다.');
            return;
        }

        setSellModalVisible(true);
    };

    // 삭제 (취소)
    const handleDelete = async () => {
        if (!selectedRow) {
            message.warning('삭제할 항목을 선택해주세요.');
            return;
        }

        if (selectedRow.status !== 0) {
            message.warning('입고대기 상태에서만 삭제가 가능합니다.');
            return;
        }

        try {
            await requestPendingStockDelete(selectedRow.id);
            message.success('삭제되었습니다.');
            setSelectedRow(null);
            loadData();
        } catch (err) {
            message.error('삭제 중 오류가 발생했습니다.');
        }
    };

    // 페이지 이동
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= maxPage) {
            setPage(newPage);
        }
    };

    return (
        <Aux>
            <PendingStockSellModal
                visible={sellModalVisible}
                onClose={() => setSellModalVisible(false)}
                pendingData={selectedRow}
                onSuccess={loadData}
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
                                        disabled={!selectedRow || selectedRow.status !== 0}
                                    >
                                        <i className="feather icon-check" /> 입고 확정
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="mr-2"
                                        onClick={handleSellModal}
                                        disabled={!selectedRow || selectedRow.status !== 0}
                                    >
                                        <i className="feather icon-shopping-cart" /> 바로판매
                                    </Button>
                                    <Popconfirm
                                        title="정말 삭제하시겠습니까?"
                                        onConfirm={handleDelete}
                                        okText="삭제"
                                        cancelText="취소"
                                        disabled={!selectedRow || selectedRow.status !== 0}
                                    >
                                        <Button
                                            variant="danger"
                                            disabled={!selectedRow || selectedRow.status !== 0}
                                        >
                                            <i className="feather icon-trash-2" /> 삭제
                                        </Button>
                                    </Popconfirm>
                                </Col>
                            </Row>

                            {/* 선택된 항목 정보 */}
                            {selectedRow && (
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
                                            <strong>선택:</strong> {selectedRow.product_name} |
                                            <strong> 수량:</strong> {selectedRow.amount}개 |
                                            <strong> 구입처:</strong> {selectedRow.supplier_name || '-'} |
                                            <strong> 상태:</strong> {selectedRow.status_display}
                                        </div>
                                    </Col>
                                </Row>
                            )}

                            {/* 그리드 */}
                            <Grid
                                ref={gridRef}
                                data={data}
                                columns={gridColumns}
                                rowHeight={35}
                                bodyHeight={400}
                                rowHeaders={['rowNum']}
                                onClick={handleRowClick}
                            />

                            {/* 페이지네이션 */}
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