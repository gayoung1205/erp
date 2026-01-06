import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Form } from 'react-bootstrap';
import Aux from '../../hoc/_Aux';
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import dateFormat from 'dateformat';
import { isEmptyObject } from 'jquery';

const CalendarMobileUpdatePopup = (props) => {
  const [visible, setVisible] = useState(false); // Memo Modal Visible
  const [data, setData] = useState({}); // Memo Data
  const [flag, setFlag] = useState(false);
  const [users, setUsers] = useState({});
  // requestTradeGet()이 처음에만 실행되도록
  useEffect(() => {
    if (!isEmptyObject(props.data)) {
      setData({
        id: props.data.id,
        calendarId: props.data.calendarId,
        title: props.data.title,
        start: dateFormat(props.data.start, "yyyy-mm-dd'T'HH:MM"),
        end: dateFormat(props.data.end, "yyyy-mm-dd'T'HH:MM"),
      });
    }
  }, [props.data]);

  useEffect(() => {
    if (!isEmptyObject(props.users)) {
      setUsers(props.users);
    }
  }, [props.users]);

  useEffect(() => {
    if (!flag) {
      setFlag(true);
      setVisible(props.visible);
    } else {
      setVisible(true);
    }
  }, [props.visible]);

  // Modal Visible -> false
  const handleCancel = () => {
    setVisible(false);
  };

  const EngineerSelect = useCallback(() => {
    return (
      <>
        <Form.Group controlId="CalendarSelect01">
          <Form.Control
            as="select"
            value={data.calendarId ? data.calendarId : ''}
            onChange={(e) => {
              setData({ ...data, calendarId: e.target.value });
            }}
            required
          >
            {users.map((engineer, i) => (
              <option key={i} value={engineer.id}>
                {engineer.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </>
    );
  }, [data, users]);

  const handleOk = () => {
    if (data.title === '') {
      return null;
    } else {
      props.update(data);
      handleCancel();
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        onOk={() => handleOk()}
        onCancel={() => handleCancel()}
        width="100%"
        zIndex={1030}
        closable={false} // Modal 창 오른쪽 X 표시 여부
        bodyStyle={{ padding: 0 }}
      >
        <Aux>
          <Row>
            <Col>
              <Card style={{ marginBottom: 0 }}>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <EngineerSelect />
                    </Col>
                    <Col md={6}>
                      <Form>
                        <Form.Group controlId="CalendarInput01">
                          <Form.Label>내용</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="일정"
                            value={data.title ? data.title : ''}
                            onChange={(e) => {
                              setData({ ...data, title: e.target.value });
                            }}
                            required
                          />
                        </Form.Group>
                      </Form>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="CalendarInput02">
                        <Form.Label>시작시간</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          value={data.start ? data.start : ''}
                          onChange={(e) => {
                            setData({ ...data, start: e.target.value });
                          }}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="CalendarInput03">
                        <Form.Label>종료시간</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          value={data.end ? data.end : ''}
                          onChange={(e) => {
                            setData({ ...data, end: e.target.value });
                          }}
                          required
                        />
                      </Form.Group>
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

export default CalendarMobileUpdatePopup;
