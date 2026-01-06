import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import Aux from '../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
import { isEmptyObject } from 'jquery';
import requestEngineerDetailGet from '../../Axios/Engineer/requestEngineerDetailGet';
import requestEngineerUpdate from '../../Axios/Engineer/requestEngineerUpdate';

const EmployeeUpdate = ({ match }) => {
  const history = useHistory(); // location 객체 접근
  const [data, setData] = useState({}); //Customer Data
  const [pwCheck, setPwCheck] = useState(false);

  useEffect(() => {
    const permission = window.sessionStorage.getItem('permission');
    if (!(permission === '2' || permission === '3')) {
      message.error('권한이 없습니다.');
      history.goBack();
    }

    requestEngineerDetailGet(match.params.employee_id).then((res) => {
      if (!isEmptyObject(res) && res !== undefined && res !== null) {
        res.password = '';
        setData(res);
      }
    });
  }, []);

  const employeeUpdate = () => {
    if (!pwCheck && data.password.length > 0) {
      message.error('비밀번호가 일치하지 않습니다.');
      return null;
    }
    if (data.name.length === 0) {
      message.error('이름을 입력해주세요.');
      return null;
    }

    requestEngineerUpdate(data).then(() => {
      history.push(`/Employee/employeeList`);
    });
  };

  return (
    <Aux>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">직원수정</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form>
                    <Form.Group controlId="customerInput1">
                      <Form.Label>아이디</Form.Label>
                      <Form.Control type="text" value={data.user_id ? data.user_id : ''} required readOnly />
                    </Form.Group>

                    <Form.Group controlId="customerInput1">
                      <Form.Label>비밀번호 변경</Form.Label>
                      <Form.Control
                        type="password"
                        value={data.password ? data.password : ''}
                        onChange={(e) => {
                          setData({ ...data, password: e.target.value });
                        }}
                      />
                    </Form.Group>

                    <Form.Group controlId="customerInput1">
                      <Form.Label>비밀번호 변경 확인</Form.Label>
                      <Form.Control
                        type="password"
                        value={data.password_check ? data.password_check : ''}
                        onChange={(e) => {
                          if (e.target.value === data.password) {
                            setPwCheck(true);
                          } else {
                            setPwCheck(false);
                          }
                          setData({ ...data, password_check: e.target.value });
                        }}
                      />
                      <Form.Text id="passwordCheckText" muted>
                        {pwCheck ? (
                          <span style={{ color: 'green' }}>비밀번호가 일치합니다.</span>
                        ) : (
                          <span style={{ color: 'red' }}>비밀번호가 일치하지 않습니다.</span>
                        )}
                      </Form.Text>
                    </Form.Group>
                  </Form>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="customerInput2">
                    <Form.Label>이름</Form.Label>
                    <Form.Control
                      type="text"
                      value={data.name ? data.name : ''}
                      onChange={(e) => {
                        setData({ ...data, name: e.target.value });
                      }}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="customerInput7">
                    <Form.Label>입사일</Form.Label>
                    <Form.Control
                      type="date"
                      value={data.join_date ? data.join_date : ''}
                      onChange={(e) => {
                        setData({ ...data, join_date: e.target.value });
                      }}
                      max={moment().format().slice(0, 10)}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="customerInput3">
                    <Form.Label>부서</Form.Label>
                    <Form.Control
                      as="select"
                      value={data.category ? data.category : 0}
                      onChange={(e) => {
                        setData({ ...data, category: Number(e.target.value) });
                      }}
                    >
                      <option value={0}>관리</option>
                      <option value={1}>지원</option>
                      <option value={2}>대표이사</option>
                      <option value={3}>관리자</option>
                      <option value={4}>연구개발</option>
                      <option value={5}>전략기획</option>
                      <option value={6}>생산</option>
                      <option value={7}>영업</option>
                    </Form.Control>
                  </Form.Group>
                  <div key="custom-inline-switch" className="mb-3">
                    <Form.Check
                      custom
                      inline
                      type="switch"
                      id="custom-inline-switch-1"
                      label="활성여부"
                      checked={data.is_active ? data.is_active : false}
                      onChange={() => {
                        data.is_active ? setData({ ...data, is_active: false }) : setData({ ...data, is_active: true });
                      }}
                    />
                    <Form.Check
                      custom
                      inline
                      type="switch"
                      id="custom-inline-switch-2"
                      label="관리 페이지 접속 가능 여부"
                      checked={data.is_staff ? data.is_staff : false}
                      onChange={() => {
                        data.is_staff ? setData({ ...data, is_staff: false }) : setData({ ...data, is_staff: true });
                      }}
                    />
                  </div>
                </Col>
              </Row>
              <Row>
                <Col style={{ textAlign: 'right' }}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      employeeUpdate();
                    }}
                  >
                    수정
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

export default EmployeeUpdate;
