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
import ProductRegistrationModal from '../../Product/productRegistrationModal';
import PendingStockSelectModal from '../../PendingStock/PendingStockSelectModal';
import calcTaxCategory from '../../../App/components/calcTaxCategory';
import handlePriceGrade from '../../../App/components/handlePriceGrade';
import BuySaleCreateGrid from './buySaleCreateGrid';
import requestSearchProductCodeGet from '../../../Axios/Product/requestSearchProductCodeGet';
import requestTradeCreate from '../../../Axios/Trade/requestTradeCreate';
import requestHistoryCreate from '../../../Axios/History/requestHisotryCreate';
import requestReleaseAllUpdate from '../../../Axios/Release/requestReleaseAllUpdate';
import requestCustomerGet from '../../../Axios/Customer/requestCustomerGet';
import requestPendingStockCreate from '../../../Axios/PendingStock/requestPendingStockCreate';
import requestPendingStockSell from '../../../Axios/PendingStock/requestPendingStockSell';

const BuySaleRegistration = (typeParams) => {
  let { type } = typeParams.match.params;
  let cmId = window.sessionStorage.getItem('customerId');
  const history = useHistory();
  const [searchText, setSearchText] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [appendRowData, setAppendRowData] = useState({});
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [productRegModalVisible, setProductRegModalVisible] = useState(false);
  const [pendingStockModalVisible, setPendingStockModalVisible] = useState(false);
  const [data, setData] = useState({
    customer_id: cmId,
    register_date: moment().format().slice(0, 16),
  });
  const [productData, setProductData] = useState({
    name: '',
    price: 0,
    stock: 1,
    tax_category: '부가세 없음',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const permission = window.sessionStorage.getItem('permission');
    if (permission === '4' || permission === '7') {
      message.error('권한이 없습니다.');
      history.goBack();
      return;
    }
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

  useEffect(() => {
    setData({ ...data, category_1: type === 'sale' ? 3 : 4 });
  }, [type]);

  const searchProduct = () => {
    if (modalLoading === false) {
      setModalLoading(true);
    }
    setSearchText(productData.name);
    setSearchModalVisible(!searchModalVisible);
  };

  const resetProductData = () => {
    setProductData({
      name: '',
      price: 0,
      stock: 1,
      tax_category: '부가세 없음',
    });
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
    resetProductData();
  };

  const productStorage = (rowData) => {
    insertProduct(rowData);
  };

  // 새 제품 등록 완료 시
  const handleProductRegSuccess = (newProduct) => {
    setProductData({
      ...productData,
      id: newProduct.id,
      name: newProduct.name,
      category: newProduct.category,
      price: newProduct.in_price || 0,
    });
    message.success(`새 제품 [${newProduct.name}]이 등록되었습니다.`);
  };

  const handlePendingStockSelect = (pendingItem) => {
    setProductData({
      id: pendingItem.product,
      name: pendingItem.product_name,
      category: pendingItem.product_category,
      price: pendingItem.price,
      stock: pendingItem.amount,
      tax_category: '부가세 없음',
      pending_stock_id: pendingItem.id,
      pending_stock_amount: pendingItem.amount,
    });
    message.info(`입고대기 [${pendingItem.product_name}]이 선택되었습니다. 수량을 확인 후 등록 버튼을 눌러주세요.`);
  };

  const enterCode = () => {
    if (window.event.keyCode === 13) {
      if (productData.name === '') {
        message.warning('제품명/코드를 입력해주세요.');
        return null;
      }
      searchProduct();
    }
  };

  const insertHistoryWithPending = () => {
    if (productData.name === '') {
      message.warning('제품명을 입력해주세요.');
      return null;
    }

    if (productData.pending_stock_id && productData.stock > productData.pending_stock_amount) {
      message.warning(`입고대기 수량(${productData.pending_stock_amount}개)보다 많이 판매할 수 없습니다.`);
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
      pending_stock_id: productData.pending_stock_id || null,
      pending_stock_amount: productData.pending_stock_amount || null,
    });
    resetProductData();
  };

  const buySaleCreate = async (historyData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const tradeRes = await requestTradeCreate(data);

      if (!tradeRes || !tradeRes.data || !tradeRes.data.data) {
        message.error('거래 등록에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      const tradeId = tradeRes.data.data;

      if (!isEmptyObject(historyData.release)) {
        for (const i in historyData.release) {
          historyData.release[i].trade_id = tradeId;
        }
        let releaseReqData = { history: historyData.release, trade: tradeId };
        await requestReleaseAllUpdate(releaseReqData);
      }

      if (!isEmptyObject(historyData.history)) {
        if (type === 'buy') {
          for (const item of historyData.history) {
            item.trade_id = tradeId;
          }

          await requestHistoryCreate(historyData.history);

          const failedItems = [];

          for (const item of historyData.history) {
            try {
              await requestPendingStockCreate({
                product_id: item.product_id,
                amount: item.amount,
                price: item.price,
                supplier_name: data.customer_name,
                trade_id: tradeId,
                memo: data.memo || '',
              });
            } catch (err) {
              failedItems.push(item.name);
              console.error(`입고대기 생성 실패: ${item.name}`, err);
            }
          }

          if (failedItems.length > 0) {
            message.warning(
                `구매 등록 완료. 단, 일부 입고대기 등록 실패: ${failedItems.join(', ')}. 입고대기 탭에서 확인해주세요.`
            );
          } else {
            message.success('제품구매가 등록되었습니다. 입고대기 탭에서 입고 확정해주세요.');
          }

          history.push(`/Product/pendingStockTable`);

        } else {
          const normalItems = [];
          const pendingItems = [];

          for (const item of historyData.history) {
            item.trade_id = tradeId;
            if (item.pending_stock_id) {
              pendingItems.push(item);
            } else {
              normalItems.push(item);
            }
          }

          if (normalItems.length > 0) {
            await requestHistoryCreate(normalItems);
          }

          for (const item of pendingItems) {
            await requestPendingStockSell(item.pending_stock_id, {
              trade_id: tradeId,
              price: item.price,
              tax_category: item.tax_category === '부가세 없음' ? 0 :
                  item.tax_category === '부가세 적용' ? 1 : 2,
              sell_amount: item.amount,
            });
          }

          if (pendingItems.length > 0) {
            message.success(`입고대기 ${pendingItems.length}건이 바로판매 처리되었습니다.`);
          }
          history.push(`/Trade/tradeTable/1`);
        }
      } else {
        history.push(`/Trade/tradeTable/1`);
      }
    } catch (err) {
      message.error('등록 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
        <ProductSearchModal loading={modalLoading} visible={searchModalVisible} searchText={searchText} productStorage={productStorage} />

        {type === 'buy' && (
            <ProductRegistrationModal
                visible={productRegModalVisible}
                onClose={() => setProductRegModalVisible(false)}
                onSuccess={handleProductRegSuccess}
            />
        )}

        {type === 'sale' && (
            <PendingStockSelectModal
                visible={pendingStockModalVisible}
                onClose={() => setPendingStockModalVisible(false)}
                onSelect={handlePendingStockSelect}
            />
        )}

        <SimpleCustomerInformation />
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <Card.Title as="h5">
                  제품{type === 'sale' ? '판매' : '구매'}
                  {type === 'buy' && (
                      <span style={{ fontSize: '12px', color: '#888', marginLeft: '10px' }}>
                    (구매 등록 시 입고대기로 등록됩니다)
                  </span>
                  )}
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <Form onSubmit={(e) => e.preventDefault()}>
                      <Form.Group controlId="buySaleInput1">
                        <Form.Label>
                          제품명/코드
                          {productData.pending_stock_id && (
                              <span style={{ color: '#17a2b8', marginLeft: '5px' }}>(입고대기)</span>
                          )}
                        </Form.Label>
                        <InputGroup className="mb-3">
                          <Form.Control
                              type="text"
                              placeholder="제품명/코드"
                              value={productData.name}
                              onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                              onKeyUp={() => enterCode()}
                          />
                          <InputGroup.Append>
                            <Button variant="primary" style={{ marginLeft: '2px' }} onClick={() => searchProduct()}>
                              검색
                            </Button>
                            {type === 'buy' && (
                                <Button variant="success" style={{ marginLeft: '2px' }} onClick={() => setProductRegModalVisible(true)}>
                                  새 제품
                                </Button>
                            )}
                            {type === 'sale' && (
                                <Button variant="info" style={{ marginLeft: '2px' }} onClick={() => setPendingStockModalVisible(true)}>
                                  입고대기
                                </Button>
                            )}
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
                      <Form.Label>
                        수량
                        {productData.pending_stock_amount && (
                            <span style={{ color: '#888', fontSize: '11px' }}> (최대: {productData.pending_stock_amount})</span>
                        )}
                      </Form.Label>
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
                            onChange={(e) => setProductData({ ...productData, tax_category: e.target.value })}
                        >
                          <option>부가세 없음</option>
                          <option>부가세 적용</option>
                          <option>상품에 포함</option>
                        </Form.Control>
                        <InputGroup.Append>
                          <Button variant="primary" style={{ marginLeft: '2px' }} onClick={() => insertHistoryWithPending()}>
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
                            onChange={(e) => setData({ ...data, register_date: e.target.value })}
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
            <BuySaleCreateGrid appendRowData={appendRowData} buySaleCreate={(historyData) => buySaleCreate(historyData)} category1={data.category_1} isSubmitting={isSubmitting} />
          </Col>
        </Row>
      </Aux>
  );
};

export default BuySaleRegistration;