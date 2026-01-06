import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { isEmptyObject } from 'jquery';
import Aux from '../../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
import SimpleCustomerInformation from '../../../App/components/simpleCustomerInformation';
import ProductSearchModal from '../../Product/productSearchModal';
import calcTaxCategory from '../../../App/components/calcTaxCategory';
import handlePriceGrade from '../../../App/components/handlePriceGrade';
import BuySaleCreateGrid from './buySaleCreateGrid';
import requestSearchProductCodeGet from '../../../Axios/Product/requestSearchProductCodeGet';
import requestTradeCreate from '../../../Axios/Trade/requestTradeCreate';
import requestHistoryCreate from '../../../Axios/History/requestHisotryCreate';
import requestReleaseAllUpdate from '../../../Axios/Release/requestReleaseAllUpdate';
import requestCustomerGet from '../../../Axios/Customer/requestCustomerGet';

const BuySaleRegistration = (typeParams) => {
  let { type } = typeParams.match.params; // buy or sale
  let cmId = window.sessionStorage.getItem('customerId'); // Customer Id
  const history = useHistory(); // location 객체 접근
  const [searchText, setSearchText] = useState('');
  const [modalLoading, setModalLoading] = useState(false); // cmId가 없을 경우 productSearchModal의 setData가 불필요하게 실행되는 경우를 막기 위해서
  const [appendRowData, setAppendRowData] = useState({});
  const [searchModalVisible, setSearchModalVisible] = useState(false); // Search Modal Visible
  const [data, setData] = useState({
    customer_id: cmId,
    register_date: moment().format().slice(0, 16),
  }); // Trade Data
  const [productData, setProductData] = useState({
    name: '',
    price: 0,
    stock: 1,
    tax_category: '부가세 없음',
  }); // Product Data

  // 처음에 type에 따라서 category 설정, customer_name, price_grade 설정, sessionStorage에 Customer Id가 없을 경우 고객목록 page로 이동
  useEffect(() => {
    cmId === null || cmId === undefined || isNaN(cmId) === true
      ? history.push('/Customer/customerTable/1')
      : requestCustomerGet().then((res) => {
          setData({
            ...data,
            category_1: type === 'sale' ? 3 : 4,
            customer_name: res[0].name,
            price_grade: res[0].price_grade,
          });
        });
  }, []);

  // Type이 바뀔 때마다 category 변경
  useEffect(() => {
    setData({ ...data, category_1: type === 'sale' ? 3 : 4 });
  }, [type]);

  // 제품 검색
  const searchProduct = () => {
    if (modalLoading === false) {
      setModalLoading(true);
    }
    setSearchText(productData.name);
    setSearchModalVisible(!searchModalVisible);
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

  // Product Search Modal에서 DbClick => Product Data 저장
  const insertProduct = (rowData) => {
    if (rowData === undefined) return null;

    // Customer price_grade에 따른 Product price_grade 선택
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
      trade_id: ' ',
      trade_category: data.category_1,
    });

    // ProductData 초기화
    resetProductData();
  };

  const productStorage = (rowData) => {
    insertProduct(rowData);
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
            trade_id: ' ',
            trade_category: data.category_1,
          });

          resetProductData();
        }
      });
    }
  };

  const buySaleCreate = (historyData) => {
    requestTradeCreate(data).then((res) => {
      if (!isEmptyObject(historyData.release)) {
        for (const i in historyData.release) {
          historyData.release[i].trade_id = res.data.data;
        }

        let releaseReqData = { history: historyData.release, trade: res.data.data };
        requestReleaseAllUpdate(releaseReqData);
      }

      if (!isEmptyObject(historyData.history)) {
        for (const i in historyData.history) {
          historyData.history[i].trade_id = res.data.data;
        }
        requestHistoryCreate(historyData.history).then(() => history.push(`/Trade/tradeTable/1`));
      } else {
        history.push(`/Trade/tradeTable/1`);
      }
    });
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
      <ProductSearchModal loading={modalLoading} visible={searchModalVisible} searchText={searchText} productStorage={productStorage} />
      <SimpleCustomerInformation />
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">제품{type === 'sale' ? '판매' : '구매'}</Card.Title>
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
                      <Form.Label>{type === 'sale' ? '판매' : '구매'}날짜</Form.Label>
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
          <BuySaleCreateGrid appendRowData={appendRowData} buySaleCreate={(historyData) => buySaleCreate(historyData)} category1={data.category_1} />
        </Col>
      </Row>
    </Aux>
  );
};

export default BuySaleRegistration;
