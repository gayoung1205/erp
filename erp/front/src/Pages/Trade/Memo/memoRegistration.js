import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import Aux from '../../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
import requestCustomerGet from '../../../Axios/Customer/requestCustomerGet';
import requestTradeCreate from '../../../Axios/Trade/requestTradeCreate';

const MemoRegistration = () => {
  const history = useHistory(); // location 객체 접근
  const [data, setData] = useState({
    customer_id: window.sessionStorage.getItem('customerId'),
    category_1: 8,
    register_date: moment().format().slice(0, 16),
  }); // Trade Data

  // 처음에 customer_name setData, sessionStorage에 Customer Id가 없을 경우 고객목록 page로 이동
  React.useEffect(() => {
    if (data.customer_id === null || data.customer_id === undefined || isNaN(data.customer_id) === true) {
      history.push('/Customer/customerTable/1');
    } else {
      requestCustomerGet().then((res) => setData({ ...data, customer_name: res[0].name }));
    }
  }, []);

  // Memo Create
  const memoCreate = () => {
    if (data.content === undefined || data.register_date === undefined) {
      message.warning('필수 입력사항을 입력해주세요.');
      return null;
    }

    requestTradeCreate(data).then(() => history.push(`/Trade/tradeTable/1`));
  };

  return (
    <Aux>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">메모등록</Card.Title>
            </Card.Header>
            <Card.Body>
              <h6 style={{ color: 'red' }}>* 표시는 필수 입력사항입니다.</h6>
              <hr />
              <Row>
                <Col md={6}>
                  <Form>
                    <Form.Group controlId="memoInput1">
                      <Form.Label>
                        <span style={{ color: 'red' }}>*</span> 제목
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter name"
                        value={data.content}
                        onChange={(e) => {
                          setData({ ...data, content: e.target.value });
                        }}
                        required
                      />
                    </Form.Group>
                  </Form>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="memoInput2">
                    <Form.Label>
                      <span style={{ color: 'red' }}>*</span> 등록날짜
                    </Form.Label>
                    <Form.Control
                      type="datetime-local"
                      placeholder="Enter name"
                      value={data.register_date}
                      onChange={(e) => {
                        setData({ ...data, register_date: e.target.value });
                      }}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group controlId="memoInput3">
                    <Form.Label>내용</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows="3"
                      placeholder="Memo"
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
                  <Button variant="primary" onClick={() => memoCreate()}>
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

export default MemoRegistration;
