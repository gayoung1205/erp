import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button, InputGroup, Table } from 'react-bootstrap';
import { isEmptyObject } from 'jquery';
import Aux from '../../../hoc/_Aux';
import { message, Popconfirm, Modal } from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
import CustomerInformation from '../../../App/components/customerInformation';
import EngineerSelect from '../../../App/components/engineerSelect';
import calcTaxCategory from '../../../App/components/calcTaxCategory';
import handlePriceGrade from '../../../App/components/handlePriceGrade';
import handleTaxCategory from '../../../App/components/handleTaxCategory';
import ProductSearchModal from '../../Product/productSearchModal';
import AsUpdateGrid from './asUpdateGrid';
import requestTradeGet from '../../../Axios/Trade/requestTradeGet';
import requestTradeDelete from '../../../Axios/Trade/requestTradeDelete';
import requestTradeUpdate from '../../../Axios/Trade/requestTradeUpdate';
import requestSearchProductCodeGet from '../../../Axios/Product/requestSearchProductCodeGet';
import requestReleaseAllUpdate from '../../../Axios/Release/requestReleaseAllUpdate';
import requestAsInternalProcessGet from '../../../Axios/AsInternalProcess/requestAsInternalProcessGet';
import requestAsInternalProcessCreate from '../../../Axios/AsInternalProcess/requestAsInternalProcessCreate';
import requestAsInternalProcessDelete from '../../../Axios/AsInternalProcess/requestAsInternalProcessDelete';
import DeleteButton from '../../../App/components/Button/deleteButton';
import UpdateButton from '../../../App/components/Button/updateButton';
import notNull from '../../../App/components/notNull';
import requestCustomerGet from '../../../Axios/Customer/requestCustomerGet';

const AsUpdate = (props) => {
  let token = sessionStorage.getItem('token');
  const history = useHistory();

  const [data, setData] = useState({ register_date: '' });
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [appendRowData, setAppendRowData] = useState({});
  const [text, setText] = useState(''); // As status Text
  const [productData, setProductData] = useState({
    name: '',
    price: 0,
    stock: 1,
    tax_category: '부가세 없음',
  });

  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  // ★ [수정] completeData에 engineer_id, category_3, memo 추가
  const [completeData, setCompleteData] = useState({
    complete_date: moment().format().slice(0, 16),
    engineer_id: '',
    category_3: '',
    symptom: '',
    completed_content: '',
    memo: '',
  });

  const [showInternalForm, setShowInternalForm] = useState(false);
  const [internalProcesses, setInternalProcesses] = useState([]);
  const [internalData, setInternalData] = useState({
    process_date: moment().format().slice(0, 16),
    engineer_id: '',
    content: '',
    memo: '',
  });

  useEffect(() => {
    requestTradeGet(props.match.params.trade_id).then((res) => {
      let tra = res.tra;
      let his = res.his;
      tra = notNull(tra);

      if (tra.category_2 === 1) {
        // history setting
        for (let i = 0; i < his.length; i++) {
          let taxSet = calcTaxCategory(his[i].tax_category, his[i].price, his[i].amount);

          his[i].supply = taxSet.supply;
          his[i].surtax = taxSet.surtax;
          his[i].total_price = taxSet.total_price;
          his[i].tax_category = handleTaxCategory('string', his[i].tax_category);
        }
      }

      if (his.length > 0) {
        setAppendRowData(his);
      }

      tra.category_2 === 0 || tra.category_2 === 2
          ? setText(`${tra.category_name2} 중인 AS입니다.`)
          : setText(`${tra.category_name2}된 AS입니다.`);

      requestCustomerGet().then((cmRes) => {
        tra.price_grade = cmRes[0].price_grade;

        setData(tra);
      });
    });

    loadInternalProcesses();
  }, [props.match.params.trade_id, token]);

  const loadInternalProcesses = () => {
    requestAsInternalProcessGet(props.match.params.trade_id).then((res) => {
      if (res) {
        setInternalProcesses(res);
      }
    });
  };

  const asUpdate = async (historyData) => {
    if (data.register_date === undefined || data.engineer_id === undefined || data.category_3 === undefined || data.content === undefined) {
      message.warning('필수 입력사항을 입력해주세요.');
      return null;
    }

    if (asUpdateRef.current) return;
    asUpdateRef.current = true;
    setAsUpdateLoading(true);

    try {
      let historyReqData = { history: [], trade: data };
      let releaseReqData = { history: [], trade: data.id };

      if (data.category_2 === 1) {
        historyReqData = { history: historyData.history, trade: data };
        if (!isEmptyObject(historyData.release)) {
          releaseReqData = { history: historyData.release, trade: data.id };
          await requestReleaseAllUpdate(releaseReqData);
        }
      }
      await requestTradeUpdate(props.match.params.trade_id, historyReqData);
      history.push(`/Trade/tradeTable/1`);
    } catch (err) {
      message.error('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      asUpdateRef.current = false;
      setAsUpdateLoading(false);
    }
  };

  const asDelete = async () => {
    if (asDeleteRef.current) return;
    asDeleteRef.current = true;
    setAsDeleteLoading(true);

    try {
      await requestTradeDelete(props.match.params.trade_id);
      history.push(`/Trade/tradeTable/1`);
    } catch (err) {
      message.error('삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      asDeleteRef.current = false;
      setAsDeleteLoading(false);
    }
  };

  const handleProgress = async () => {
    if (progressRef.current) return;
    progressRef.current = true;
    setProgressLoading(true);
    try {
      let reqData = { ...data, category_2: 2, visit_date: moment().format().slice(0, 16) };
      await requestTradeUpdate(props.match.params.trade_id, { history: [], trade: reqData });
      window.location.reload();
    } catch (err) {
      message.error('상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      progressRef.current = false;
      setProgressLoading(false);
    }
  };

  const handleComplete = async () => {
    if (completeRef.current) return;
    completeRef.current = true;
    setCompleteLoading(true);
    try {
      let reqData = { ...data, category_2: 1, complete_date: moment().format().slice(0, 16) };
      await requestTradeUpdate(props.match.params.trade_id, { history: [], trade: reqData });
      window.location.reload();
    } catch (err) {
      message.error('상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      completeRef.current = false;
      setCompleteLoading(false);
    }
  };

  const handleCancel = async () => {
    if (cancelRef.current) return;
    cancelRef.current = true;
    setCancelLoading(true);
    try {
      let reqData = { ...data, category_2: 3 };
      await requestTradeUpdate(props.match.params.trade_id, { history: [], trade: reqData });
      window.location.reload();
    } catch (err) {
      message.error('상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      cancelRef.current = false;
      setCancelLoading(false);
    }
  };

  const openCompleteModal = () => {
    if (data.register_date === undefined || data.engineer_id === undefined ||
        data.category_3 === undefined || data.content === undefined) {
      message.warning('필수 입력사항을 입력해주세요.');
      return null;
    }
    setCompleteData({
      complete_date: data.complete_date || moment().format().slice(0, 16),
      engineer_id: data.engineer_id || '',
      category_3: data.category_3 !== undefined ? data.category_3 : '',
      symptom: data.symptom || '',
      completed_content: data.completed_content || '',
      memo: data.memo || '',
    });
    setCompleteModalVisible(true);
  };

  const handleCompleteConfirm = () => {
    if (!completeData.complete_date) {
      message.warning('완료일을 입력해주세요.');
      return;
    }

    let reqData = { ...data };
    reqData.category_2 = 1; // 완료 상태로 변경
    reqData.complete_date = completeData.complete_date;
    reqData.engineer_id = completeData.engineer_id;
    reqData.category_3 = completeData.category_3;
    reqData.symptom = completeData.symptom;
    reqData.completed_content = completeData.completed_content;
    reqData.memo = completeData.memo;

    requestTradeUpdate(props.match.params.trade_id, { history: [], trade: reqData })
    .then(() => {
      setCompleteModalVisible(false);
      message.success('AS가 완료 처리되었습니다.');
      window.location.reload();
    });
  };

  const searchProduct = () => {
    setSearchText(productData.name);
    setSearchModalVisible(!searchModalVisible);
  };

  const insertProduct = (rowData) => {
    if (rowData === undefined) return null;
    let priceGrade = handlePriceGrade(data.price_grade);

    setProductData({
      ...productData,
      id: rowData.id,
      name: rowData.name,
      category: rowData.category,
      price: rowData[priceGrade] === ' ' ? 0 : rowData[priceGrade],
    });
  };

  const progressRef = useRef(false);
  const [progressLoading, setProgressLoading] = useState(false);

  const completeRef = useRef(false);
  const [completeLoading, setCompleteLoading] = useState(false);

  const cancelRef = useRef(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const asUpdateRef = useRef(false);
  const [asUpdateLoading, setAsUpdateLoading] = useState(false);

  const asDeleteRef = useRef(false);
  const [asDeleteLoading, setAsDeleteLoading] = useState(false);

  const insertHistory = () => {
    if (productData.name === '') {
      message.warning('제품명을 입력해주세요.');
      return null;
    }

    let taxSet = calcTaxCategory(productData.tax_category, productData.price, productData.stock);

    setAppendRowData({
      name: productData.name,
      product_category: productData.category,
      amount: productData.stock,
      price: productData.price,
      tax_category: productData.tax_category,
      supply: taxSet.supply,
      surtax: taxSet.surtax,
      total_price: taxSet.total_price,
      product_id: productData.id,
      trade_id: parseInt(props.match.params.trade_id),
      trade_category: data.category_1,
      id: null,
    });

    resetProductData();
  };

  const resetProductData = () => {
    setProductData({
      name: '',
      price: 0,
      stock: 1,
      tax_category: '부가세 없음',
    });
  };

  const enterCode = () => {
    if (window.event.keyCode === 13) {
      if (productData.name === '') {
        message.warning('코드를 입력해주세요.');
        return null;
      }

      requestSearchProductCodeGet(productData.name).then((res) => {
        if (res !== null && res !== undefined) {
          let priceGrade = handlePriceGrade(res.price_grade);

          let taxSet = calcTaxCategory(productData.tax_category, res[priceGrade], productData.stock);

          setAppendRowData({
            name: res.name,
            product_category: res.category,
            amount: 1,
            price: res[priceGrade],
            tax_category: productData.tax_category,
            supply: taxSet.supply,
            surtax: taxSet.surtax,
            total_price: taxSet.total_price,
            product_id: res.id,
            trade_id: parseInt(props.match.params.trade_id),
            trade_category: data.category_1,
            id: null,
          });

          resetProductData();
        }
      });
    }
  };


  const toggleInternalForm = () => {
    if (!showInternalForm) {
      setInternalData({
        process_date: moment().format().slice(0, 16),
        engineer_id: '',
        content: '',
        memo: '',
      });
    }
    setShowInternalForm(!showInternalForm);
  };

  const createInternalProcess = () => {
    if (!internalData.engineer_id || internalData.engineer_id === '담당자 선택') {
      message.warning('담당자를 선택해주세요.');
      return null;
    }
    if (!internalData.content) {
      message.warning('처리 내용을 입력해주세요.');
      return null;
    }

    const reqData = {
      trade_id: parseInt(props.match.params.trade_id),
      engineer_id: parseInt(internalData.engineer_id),
      process_date: internalData.process_date,
      content: internalData.content,
      memo: internalData.memo,
    };

    requestAsInternalProcessCreate(reqData).then((res) => {
      if (res) {
        message.success('내부처리가 등록되었습니다.');
        setInternalData({
          process_date: moment().format().slice(0, 16),
          engineer_id: '',
          content: '',
          memo: '',
        });
        setShowInternalForm(false);
        loadInternalProcesses();
      } else {
        message.error('내부처리 등록에 실패했습니다.');
      }
    });
  };

  const deleteInternalProcess = (processId) => {
    requestAsInternalProcessDelete(processId).then((res) => {
      if (res) {
        message.success('내부처리가 삭제되었습니다.');
        loadInternalProcesses();
      } else {
        message.error('내부처리 삭제에 실패했습니다.');
      }
    });
  };

  if (data === undefined) {
    return null;
  }

  const AsProgressButton = () => (
      <Button variant="primary" onClick={handleProgress} disabled={progressLoading}>
        {progressLoading ? '처리 중...' : '진행'}
      </Button>
  );
  const AsCompleteButton = () => (
      <Button variant="primary" onClick={openCompleteModal} disabled={completeLoading}>
        완료
      </Button>
  );

  const AsInternalButton = () => {
    return (
        <>
          <Button
              variant={showInternalForm ? 'secondary' : 'info'}
              onClick={toggleInternalForm}
              style={{ marginRight: '5px' }}
          >
            {showInternalForm ? '내부처리 닫기' : '내부처리'}
          </Button>
        </>
    );
  };

  const AsCancelButton = () => (
      <Button variant="primary" onClick={handleCancel} disabled={cancelLoading}>
        {cancelLoading ? '처리 중...' : '취소'}
      </Button>
  );

  const AsVisitDate = () => {
    return (
        <>
          <Form.Group controlId="asInput4">
            <Form.Label>방문일</Form.Label>
            <Form.Control
                type="datetime-local"
                value={data.visit_date ? data.visit_date : moment().format().slice(0, 16)}
                onChange={(e) => {
                  setData({ ...data, visit_date: e.target.value });
                }}
                required
            />
          </Form.Group>
        </>
    );
  };

  const AsCompleteDate = () => {
    return (
        <>
          <Form.Group controlId="asInput5">
            <Form.Label>완료일</Form.Label>
            <Form.Control
                type="datetime-local"
                value={data.complete_date ? data.complete_date : moment().format().slice(0, 16)}
                onChange={(e) => {
                  setData({ ...data, complete_date: e.target.value });
                }}
                required
            />
          </Form.Group>
        </>
    );
  };

  const handleEmpty = (e) => {
    if (isEmptyObject(e.target.value)) {
      setProductData({ ...productData, [e.target.name]: e.target.name === 'price' ? 0 : 1 });
    } else {
      setProductData({ ...productData, [e.target.name]: parseInt(e.target.value) });
    }
  };

  return (
      <Aux>
        <CustomerInformation />
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <Card.Title as="h5">AS수정</Card.Title>
              </Card.Header>
              <Card.Body>
                <h6 style={{ color: 'red' }}>{text}</h6>
                <hr />
                <Row>
                  <Col md={6}>
                    <Form>
                      <Form.Group controlId="asInput1">
                        <Form.Label>접수일</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            placeholder="Enter name"
                            value={data.register_date}
                            onChange={(e) => {
                              setData({ ...data, register_date: e.target.value });
                            }}
                            required
                        />
                      </Form.Group>

                      <Form.Group controlId="asInput2">
                        <Form.Label>담당자</Form.Label>
                        <Form.Control
                            as="select"
                            value={data.engineer_id}
                            onChange={(e) => {
                              setData({ ...data, engineer_id: Number(e.target.value) });
                            }}
                            required
                        >
                          <EngineerSelect />
                        </Form.Control>
                      </Form.Group>

                      <Form.Group controlId="asInput3">
                        <Form.Label>출장/내방</Form.Label>
                        <Form.Control
                            as="select"
                            value={data.category_3}
                            onChange={(e) => {
                              setData({ ...data, category_3: parseInt(e.target.value) });
                            }}
                            required
                        >
                          <option>{data.category_name3}</option>
                          <option value="0">출장</option>
                          <option value="1">내방</option>
                          <option value="2">공사</option>
                          <option value="3">내부처리</option>
                        </Form.Control>
                      </Form.Group>

                      {data.category_2 === 1 || data.category_2 === 2 ? <AsVisitDate /> : null}
                      {data.category_2 === 1 ? <AsCompleteDate /> : null}
                    </Form>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="asInput6">
                      <Form.Label>접수 내용</Form.Label>
                      <Form.Control
                          as="textarea"
                          rows="3"
                          placeholder="Memo"
                          value={data.content}
                          onChange={(e) => {
                            setData({ ...data, content: e.target.value });
                          }}
                          required
                      />
                    </Form.Group>

                    <Form.Group controlId="asInput7">
                      <Form.Label>참고사항</Form.Label>
                      <Form.Control
                          as="textarea"
                          rows="3"
                          placeholder="Memo"
                          value={data.memo ? data.memo : ''}
                          onChange={(e) => {
                            setData({ ...data, memo: e.target.value });
                          }}
                      />
                    </Form.Group>

                    {data.category_2 === 1 || data.category_2 === 2 ? (
                        <Form.Group controlId="asInput8">
                          <Form.Label>고장증상</Form.Label>
                          <Form.Control
                              as="textarea"
                              rows="3"
                              placeholder="고장증상"
                              value={data.symptom ? data.symptom : ''}
                              onChange={(e) => {
                                setData({ ...data, symptom: e.target.value });
                              }}
                          />
                        </Form.Group>
                    ) : null}
                    {data.category_2 === 1 ? (
                        <Form.Group controlId="asInput9">
                          <Form.Label>완료내역</Form.Label>
                          <Form.Control
                              as="textarea"
                              rows="3"
                              placeholder="완료내역"
                              value={data.completed_content ? data.completed_content : ''}
                              onChange={(e) => {
                                setData({ ...data, completed_content: e.target.value });
                              }}
                          />
                        </Form.Group>
                    ) : null}
                  </Col>
                </Row>
                <Row>
                  <Col style={{ textAlign: 'right' }}>
                    {data.category_2 !== 3 && data.category_2 !== 1 ? <AsCancelButton /> : null}
                    {data.category_2 !== 1 ? (
                        <DeleteButton tradeId={data.id} delete={() => asDelete()} disabled={asDeleteLoading} />
                    ) : null}
                    {data.category_2 === 0 ? <AsProgressButton /> : null}
                    {data.category_2 === 2 ? <AsInternalButton /> : null}
                    {data.category_2 === 2 ? <AsCompleteButton /> : null}
                    {data.category_2 !== 1 ? (
                        <UpdateButton update={() => asUpdate()} disabled={asUpdateLoading} />
                    ) : null}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {showInternalForm && data.category_2 === 2 ? (
            <Row>
              <Col>
                <Card>
                  <Card.Header>
                    <Card.Title as="h5">내부처리 등록</Card.Title>
                    <span className="d-block m-t-5" style={{ color: '#888' }}>
                  다른 담당자가 AS를 처리한 경우 기록을 남길 수 있습니다.
                </span>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group controlId="internalInput1">
                          <Form.Label>
                            <span style={{ color: 'red' }}>*</span>처리일
                          </Form.Label>
                          <Form.Control
                              type="datetime-local"
                              value={internalData.process_date}
                              onChange={(e) => {
                                setInternalData({ ...internalData, process_date: e.target.value });
                              }}
                              required
                          />
                        </Form.Group>

                        <Form.Group controlId="internalInput2">
                          <Form.Label>
                            <span style={{ color: 'red' }}>*</span>담당자
                          </Form.Label>
                          <Form.Control
                              as="select"
                              value={internalData.engineer_id}
                              onChange={(e) => {
                                setInternalData({ ...internalData, engineer_id: e.target.value });
                              }}
                              required
                          >
                            <option>담당자 선택</option>
                            <EngineerSelect />
                          </Form.Control>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="internalInput3">
                          <Form.Label>
                            <span style={{ color: 'red' }}>*</span>처리 내용
                          </Form.Label>
                          <Form.Control
                              as="textarea"
                              rows="3"
                              placeholder="처리 내용을 입력하세요"
                              value={internalData.content}
                              onChange={(e) => {
                                setInternalData({ ...internalData, content: e.target.value });
                              }}
                              required
                          />
                        </Form.Group>

                        <Form.Group controlId="internalInput4">
                          <Form.Label>참고사항</Form.Label>
                          <Form.Control
                              as="textarea"
                              rows="2"
                              placeholder="Memo"
                              value={internalData.memo}
                              onChange={(e) => {
                                setInternalData({ ...internalData, memo: e.target.value });
                              }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col style={{ textAlign: 'right' }}>
                        <Button variant="primary" onClick={createInternalProcess}>
                          내부처리 등록
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
        ) : null}

        {internalProcesses.length > 0 ? (
            <Row>
              <Col>
                <Card>
                  <Card.Header>
                    <Card.Title as="h5">내부처리 이력</Card.Title>
                    <span className="d-block m-t-5" style={{ color: '#888' }}>
            총 {internalProcesses.length}건의 내부처리 기록이 있습니다.
          </span>
                  </Card.Header>
                  <Card.Body>
                    <Table striped hover responsive>
                      <thead>
                      <tr>
                        <th style={{ textAlign: 'center', width: '50px' }}>#</th>
                        <th style={{ textAlign: 'center', width: '80px' }}>담당자</th>
                        <th style={{ textAlign: 'center', width: '140px' }}>처리일</th>
                        <th style={{ textAlign: 'center', width: '30%' }}>처리 내용</th>
                        <th style={{ textAlign: 'center', width: '20%' }}>참고사항</th>
                        <th style={{ textAlign: 'center', width: '80px' }}>등록자</th>
                        <th style={{ textAlign: 'center', width: '70px' }}>삭제</th>
                      </tr>
                      </thead>
                      <tbody>
                      {internalProcesses.map((item, index) => (
                          <tr key={item.id}>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{index + 1}</td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{item.engineer_name}</td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                              {item.process_date ? item.process_date.slice(0, 16).replace('T', ' ') : '-'}
                            </td>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle', whiteSpace: 'pre-wrap' }}>{item.content}</td>
                            <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{item.memo || '-'}</td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{item.register_name}</td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                              <Popconfirm
                                  title="정말 삭제하시겠습니까?"
                                  onConfirm={() => deleteInternalProcess(item.id)}
                                  okText="삭제"
                                  cancelText="취소"
                              >
                                <Button variant="danger" size="sm">
                                  삭제
                                </Button>
                              </Popconfirm>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
        ) : null}

        {data.category_2 === 1 ? (
            <ProductSearchModal visible={searchModalVisible} searchText={searchText} productStorage={insertProduct} />
        ) : null}
        {data.category_2 === 1 ? (
            <Row>
              <Col>
                <Card>
                  <Card.Header>
                    <Card.Title as="h5">제품{data.category_name1}</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={3}>
                        <Form onSubmit={(e) => e.preventDefault()}>
                          <Form.Group controlId="asHistoryInput1">
                            <Form.Label>제품명/코드</Form.Label>
                            <InputGroup className="mb-3">
                              <Form.Control
                                  type="text"
                                  placeholder="제품명/코드"
                                  value={productData.name}
                                  onChange={(e) => {
                                    setProductData({ ...productData, name: e.target.value });
                                  }}
                                  onKeyUp={() => enterCode()}
                              />
                              <InputGroup.Append>
                                <Button variant="primary" style={{ marginLeft: '2px' }} onClick={(e) => searchProduct()}>
                                  검색
                                </Button>
                              </InputGroup.Append>
                            </InputGroup>
                          </Form.Group>
                        </Form>
                      </Col>
                      <Col md={2}>
                        <Form>
                          <Form.Group controlId="asHistoryInput2">
                            <Form.Label>단가</Form.Label>
                            <Form.Control
                                type="number"
                                value={productData.price}
                                name="price"
                                onChange={(e) => handleEmpty(e)}
                            />
                          </Form.Group>
                        </Form>
                      </Col>
                      <Col md={2}>
                        <Form.Group controlId="asHistoryInput3">
                          <Form.Label>수량</Form.Label>
                          <Form.Control
                              type="number"
                              value={productData.stock}
                              name="stock"
                              onChange={(e) => handleEmpty(e)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group controlId="asHistoryInput4">
                          <Form.Label>부가세 Type</Form.Label>
                          <InputGroup className="mb-3">
                            <Form.Control
                                as="select"
                                value={productData.tax_category}
                                onChange={(e) => {
                                  setProductData({ ...productData, tax_category: e.target.value });
                                }}
                            >
                              <option>부가세 없음</option>
                              <option>부가세 적용</option>
                              <option>상품에 포함</option>
                            </Form.Control>
                            <InputGroup.Append>
                              <Button
                                  variant="primary"
                                  style={{ marginLeft: '2px' }}
                                  onClick={(e) => {
                                    insertHistory();
                                  }}
                              >
                                등록
                              </Button>
                            </InputGroup.Append>
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form>
                          <Form.Group controlId="asHistoryInput5">
                            <Form.Label>{data.category_name1}날짜</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={data.register_date}
                                onChange={(e) => {
                                  setProductData({ ...data, register_date: e.target.value });
                                }}
                            />
                          </Form.Group>
                        </Form>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
        ) : null}
        {data.category_2 === 1 ? (
            <Row>
              <Col>
                <AsUpdateGrid
                    appendRowData={appendRowData}
                    tradeId={props.match.params.trade_id}
                    asDelete={() => asDelete()}
                    asUpdate={(historyData) => asUpdate(historyData)}
                    priceGrade={data.price_grade}
                    category1={data.category_1}
                />
              </Col>
            </Row>
        ) : null}

        <Modal
            title="AS 완료 처리"
            visible={completeModalVisible}
            onOk={handleCompleteConfirm}
            onCancel={() => setCompleteModalVisible(false)}
            okText="저장"
            cancelText="취소"
            width={600}
        >
          <Form>
            <Form.Group controlId="completeModalInput1">
              <Form.Label><span style={{ color: 'red' }}>*</span> 완료일</Form.Label>
              <Form.Control
                  type="datetime-local"
                  value={completeData.complete_date}
                  onChange={(e) => {
                    setCompleteData({ ...completeData, complete_date: e.target.value });
                  }}
                  required
              />
            </Form.Group>

            <Form.Group controlId="completeModalInput2" style={{ marginTop: '15px' }}>
              <Form.Label>담당자</Form.Label>
              <Form.Control
                  as="select"
                  value={completeData.engineer_id}
                  onChange={(e) => {
                    setCompleteData({ ...completeData, engineer_id: Number(e.target.value) });
                  }}
              >
                <EngineerSelect />
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="completeModalInput3" style={{ marginTop: '15px' }}>
              <Form.Label>출장구분</Form.Label>
              <Form.Control
                  as="select"
                  value={completeData.category_3}
                  onChange={(e) => {
                    setCompleteData({ ...completeData, category_3: parseInt(e.target.value) });
                  }}
              >
                <option value="">선택해주세요</option>
                <option value="0">출장</option>
                <option value="1">내방</option>
                <option value="2">공사</option>
                <option value="3">내부처리</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="completeModalInput4" style={{ marginTop: '15px' }}>
              <Form.Label>고장증상</Form.Label>
              <Form.Control
                  as="textarea"
                  rows="3"
                  placeholder="고장증상을 입력해주세요"
                  value={completeData.symptom}
                  onChange={(e) => {
                    setCompleteData({ ...completeData, symptom: e.target.value });
                  }}
              />
            </Form.Group>

            <Form.Group controlId="completeModalInput5" style={{ marginTop: '15px' }}>
              <Form.Label>완료내역</Form.Label>
              <Form.Control
                  as="textarea"
                  rows="3"
                  placeholder="완료내역을 입력해주세요"
                  value={completeData.completed_content}
                  onChange={(e) => {
                    setCompleteData({ ...completeData, completed_content: e.target.value });
                  }}
              />
            </Form.Group>

            <Form.Group controlId="completeModalInput6" style={{ marginTop: '15px' }}>
              <Form.Label>참고사항</Form.Label>
              <Form.Control
                  as="textarea"
                  rows="2"
                  placeholder="참고사항을 입력해주세요"
                  value={completeData.memo}
                  onChange={(e) => {
                    setCompleteData({ ...completeData, memo: e.target.value });
                  }}
              />
            </Form.Group>
          </Form>
        </Modal>
      </Aux>
  );
};

export default AsUpdate;