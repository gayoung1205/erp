import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import Aux from '../../hoc/_Aux';
import { Modal, message } from 'antd';
import 'antd/dist/antd.css';
import CategoryModal from '../../App/components/categoryModal';
import Category from '../../App/components/category';
import requestProductUpdate from '../../Axios/Product/requestProductUpdate';
import requestProductDelete from '../../Axios/Product/requestProductDelete';
import CheckModal from '../../App/components/Modal/checkModal';

const ProductTable = (props) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' }); // deviceWidth > 768

  const [visible, setVisible] = useState(false); //Modal visible
  const [checkModalVisible, setCheckModalVisible] = useState(false);
  const [rowData, setRowData] = useState({}); // DbClick 할 때 target rowData 저장할 변수
  const [flag, setFlag] = useState(false);
  const [modalWidth, setModalWidth] = useState('50%');

  // Product Update
  const productUpdate = () => {
    requestProductUpdate(rowData).then(() => handleOk());
  };

  // Product Delete
  const productDelete = (id) => {
    requestProductDelete(id)
      .then(() => window.location.reload())
      .catch(() => handleCancel());
  };

  // requestProductGet()이 처음에만 실행되도록
  useEffect(() => {
    setRowData(props.data);
  }, [props.data]);

  useEffect(() => {
    isDesktop ? setModalWidth('50%') : setModalWidth('100%');
  }, [isDesktop]);

  useEffect(() => {
    if (!flag) {
      setFlag(true);
      setVisible(props.visible);
    } else {
      setVisible(true);
    }
  }, [props.visible]);

  // Modal Visible true -> false, Page Reload
  const handleOk = (e) => {
    setVisible(false);
    window.location.reload();
  };

  // Modal Visible true -> false
  const handleCancel = (e) => {
    setVisible(false);
  };

  const handleDelete = () => {
    setCheckModalVisible(!checkModalVisible);
  };

  return (
    <>
      <CheckModal visible={checkModalVisible} id={rowData.id} delete={(id) => productDelete(id)} />
      <Modal title="제품 수정" visible={visible} onOk={() => productUpdate()} onCancel={() => handleCancel()} width={modalWidth} zIndex={1030}>
        <Aux>
          <Row>
            <Col>
              <Card>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form>
                        <Form.Group controlId="productInput1">
                          <Form.Label>제품분류</Form.Label>
                          <InputGroup className="mb-3">
                            <Form.Control
                              as="select"
                              value={rowData.category}
                              onChange={(e) => {
                                setRowData({ ...rowData, category: e.target.value });
                              }}
                            >
                              <option key={rowData.category}>{rowData.category}</option>
                              <Category data={1} />
                            </Form.Control>
                            <InputGroup.Append>
                              <CategoryModal data={1} />
                            </InputGroup.Append>
                          </InputGroup>
                        </Form.Group>

                        <Form.Group controlId="productInput2">
                          <Form.Label>제품명</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter name"
                            value={rowData.name}
                            onChange={(e) => {
                              setRowData({ ...rowData, name: e.target.value });
                            }}
                          />
                          {/* <Form.Text className="text-muted">We'll never share your email with anyone else.</Form.Text> */}
                        </Form.Group>

                        <Form.Group controlId="productInput3">
                          <Form.Label>제조사</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="제조사"
                            value={rowData.supplier}
                            onChange={(e) => {
                              setRowData({ ...rowData, supplier: e.target.value });
                            }}
                          />
                        </Form.Group>

                        <Form.Group controlId="productInput4">
                          <Form.Label>보관위치</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="보관위치"
                            value={rowData.container}
                            onChange={(e) => {
                              setRowData({ ...rowData, container: e.target.value });
                            }}
                          />
                        </Form.Group>

                        <Form.Group controlId="productInput5">
                          <Form.Label>주매입처</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="주매입처"
                            value={rowData.purchase}
                            onChange={(e) => {
                              setRowData({ ...rowData, purchase: e.target.value });
                            }}
                          />
                        </Form.Group>

                        <Form.Group controlId="productInput6">
                          <Form.Label>재고량</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="재고량"
                            value={rowData.stock}
                            onChange={(e) => {
                              const permission = window.sessionStorage.getItem('permission');
                              if (!(permission === '2' || permission === '3')) {
                                message.error('권한이 없습니다.');
                              } else {
                                setRowData({ ...rowData, stock: e.target.value });
                              }
                            }}
                          />
                        </Form.Group>
                      </Form>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="productInput7">
                        <Form.Label>Code</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Code 입력, 한/영 주의"
                          value={rowData.code}
                          onChange={(e) => {
                            setRowData({ ...rowData, code: e.target.value });
                          }}
                        />
                      </Form.Group>

                      <Form.Group controlId="productInput8">
                        <Form.Label>매입금액</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="매입금액"
                          value={rowData.in_price}
                          onChange={(e) => {
                            setRowData({ ...rowData, in_price: e.target.value });
                          }}
                        />
                      </Form.Group>

                      <Form.Group controlId="productInput9">
                        <Form.Label>매출금액</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="매출금액"
                          value={rowData.out_price}
                          onChange={(e) => {
                            setRowData({ ...rowData, out_price: e.target.value });
                          }}
                        />
                      </Form.Group>

                      <Form.Group controlId="productInput10">
                        <Form.Label>소비자금액</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="소비자금액"
                          value={rowData.sale_price}
                          onChange={(e) => {
                            setRowData({ ...rowData, sale_price: e.target.value });
                          }}
                        />
                      </Form.Group>

                      <Form.Group controlId="productInput11">
                        <Form.Label>메모</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows="3"
                          placeholder="Memo"
                          value={rowData.memo}
                          onChange={(e) => {
                            setRowData({ ...rowData, memo: e.target.value });
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col style={{ textAlign: 'right' }}>
                      {isDesktop ? (
                        <Button
                          variant="primary"
                          onClick={(e) => {
                            handleDelete();
                          }}
                        >
                          삭제
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            handleDelete();
                          }}
                        >
                          삭제
                        </Button>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Aux>
      </Modal>
    </>
  );
};

export default ProductTable;
