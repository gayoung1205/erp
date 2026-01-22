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
import DeliveryUpdateGrid from './deliveryUpdateGrid';
import requestTradeGet from '../../../Axios/Trade/requestTradeGet';
import requestSearchProductCodeGet from '../../../Axios/Product/requestSearchProductCodeGet';
import requestTradeDelete from '../../../Axios/Trade/requestTradeDelete';
import requestReleaseAllUpdate from '../../../Axios/Release/requestReleaseAllUpdate';
import requestTradeUpdate from '../../../Axios/Trade/requestTradeUpdate';
import UpdateButton from '../../../App/components/Button/updateButton';
import DeleteButton from '../../../App/components/Button/deleteButton';
import requestCustomerGet from '../../../Axios/Customer/requestCustomerGet';

const DeliveryUpdate = (props) => {
  let token = sessionStorage.getItem('token'); // Login Token
  const history = useHistory(); // location 객체 접근

  const [data, setData] = useState({ register_date: moment().format().slice(0, 16) }); // trade data, register_date 초기 값이 없을 경우 Warning이 생겨서 초기값으로 그날 날짜로 설정해놨음, Trade Data
  const [searchModalVisible, setSearchModalVisible] = useState(false); // Modal Product Search Visible
  const [searchText, setSearchText] = useState('');
  const [appendRowData, setAppendRowData] = useState({});
  const [text, setText] = useState(''); // As Status Text
  const [productData, setProductData] = useState({
    name: '',
    price: 0,
    stock: 1,
    tax_category: '부가세 없음',
  }); // Product Data

  // requestTradeGet()이 처음에만 실행되도록
  useEffect(() => {
    requestTradeGet(props.match.params.trade_id).then((res) => {
      // Trade Data Copy
      let tra = res.tra;

      // History Data Copy
      let his = res.his;

      // History Data는 category_2가 1(완료)일 경우만 필요
      if (tra.category_2 === 1) {
        // History Setting
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

      // 납품일 경우 접수, 취소, 완료만 존재
      tra.category_2 === 0 ? setText(`${tra.category_name2} 중인 납품입니다.`) : setText(`${tra.category_name2}된 납품입니다.`);

      // customer price_grade get
      requestCustomerGet().then((cmRes) => {
        tra.price_grade = cmRes[0].price_grade;

        // trade data 저장
        setData(tra);
      });
    });
  }, [props.match.params.trade_id, token]);

  // Delivery Update
  const deliveryUpdate = (historyData) => {
    // 필수 입력사항 없을 시 수정 못하게끔 제약
    if (data.register_date === undefined) {
      message.warning('접수일을 입력해주세요.');
      return null;
    }
    if (data.engineer_id === undefined) {
      message.warning('담당자를 입력해주세요.');
      return null;
    }
    if (data.content === undefined) {
      message.warning('접수 내용을 입력해주세요.');
      return null;
    }

    // Update Data
    let historyReqData = { history: [], trade: data };
    let releaseReqData = { history: [], trade: data.id };

    // 완료일 때 tax_category int -> string
    if (data.category_2 === 1) {
      historyReqData = { history: historyData.history, trade: data };

      if (!isEmptyObject(historyData.release)) {
        releaseReqData = { history: historyData.release, trade: data.id };
        requestReleaseAllUpdate(releaseReqData);
      }
    }

    requestTradeUpdate(props.match.params.trade_id, historyReqData).then(() => history.push(`/Trade/tradeTable/1`));
  };

  // Delivery Delete
  const deliveryDelete = () => {
    requestTradeDelete(props.match.params.trade_id).then(() => history.push(`/Trade/tradeTable/1`));
  };

  // Delivery category_2 변경
  const changeCategory = (num) => {
    if (data.register_date === undefined || data.engineer_id === undefined || data.category_3 === undefined || data.content === undefined) {
      message.warning('필수 입력사항을 입력해주세요.');
      return null;
    }

    let reqData = data;
    reqData.category_2 = num;

    if (num === 1) reqData.complete_date = moment().format().slice(0, 16);

    requestTradeUpdate(props.match.params.trade_id, { history: [], trade: reqData }).then(() => window.location.reload());
  };

  // Product Search Button Click => Product Search Data Get, Product Search Modal Visible false->true
  const searchProduct = () => {
    setSearchText(productData.name);
    setSearchModalVisible(!searchModalVisible);
  };

  // 등록 Button Click
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

  // History Row Insert
  const insertHistory = () => {
    if (productData.name === '') {
      message.warning('제품명을 입력해주세요.');
      return null;
    }

    let taxSet = calcTaxCategory(productData.tax_category, productData.price, productData.stock);

    // History Grid Row 추가
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

  // Product Data 초기화
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

  // Delivery category_2=0 => Complete Button
  const DeliveryCompleteButton = () => {
    return (
      <>
        <Button variant="primary" onClick={() => changeCategory(1)}>
          완료
        </Button>
      </>
    );
  };

  // Delivery category_2=0, category_2=1 => Cancel Button
  const DeliveryCancelButton = () => {
    return (
      <>
        <Button variant="primary" onClick={() => changeCategory(3)}>
          취소
        </Button>
      </>
    );
  };

  // Delivery category_2=1 => complete_visit
  const DeliveryCompleteDate = () => {
    return (
      <>
        <Form.Group controlId="deliveryInput2">
          <Form.Label>완료일</Form.Label>
          <Form.Control
            type="datetime-local"
            placeholder="Enter name"
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
              <Card.Title as="h5">납품수정</Card.Title>
            </Card.Header>
            <Card.Body>
              <h6 style={{ color: 'red' }}>{text}</h6>
              <hr />
              <Row>
                <Col md={6}>
                  <Form>
                    <Form.Group controlId="deliveryInput1">
                      <Form.Label>접수일</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={data.register_date}
                        onChange={(e) => {
                          setData({ ...data, register_date: e.target.value });
                        }}
                        required
                      />
                    </Form.Group>

                    {data.category_2 === 1 ? <DeliveryCompleteDate /> : null}

                    <Form.Group controlId="deliveryInput3">
                      <Form.Label>담당자</Form.Label>
                      <Form.Control
                        as="select"
                        value={data.engineer_id}
                        onChange={(e) => {
                          setData({
                            ...data,
                            engineer_id: parseInt(e.target.value),
                          });
                        }}
                        required
                      >
                        <EngineerSelect />
                      </Form.Control>
                    </Form.Group>
                  </Form>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="deliveryInput4">
                    <Form.Label>접수 내용</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows="3"
                      placeholder="접수 내용"
                      value={data.content}
                      onChange={(e) => {
                        setData({ ...data, content: e.target.value });
                      }}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="deliveryInput5">
                    <Form.Label>참고사항</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows="3"
                      placeholder="Memo"
                      value={data.memo}
                      onChange={(e) => {
                        setData({ ...data, memo: e.target.value });
                      }}
                    />
                  </Form.Group>

                  {data.category_2 === 1 ? (
                    <Form.Group controlId="deliveryInput6">
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
                  {data.category_2 !== 3 && data.category_2 !== 1 ? <DeliveryCancelButton /> : null}
                  {data.category_2 !== 1 ? <DeleteButton tradeId={data.id} delete={() => deliveryDelete()} /> : null}
                  {data.category_2 !== 1 ? <UpdateButton update={() => deliveryUpdate()} /> : null}
                  {data.category_2 === 0 ? <DeliveryCompleteButton /> : null}
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
                      <Form.Group controlId="exampleForm.ControlSelect1">
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
                      <Form.Group controlId="exampleForm.ControlInput1">
                        <Form.Label>단가</Form.Label>
                        <Form.Control type="number" value={productData.price} name="price" onChange={(e) => handleEmpty(e)} />
                      </Form.Group>
                    </Form>
                  </Col>
                  <Col md={2}>
                    <Form.Group controlId="exampleForm.ControlInput1">
                      <Form.Label>수량</Form.Label>
                      <Form.Control type="number" value={productData.stock} name="stock" onChange={(e) => handleEmpty(e)} />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="exampleForm.ControlSelect1">
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
                      <Form.Group controlId="exampleForm.ControlInput1">
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
            <DeliveryUpdateGrid
              appendRowData={appendRowData}
              tradeId={props.match.params.trade_id}
              deliveryDelete={() => deliveryDelete()}
              deliveryUpdate={(historyData) => deliveryUpdate(historyData)}
              priceGrade={data.price_grade}
              category1={data.category_1}
            />
          </Col>
        </Row>
      ) : null}
    </Aux>
  );
};

export default DeliveryUpdate;
