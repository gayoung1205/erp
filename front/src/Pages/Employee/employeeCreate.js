import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import Aux from '../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
import requestUserIdCheck from '../../Axios/User/requestUserIdCheck';
import requestEngineerCreate from '../../Axios/Engineer/requestEngineerCreate';

const EmployeeCreate = () => {
  const history = useHistory(); // location 객체 접근
  const [data, setData] = useState({
    user_id: '',
    name: '',
    join_date: moment().format().slice(0, 10),
    category: 0,
    is_active: true,
    is_staff: false,
    is_leader: false,
  }); //Customer Data
  const [idCheck, setIdCheck] = useState(false);
  const [pwCheck, setPwCheck] = useState(false);

  useEffect(() => {
    const permission = window.sessionStorage.getItem('permission');
    if (!(permission === '2' || permission === '3')) {
      message.error('권한이 없습니다.');
      history.goBack();
    }
  }, []);

  const userIdCheck = (user_id) => {
    if (user_id.length === 0 || user_id === undefined) {
      message.warning('아이디를 입력해주세요.');
      return null;
    }
    requestUserIdCheck(user_id).then((res) => {
      if (res === true) {
        setIdCheck(true);
        message.success('사용가능 아이디입니다.');
      } else {
        setIdCheck(false);
        message.error('중복된 아이디입니다.');
      }
    });
  };

  const employeeCreate = () => {
    if (!idCheck) {
      message.error('아이디 중복확인이 필요합니다.');
      return null;
    }
    if (!pwCheck) {
      message.error('비밀번호가 일치하지 않습니다.');
      return null;
    }
    if (data.name.length === 0) {
      message.error('이름을 입력해주세요.');
      return null;
    }

    requestEngineerCreate(data).then(() => {
      history.push(`/Employee/employeeList`);
    });
  };

  const checkLeader = () => {
    if (data.is_leader) {
      setData({ ...data, is_leader: false });
    } else {
      setData({ ...data, is_leader: true });
    }
  };

  return (
    <Aux>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">직원등록</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form>
                    <Form.Group controlId="customerInput1">
                      <Form.Label>아이디</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          value={data.user_id}
                          onChange={(e) => {
                            if (idCheck) setIdCheck(false);
                            setData({ ...data, user_id: e.target.value });
                          }}
                          required
                        />
                        <InputGroup.Append>
                          <Button
                            variant="primary"
                            onClick={() => {
                              userIdCheck(data.user_id);
                            }}
                          >
                            중복확인
                          </Button>
                        </InputGroup.Append>
                      </InputGroup>
                      <Form.Text id="idHelpText" muted>
                        {idCheck ? (
                          <span style={{ color: 'green' }}>사용가능한 아이디입니다.</span>
                        ) : (
                          <span style={{ color: 'red' }}>아이디 중복확인이 필요합니다.</span>
                        )}
                      </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="customerInput1">
                      <Form.Label>비밀번호</Form.Label>
                      <Form.Control
                        type="password"
                        value={data.password ? data.password : ''}
                        onChange={(e) => {
                          setData({ ...data, password: e.target.value });
                        }}
                      />
                    </Form.Group>

                    <Form.Group controlId="customerInput1">
                      <Form.Label>비밀번호 확인</Form.Label>
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
                      checked={data.is_active}
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
                      checked={data.is_staff}
                      onChange={() => {
                        data.is_staff ? setData({ ...data, is_staff: false }) : setData({ ...data, is_staff: true });
                      }}
                    />
                    <Form.Check
                      custom
                      inline
                      type="switch"
                      id="custom-inline-switch-3"
                      label="팀장 여부"
                      checked={data.is_leader}
                      onChange={() => checkLeader()}
                    />
                  </div>
                </Col>
              </Row>
              <Row>
                <Col style={{ textAlign: 'right' }}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      employeeCreate();
                    }}
                  >
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

export default EmployeeCreate;
