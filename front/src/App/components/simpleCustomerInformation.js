import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, FormControl } from 'react-bootstrap';
import requestCustomerGet from '../../Axios/Customer/requestCustomerGet';
import notNull from './notNull';

const SimpleCustomerInformation = () => {
  let [data, setData] = useState(); // Customer Data

  // requestCustomerGet()이 처음 한번만 실행되도록
  useEffect(() => {
    requestCustomerGet().then((res) => setData(notNull(res)));
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
              <Col md={4}>
                <Form>
                  <Form.Group controlId="customerInformation_name">
                    <Form.Label>고객(거래처)명</Form.Label>
                    <Form.Control type="text" value={data[0].name} readOnly />
                  </Form.Group>
                </Form>
              </Col>
              <Col md={4}>
                <Form>
                  <Form.Group controlId="customerInformation_tel">
                    <Form.Label>자택전화번호</Form.Label>
                    <Form.Control type="tel" value={data[0].tel} readOnly />
                  </Form.Group>
                </Form>
              </Col>
              <Col md={4}>
                <Form.Group controlId="customerInformation_phone">
                  <Form.Label>휴대전화번호</Form.Label>
                  <Form.Control type="tel" value={data[0].phone} readOnly />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="customerInformation_fax">
                  <Form.Label>FAX</Form.Label>
                  <Form.Control type="tel" value={data[0].fax_number} readOnly />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form>
                  <Form.Group controlId="customerInformation_address">
                    <Form.Label>주소</Form.Label>
                    <FormControl as="textarea" rows="auto" value={data[0].address_1 + data[0].address_2} readOnly />
                  </Form.Group>
                </Form>
              </Col>
              <Col md={4}>
                <Form.Group controlId="customerInformation_memo">
                  <Form.Label>메모</Form.Label>
                  <Form.Control as="textarea" rows="auto" value={data[0].memo} readOnly />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default SimpleCustomerInformation;
