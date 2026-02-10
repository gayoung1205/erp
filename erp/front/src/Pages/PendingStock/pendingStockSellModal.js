import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { message, Select, Spin } from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
import requestPendingStockSell from '../../Axios/PendingStock/requestPendingStockSell';
import requestTradeCreate from '../../Axios/Trade/requestTradeCreate';
import requestSearchTableGet from '../../Axios/Search/requestSearchTableGet';

const { Option } = Select;

const PendingStockSellModal = ({ visible, onClose, pendingData, onSuccess }) => {
    const [data, setData] = useState({
        price: 0,
        tax_category: 0,
        sell_amount: 0,
    });
    const [customerList, setCustomerList] = useState([]);       // 검색된 고객 목록
    const [selectedCustomer, setSelectedCustomer] = useState(null); // 선택된 고객 { id, name }
    const [customerSearching, setCustomerSearching] = useState(false); // 검색 중 로딩
    const [processing, setProcessing] = useState(false);        // 바로판매 처리 중

    useEffect(() => {
        if (pendingData) {
            setData({
                price: pendingData.price || 0,
                tax_category: 0,
                sell_amount: pendingData.amount || 0,
            });
            setSelectedCustomer(null);
            setCustomerList([]);
        }
    }, [pendingData]);

    const handleCustomerSearch = async (searchText) => {
        if (!searchText || searchText.length < 1) {
            setCustomerList([]);
            return;
        }

        setCustomerSearching(true);
        try {
            const res = await requestSearchTableGet({
                tables: '고객',
                tags: `통합검색:${searchText}`,
            });
            if (res && res.length > 0) {
                setCustomerList(res);
            } else {
                setCustomerList([]);
            }
        } catch (err) {
            console.error('고객 검색 오류:', err);
            setCustomerList([]);
        }
        setCustomerSearching(false);
    };

    const handleCustomerSelect = (value) => {
        const customer = customerList.find((c) => c.id === value);
        if (customer) {
            setSelectedCustomer({ id: customer.id, name: customer.name });
        }
    };

    const handleCustomerClear = () => {
        setSelectedCustomer(null);
    };

    const handleSell = async () => {
        // 유효성 검사
        if (!selectedCustomer) {
            message.warning('판매할 고객(거래처)을 선택해주세요.');
            return;
        }

        if (!data.sell_amount || data.sell_amount <= 0) {
            message.warning('판매 수량을 입력해주세요.');
            return;
        }

        if (data.sell_amount > pendingData.amount) {
            message.warning(`입고대기 수량(${pendingData.amount}개)보다 많이 판매할 수 없습니다.`);
            return;
        }

        setProcessing(true);

        try {
            const tradeData = {
                customer_id: selectedCustomer.id,
                customer_name: selectedCustomer.name,
                category_1: 3,
                register_date: moment().format().slice(0, 16),
            };

            const tradeRes = await requestTradeCreate(tradeData);
            const tradeId = tradeRes.data.data;

            await requestPendingStockSell(pendingData.id, {
                trade_id: tradeId,
                price: data.price,
                tax_category: data.tax_category,
                sell_amount: data.sell_amount,
            });

            message.success(
                `[${pendingData.product_name}] ${data.sell_amount}개를 [${selectedCustomer.name}]에게 바로판매 처리했습니다.`
            );
            onSuccess();
            onClose();
        } catch (err) {
            console.error('바로판매 처리 오류:', err);
            message.error('바로판매 처리 중 오류가 발생했습니다.');
        }

        setProcessing(false);
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
                        <Form.Label>
                            판매 수량
                            <span style={{ color: '#888', fontSize: '12px', marginLeft: '8px' }}>
                                (입고대기: {pendingData.amount}개)
                            </span>
                        </Form.Label>
                        <Form.Control
                            type="number"
                            value={data.sell_amount}
                            min={1}
                            max={pendingData.amount}
                            onChange={(e) => setData({ ...data, sell_amount: parseInt(e.target.value) || 0 })}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>
                            <span style={{ color: 'red' }}>*</span> 고객(거래처) 선택
                        </Form.Label>
                        <Select
                            showSearch
                            allowClear
                            placeholder="고객명을 검색하세요"
                            style={{ width: '100%' }}
                            filterOption={false}
                            defaultActiveFirstOption={false}
                            getPopupContainer={(trigger) => trigger.parentNode}
                            onSearch={handleCustomerSearch}
                            onSelect={handleCustomerSelect}
                            onClear={handleCustomerClear}
                            notFoundContent={customerSearching ? <Spin size="small" /> : '검색 결과 없음'}
                            value={selectedCustomer ? selectedCustomer.id : undefined}
                        >
                            {customerList.map((customer) => (
                                <Option key={customer.id} value={customer.id}>
                                    {customer.name}
                                    {customer.phone ? ` | ${customer.phone}` : ''}
                                    {customer.address_1 ? ` | ${customer.address_1}` : ''}
                                </Option>
                            ))}
                        </Select>
                        <Form.Text className="text-muted">
                            고객명을 입력하면 자동으로 검색됩니다. 선택 시 판매 거래가 자동 생성됩니다.
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
                <Button variant="secondary" onClick={onClose} disabled={processing}>
                    취소
                </Button>
                <Button variant="primary" onClick={handleSell} disabled={processing}>
                    {processing ? '처리 중...' : '바로판매 처리'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PendingStockSellModal;