import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { message } from 'antd';
import 'antd/dist/antd.css';
import requestPendingStockSell from '../../Axios/PendingStock/requestPendingStockSell';
import requestCustomerGet from '../../Axios/Customer/requestCustomerGet';

const PendingStockSellModal = ({ visible, onClose, pendingData, onSuccess }) => {
    const [data, setData] = useState({
        trade_id: '',
        price: 0,
        tax_category: 0,
    });
    const [customerName, setCustomerName] = useState('');

    useEffect(() => {
        if (pendingData) {
            setData({
                ...data,
                price: pendingData.price || 0,
            });
        }
    }, [pendingData]);

    useEffect(() => {
        // 현재 선택된 고객 정보 가져오기
        const customerId = sessionStorage.getItem('customerId');
        if (customerId) {
            requestCustomerGet().then((res) => {
                if (res && res[0]) {
                    setCustomerName(res[0].name);
                }
            });
        }
    }, [visible]);

    const handleSell = async () => {
        if (!data.trade_id) {
            message.warning('거래 ID를 입력해주세요.');
            return;
        }

        try {
            await requestPendingStockSell(pendingData.id, data);
            message.success('바로판매 처리되었습니다.');
            onSuccess();
            onClose();
        } catch (err) {
            message.error('바로판매 처리 중 오류가 발생했습니다.');
        }
    };

    if (!pendingData) return null;

    return (
        <Modal show={visible} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>바로판매</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                    입고대기 제품을 바로 판매 처리합니다.<br />
                    (입고 → 즉시 출고, 재고 변동 없음)
                </p>

                <Form>
                    <Form.Group>
                        <Form.Label>제품명</Form.Label>
                        <Form.Control type="text" value={pendingData.product_name} disabled />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>수량</Form.Label>
                        <Form.Control type="number" value={pendingData.amount} disabled />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>
                            <span style={{ color: 'red' }}>*</span> 거래 ID
                        </Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="판매 거래 ID 입력"
                            value={data.trade_id}
                            onChange={(e) => setData({ ...data, trade_id: e.target.value })}
                        />
                        <Form.Text className="text-muted">
                            제품판매 거래를 먼저 생성한 후 거래 ID를 입력하세요.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>판매단가</Form.Label>
                        <Form.Control
                            type="number"
                            value={data.price}
                            onChange={(e) => setData({ ...data, price: parseInt(e.target.value) || 0 })}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>부가세</Form.Label>
                        <Form.Control
                            as="select"
                            value={data.tax_category}
                            onChange={(e) => setData({ ...data, tax_category: parseInt(e.target.value) })}
                        >
                            <option value={0}>부가세 없음</option>
                            <option value={1}>부가세 적용</option>
                            <option value={2}>상품에 포함</option>
                        </Form.Control>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    취소
                </Button>
                <Button variant="primary" onClick={handleSell}>
                    바로판매 처리
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PendingStockSellModal;