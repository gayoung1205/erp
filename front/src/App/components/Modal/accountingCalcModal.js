import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, InputGroup, Button } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import Aux from '../../../hoc/_Aux';
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import setComma from '../../../App/components/setComma';
import requestAccountingCalcGet from '../../../Axios/AccountingCalc/requestAccountingCalcGet';

const AccountingCalcModal = (props) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' }); // deviceWidth > 768

  const [visible, setVisible] = useState(false); // Modal Visible
  const [data, setData] = useState({ month_income: 0, month_outcome: 0, month_amount: 0 }); // Data
  const [flag, setFlag] = useState(false);
  const [date, setDate] = useState({}); // 검색할 YYYY-MM 데이터
  const [modalWidth, setModalWidth] = useState('50%');

  useEffect(() => {
    isDesktop ? setModalWidth('50%') : setModalWidth('100%');
  }, [isDesktop]);

  useEffect(() => {
    let today = new Date();
    let year = today.getFullYear(); // 년도
    let month = today.getMonth() + 1; // 월

    if (month < 10) month = '0' + month;

    let lastDate = calcDate(year, month);
    setDate({ startDate: `${year}-${month}-01`, endDate: lastDate });
    handleCalc(`${year}-${month}-01`, lastDate);
  }, []);

  useEffect(() => {
    if (!flag) {
      setFlag(true);
      setVisible(props.visible);
    } else {
      setVisible(true);
    }
  }, [props.visible]);

  //달마다 마지막날짜 계산
  const calcDate = (year, month) => {
    if (parseInt(month) < 8) {
      if (month % 2 === 1) {
        return `${year}-${month}-31`;
      } else {
        if (month === '02') {
          if (year / 4 === 0 || year / 100 === 0 || year / 400 === 0) {
            return `${year}-${month}-29`;
          } else {
            return `${year}-${month}-28`;
          }
        }
        return `${year}-${month}-30`;
      }
    } else {
      if (month % 2 === 1) {
        return `${year}-${month}-30`;
      } else {
        return `${year}-${month}-31`;
      }
    }
  };

  // Modal Visible -> false
  const handleCancel = () => {
    setVisible(false);
  };

  const handleCalc = (startDate, endDate) => {
    if (new Date(startDate).getTime() <= new Date(endDate).getTime()) {
      requestAccountingCalcGet(startDate, endDate).then((res) => {
        setData(res);
      });
    } else {
      requestAccountingCalcGet(endDate, startDate).then((res) => {
        setData(res);
      });
    }
  };

  return (
    <>
      <Modal
        title="손익계산"
        visible={visible}
        onCancel={() => handleCancel()}
        width={modalWidth}
        zIndex={1030}
        footer={null}
      >
        <Aux>
          <Row>
            <Col>
              <Card>
                <Card.Body>
                  <Form.Group controlId="accountingCalcDate">
                    <InputGroup className="mb-3">
                      <Form.Control
                        type="date"
                        value={date.startDate}
                        min="2020-10-01"
                        onChange={(e) => {
                          setDate({ ...date, startDate: e.target.value });
                          handleCalc(e.target.value, date.endDate);
                        }}
                        required
                      />
                      <Form.Control
                        type="date"
                        value={date.endDate}
                        min="2020-10-01"
                        onChange={(e) => {
                          setDate({ ...date, endDate: e.target.value });
                          handleCalc(date.startDate, e.target.value);
                        }}
                        required
                      />
                      <InputGroup.Append>
                        <Button
                          variant="primary"
                          onClick={() => {
                            handleCalc(date.startDate, date.endDate);
                          }}
                        >
                          계산
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                  </Form.Group>
                  <Row>
                    <Col md={12}>
                      <Form>
                        <Form.Group controlId="calc01">
                          <Form.Label>수입액</Form.Label>
                          <Form.Control
                            type="text"
                            value={data.month_income ? setComma(data.month_income) : 0}
                            readOnly
                          />
                        </Form.Group>
                      </Form>
                    </Col>
                    <Col md={12}>
                      <Form>
                        <Form.Group controlId="calc02">
                          <Form.Label>지출액</Form.Label>
                          <Form.Control
                            type="text"
                            value={data.month_outcome ? setComma(data.month_outcome) : 0}
                            readOnly
                          />
                        </Form.Group>
                      </Form>
                    </Col>
                    <Col md={12}>
                      <Form>
                        <Form.Group controlId="calc03">
                          <Form.Label>손익액</Form.Label>
                          <Form.Control
                            type="text"
                            value={data.month_amount ? setComma(data.month_amount) : 0}
                            readOnly
                          />
                        </Form.Group>
                      </Form>
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

export default AccountingCalcModal;
