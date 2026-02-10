import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import Aux from '../../hoc/_Aux';
import { Modal, message } from 'antd';
import 'antd/dist/antd.css';
import CategoryModal from '../../App/components/categoryModal';
import Category from '../../App/components/category';
import requestProductUpdate from '../../Axios/Product/requestProductUpdate';
import requestProductDeactivate from '../../Axios/Product/requestProductDeactivate';

const ProductUpdateModal = (props) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' });

  const [visible, setVisible] = useState(false);
  const [rowData, setRowData] = useState({});
  const [flag, setFlag] = useState(false);
  const [modalWidth, setModalWidth] = useState('50%');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Product Update
  const productUpdate = () => {
    requestProductUpdate(rowData).then(() => handleOk());
  };

  const productDeactivate = (id) => {
    Modal.confirm({
      title: '제품 비활성화',
      content: '이 제품을 비활성화하시겠습니까? 비활성화된 제품은 목록에서 숨겨지며, 거래 등록 시 검색되지 않습니다.',
      okText: '비활성화',
      okType: 'danger',
      cancelText: '취소',
      onOk: () => {
        requestProductDeactivate(id)
            .then(() => {
              message.success('제품이 비활성화되었습니다.');
              window.location.reload();
            })
            .catch(() => {
              message.error('비활성화에 실패했습니다.');
              handleCancel();
            });
      },
    });
  };

  useEffect(() => {
    setRowData(props.data);
  }, [props.data]);

  useEffect(() => {
    isDesktop ? setModalWidth('50%') : setModalWidth('100%');
  }, [isDesktop]);

  useEffect(() => {
    setVisible(props.visible);
  }, [props.visible]);

  const handleOk = () => {
    setVisible(false);
    window.location.reload();
  };

  const handleCancel = () => {
    setVisible(false);
    window.location.reload();
  };

  const handleChange = (e) => {
    setRowData({ ...rowData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (value) => {
    setRowData({ ...rowData, category: value });
  };

  return (
      <>
        <Modal
            title="제품 수정"
            visible={visible}
            onOk={productUpdate}
            onCancel={handleCancel}
            okText="수정"
            cancelText="취소"
            width={modalWidth}
        >
          <Form>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                제품명
              </Form.Label>
              <Col sm="9">
                <Form.Control
                    type="text"
                    name="name"
                    value={rowData.name || ''}
                    onChange={handleChange}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                제품분류
              </Form.Label>
              <Col sm="9">
                <InputGroup>
                  <Form.Control
                      type="text"
                      name="category"
                      value={rowData.category || ''}
                      onChange={handleChange}
                      readOnly
                  />
                  <Button
                      variant="outline-secondary"
                      onClick={() => setCategoryModalVisible(true)}
                  >
                    선택
                  </Button>
                </InputGroup>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                제조사
              </Form.Label>
              <Col sm="9">
                <Form.Control
                    type="text"
                    name="supplier"
                    value={rowData.supplier || ''}
                    onChange={handleChange}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                보관장소
              </Form.Label>
              <Col sm="9">
                <Form.Control
                    type="text"
                    name="container"
                    value={rowData.container || ''}
                    onChange={handleChange}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                주매입처
              </Form.Label>
              <Col sm="9">
                <Form.Control
                    type="text"
                    name="purchase"
                    value={rowData.purchase || ''}
                    onChange={handleChange}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                코드
              </Form.Label>
              <Col sm="9">
                <Form.Control
                    type="text"
                    name="code"
                    value={rowData.code || ''}
                    onChange={handleChange}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                재고량
              </Form.Label>
              <Col sm="9">
                <Form.Control
                    type="number"
                    name="stock"
                    value={rowData.stock || 0}
                    onChange={handleChange}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                매입금액
              </Form.Label>
              <Col sm="9">
                <Form.Control
                    type="number"
                    name="in_price"
                    value={rowData.in_price || 0}
                    onChange={handleChange}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                매출금액
              </Form.Label>
              <Col sm="9">
                <Form.Control
                    type="number"
                    name="out_price"
                    value={rowData.out_price || 0}
                    onChange={handleChange}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                소비자금액
              </Form.Label>
              <Col sm="9">
                <Form.Control
                    type="number"
                    name="sale_price"
                    value={rowData.sale_price || 0}
                    onChange={handleChange}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3">
                메모
              </Form.Label>
              <Col sm="9">
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="memo"
                    value={rowData.memo || ''}
                    onChange={handleChange}
                />
              </Col>
            </Form.Group>

            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <Button
                  variant="warning"
                  onClick={() => productDeactivate(rowData.id)}
              >
                비활성화
              </Button>
            </div>
          </Form>
        </Modal>

        <CategoryModal
            visible={categoryModalVisible}
            setVisible={setCategoryModalVisible}
            category={1}
            onSelect={handleCategoryChange}
        />
      </>
  );
};

export default ProductUpdateModal;