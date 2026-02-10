import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import Aux from '../../hoc/_Aux';
import { message, Modal } from 'antd';
import 'antd/dist/antd.css';
import axios from 'axios';
import CheckToken from '../../App/components/checkToken';
import config from '../../config.js';
import requestRecordGet from '../../Axios/Record/requestRecordGet';
import requestRecordUpdate from '../../Axios/Record/requestRecordUpdate';

const DocumentUpdateModal = (props) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' }); // deviceWidth > 768
  let token = sessionStorage.getItem('token'); // Login Token
  const permission = sessionStorage.getItem('permission'); // Permission 값
  const [visible, setVisible] = useState(false); // Modal visible
  const [data, setData] = useState({}); // 생성 데이터
  const [flag, setFlag] = useState(false); // Modal Visible 조절 변수
  const [modalWidth, setModalWidth] = useState('50%');

  useEffect(() => {
    // props.id === undefined이면 axios X
    if (props.id !== undefined) {
      requestRecordGet(props.id).then((res) => setData(res));
    }
  }, [props.id]);

  useEffect(() => {
    if (!flag) {
      setFlag(true);
      setVisible(props.visible);
    } else {
      setVisible(true);
    }
  }, [props.visible]);

  useEffect(() => {
    isDesktop ? setModalWidth('50%') : setModalWidth('100%');
  }, [isDesktop]);

  const documentUpdate = useCallback(
    (type) => {
      if (type === 'is_reject') {
        if (data.reject_content === '') {
          message.warning('반려사유를 입력해주세요.');
          return null;
        }
      }

      requestRecordUpdate(data, type, props.id).then(() => handleOk());
    },
    [data, props.id]
  );

  const requestDocumentDelete = useCallback(() => {
    axios({
      url: `${config.backEndServerAddress}api/record/${props.id}/`,
      method: 'DELETE',
      headers: { Authorization: `JWT ${token}` },
    })
      .then(() => handleOk())
      .catch((err) => CheckToken(err));
  }, [token, props.id]);

  // Modal Visible true -> false, Page Reload
  const handleOk = (e) => {
    setVisible(false);
    window.location.reload();
  };

  // Modal Visible true -> false
  const handleCancel = (e) => {
    setVisible(false);
  };

  return (
    <>
      <Modal title={data.title} visible={visible} onCancel={() => handleCancel()} width={modalWidth} footer={null} zIndex={1030}>
        <Aux>
          <Row>
            <Col>
              <Card>
                <Card.Body>
                  <Row>
                    <Col md={12} xl={6}>
                      <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                          <InputGroup.Text id="updateRegisterDate">등록일</InputGroup.Text>
                        </InputGroup.Prepend>
                        {data.status === 0 ? (
                          <Form.Control
                            type="date"
                            value={data.date ? data.date : ''}
                            onChange={(e) => {
                              setData({ ...data, date: e.target.value });
                            }}
                          />
                        ) : (
                          <Form.Control
                            type="date"
                            value={data.date ? data.date : ''}
                            onChange={(e) => {
                              setData({ ...data, date: e.target.value });
                            }}
                            readOnly
                          />
                        )}
                      </InputGroup>
                    </Col>
                    <Col md={12} xl={6}>
                      <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                          <InputGroup.Text id="updateDepartment">부서</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control type="text" value={data.department ? data.department : ''} readOnly />
                      </InputGroup>
                    </Col>
                    {data.category === '휴가신청' && (
                      <>
                        <Col md={12} xl={6}>
                          <InputGroup className="mb-3">
                            <InputGroup.Prepend>
                              <InputGroup.Text id="updateStartDate">시작일</InputGroup.Text>
                            </InputGroup.Prepend>
                            {data.status === 0 ? (
                              <Form.Control
                                type="datetime-local"
                                title={data.start_date ? data.start_date : ''}
                                value={data.start_date ? data.start_date : ''}
                                onChange={(e) => {
                                  setData({ ...data, start_date: e.target.value });
                                }}
                              />
                            ) : (
                              <Form.Control
                                type="datetime-local"
                                title={data.start_date ? data.start_date : ''}
                                value={data.start_date ? data.start_date : ''}
                                onChange={(e) => {
                                  setData({ ...data, start_date: e.target.value });
                                }}
                                readOnly
                              />
                            )}
                          </InputGroup>
                        </Col>
                        <Col md={12} xl={6}>
                          <InputGroup className="mb-3">
                            <InputGroup.Prepend>
                              <InputGroup.Text id="updateEndDate">종료일</InputGroup.Text>
                            </InputGroup.Prepend>
                            {data.status === 0 ? (
                              <Form.Control
                                type="datetime-local"
                                title={data.end_date ? data.end_date : ''}
                                value={data.end_date ? data.end_date : ''}
                                onChange={(e) => {
                                  setData({ ...data, end_date: e.target.value });
                                }}
                              />
                            ) : (
                              <Form.Control
                                type="datetime-local"
                                title={data.end_date ? data.end_date : ''}
                                value={data.end_date ? data.end_date : ''}
                                onChange={(e) => {
                                  setData({ ...data, end_date: e.target.value });
                                }}
                                readOnly
                              />
                            )}
                          </InputGroup>
                        </Col>
                      </>
                    )}
                    <Col md={12}>
                      {data.status === 0 ? (
                        <>
                          {data.category === '업무일지' && (
                            <>
                              <Form.Group controlId="documentUpdateInput02">
                                <Form.Control
                                  as="textarea"
                                  rows="10"
                                  value={data.content ? data.content : ''}
                                  placeholder="내용 입력"
                                  onChange={(e) => {
                                    setData({ ...data, content: e.target.value });
                                  }}
                                />
                              </Form.Group>
                              <Form.Group controlId="documentUpdateInput03">
                                <Form.Control
                                  as="textarea"
                                  rows="10"
                                  value={data.plan ? data.plan : ''}
                                  placeholder="예정 계획"
                                  onChange={(e) => {
                                    setData({ ...data, plan: e.target.value });
                                  }}
                                />
                              </Form.Group>
                              <Form.Group controlId="documentUpdateInput04">
                                <Form.Control
                                  as="textarea"
                                  rows="5"
                                  value={data.remark ? data.remark : ''}
                                  placeholder="비고"
                                  onChange={(e) => {
                                    setData({ ...data, remark: e.target.value });
                                  }}
                                />
                              </Form.Group>
                            </>
                          )}
                          {data.category !== '업무일지' && (
                            <Form.Group controlId="documentUpdateInput02">
                              <Form.Control
                                as="textarea"
                                rows="20"
                                value={data.content ? data.content : ''}
                                placeholder="내용 입력"
                                onChange={(e) => {
                                  setData({ ...data, content: e.target.value });
                                }}
                              />
                            </Form.Group>
                          )}
                        </>
                      ) : (
                        <>
                          {data.category === '업무일지' && (
                            <>
                              <Form.Group controlId="documentUpdateInput02">
                                <Form.Control
                                  as="textarea"
                                  rows="10"
                                  value={data.content ? data.content : ''}
                                  placeholder="내용 입력"
                                  onChange={(e) => {
                                    setData({ ...data, content: e.target.value });
                                  }}
                                  readOnly
                                />
                              </Form.Group>
                              <Form.Group controlId="documentUpdateInput03">
                                <Form.Control
                                  as="textarea"
                                  rows="10"
                                  value={data.plan ? data.plan : ''}
                                  placeholder="예정 계획"
                                  onChange={(e) => {
                                    setData({ ...data, plan: e.target.value });
                                  }}
                                  readOnly
                                />
                              </Form.Group>
                              <Form.Group controlId="documentUpdateInput04">
                                <Form.Control
                                  as="textarea"
                                  rows="5"
                                  value={data.remark ? data.remark : ''}
                                  placeholder="비고"
                                  onChange={(e) => {
                                    setData({ ...data, remark: e.target.value });
                                  }}
                                  readOnly
                                />
                              </Form.Group>
                            </>
                          )}
                          {data.category !== '업무일지' && (
                            <Form.Group controlId="documentUpdateInput02">
                              <Form.Control
                                as="textarea"
                                rows="20"
                                value={data.content ? data.content : ''}
                                placeholder="내용 입력"
                                onChange={(e) => {
                                  setData({ ...data, content: e.target.value });
                                }}
                                readOnly
                              />
                            </Form.Group>
                          )}
                        </>
                      )}
                    </Col>
                    {((data.status === 0 && (permission === '2' || permission === '3')) || data.status === 2) && (
                      <Col md={12}>
                        <Form.Group controlId="documentUpdateInput05">
                          <Form.Label>반려 사유</Form.Label>
                          {data.status === 0 ? (
                            <Form.Control
                              as="textarea"
                              rows="5"
                              value={data.reject_content ? data.reject_content : ''}
                              placeholder="반려 사유 입력"
                              onChange={(e) => {
                                setData({ ...data, reject_content: e.target.value });
                              }}
                            />
                          ) : (
                            <Form.Control
                              as="textarea"
                              rows="5"
                              value={data.reject_content ? data.reject_content : ''}
                              placeholder="반려 사유 입력"
                              onChange={(e) => {
                                setData({ ...data, reject_content: e.target.value });
                              }}
                              readOnly
                            />
                          )}
                        </Form.Group>
                      </Col>
                    )}
                  </Row>
                  {data.isSubmit !== true && (
                    <Row>
                      <Col style={{ textAlign: 'center' }}>
                        {data.status === 0 && (
                            <>
                              {permission === '2' || permission === '3' ? (
                                  <>
                                    <Button variant="danger" onClick={() => documentUpdate('is_reject')}>반려</Button>
                                    <Button variant="primary" onClick={() => documentUpdate('is_approved')}>승인</Button>
                                  </>
                              ) : data.username === sessionStorage.getItem('username') ? (
                                  <>
                                    <Button variant="primary" onClick={() => documentUpdate()}>수정</Button>
                                    <Button variant="danger" onClick={() => requestDocumentDelete()}>삭제</Button>
                                  </>
                              ) : null}
                            </>
                        )}
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Aux>
      </Modal>
    </>
  );
};

export default DocumentUpdateModal;
