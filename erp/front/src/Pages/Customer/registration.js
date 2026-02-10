import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button, InputGroup, FormControl } from 'react-bootstrap';
import Aux from '../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import CategoryModal from '../../App/components/categoryModal';
import Category from '../../App/components/category';
import requestCustomerCreate from '../../Axios/Customer/requestCustomerCreate';
import AddressSearchModal from '../../App/components/Modal/addressSearchModal';

const CustomerRegistration = () => {
  const history = useHistory(); // location 객체 접근
  const [data, setData] = useState({ price_grade: '매출단가 적용' }); //Customer Data
  const [addrSearchModalVisible, setAddrSearchModalVisible] = useState(false);

  useEffect(() => {
    const permission = window.sessionStorage.getItem('permission');
    if (permission === '4' || permission === '6') {
      message.error('권한이 없습니다.');
      history.goBack();
    }
  }, []);

  // Customer Create
  const customerCreate = () => {
    if (data.name === undefined || data.customer_grade === undefined) {
      message.warning('필수 입력사항을 입력해주세요.');
      return null;
    }

    requestCustomerCreate(data).then(() => history.push(`/Customer/customerTable/1`));
  };

  const handleAddrSearchModal = () => {
    setAddrSearchModalVisible(!addrSearchModalVisible);
  };

  const insertAddress = (addr) => {
    setData({ ...data, address_1: addr });
  };

  return (
    <Aux>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">고객등록</Card.Title>
            </Card.Header>
            <Card.Body>
              <h6 style={{ color: 'red' }}>* 표시는 필수 입력사항입니다.</h6>
              <hr />
              <Row>
                <Col md={6}>
                  <Form>
                    <Form.Group controlId="customerInput1">
                      <Form.Label>
                        <span style={{ color: 'red' }}>*</span> 고객분류
                      </Form.Label>
                      <InputGroup className="mb-3">
                        <Form.Control
                          as="select"
                          value={data.customer_grade}
                          onChange={(e) => {
                            setData({ ...data, customer_grade: e.target.value });
                          }}
                          required
                        >
                          <option>고객분류 선택</option>
                          <Category data={0} />
                        </Form.Control>
                        <InputGroup.Append>
                          <CategoryModal data={0} />
                        </InputGroup.Append>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="customerInput2">
                      <Form.Label>
                        <span style={{ color: 'red' }}>*</span> 고객(거래처)명
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="고객(거래처)명 입력"
                        onChange={(e) => {
                          setData({ ...data, name: e.target.value });
                        }}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="customerInput3">
                      <Form.Label>가격분류</Form.Label>
                      <Form.Control
                        as="select"
                        onChange={(e) => {
                          setData({ ...data, price_grade: e.target.value });
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
                          value={data.address_1 ? data.address_1 : ''}
                          onChange={(e) => {
                            setData({ ...data, address_1: e.target.value });
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
                        onChange={(e) => {
                          setData({ ...data, address_2: e.target.value });
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
                      onChange={(e) => {
                        setData({ ...data, tel: e.target.value });
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="customerInput7">
                    <Form.Label>휴대전화번호</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="- 입력"
                      onChange={(e) => {
                        setData({ ...data, phone: e.target.value });
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="customerInput8">
                    <Form.Label>FAX</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="- 입력"
                      onChange={(e) => {
                        setData({ ...data, fax_number: e.target.value });
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="customerInput9">
                    <Form.Label>이메일 주소</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="email@example.com"
                      onChange={(e) => {
                        setData({ ...data, email: e.target.value });
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="customerInput10">
                    <Form.Label>메모</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows="3"
                      placeholder="Memo"
                      onChange={(e) => {
                        setData({ ...data, memo: e.target.value });
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col style={{ textAlign: 'right' }}>
                  <Button variant="primary" onClick={() => customerCreate()}>
                    등록
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

export default CustomerRegistration;
