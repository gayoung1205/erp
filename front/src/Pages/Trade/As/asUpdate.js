import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { isEmptyObject } from 'jquery';
import Aux from '../../../hoc/_Aux';
import { message } from 'antd';
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
import DeleteButton from '../../../App/components/Button/deleteButton';
import UpdateButton from '../../../App/components/Button/updateButton';
import notNull from '../../../App/components/notNull';
import requestCustomerGet from '../../../Axios/Customer/requestCustomerGet';

const AsUpdate = (props) => {
  let token = sessionStorage.getItem('token'); // Login Token
  const history = useHistory(); // location 객체 접근

  const [data, setData] = useState({ register_date: '' }); // Trade Data
  const [searchModalVisible, setSearchModalVisible] = useState(false); // Modal Product Search Visible
  const [searchText, setSearchText] = useState('');
  const [appendRowData, setAppendRowData] = useState({});
  const [text, setText] = useState(''); // As status Text
  const [productData, setProductData] = useState({
    name: '',
    price: 0,
    stock: 1,
    tax_category: '부가세 없음',
  }); // Product Data

  // 처음 실행될 때 Trade Data Get
  useEffect(() => {
    requestTradeGet(props.match.params.trade_id).then((res) => {
      // trade data 복사
      let tra = res.tra;
      // history data 복사
      let his = res.his;

      // null 제거
      tra = notNull(tra);

      // As가 완료일 경우에만
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

      // As category_name2 Text
      tra.category_2 === 0 || tra.category_2 === 2 ? setText(`${tra.category_name2} 중인 AS입니다.`) : setText(`${tra.category_name2}된 AS입니다.`);

      // customer price_grade get
      requestCustomerGet().then((cmRes) => {
        tra.price_grade = cmRes[0].price_grade;

        // trade data 저장
        setData(tra);
      });
    });
  }, [props.match.params.trade_id, token]);

  // AS 수정
  const asUpdate = (historyData) => {
    if (data.register_date === undefined || data.engineer_id === undefined || data.category_3 === undefined || data.content === undefined) {
      message.warning('필수 입력사항을 입력해주세요.');
      return null;
    }

    // Update Data
    let historyReqData = { history: [], trade: data };
    let releaseReqData = { history: [], trade: data.id };

    // As 완료일 경우에만
    if (data.category_2 === 1) {
      historyReqData = { history: historyData.history, trade: data };

      if (!isEmptyObject(historyData.release)) {
        releaseReqData = { history: historyData.release, trade: data.id };
        requestReleaseAllUpdate(releaseReqData);
      }
    }

    requestTradeUpdate(props.match.params.trade_id, historyReqData).then(() => history.push(`/Trade/tradeTable/1`));
  };

  // As Delete
  const asDelete = () => {
    requestTradeDelete(props.match.params.trade_id).then(() => history.push(`/Trade/tradeTable/1`));
  };

  // As Category_2 변경
  const changeCategory = (num) => {
    if (data.register_date === undefined || data.engineer_id === undefined || data.category_3 === undefined || data.content === undefined) {
      message.warning('필수 입력사항을 입력해주세요.');
      return null;
    }

    let reqData = data;
    reqData.category_2 = num;

    // Date를 시간까지만
    if (num === 2) reqData.visit_date = moment().format().slice(0, 16);
    if (num === 1) reqData.complete_date = moment().format().slice(0, 16);

    requestTradeUpdate(props.match.params.trade_id, { history: [], trade: reqData }).then(() => window.location.reload());
  };

  // Search Button Click 시 SearchModal Visible false->true, Product Data Get
  const searchProduct = () => {
    setSearchText(productData.name);
    setSearchModalVisible(!searchModalVisible);
  };

  // Product Search Modal에서 DbClick으로 등록
  const insertProduct = (rowData) => {
    if (rowData === undefined) return null;
    let priceGrade = handlePriceGrade(data.price_grade);

    // Product price_grade값의 Null여부에 따라 price 변경
    setProductData({
      ...productData,
      id: rowData.id,
      name: rowData.name,
      category: rowData.category,
      price: rowData[priceGrade] === ' ' ? 0 : rowData[priceGrade],
    });
  };

  // History Insert
  const insertHistory = () => {
    if (productData.name === '') {
      message.warning('제품명을 입력해주세요.');
      return null;
    }

    let taxSet = calcTaxCategory(productData.tax_category, productData.price, productData.stock);

    // Grid에 Row 추가
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

    // ProductData 초기화
    resetProductData();
  };

  // ProductData 초기화
  const resetProductData = () => {
    setProductData({
      name: '',
      price: 0,
      stock: 1,
      tax_category: '부가세 없음',
    });
  };

  // 제품명/코드 InputText에서 Enter 시 자동 검색 기능
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

  // data rendering전에 data 값이 undefined일 경우 Warning 있어서
  if (data === undefined) {
    return null;
  }

  // AS접수일 경우 진행 Button
  const AsProgressButton = () => {
    return (
      <>
        <Button variant="primary" onClick={() => changeCategory(2)}>
          진행
        </Button>
      </>
    );
  };

  // AS진행일 경우 진행 Button
  const AsCompleteButton = () => {
    return (
      <>
        <Button variant="primary" onClick={() => changeCategory(1)}>
          완료
        </Button>
      </>
    );
  };

  // AS접수, AS진행, AS완료일 경우 Cancel Button
  const AsCancelButton = () => {
    return (
      <>
        <Button variant="primary" onClick={() => changeCategory(3)}>
          취소
        </Button>
      </>
    );
  };

  // AS완료, AS진행일 경우 visit_date
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

  // AS완료, AS진행일 경우 complete_date
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

  // 단가, 수량 값이 비게 될 경우 0으로 변경
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
                  {data.category_2 !== 1 ? <DeleteButton tradeId={data.id} delete={() => asDelete()} /> : null}
                  {data.category_2 === 0 ? <AsProgressButton /> : null}
                  {data.category_2 === 2 ? <AsCompleteButton /> : null}
                  {data.category_2 !== 1 ? <UpdateButton update={() => asUpdate()} /> : null}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {data.category_2 === 1 ? <ProductSearchModal visible={searchModalVisible} searchText={searchText} productStorage={insertProduct} /> : null}
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
                        <Form.Control type="number" value={productData.price} name="price" onChange={(e) => handleEmpty(e)} />
                      </Form.Group>
                    </Form>
                  </Col>
                  <Col md={2}>
                    <Form.Group controlId="asHistoryInput3">
                      <Form.Label>수량</Form.Label>
                      <Form.Control type="number" value={productData.stock} name="stock" onChange={(e) => handleEmpty(e)} />
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
    </Aux>
  );
};

export default AsUpdate;
