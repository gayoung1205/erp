import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { isEmptyObject } from 'jquery';
import Aux from '../../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import SimpleCustomerInformation from '../../../App/components/simpleCustomerInformation';
import ProductSearchModal from '../../Product/productSearchModal';
import calcTaxCategory from '../../../App/components/calcTaxCategory';
import handlePriceGrade from '../../../App/components/handlePriceGrade';
import handleTaxCategory from '../../../App/components/handleTaxCategory';
import requestTradeGet from '../../../Axios/Trade/requestTradeGet';
import requestSearchProductCodeGet from '../../../Axios/Product/requestSearchProductCodeGet';
import BuySaleUpdateGrid from './buySaleUpdateGrid';
import requestTradeUpdate from '../../../Axios/Trade/requestTradeUpdate';
import requestReleaseAllUpdate from '../../../Axios/Release/requestReleaseAllUpdate';
import requestCustomerGet from '../../../Axios/Customer/requestCustomerGet';

const BuySaleUpdate = (props) => {
  const history = useHistory(); //location 객체 접근
  const [searchText, setSearchText] = useState('');
  const [appendRowData, setAppendRowData] = useState({});
  const [searchModalVisible, setSearchModalVisible] = useState(false); // Modal visible
  const [data, setData] = useState({ register_date: '' }); // Trade Data
  const [productData, setProductData] = useState({
    name: '',
    price: 0,
    stock: 1,
    tax_category: '부가세 없음',
  }); // Product Data

  // 페이지 로딩 시에 제품판매, 구매 데이터 설정
  useEffect(() => {
    requestTradeGet(props.match.params.trade_id).then((res) => {
      // Trade Data Copy
      let tra = res.tra;

      // History Data Copy
      let his = res.his;

      // History Data Setting
      for (let i = 0; i < his.length; i++) {
        let taxSet = calcTaxCategory(his[i].tax_category, his[i].price, his[i].amount);

        his[i].supply = taxSet.supply;
        his[i].surtax = taxSet.surtax;
        his[i].total_price = taxSet.total_price;
        his[i].tax_category = handleTaxCategory('string', his[i].tax_category);
      }

      if (his.length > 0) {
        setAppendRowData(his);
      }

      requestCustomerGet().then((cmRes) => {
        // trade data 저장
        setData({
          category_1: parseInt(tra.category_1),
          category_name1: tra.category_name1,
          customer_id: parseInt(tra.customer_id),
          customer_name: tra.customer_name,
          id: parseInt(tra.id),
          register_date: tra.register_date,
          price_grade: cmRes[0].price_grade,
        });
      });
    });
  }, []);

  // 제품판매, 제품구매 수정
  const buySaleUpdate = (historyData) => {
    // Update Data
    let historyReqData = { history: [], trade: data };
    let releaseReqData = { history: [], trade: data.id };

    historyReqData = { history: historyData.history, trade: data };

    if (!isEmptyObject(historyData.release)) {
      releaseReqData = { history: historyData.release, trade: data.id };
      requestReleaseAllUpdate(releaseReqData);
    }

    requestTradeUpdate(props.match.params.trade_id, historyReqData).then(() => history.push(`/Trade/tradeTable/1`));
  };

  // 제품명 검색
  const searchProduct = () => {
    setSearchText(productData.name);
    setSearchModalVisible(!searchModalVisible);
  };

  // 제품 등록
  const insertProduct = (rowData) => {
    if (rowData === undefined) return null;

    // Customer price_grade에 따라서 Product price_grade 변경
    let priceGrade = handlePriceGrade(data.price_grade);

    // Product price_grade 값의 Null 여부에 따라서 price 변경
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

    // Product Data 초기화
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

  // 제품명/코드 InputText에서 Enter 시 자동 검색 기능
  const enterCode = () => {
    if (window.event.keyCode === 13) {
      if (data.name === '') {
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
      <ProductSearchModal visible={searchModalVisible} searchText={searchText} productStorage={insertProduct} />
      <SimpleCustomerInformation />
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
                    <Form.Group controlId="buySaleInput1">
                      <Form.Label>제품명/코드</Form.Label>
                      <InputGroup className="mb-3">
                        <Form.Control
                          type="text"
                          placeholder="제품명/코드"
                          value={productData.name}
                          onChange={(e) => {
                            setProductData({ ...productData, name: e.target.value });
                          }}
                          onKeyUp={(e) => enterCode()}
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
                    <Form.Group controlId="buySaleInput2">
                      <Form.Label>단가</Form.Label>
                      <Form.Control type="number" value={productData.price} name="price" onChange={(e) => handleEmpty(e)} />
                    </Form.Group>
                  </Form>
                </Col>
                <Col md={2}>
                  <Form.Group controlId="buySaleInput3">
                    <Form.Label>수량</Form.Label>
                    <Form.Control type="number" value={productData.stock} name="stock" onChange={(e) => handleEmpty(e)} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="buySaleInput4">
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
                    <Form.Group controlId="buySaleInput5">
                      <Form.Label>{data.category_name1}날짜</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={data.register_date}
                        onChange={(e) => {
                          setData({ ...data, register_date: e.target.value });
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
      <Row>
        <Col>
          <BuySaleUpdateGrid
            appendRowData={appendRowData}
            buySaleUpdate={buySaleUpdate}
            tradeId={props.match.params.trade_id}
            category1={data.category_1}
          />
        </Col>
      </Row>
    </Aux>
  );
};

export default BuySaleUpdate;
