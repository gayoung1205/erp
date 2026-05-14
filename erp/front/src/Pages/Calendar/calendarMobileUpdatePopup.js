import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form } from 'react-bootstrap';
import { Modal, message } from 'antd';
import 'antd/dist/antd.css';
import dateFormat from 'dateformat';
import { isEmptyObject } from 'jquery';

const CalendarMobileUpdatePopup = (props) => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({});
  const [flag, setFlag] = useState(false);
  const [users, setUsers] = useState({});
  const startRef = useRef(null);
  const endRef = useRef(null);

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

  const handleCancel = () => {
    setVisible(false);
  };

  const EngineerSelect = useCallback(() => {
    return (
        <Form.Control
            as="select"
            size="sm"
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
    );
  }, [data, users]);

  const handleOk = () => {
    if (data.title === '' || !data.title) {
      return null;
    } else {
      props.update(data);
      handleCancel();
    }
  };

  const handleDelete = () => {
    if (window.confirm(`"${data.title}" 일정을 삭제하시겠습니까?`)) {
      props.delete(data.id);  // calendarMain의 deleteSchedule 호출
      handleCancel();
    }
  };

  return (
      <Modal
          visible={visible}
          onOk={() => handleOk()}
          onCancel={() => handleCancel()}
          width={400}
          zIndex={1100}
          centered
          closable={true}
          bodyStyle={{ padding: '16px 20px' }}
          mask={true}
          getContainer={document.body}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <a onClick={handleDelete} style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: '13px', lineHeight: '32px' }}>
                삭제
              </a>
              <div>
                <button
                    onClick={handleCancel}
                    style={{ marginRight: '8px', padding: '4px 12px', border: '1px solid #d9d9d9', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                    onClick={handleOk}
                    style={{ padding: '4px 12px', border: 'none', borderRadius: '4px', background: '#1890ff', color: '#fff', cursor: 'pointer' }}
                >
                  수정
                </button>
              </div>
            </div>
          }
      >
        <Form onSubmit={(e) => { e.preventDefault(); handleOk(); }}>
          <div style={{ marginBottom: '8px', marginTop: '24px' }}>
            <EngineerSelect />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Form.Control
                type="text"
                placeholder="일정 내용"
                size="sm"
                value={data.title ? data.title : ''}
                onChange={(e) => {
                  setData({ ...data, title: e.target.value });
                }}
                required
                autoFocus
            />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Form.Label style={{ fontSize: '12px', marginBottom: '2px', color: '#888' }}>시작</Form.Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Form.Control
                  ref={startRef}
                  type="datetime-local"
                  size="sm"
                  value={data.start ? data.start : ''}
                  onChange={(e) => {
                    setData({ ...data, start: e.target.value });
                  }}
                  required
              />
              <button
                  type="button"
                  onClick={() => { if (startRef.current) startRef.current.blur(); }}
                  style={{
                    padding: '2px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    color: '#1890ff',
                  }}
              >
                완료
              </button>
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Form.Label style={{ fontSize: '12px', marginBottom: '2px', color: '#888' }}>종료</Form.Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Form.Control
                  ref={endRef}
                  type="datetime-local"
                  size="sm"
                  value={data.end ? data.end : ''}
                  onChange={(e) => {
                    setData({ ...data, end: e.target.value });
                  }}
                  required
              />
              <button
                  type="button"
                  onClick={() => { if (endRef.current) endRef.current.blur(); }}
                  style={{
                    padding: '2px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    color: '#1890ff',
                  }}
              >
                완료
              </button>
            </div>
          </div>
        </Form>
      </Modal>
  );
};

export default CalendarMobileUpdatePopup;