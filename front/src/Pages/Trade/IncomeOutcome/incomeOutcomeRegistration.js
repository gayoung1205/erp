import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import Aux from '../../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
import { isEmptyObject } from 'jquery';
import requestTradeCreate from '../../../Axios/Trade/requestTradeCreate';

const IncomeOutcomeRegistration = (props) => {
  let { type } = props.match.params; // income or outcome

  const history = useHistory(); // location 객체 접근

  const [data, setData] = useState({
    register_date: moment().format().slice(0, 16),
    cash: 0,
    credit: 0,
    bank: 0,
  }); // Trade Data

  // type 이 바뀔 때마다 실행
  React.useEffect(() => {
    setData({ ...data, name: type === 'income' ? '수입' : '지출', category_1: type === 'income' ? 5 : 6 });
  }, [type]);

  // Income, Outcome Create
  const incomeOutcomeCreate = () => {
    if (data.register_date === undefined || data.content === undefined) {
      message.warning('필수 입력사항을 입력해주세요.');
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

    requestTradeCreate(data).then(() => history.push(`/Trade/accountingTable/1`));
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
              <h6 style={{ color: 'red' }}>* 표시는 필수 입력사항입니다.</h6>
              <hr />
              <Row>
                <Col md={4}>
                  <Form>
                    <Form.Group controlId="inOutInput1">
                      <Form.Label>현금결제</Form.Label>
                      <Form.Control type="number" value={data.cash} name="cash" onChange={(e) => priceCalculator(e)} />
                    </Form.Group>
                  </Form>
                  <Form>
                    <Form.Group controlId="inOutInput2">
                      <Form.Label>카드결제</Form.Label>
                      <Form.Control type="number" value={data.credit} name="credit" onChange={(e) => priceCalculator(e)} />
                    </Form.Group>
                  </Form>
                  <Form>
                    <Form.Group controlId="inOutInput3">
                      <Form.Label>은행입금</Form.Label>
                      <Form.Control type="number" value={data.bank} name="bank" onChange={(e) => priceCalculator(e)} />
                    </Form.Group>
                  </Form>
                </Col>
                <Col md={4}>
                  <Form>
                    <Form.Group controlId="inOutInput4">
                      <Form.Label>{data.name}금액</Form.Label>
                      <Form.Control type="number" value={parseInt(data.cash) + parseInt(data.bank) + parseInt(data.credit)} readOnly />
                    </Form.Group>

                    <Form.Group controlId="inOutInput5">
                      <Form.Label>
                        <span style={{ color: 'red' }}>*</span>등록일
                      </Form.Label>
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
                  </Form>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="inOutInput6">
                    <Form.Label>
                      <span style={{ color: 'red' }}>*</span>내용
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="내용"
                      value={data.content ? data.content : ''}
                      onChange={(e) => {
                        setData({ ...data, content: e.target.value });
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="inOutInput7">
                    <Form.Label>메모</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows="3"
                      placeholder="메모"
                      value={data.memo}
                      onChange={(e) => {
                        setData({ ...data, memo: e.target.value });
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col style={{ textAlign: 'right' }}>
                  <Button variant="primary" onClick={() => incomeOutcomeCreate()}>
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

export default IncomeOutcomeRegistration;
