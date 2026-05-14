import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import Aux from '../../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
import CustomerInformation from '../../../App/components/customerInformation';
import EngineerSelect from '../../../App/components/engineerSelect';
import requestTradeGet from '../../../Axios/Trade/requestTradeGet';
import requestTradeDelete from '../../../Axios/Trade/requestTradeDelete';
import requestTradeUpdate from '../../../Axios/Trade/requestTradeUpdate';
import requestCustomerGet from '../../../Axios/Customer/requestCustomerGet';
import requestEngineerGet from '../../../Axios/Engineer/requestEngineerGet';
import DeleteButton from '../../../App/components/Button/deleteButton';
import UpdateButton from '../../../App/components/Button/updateButton';
import notNull from '../../../App/components/notNull';

const ConstructionUpdate = (props) => {
  let token = sessionStorage.getItem('token');
  const history = useHistory();

  const [data, setData] = useState({ register_date: moment().format().slice(0, 16) });
  const [text, setText] = useState('');
  const [engineers, setEngineers] = useState([]);           // 전체 직원 목록 (참여자 선택용)
  const [selectedParticipants, setSelectedParticipants] = useState([]);  // 선택된 참여자 id 목록

  // ===== 중복 방지 ref =====
  const changeCategoryRef = useRef(false);
  const [changeCategoryLoading, setChangeCategoryLoading] = useState(false);

  const constructionUpdateRef = useRef(false);
  const [constructionUpdateLoading, setConstructionUpdateLoading] = useState(false);

  const constructionDeleteRef = useRef(false);
  const [constructionDeleteLoading, setConstructionDeleteLoading] = useState(false);

  // 페이지 로딩 시 데이터 조회
  useEffect(() => {
    requestTradeGet(props.match.params.trade_id).then((res) => {
      let tra = res.tra;
      tra = notNull(tra);

      // 상태 텍스트
      tra.category_2 === 0 || tra.category_2 === 2
          ? setText(`${tra.category_name2} 중인 공사입니다.`)
          : setText(`${tra.category_name2}된 공사입니다.`);

      requestCustomerGet().then((cmRes) => {
        tra.price_grade = cmRes[0].price_grade;
        setData(tra);

        // 기존 참여자 세팅
        if (tra.participants_ids && tra.participants_ids.length > 0) {
          setSelectedParticipants(tra.participants_ids);
        }
      });
    });

    requestEngineerGet(true).then((res) => {
      if (res) setEngineers(res);
    });
  }, [props.match.params.trade_id, token]);

  const toggleParticipant = (engineerId) => {
    setSelectedParticipants(prev =>
        prev.includes(engineerId)
            ? prev.filter(id => id !== engineerId)
            : [...prev, engineerId]
    );
  };

  const constructionUpdate = async () => {
    if (data.register_date === undefined || data.engineer_id === undefined || data.content === undefined) {
      message.warning('필수 입력사항을 입력해주세요.');
      return null;
    }

    if (constructionUpdateRef.current) return;
    constructionUpdateRef.current = true;
    setConstructionUpdateLoading(true);

    try {
      await requestTradeUpdate(props.match.params.trade_id, {
        history: [],
        trade: {
          ...data,
          participants: selectedParticipants,
        },
      });
      history.push(`/Trade/tradeTable/1`);
    } catch (err) {
      message.error('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      constructionUpdateRef.current = false;
      setConstructionUpdateLoading(false);
    }
  };

  // 공사 삭제
  const constructionDelete = async () => {
    if (constructionDeleteRef.current) return;
    constructionDeleteRef.current = true;
    setConstructionDeleteLoading(true);

    try {
      await requestTradeDelete(props.match.params.trade_id);
      history.push(`/Trade/tradeTable/1`);
    } catch (err) {
      message.error('삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      constructionDeleteRef.current = false;
      setConstructionDeleteLoading(false);
    }
  };

  // 상태 변경 (완료/취소)
  const changeCategory = async (num) => {
    if (data.register_date === undefined || data.engineer_id === undefined || data.content === undefined) {
      message.warning('필수 입력사항을 입력해주세요.');
      return null;
    }

    if (changeCategoryRef.current) return;
    changeCategoryRef.current = true;
    setChangeCategoryLoading(true);

    try {
      let reqData = { ...data };
      reqData.category_2 = num;
      if (num === 2) reqData.visit_date = moment().format().slice(0, 16);
      if (num === 1) reqData.complete_date = moment().format().slice(0, 16);

      await requestTradeUpdate(props.match.params.trade_id, {
        history: [],
        trade: {
          ...reqData,
          participants: selectedParticipants,
        },
      });
      window.location.reload();
    } catch (err) {
      message.error('상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
      changeCategoryRef.current = false;
      setChangeCategoryLoading(false);
    }
  };

  if (data === undefined) return null;

  const ConstructionCompleteButton = () => (
      <Button
          variant="primary"
          onClick={() => changeCategory(1)}
          disabled={changeCategoryLoading}
      >
        {changeCategoryLoading ? '처리 중...' : '완료'}
      </Button>
  );

  // 취소 버튼
  const ConstructionCancelButton = () => (
      <Button
          variant="primary"
          onClick={() => changeCategory(3)}
          disabled={changeCategoryLoading}
      >
        {changeCategoryLoading ? '처리 중...' : '취소'}
      </Button>
  );

  const ConstructionProgressButton = () => (
      <Button
          variant="primary"
          onClick={() => changeCategory(2)}
          disabled={changeCategoryLoading}
      >
        {changeCategoryLoading ? '처리 중...' : '진행'}
      </Button>
  );

  return (
      <Aux>
        <CustomerInformation />
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <Card.Title as="h5">공사수정</Card.Title>
              </Card.Header>
              <Card.Body>
                <h6 style={{ color: 'red' }}>{text}</h6>
                <hr />
                <Row>
                  <Col md={6}>
                    <Form>
                      <Form.Group controlId="constructionInput1">
                        <Form.Label>접수일</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={data.register_date}
                            onChange={(e) => setData({ ...data, register_date: e.target.value })}
                            required
                        />
                      </Form.Group>

                      {data.category_2 === 1 && (
                          <Form.Group controlId="constructionInput2">
                            <Form.Label>완료일</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={data.complete_date ? data.complete_date : moment().format().slice(0, 16)}
                                onChange={(e) => setData({ ...data, complete_date: e.target.value })}
                                required
                            />
                          </Form.Group>
                      )}

                      <Form.Group controlId="constructionInput3">
                        <Form.Label>담당자</Form.Label>
                        <Form.Control
                            as="select"
                            value={data.engineer_id}
                            onChange={(e) => setData({ ...data, engineer_id: parseInt(e.target.value) })}
                            required
                        >
                          <EngineerSelect />
                        </Form.Control>
                      </Form.Group>

                      <Form.Group controlId="constructionInput4">
                        <Form.Label>참여자</Form.Label>
                        <div style={{
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          padding: '10px',
                          maxHeight: '150px',
                          overflowY: 'auto',
                        }}>
                          {engineers.map((eng) => (
                              <Form.Check
                                  key={eng.id}
                                  type="checkbox"
                                  id={`participant-${eng.id}`}
                                  label={eng.name}
                                  checked={selectedParticipants.includes(eng.id)}
                                  onChange={() => toggleParticipant(eng.id)}
                                  disabled={eng.id === data.engineer_id} // 담당자는 비활성화
                              />
                          ))}
                          {engineers.length === 0 && (
                              <span style={{ color: '#888', fontSize: '12px' }}>직원 목록 로딩 중...</span>
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
                    <Form.Group controlId="constructionInput5">
                      <Form.Label>공사 내용</Form.Label>
                      <Form.Control
                          as="textarea"
                          rows="3"
                          placeholder="공사 내용"
                          value={data.content}
                          onChange={(e) => setData({ ...data, content: e.target.value })}
                          required
                      />
                    </Form.Group>

                    <Form.Group controlId="constructionInput6">
                      <Form.Label>참고사항</Form.Label>
                      <Form.Control
                          as="textarea"
                          rows="3"
                          placeholder="Memo"
                          value={data.memo ? data.memo : ''}
                          onChange={(e) => setData({ ...data, memo: e.target.value })}
                      />
                    </Form.Group>

                    {data.category_2 === 1 && (
                        <Form.Group controlId="constructionInput7">
                          <Form.Label>완료내역</Form.Label>
                          <Form.Control
                              as="textarea"
                              rows="3"
                              placeholder="완료내역"
                              value={data.completed_content ? data.completed_content : ''}
                              onChange={(e) => setData({ ...data, completed_content: e.target.value })}
                          />
                        </Form.Group>
                    )}
                  </Col>
                </Row>

                <Row>
                  <Col style={{ textAlign: 'right' }}>
                    {data.category_2 !== 3 && data.category_2 !== 1 && <ConstructionCancelButton />}
                    {data.category_2 !== 1 && (
                        <DeleteButton
                            tradeId={data.id}
                            delete={() => constructionDelete()}
                            disabled={constructionDeleteLoading}
                        />
                    )}
                    {data.category_2 === 0 && <ConstructionProgressButton />}
                    {data.category_2 === 2 && <ConstructionCompleteButton />}
                    {data.category_2 !== 1 && (
                        <UpdateButton
                            update={() => constructionUpdate()}
                            disabled={constructionUpdateLoading}
                        />
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Aux>
  );
};

export default ConstructionUpdate;