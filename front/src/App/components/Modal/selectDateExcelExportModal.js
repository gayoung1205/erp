import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, InputGroup, Button } from 'react-bootstrap';
import Aux from '../../../hoc/_Aux';
import { message, Modal } from 'antd';
import 'antd/dist/antd.css';
import DynamicProgress from '../DynamicProgress';

const SelectDateExcelExportModal = (props) => {
  const [date, setDate] = useState({}); // 검색할 YYYY-MM 데이터
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);

  useEffect(() => {
    let today = new Date();
    let year = today.getFullYear(); // 년도
    let month = today.getMonth() + 1; // 월

    if (month < 10) month = '0' + month;

    let lastDate = calcLastDate(year, month);
    setDate({ startDate: `${year}-${month}-01`, endDate: lastDate });
  }, []);

  //달마다 마지막날짜 계산
  const calcLastDate = (year, month) => {
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
    props.selectDateExcelExportModalProcessing(false);
  };

  const downloadModalProcessing = (isVisible) => {
    setDownloadModalVisible(isVisible);
    if (!isVisible) {
      handleCancel();
    }
  };

  const handleCalc = () => {
    if (date.startDate && date.endDate) {
      downloadModalProcessing(true);
      // handleCancel();
    } else {
      message.error('날짜를 입력해주세요.');
    }
  };

  return (
    <>
      <Modal title="엑셀출력" visible={props.visible} onCancel={() => handleCancel()} width={'50%'} zIndex={1030} footer={null}>
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
                        }}
                        required
                      />
                      <Form.Control
                        type="date"
                        value={date.endDate}
                        min="2020-10-01"
                        onChange={(e) => {
                          setDate({ ...date, endDate: e.target.value });
                        }}
                        required
                      />
                      <InputGroup.Append>
                        <Button
                          variant="primary"
                          onClick={() => {
                            handleCalc();
                          }}
                        >
                          출력
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <DynamicProgress visible={downloadModalVisible} type={'accounting'} downloadModalProcessing={downloadModalProcessing} date={date} />
        </Aux>
      </Modal>
    </>
  );
};

export default SelectDateExcelExportModal;
