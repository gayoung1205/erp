import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import Aux from '../../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
import { isEmptyObject } from 'jquery';
import requestCustomerGet from '../../../Axios/Customer/requestCustomerGet';
import requestTradeCreate from '../../../Axios/Trade/requestTradeCreate';

const CollectionPaymentRegistration = (props) => {
  let { type } = props.match.params; // collect or payment
  const history = useHistory(); // location 객체 접근
  const [data, setData] = useState({
    customer_id: window.sessionStorage.getItem('customerId'),
    register_date: moment().format().slice(0, 16),
    customer_receivable: 0, // 초기에 data 값이 없을 때 {data.category_name2} 후 미수금의 value가 NaN이 되지 않게 하기 위해서 초기값 설정
    cash: 0,
    credit: 0,
    bank: 0,
  }); // Trade Data

  React.useEffect(() => {
    if (data.customer_id === null || data.customer_id === undefined || isNaN(data.customer_id) === true) {
      history.push('/Customer/customerTable/1');
    } else {
      requestCustomerGet().then((res) => {
        setData({
          ...data,
          name: type === 'collection' ? '수금' : '지불',
          category_1: type === 'collection' ? 1 : 2,
          customer_name: res[0].name,
          customer_receivable: res[0].receivable,
        });
      });
    }
  }, [type]);

  // collection, payment Create
  const tradeCreate = () => {
    if (data.register_date === undefined) {
      message.warning('등록일을 입력해주세요.');
      return null;
    }
    if (
      data.cash === undefined ||
      data.credit === undefined ||
      data.bank === undefined ||
      (data.cash === 0 && data.credit === 0 && data.bank === 0)
    ) {
      message.warning('현금결제, 카드결제, 은행입금 중 최소 한 개를 입력해주세요.');
      return null;
    }

    requestTradeCreate(data).then(() => history.push(`/Trade/tradeTable/1`));
  };

  // data rendering전에 data 값이 undefined일 경우 Warning 있어서
  if (data === undefined) {
    return null;
  }

  // 현금, 카드, 은행 금액 변동에 따른 수금 후 미수금, 결제금액
  const priceCalculator = (e) => {
    if (isEmptyObject(e.target.value)) {
      setData({ ...data, [e.target.name]: 0 });
    } else {
      setData({ ...data, [e.target.name]: parseInt(e.target.value) });
    }
  };

  return (
    <Aux>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">{data.name}등록</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form>
                    <Form.Group controlId="collectionPaymentInput1">
                      <Form.Label>현금결제</Form.Label>
                      <Form.Control type="number" value={data.cash} name="cash" onChange={(e) => priceCalculator(e)} />
                    </Form.Group>

                    <Form.Group controlId="collectionPaymentInput2">
                      <Form.Label>카드결제</Form.Label>
                      <Form.Control type="number" value={data.credit} name="credit" onChange={(e) => priceCalculator(e)} />
                    </Form.Group>

                    <Form.Group controlId="collectionPaymentInput3">
                      <Form.Label>은행입금</Form.Label>
                      <Form.Control type="number" value={data.bank} name="bank" onChange={(e) => priceCalculator(e)} />
                    </Form.Group>
                  </Form>
                </Col>
                <Col md={4}>
                  <Form>
                    <Form.Group controlId="collectionPaymentInput4">
                      <Form.Label>총미수금</Form.Label>
                      <Form.Control type="number" value={data.customer_receivable} readOnly />
                    </Form.Group>

                    <Form.Group controlId="collectionPaymentInput5">
                      <Form.Label>{data.name} 후 미수금</Form.Label>
                      <Form.Control
                        type="number"
                        value={
                          type === 'collection'
                            ? parseInt(data.customer_receivable) - parseInt(data.cash) - parseInt(data.bank) - parseInt(data.credit)
                            : parseInt(data.customer_receivable) + parseInt(data.cash) + parseInt(data.bank) + parseInt(data.credit)
                        }
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group controlId="collectionPaymentInput6">
                      <Form.Label>결제금액</Form.Label>
                      <Form.Control type="number" value={parseInt(data.cash) + parseInt(data.bank) + parseInt(data.credit)} readOnly />
                    </Form.Group>
                  </Form>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="collectionPaymentInput7">
                    <Form.Label>등록일</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={data.register_date}
                      onChange={(e) => {
                        setData({
                          ...data,
                          register_date: e.target.value,
                        });
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="collectionPaymentInput8">
                    <Form.Label>거래/접수내용</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows="3"
                      placeholder="거래/접수내용"
                      value={data.content}
                      onChange={(e) => {
                        setData({ ...data, content: e.target.value });
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col style={{ textAlign: 'right' }}>
                  <Button variant="primary" onClick={() => tradeCreate()}>
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

export default CollectionPaymentRegistration;
