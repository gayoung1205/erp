import React, { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import Aux from '../../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
import CustomerInformation from '../../../App/components/customerInformation';
import EngineerSelect from '../../../App/components/engineerSelect';
import requestTradeCreate from '../../../Axios/Trade/requestTradeCreate';
import requestCustomerGet from '../../../Axios/Customer/requestCustomerGet';
import requestEngineerGet from '../../../Axios/Engineer/requestEngineerGet';

const ConstructionRegistration = () => {
  let cmId = window.sessionStorage.getItem('customerId');
  const history = useHistory();
  const [selectLoading, setSelectLoading] = useState(false);
  const [engineers, setEngineers] = useState([]);  // 참여자 선택용 전체 직원 목록
  const [data, setData] = useState({
    customer_id: cmId,
    category_1: 9,   // 공사
    category_2: 0,   // 접수
    register_date: moment().format().slice(0, 16),
  });
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const permission = window.sessionStorage.getItem('permission');
    if (permission === '4' || permission === '7') {
      message.error('권한이 없습니다.');
      history.goBack();
      return;
    }
    if (cmId === null || cmId === undefined || isNaN(cmId) === true) {
      history.push('/Customer/customerTable/1');
    } else {
      setSelectLoading(true);
      requestCustomerGet().then((res) => {
        setData({ ...data, customer_name: res[0].name });
      });
      // 전체 직원 목록 로드 (참여자 선택용)
      requestEngineerGet(true).then((res) => {
        if (res) setEngineers(res.filter(eng => eng.is_active === true));
      });
    }
  }, []);

  // 참여자 체크박스 토글
  const toggleParticipant = (engineerId) => {
    setSelectedParticipants(prev =>
        prev.includes(engineerId)
            ? prev.filter(id => id !== engineerId)
            : [...prev, engineerId]
    );
  };

  const constructionCreate = async () => {
    if (data.register_date === undefined || data.engineer_id === undefined || data.content === undefined) {
      message.warning('필수 입력사항을 입력해주세요.');
      return null;
    }

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      await requestTradeCreate({
        ...data,
        participants: selectedParticipants,
      });
      history.push(`/Trade/tradeTable/1`);
    } catch (err) {
      message.error('등록 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (data === undefined) return null;

  return (
      <Aux>
        <CustomerInformation />
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <Card.Title as="h5">공사접수</Card.Title>
              </Card.Header>
              <Card.Body>
                <h6 style={{ color: 'red' }}>* 표시는 필수 입력사항입니다.</h6>
                <hr />
                <Row>
                  <Col md={6}>
                    <Form>
                      <Form.Group controlId="constructionInput1">
                        <Form.Label><span style={{ color: 'red' }}>*</span> 접수일</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={data.register_date}
                            onChange={(e) => setData({ ...data, register_date: e.target.value })}
                            required
                        />
                      </Form.Group>

                      <Form.Group controlId="constructionInput2">
                        <Form.Label><span style={{ color: 'red' }}>*</span> 담당자</Form.Label>
                        <Form.Control
                            as="select"
                            value={data.engineer_id}
                            onChange={(e) => setData({ ...data, engineer_id: e.target.value })}
                            required
                        >
                          <option>담당자 선택</option>
                          <EngineerSelect loading={selectLoading} />
                        </Form.Control>
                      </Form.Group>

                      {/* ✅ 참여자 선택 (체크박스) */}
                      <Form.Group controlId="constructionInput3">
                        <Form.Label>참여자</Form.Label>
                        <div style={{
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          padding: '10px',
                          maxHeight: '150px',
                          overflowY: 'auto'
                        }}>
                          {engineers.map((eng) => (
                              <Form.Check
                                  key={eng.id}
                                  type="checkbox"
                                  id={`participant-${eng.id}`}
                                  label={eng.name}
                                  checked={selectedParticipants.includes(eng.id)}
                                  onChange={() => toggleParticipant(eng.id)}
                                  disabled={String(eng.id) === String(data.engineer_id)} // 담당자는 비활성화
                              />
                          ))}
                          {engineers.length === 0 && (
                              <span style={{ color: '#888', fontSize: '12px' }}>직원 목록을 불러오는 중...</span>
                          )}
                        </div>
                        {selectedParticipants.length > 0 && (
                            <small style={{ color: '#17a2b8' }}>
                              {selectedParticipants.length}명 선택됨
                            </small>
                        )}
                      </Form.Group>
                    </Form>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="constructionInput4">
                      <Form.Label><span style={{ color: 'red' }}>*</span> 공사 내용</Form.Label>
                      <Form.Control
                          as="textarea"
                          rows="3"
                          placeholder="공사 내용"
                          value={data.content}
                          onChange={(e) => setData({ ...data, content: e.target.value })}
                          required
                      />
                    </Form.Group>

                    <Form.Group controlId="constructionInput5">
                      <Form.Label>참고사항</Form.Label>
                      <Form.Control
                          as="textarea"
                          rows="3"
                          placeholder="Memo"
                          value={data.memo}
                          onChange={(e) => setData({ ...data, memo: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col style={{ textAlign: 'right' }}>
                    <Button
                        variant="primary"
                        onClick={() => constructionCreate()}
                        disabled={isSubmitting}
                    >
                      {isSubmitting ? '등록 중...' : '등록'}
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Aux>
  );
};

export default ConstructionRegistration;