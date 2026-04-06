import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form } from 'react-bootstrap';
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import dateFormat from 'dateformat';
import { isEmptyObject } from 'jquery';

const CalendarMobileCreatePopup = (props) => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({});
  const [flag, setFlag] = useState(false);
  const [users, setUsers] = useState({});

  // ===== 추가: datetime-local input에 대한 ref =====
  const startRef = useRef(null);
  const endRef = useRef(null);
  // ===== 추가 끝 =====

  useEffect(() => {
    if (!isEmptyObject(props.data)) {
      setData({
        ...data,
        title: '',
        start: dateFormat(props.data.start, "yyyy-mm-dd'T'HH:MM"),
        end: dateFormat(props.data.end, "yyyy-mm-dd'T'HH:MM"),
      });
    }
  }, [props.data]);

  useEffect(() => {
    if (!isEmptyObject(props.users)) {
      setUsers(props.users);
      setData({ ...data, calendarId: props.users[0].id });
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
      props.create(data);
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
          okText="저장"
          cancelText="취소"
          mask={true}
          getContainer={document.body}
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
            {/* ===== 수정: 완료 버튼 추가 ===== */}
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
            {/* ===== 수정 끝 ===== */}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Form.Label style={{ fontSize: '12px', marginBottom: '2px', color: '#888' }}>종료</Form.Label>
            {/* ===== 수정: 완료 버튼 추가 ===== */}
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
            {/* ===== 수정 끝 ===== */}
          </div>
        </Form>
      </Modal>
  );
};

export default CalendarMobileCreatePopup;