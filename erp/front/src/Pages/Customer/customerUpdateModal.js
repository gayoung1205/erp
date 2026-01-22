import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button, InputGroup, FormControl } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import Aux from '../../hoc/_Aux';
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import CategoryModal from '../../App/components/categoryModal';
import Category from '../../App/components/category';
import CheckModal from '../../App/components/Modal/checkModal';
import requestCustomerUpdate from '../../Axios/Customer/requestCustomerUpdate';
import requestCustomerDelete from '../../Axios/Customer/requestCustomerDelete';
import AddressSearchModal from '../../App/components/Modal/addressSearchModal';

const CustomerUpdateModal = (props) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' }); // deviceWidth > 768
  const [visible, setVisible] = useState(false); //Modal visible
  const [checkModalVisible, setCheckModalVisible] = useState(false);
  const [addrSearchModalVisible, setAddrSearchModalVisible] = useState(false);
  const [rowData, setRowData] = useState({}); // DbClick 할 때 target rowData 저장할 변수
  const [flag, setFlag] = useState(false);
  const history = useHistory(); // location 객체 접근
  const [modalWidth, setModalWidth] = useState('50%');

  // Customer Update
  const customerUpdate = () => {
    requestCustomerUpdate(rowData.id, rowData).then(() => handleOk());
  };

  // requestCustomerGet()가 처음에만 실행되도록
  useEffect(() => {
    setRowData(props.data);
  }, [props.data]);

  useEffect(() => {
    isDesktop ? setModalWidth('50%') : setModalWidth('100%');
  }, [isDesktop]);

  // requestCustomerGet()가 처음에만 실행되도록
  useEffect(() => {
    if (!flag) {
      setFlag(true);
      setVisible(props.visible);
    } else {
      setVisible(true);
    }
  }, [props.visible]);

  // Customer Delete
  const customerDelete = (id) => {
    requestCustomerDelete(id).then(() => window.location.reload());
  };

  // Modal ok버튼 handle, visible => false, page reload
  const handleOk = () => {
    setVisible(false);
    window.location.reload();
  };

  // Modal cancel버튼 handle, visible => false
  const handleCancel = (e) => {
    setVisible(false);
  };

  // 고객에 관한 AS 및 거래관리로
  const ToAs = (id) => {
    // id type=string => ','->'' , type->string
    if (typeof id === 'string') {
      id = parseInt(id.replace(',', ''));
    }

    window.sessionStorage.setItem('customerId', id);
    history.push(`/Trade/tradeTable/1`);

    window.location.reload();
  };

  const handleDelete = () => {
    setCheckModalVisible(!checkModalVisible);
  };

  const handleAddrSearchModal = () => {
    setAddrSearchModalVisible(!addrSearchModalVisible);
  };

  const insertAddress = (addr) => {
    setRowData({ ...rowData, address_1: addr });
  };

  return (
    <>
      <CheckModal visible={checkModalVisible} id={rowData.id} delete={(id) => customerDelete(id)} />
      <Modal title="고객 수정" visible={visible} onOk={() => customerUpdate()} onCancel={() => handleCancel()} width={modalWidth} zIndex={1030}>
        <Aux>
          <Row>
            <Col>
              <Card>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form>
                        <Form.Group controlId="customerInput1">
                          <Form.Label>고객분류</Form.Label>
                          <InputGroup className="mb-3">
                            <Form.Control
                              as="select"
                              value={rowData.customer_grade}
                              onChange={(e) => {
                                setRowData({ ...rowData, customer_grade: e.target.value });
                              }}
                              required
                            >
                              <option key={rowData.customer_grade}>{rowData.customer_grade}</option>
                              <Category data={0} />
                            </Form.Control>
                            <InputGroup.Append>
                              <CategoryModal data={0} />
                            </InputGroup.Append>
                          </InputGroup>
                        </Form.Group>

                        <Form.Group controlId="customerInput2">
                          <Form.Label>고객(거래처)명</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter name"
                            value={rowData.name}
                            onChange={(e) => {
                              setRowData({ ...rowData, name: e.target.value });
                            }}
                            required
                          />
                          {/* <Form.Text className="text-muted">We'll never share your email with anyone else.</Form.Text> */}
                        </Form.Group>

                        <Form.Group controlId="customerInput3">
                          <Form.Label>가격분류</Form.Label>
                          <Form.Control
                            as="select"
                            value={rowData.price_grade}
                            onChange={(e) => {
                              setRowData({ ...rowData, price_grade: e.target.value });
                            }}
                          >
                            <option>매출단가 적용</option>
                            <option>매입단가 적용</option>
                            <option>소비자가 적용</option>
                          </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="customerInput4">
                          <Form.Label>주소</Form.Label>
                          <InputGroup className="mb-3">
                            <FormControl
                              placeholder="주소"
                              aria-label="Recipient's username"
                              aria-describedby="basic-addon2"
                              value={rowData.address_1}
                              onChange={(e) => {
                                setRowData({ ...rowData, address_1: e.target.value });
                              }}
                            />
                            <InputGroup.Append>
                              <Button onClick={() => handleAddrSearchModal()}>주소검색</Button>
                              <AddressSearchModal visible={addrSearchModalVisible} insertAddress={(addr) => insertAddress(addr)} />
                            </InputGroup.Append>
                          </InputGroup>
                        </Form.Group>

                        <Form.Group controlId="customerInput5">
                          <Form.Label>상세주소</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="상세주소"
                            value={rowData.address_2}
                            onChange={(e) => {
                              setRowData({ ...rowData, address_2: e.target.value });
                            }}
                          />
                          <Form.Text className="text-muted">
                            도로명 상세주소 예시) 8동 302호 (여의도동, 00아파트), 단독주택의 경우 건물번호만 입력하십시오.
                          </Form.Text>
                        </Form.Group>
                      </Form>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="customerInput6">
                        <Form.Label>자택전화번호</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="- 입력"
                          value={rowData.tel}
                          onChange={(e) => {
                            setRowData({ ...rowData, tel: e.target.value });
                          }}
                        />
                      </Form.Group>

                      <Form.Group controlId="customerInput7">
                        <Form.Label>휴대전화번호</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="- 입력"
                          value={rowData.phone}
                          onChange={(e) => {
                            setRowData({ ...rowData, phone: e.target.value });
                          }}
                        />
                      </Form.Group>

                      <Form.Group controlId="customerInput8">
                        <Form.Label>FAX</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="- 입력"
                          value={rowData.fax_number}
                          onChange={(e) => {
                            setRowData({ ...rowData, fax_number: e.target.value });
                          }}
                        />
                      </Form.Group>

                      <Form.Group controlId="customerInput9">
                        <Form.Label>이메일 주소</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="email@example.com"
                          value={rowData.email}
                          onChange={(e) => {
                            setRowData({ ...rowData, email: e.target.value });
                          }}
                        />
                      </Form.Group>

                      <Form.Group controlId="customerInput10">
                        <Form.Label>메모</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={isDesktop ? 3 : 8}
                            placeholder="Memo"
                            value={rowData.memo}
                            onChange={(e) => {
                              setRowData({ ...rowData, memo: e.target.value });
                            }}
                            style={!isDesktop ? { fontSize: '16px', lineHeight: '1.6' } : {}}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col style={{ textAlign: 'right' }}>
                      {isDesktop ? (
                        <>
                          <Button
                            variant="primary"
                            onClick={() => {
                              ToAs(rowData.id);
                            }}
                          >
                            AS 및 거래 이동
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => {
                              handleDelete();
                            }}
                          >
                            삭제
                          </Button>
                        </>
                      ) : (
                          <>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  ToAs(rowData.id);
                                }}
                            >
                              AS 및 거래 이동
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                style={{ marginLeft: '10px' }}
                                onClick={() => {
                                  handleDelete();
                                }}
                            >
                              삭제
                            </Button>
                          </>
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

export default CustomerUpdateModal;
