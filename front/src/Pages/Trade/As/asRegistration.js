import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import Aux from '../../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
import CustomerInformation from '../../../App/components/customerInformation';
import EngineerSelect from '../../../App/components/engineerSelect';
import requestTradeCreate from '../../../Axios/Trade/requestTradeCreate';
import requestCustomerGet from '../../../Axios/Customer/requestCustomerGet';

const AsRegistration = () => {
  let cmId = window.sessionStorage.getItem('customerId'); // Customer Id
  const history = useHistory(); // location 객체 접근
  const [selectLoading, setSelectLoading] = useState(false);
  const [data, setData] = useState({
    customer_id: cmId,
    category_1: 0,
    category_2: 0,
    category_3: 0,
    register_date: moment().format().slice(0, 16),
  }); // Trade Data

  // customer_name setData, sessionStorage에 Customer Id가 없을 경우 고객목록 page로 이동
  React.useEffect(() => {
    if (cmId === null || cmId === undefined || isNaN(cmId) === true) {
      history.push('/Customer/customerTable/1');
    } else {
      setSelectLoading(true);

      requestCustomerGet().then((res) => {
        setData({ ...data, customer_name: res[0].name });
      });
    }
  }, []);

  // As Create
  const asCreate = () => {
    if (data.register_date === undefined || data.engineer_id === undefined || data.category_3 === undefined || data.content === undefined) {
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
              <Card.Title as="h5">AS접수</Card.Title>
            </Card.Header>
            <Card.Body>
              <h6 style={{ color: 'red' }}>* 표시는 필수 입력사항입니다.</h6>
              <hr />
              <Row>
                <Col md={6}>
                  <Form>
                    <Form.Group controlId="asInput1">
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
                    </Form.Group>

                    <Form.Group controlId="asInput2">
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

                    <Form.Group controlId="asInput3">
                      <Form.Label>
                        <span style={{ color: 'red' }}>*</span>출장/내방
                      </Form.Label>
                      <Form.Control
                        as="select"
                        value={data.category_3}
                        onChange={(e) => {
                          setData({ ...data, category_3: e.target.value });
                        }}
                        required
                      >
                        <option value={0}>출장</option>
                        <option value={1}>내방</option>
                      </Form.Control>
                    </Form.Group>
                  </Form>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="asInput4">
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

                  <Form.Group controlId="asInput5">
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
                  <Button variant="primary" onClick={() => asCreate()}>
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

export default AsRegistration;
