import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { message } from 'antd';
import 'antd/dist/antd.css';
import Category from '../../App/components/category';
import CategoryModal from '../../App/components/categoryModal';
import requestProductCreate from '../../Axios/Product/requestProductCreate';

const ProductRegistrationModal = ({ visible, onClose, onSuccess }) => {
    const [data, setData] = useState({
        name: '',
        category: '',
        supplier: '',
        container: '',
        purchase: '',
        code: '',
        stock: 0,
        memo: '',
        in_price: 0,
        out_price: 0,
        sale_price: 0,
    });
    const [loading, setLoading] = useState(false);

    // 폼 초기화
    const resetForm = () => {
        setData({
            name: '',
            category: '',
            supplier: '',
            container: '',
            purchase: '',
            code: '',
            stock: 0,
            memo: '',
            in_price: 0,
            out_price: 0,
            sale_price: 0,
        });
    };

    // 모달 닫기
    const handleClose = () => {
        resetForm();
        onClose();
    };

    // 제품 등록
    const handleCreate = async () => {
        // 필수값 체크
        if (!data.name || !data.category || data.category === '제품분류 선택') {
            message.warning('제품명과 제품분류는 필수 입력사항입니다.');
            return;
        }

        setLoading(true);

        try {
            await requestProductCreate(data);
            message.success('제품이 등록되었습니다.');

            // 성공 콜백 (등록된 제품 정보 전달)
            if (onSuccess) {
                onSuccess({
                    name: data.name,
                    category: data.category,
                    in_price: data.in_price,
                    out_price: data.out_price,
                    sale_price: data.sale_price,
                });
            }

            handleClose();
        } catch (err) {
            if (err.message === 'Request failed with status code 400') {
                message.warning('중복되는 코드입니다. 코드를 변경해주세요.');
            } else {
                message.error('제품 등록 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={visible} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>새 제품 등록</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p style={{ color: '#888', marginBottom: '15px' }}>
                    <span style={{ color: 'red' }}>*</span> 표시는 필수 입력사항입니다.
                </p>

                <Row>
                    {/* 왼쪽 컬럼 */}
                    <Col md={6}>
                        <Form.Group controlId="modalProductInput1">
                            <Form.Label>
                                <span style={{ color: 'red' }}>*</span> 제품분류
                            </Form.Label>
                            <InputGroup className="mb-3">
                                <Form.Control
                                    as="select"
                                    value={data.category}
                                    onChange={(e) => setData({ ...data, category: e.target.value })}
                                >
                                    <option>제품분류 선택</option>
                                    <Category data={1} />
                                </Form.Control>
                                <InputGroup.Append>
                                    <CategoryModal data={1} />
                                </InputGroup.Append>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group controlId="modalProductInput2">
                            <Form.Label>
                                <span style={{ color: 'red' }}>*</span> 제품명
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="제품명 입력"
                                value={data.name}
                                onChange={(e) => setData({ ...data, name: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group controlId="modalProductInput3">
                            <Form.Label>제조사</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="제조사"
                                value={data.supplier}
                                onChange={(e) => setData({ ...data, supplier: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group controlId="modalProductInput4">
                            <Form.Label>보관위치</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="보관위치"
                                value={data.container}
                                onChange={(e) => setData({ ...data, container: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group controlId="modalProductInput5">
                            <Form.Label>주매입처</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="주매입처"
                                value={data.purchase}
                                onChange={(e) => setData({ ...data, purchase: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group controlId="modalProductInput6">
                            <Form.Label>재고량</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="재고량"
                                value={data.stock}
                                onChange={(e) => setData({ ...data, stock: parseInt(e.target.value) || 0 })}
                            />
                            <Form.Text className="text-muted">
                                제품구매 시 입고대기로 등록되므로 초기 재고는 0으로 설정해도 됩니다.
                            </Form.Text>
                        </Form.Group>
                    </Col>

                    {/* 오른쪽 컬럼 */}
                    <Col md={6}>
                        <Form.Group controlId="modalProductInput7">
                            <Form.Label>Code</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Code 입력, 한/영 주의"
                                value={data.code}
                                onChange={(e) => setData({ ...data, code: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group controlId="modalProductInput8">
                            <Form.Label>매입금액</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="매입금액"
                                value={data.in_price}
                                onChange={(e) => setData({ ...data, in_price: parseInt(e.target.value) || 0 })}
                            />
                        </Form.Group>

                        <Form.Group controlId="modalProductInput9">
                            <Form.Label>매출금액</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="매출금액"
                                value={data.out_price}
                                onChange={(e) => setData({ ...data, out_price: parseInt(e.target.value) || 0 })}
                            />
                        </Form.Group>

                        <Form.Group controlId="modalProductInput10">
                            <Form.Label>소비자금액</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="소비자금액"
                                value={data.sale_price}
                                onChange={(e) => setData({ ...data, sale_price: parseInt(e.target.value) || 0 })}
                            />
                        </Form.Group>

                        <Form.Group controlId="modalProductInput11">
                            <Form.Label>메모</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows="4"
                                placeholder="메모"
                                value={data.memo}
                                onChange={(e) => setData({ ...data, memo: e.target.value })}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    취소
                </Button>
                <Button variant="primary" onClick={handleCreate} disabled={loading}>
                    {loading ? '등록 중...' : '제품 등록'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProductRegistrationModal;