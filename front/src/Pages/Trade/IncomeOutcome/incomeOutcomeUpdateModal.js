import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import Aux from '../../../hoc/_Aux';
import { Modal, Button } from 'antd';
import 'antd/dist/antd.css';
import { isEmptyObject } from 'jquery';
import requestTradeUpdate from '../../../Axios/Trade/requestTradeUpdate';
import requestTradeDelete from '../../../Axios/Trade/requestTradeDelete';
import requestTradeGet from '../../../Axios/Trade/requestTradeGet';

const AccountingTable = (props) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' }); // deviceWidth > 768

  const [visible, setVisible] = useState(false); // IncomeOutcome Modal Visible
  const [data, setData] = useState({ cash: 0, credit: 0, bank: 0 }); // IncomeOutcome Data
  const [flag, setFlag] = useState(false);
  const [modalWidth, setModalWidth] = useState('50%');

  // requestTradeGet()이 처음에만 실행되도록
  useEffect(() => {
    if (props.id !== undefined) {
      requestTradeGet(props.id).then((res) => {
        setData(res.tra);
      });
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

  // Collection, Payment Update
  const incomeOutcomeUpdate = (dataType) => {
    let reqData = { history: [], trade: dataType };

    requestTradeUpdate(dataType.id, reqData).then(() => window.location.reload());
  };

  // Collection, Payment Delete
  const incomeOutcomeDelete = (id) => {
    requestTradeDelete(id).then(() => window.location.reload());
  };

  // Modal visible -> false
  const handleCancel = () => {
    setVisible(false);
  };

  // 현금, 카드, 은행 금액 변동에 따른 수금 후 미수금, 결제금액
  const priceCalculator = (e) => {
    if (isEmptyObject(e.target.value)) {
      setData({ ...data, [e.target.name]: 0 });
    } else {
      setData({ ...data, [e.target.name]: parseInt(e.target.value) });
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        onOk={() => incomeOutcomeUpdate(data)}
        onCancel={() => handleCancel()}
        width={modalWidth}
        zIndex={1030}
        footer={null}
      >
        <Aux>
          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <Card.Title as="h5">{data.category_name1}수정</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form>
                        <Form.Group controlId="inOutInput1">
                          <Form.Label>현금결제</Form.Label>
                          <Form.Control
                            type="number"
                            value={data.cash}
                            name="cash"
                            onChange={(e) => priceCalculator(e)}
                          />
                        </Form.Group>
                      </Form>
                      <Form>
                        <Form.Group controlId="inOutInput2">
                          <Form.Label>카드결제</Form.Label>
                          <Form.Control
                            type="number"
                            value={data.credit}
                            name="credit"
                            onChange={(e) => priceCalculator(e)}
                          />
                        </Form.Group>
                      </Form>
                      <Form>
                        <Form.Group controlId="inOutInput3">
                          <Form.Label>은행입금</Form.Label>
                          <Form.Control
                            type="number"
                            value={data.bank}
                            name="bank"
                            onChange={(e) => priceCalculator(e)}
                          />
                        </Form.Group>
                      </Form>
                    </Col>
                    <Col md={4}>
                      <Form>
                        <Form.Group controlId="inOutInput4">
                          <Form.Label>{data.category_name1}금액</Form.Label>
                          <Form.Control
                            type="number"
                            value={parseInt(data.cash) + parseInt(data.bank) + parseInt(data.credit)}
                            readOnly
                          />
                        </Form.Group>

                        <Form.Group controlId="inOutInput5">
                          <Form.Label>등록일</Form.Label>
                          <Form.Control
                            type="datetime-local"
                            value={data.register_date ? data.register_date : ''}
                            onChange={(e) => {
                              setData({
                                ...data,
                                register_data: e.target.value,
                              });
                            }}
                          />
                        </Form.Group>
                      </Form>
                    </Col>
                    <Col md={4}>
                      <Form.Group controlId="inOutInput6">
                        <Form.Label>내용</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="내용"
                          value={data.content ? data.content : ''}
                          onChange={(e) => {
                            setData({ ...data, content: e.target.value });
                          }}
                        />
                      </Form.Group>

                      <Form.Group controlId="inOutInput7">
                        <Form.Label>메모</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows="3"
                          placeholder="메모"
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
                      <Button variant="primary" onClick={() => incomeOutcomeDelete(data.id)}>
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

export default AccountingTable;
