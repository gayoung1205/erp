import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import Aux from '../../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
import CustomerInformation from '../../../App/components/customerInformation';
import EngineerSelect from '../../../App/components/engineerSelect';
import requestCustomerGet from '../../../Axios/Customer/requestCustomerGet';
import requestTradeCreate from '../../../Axios/Trade/requestTradeCreate';

const DeliveryRegistration = () => {
  let cmId = window.sessionStorage.getItem('customerId'); // Customer Id
  const history = useHistory(); // location 객체 접근
  const [selectLoading, setSelectLoading] = useState(false);
  const [data, setData] = useState({
    customer_id: cmId,
    category_1: 7,
    category_2: 0,
    register_date: moment().format().slice(0, 16),
  }); // Trade Data

  React.useEffect(() => {
    const permission = window.sessionStorage.getItem('permission');
    if (permission === '4' || permission === '7') {
      message.error('권한이 없습니다.');
      history.goBack();
      return;
    }
    if (cmId === null || cmId === undefined || isNaN(cmId) === true) {
      history.push('/Customer/customerTable/1');
    } else {
      setSelectLoading(true);

      requestCustomerGet().then((res) => {
        setData({ ...data, customer_name: res[0].name });
      });
    }
  }, []);

  // Delivery Create
  const deliveryCreate = () => {
    if (data.register_date === undefined || data.engineer_id === undefined || data.content === undefined) {
      message.warning('필수 입력사항을 입력해주세요.');
      return null;
    }

    requestTradeCreate(data).then(() => history.push(`/Trade/tradeTable/1`));
  };

  // data rendering전에 data 값이 undefined일 경우 Warning 있어서
  if (data === undefined) {
    return null;
  }

  return (
    <Aux>
      <CustomerInformation />
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">납품접수</Card.Title>
            </Card.Header>
            <Card.Body>
              <h6 style={{ color: 'red' }}>* 표시는 필수 입력사항입니다.</h6>
              <hr />
              <Row>
                <Col md={6}>
                  <Form>
                    <Form.Group controlId="deliveryInput1">
                      <Form.Label>
                        <span style={{ color: 'red' }}>*</span> 접수일
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
                      {/* <Form.Text className="text-muted">We'll never share your email with anyone else.</Form.Text> */}
                    </Form.Group>

                    <Form.Group controlId="deliveryInput2">
                      <Form.Label>
                        <span style={{ color: 'red' }}>*</span>담당자
                      </Form.Label>
                      <Form.Control
                        as="select"
                        value={data.engineer_id}
                        onChange={(e) => {
                          setData({ ...data, engineer_id: e.target.value });
                        }}
                        required
                      >
                        <option>담당자 선택</option>
                        <EngineerSelect loading={selectLoading} />
                      </Form.Control>
                    </Form.Group>
                  </Form>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="deliveryInput3">
                    <Form.Label>
                      <span style={{ color: 'red' }}>*</span>접수 내용
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows="3"
                      placeholder="접수 내용"
                      value={data.content}
                      onChange={(e) => {
                        setData({ ...data, content: e.target.value });
                      }}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="deliveryInput4">
                    <Form.Label>참고사항</Form.Label>
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
                  <Button variant="primary" onClick={() => deliveryCreate()}>
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

export default DeliveryRegistration;
