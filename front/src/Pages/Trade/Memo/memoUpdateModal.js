import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import Aux from '../../../hoc/_Aux';
import { Modal, Button } from 'antd';
import 'antd/dist/antd.css';
import requestTradeUpdate from '../../../Axios/Trade/requestTradeUpdate';
import requestTradeDelete from '../../../Axios/Trade/requestTradeDelete';
import requestTradeGet from '../../../Axios/Trade/requestTradeGet';

const TradeTable = (props) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' }); // deviceWidth > 768

  const [visible, setVisible] = useState(false); // Memo Modal Visible
  const [memoData, setMemoData] = useState({}); // Memo Data
  const [flag, setFlag] = useState(false);
  const [modalWidth, setModalWidth] = useState('50%');

  // requestTradeGet()이 처음에만 실행되도록
  useEffect(() => {
    if (props.id !== undefined) {
      requestTradeGet(props.id).then((res) => setMemoData(res.tra));
    }
  }, [props.id]);

  useEffect(() => {
    isDesktop ? setModalWidth('50%') : setModalWidth('100%');
  }, [isDesktop]);

  useEffect(() => {
    if (!flag) {
      setFlag(true);
      setVisible(props.visible);
    } else {
      setVisible(true);
    }
  }, [props.visible]);

  // Collection, Payment, Memo Update
  const memoUpdate = (dataType) => {
    let reqData = { history: [], trade: dataType };

    requestTradeUpdate(dataType.id, reqData).then(() => window.location.reload());
  };

  // Collection,Payment, Memo Delete
  const memoDelete = (id) => {
    requestTradeDelete(id).then(() => window.location.reload());
  };

  // Modal Visible -> false
  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <>
      <Modal
        title="메모수정"
        visible={visible}
        onOk={() => memoUpdate(memoData)}
        onCancel={() => handleCancel()}
        width={modalWidth}
        zIndex={1030}
      >
        <Aux>
          <Row>
            <Col>
              <Card>
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
                            value={memoData.content ? memoData.content : ''}
                            onChange={(e) => {
                              setMemoData({ ...memoData, content: e.target.value });
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
                          value={memoData.register_date ? memoData.register_date : ''}
                          onChange={(e) => {
                            setMemoData({ ...memoData, register_date: e.target.value });
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
                          value={memoData.memo}
                          onChange={(e) => {
                            setMemoData({ ...memoData, memo: e.target.value });
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col style={{ textAlign: 'right' }}>
                      <Button variant="primary" onClick={() => memoDelete(memoData.id)}>
                        삭제
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

export default TradeTable;
