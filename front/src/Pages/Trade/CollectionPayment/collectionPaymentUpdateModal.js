import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import Aux from '../../../hoc/_Aux';
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import { isEmptyObject } from 'jquery';
import requestTradeUpdate from '../../../Axios/Trade/requestTradeUpdate';
import requestTradeDelete from '../../../Axios/Trade/requestTradeDelete';
import requestTradeGet from '../../../Axios/Trade/requestTradeGet';

const TradeTable = (props) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' }); // deviceWidth > 768

  const [modalVisible, setModalVisible] = useState(false); // CollectionPayment Modal Visible
  const [colPayData, setColPayData] = useState({}); // CollectionPayment Data
  const [flag, setFlag] = useState(false);
  const [modalWidth, setModalWidth] = useState('50%');

  // requestTradeGet()이 처음에만 실행되도록
  useEffect(() => {
    if (props.id !== undefined) {
      requestTradeGet(props.id).then((res) => {
        //수금, 지불 수정 시 계산 후 미수금을 산출하기 위해서 미수금에 현금,카드,은행을 더하거나 뺌
        res.tra.total_receivable =
          res.tra.category_1 === 1
            ? Math.round(res.tra.total_receivable) + res.tra.cash + res.tra.credit + res.tra.bank
            : Math.round(res.tra.total_receivable) - res.tra.cash - res.tra.credit - res.tra.bank;

        setColPayData(res.tra);
      });
    }
  }, [props.id]);

  useEffect(() => {
    isDesktop ? setModalWidth('50%') : setModalWidth('100%');
  }, [isDesktop]);

  useEffect(() => {
    if (!flag) {
      setFlag(true);
      setModalVisible(props.visible);
    } else {
      setModalVisible(true);
    }
  }, [props.visible]);

  // Collection, Payment, Memo Update
  const collectionPaymentUpdate = (dataType) => {
    let reqData = { history: [], trade: dataType };

    if (reqData.trade.content.indexOf('현금결제') !== -1) {
      reqData.trade.content = reqData.trade.content.replace('현금결제/', '');
    }
    if (reqData.trade.content.indexOf('카드결제') !== -1) {
      reqData.trade.content = reqData.trade.content.replace('카드결제/', '');
    }
    if (reqData.trade.content.indexOf('은행입금') !== -1) {
      reqData.trade.content = reqData.trade.content.replace('은행입금/', '');
    }

    reqData.trade.content = reqData.trade.content.replace(' ', '');
    requestTradeUpdate(dataType.id, reqData).then(() => window.location.reload());
  };

  // Collection,Payment, Memo Delete
  const collectionPaymentDelete = (id) => {
    requestTradeDelete(id).then(() => window.location.reload());
  };

  // Modal Visible -> false
  const handleCancel = () => {
    setModalVisible(false);
  };

  // 현금, 카드, 은행 금액 변동에 따른 수금 후 미수금, 결제금액
  const priceCalculator = (e) => {
    if (isEmptyObject(e.target.value)) {
      setColPayData({ ...colPayData, [e.target.name]: 0 });
    } else {
      setColPayData({ ...colPayData, [e.target.name]: parseInt(e.target.value) });
    }
  };

  // data rendering전에 data 값이 undefined일 경우 Warning 있어서
  if (colPayData === undefined) {
    return null;
  }

  return (
    <>
      <Modal
        visible={modalVisible}
        onOk={() => collectionPaymentUpdate(colPayData)}
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
                  <Card.Title as="h5">{colPayData.category_name1}수정</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form>
                        <Form.Group controlId="collectionPaymentInput1">
                          <Form.Label>현금결제</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="현금"
                            value={colPayData.cash ? colPayData.cash : 0}
                            name="cash"
                            onChange={(e) => priceCalculator(e)}
                          />
                        </Form.Group>

                        <Form.Group controlId="collectionPaymentInput2">
                          <Form.Label>카드결제</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="카드"
                            value={colPayData.credit ? colPayData.credit : 0}
                            name="credit"
                            onChange={(e) => priceCalculator(e)}
                          />
                        </Form.Group>

                        <Form.Group controlId="collectionPaymentInput3">
                          <Form.Label>은행입금</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="은행"
                            value={colPayData.bank ? colPayData.bank : 0}
                            name="bank"
                            onChange={(e) => priceCalculator(e)}
                          />
                        </Form.Group>
                      </Form>
                    </Col>
                    <Col md={4}>
                      <Form>
                        <Form.Group controlId="collectionPaymentInput4">
                          <Form.Label>총미수금</Form.Label>
                          <Form.Control
                            type="number"
                            value={colPayData.total_receivable ? colPayData.total_receivable : 0}
                            readOnly
                          />
                        </Form.Group>

                        <Form.Group controlId="collectionPaymentInput5">
                          <Form.Label>{colPayData.category_name1} 후 미수금</Form.Label>
                          <Form.Control
                            type="number"
                            value={
                              colPayData.category_1
                                ? colPayData.category_1 === 1
                                  ? colPayData.total_receivable - colPayData.cash - colPayData.bank - colPayData.credit
                                  : colPayData.total_receivable + colPayData.cash + colPayData.bank + colPayData.credit
                                : 0
                            }
                            readOnly
                          />
                        </Form.Group>

                        <Form.Group controlId="collectionPaymentInput6">
                          <Form.Label>결제금액</Form.Label>
                          <Form.Control
                            type="number"
                            value={colPayData.cash ? colPayData.cash + colPayData.bank + colPayData.credit : 0}
                            readOnly
                          />
                        </Form.Group>
                      </Form>
                    </Col>
                    <Col md={4}>
                      <Form.Group controlId="collectionPaymentInput7">
                        <Form.Label>등록일</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          value={colPayData.register_date ? colPayData.register_date : ''}
                          onChange={(e) => {
                            setColPayData({
                              ...colPayData,
                              register_date: e.target.value,
                            });
                          }}
                        />
                      </Form.Group>

                      <Form.Group controlId="collectionPaymentInput8">
                        <Form.Label>거래/접수내용</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows="3"
                          placeholder="거래/접수내용"
                          value={colPayData.content ? colPayData.content : ' '}
                          onChange={(e) => {
                            setColPayData({ ...colPayData, content: e.target.value });
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col style={{ textAlign: 'right' }}>
                      <Button variant="primary" onClick={() => collectionPaymentDelete(colPayData.id)}>
                        삭제
                      </Button>
                      <Button variant="primary" onClick={() => collectionPaymentUpdate(colPayData)}>
                        수정
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
