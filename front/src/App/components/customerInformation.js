import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, FormControl } from 'react-bootstrap';
import notNull from './notNull';
import requestCustomerGet from '../../Axios/Customer/requestCustomerGet';

const CustomerInformation = () => {
  let [data, setData] = useState(); // customer data

  // requestCustomerGet()이 처음 한번만 동작하도록
  useEffect(() => {
    requestCustomerGet().then((res) => {
      setData(notNull(res));
    });
  }, []);

  // 처음 undefined 방지
  if (data === undefined) {
    return null;
  }

  return (
    <Row>
      <Col>
        <Card>
          <Card.Header>
            <Card.Title as="h5">고객정보</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={2}>
                <Form>
                  <Form.Group controlId="customerInformation1">
                    <Form.Label>고객(거래처)명</Form.Label>
                    <Form.Control type="text" placeholder="Enter name" value={data[0].name} readOnly />
                  </Form.Group>

                  <Form.Group controlId="customerInformation2">
                    <Form.Label>고객분류</Form.Label>
                    <Form.Control as="select">
                      <option>{data[0].customer_grade}</option>
                    </Form.Control>
                  </Form.Group>
                </Form>
              </Col>
              <Col md={2}>
                <Form>
                  <Form.Group controlId="customerInformation3">
                    <Form.Label>자택전화번호</Form.Label>
                    <Form.Control type="tel" placeholder="- 입력" value={data[0].tel} readOnly />
                  </Form.Group>

                  <Form.Group controlId="customerInformation4">
                    <Form.Label>휴대전화번호</Form.Label>
                    <Form.Control type="tel" placeholder="- 입력" value={data[0].phone} readOnly />
                  </Form.Group>
                </Form>
              </Col>
              <Col md={2}>
                <Form.Group controlId="customerInformation5">
                  <Form.Label>FAX</Form.Label>
                  <Form.Control type="text" placeholder="- 입력" value={data[0].fax_number} readOnly />
                </Form.Group>

                <Form.Group controlId="customerInformation6">
                  <Form.Label>가격분류</Form.Label>
                  <Form.Control as="select">
                    <option>{data[0].price_grade}</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form>
                  <Form.Group controlId="customerInformation7">
                    <Form.Label>이메일 주소</Form.Label>
                    <Form.Control type="email" placeholder="email@example.com" value={data[0].email} readOnly />
                  </Form.Group>

                  <Form.Group controlId="customerInformation8">
                    <Form.Label>주소</Form.Label>
                    <FormControl placeholder="주소" value={data[0].address_1 + data[0].address_2} readOnly />
                  </Form.Group>
                </Form>
              </Col>
              <Col md={3}>
                <Form.Group controlId="customerInformation9">
                  <Form.Label>메모</Form.Label>
                  <Form.Control as="textarea" rows="3" placeholder="Memo" value={data[0].memo} readOnly />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CustomerInformation;
