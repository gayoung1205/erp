import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import Aux from '../../hoc/_Aux';
import { Modal, message } from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
import requestRecordCreate from '../../Axios/Record/requestRecordCreate';

const DocumentCreateModal = (props) => {
  const [state, setState] = useState({ visible: false }); //Modal visible
  const [data, setData] = useState({ category: 0, date: moment().format().slice(0, 10) }); // 생성 데이터
  const [flag, setFlag] = useState(false); // Modal Visible 조절 변수

  // props.visible이 변경될 때마다 실행
  useEffect(() => {
    if (!flag) {
      setFlag(true);
      setState({ visible: props.visible });
    } else {
      setState({ visible: true });
    }
  }, [props.visible]);

  // Document Create
  const requestDocumentCreate = (isSubmit) => {
    // 제출 시에 is_submit을 true로, 임시저장일 시에는 자동으로 false가 들어감
    if (isSubmit === true) data.is_submit = true;

    // category 입력 확인
    if (data.category === undefined) {
      message.warning('문서 종류를 입력해주세요.');
      return null;
    }

    // 휴가신청일 경우 시작일과 종료일이 필수이기 때문에 체크
    if (data.category === 3) {
      if (data.start_date === undefined) {
        message.warning('시작일을 입력해주세요.');
        return null;
      }
      if (data.end_date === undefined) {
        message.warning('종료일을 입력해주세요.');
        return null;
      }
    }

    // 내용 입력 확인
    if (data.content === undefined) {
      message.warning('내용을 입력해주세요.');
      return null;
    }

    requestRecordCreate(data).then(() => handleOk());
  };

  // Modal Visible true -> false, Page Reload
  const handleOk = (e) => {
    setState({
      visible: false,
    });
    window.location.reload();
  };

  // Modal Visible true -> false
  const handleCancel = (e) => {
    setState({
      visible: false,
    });
  };

  return (
    <>
      <Modal
        title="문서 생성"
        visible={state.visible}
        onOk={() => requestDocumentCreate()}
        onCancel={() => handleCancel()}
        width="50%"
        footer={null}
        zIndex={1030}
      >
        <Aux>
          <Row>
            <Col>
              <Card>
                <Card.Body>
                  <Row>
                    <Col md={12} xl={6}>
                      <Form>
                        <Form.Group controlId="documentCreateInput01">
                          <Form.Control
                            as="select"
                            defaultValue={0}
                            onChange={(e) => {
                              setData({ ...data, category: parseInt(e.target.value) });
                            }}
                          >
                            <option value={0}>업무일지</option>
                            {/* <option value={1}>휴가신청</option> */}
                          </Form.Control>
                        </Form.Group>
                      </Form>
                    </Col>
                    <Col md={12} xl={6}>
                      <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                          <InputGroup.Text id="createRegisterDate">등록일</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                          type="date"
                          value={data.date}
                          onChange={(e) => {
                            setData({ ...data, date: e.target.value });
                          }}
                        />
                      </InputGroup>
                    </Col>
                    {data.category === 1 && (
                      <>
                        <Col md={12} xl={6}>
                          <InputGroup className="mb-3">
                            <InputGroup.Prepend>
                              <InputGroup.Text id="createStartDate">시작일</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                              type="datetime-local"
                              onChange={(e) => {
                                setData({ ...data, start_date: e.target.value });
                              }}
                            />
                          </InputGroup>
                        </Col>
                        <Col md={12} xl={6}>
                          <InputGroup className="mb-3">
                            <InputGroup.Prepend>
                              <InputGroup.Text id="createEndDate">종료일</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                              type="datetime-local"
                              onChange={(e) => {
                                setData({ ...data, end_date: e.target.value });
                              }}
                            />
                          </InputGroup>
                        </Col>
                      </>
                    )}
                    {data.category !== 0 && (
                      <Col md={12}>
                        <Form.Group controlId="documentCreateInput04">
                          <Form.Control
                            as="textarea"
                            rows="20"
                            placeholder="내용 입력"
                            onChange={(e) => {
                              setData({ ...data, content: e.target.value });
                            }}
                          />
                        </Form.Group>
                      </Col>
                    )}
                    {data.category === 0 && (
                      <>
                        <Col md={12}>
                          <Form.Group controlId="documentCreateInput04">
                            <Form.Control
                              as="textarea"
                              rows="10"
                              placeholder="내용 입력"
                              onChange={(e) => {
                                setData({ ...data, content: e.target.value });
                              }}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group controlId="documentCreateInput05">
                            <Form.Control
                              as="textarea"
                              rows="10"
                              placeholder="예정 계획"
                              onChange={(e) => {
                                setData({ ...data, plan: e.target.value });
                              }}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group controlId="documentCreateInput06">
                            <Form.Control
                              as="textarea"
                              rows="5"
                              placeholder="비고"
                              onChange={(e) => {
                                setData({ ...data, remark: e.target.value });
                              }}
                            />
                          </Form.Group>
                        </Col>
                      </>
                    )}
                  </Row>
                  <Row>
                    <Col style={{ textAlign: 'center' }}>
                      <Button variant="primary" onClick={() => requestDocumentCreate(true)}>
                        제출
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Aux>
      </Modal>
    </>
  );
};

export default DocumentCreateModal;
