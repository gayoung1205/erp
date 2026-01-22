import React, { useState, memo, useCallback } from 'react';
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { isEmptyObject } from 'jquery';
import Aux from '../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import ProductSearchModal from '../Product/productSearchModal';
import PackageSelectModal from '../Package/packageSelectModal';
import ReleaseGrid from './releaseGrid';
import requestSearchProductCodeGet from '../../Axios/Product/requestSearchProductCodeGet';
import requestReleaseCreate from '../../Axios/Release/requestReleaseCreate';
import requestReleasePackage from '../../Axios/Package/requestReleasePackage';
import ReleaseLogGrid from './releaseLogGrid';

const MemoedReleaseGrid = memo(ReleaseGrid);
const MemoedProductSearchModal = memo(ProductSearchModal);
const MemoedReleaseLogGrid = memo(ReleaseLogGrid);

const ReleaseTable = () => {
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [packageModalVisible, setPackageModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [appendRowData, setAppendRowData] = useState({});
  const [appendMultipleRows, setAppendMultipleRows] = useState([]);
  const [data, setData] = useState({
    name: '',
    amount: 1,
  });

  const searchProduct = useCallback(() => {
    setSearchText(data.name);
    setSearchModalVisible(!searchModalVisible);
  }, [data.name, searchModalVisible]);

  const resetData = () => {
    setData({
      name: '',
      amount: 1,
    });
  };

  const insertHistory = () => {
    if (data.name === '') {
      message.warning('제품명을 입력해주세요.');
      return null;
    }

    if (data.product_id === undefined) {
      message.warning('등록되어 있지 않은 제품입니다.');
      return null;
    }

    requestReleaseCreate(data).then((res) => {
      if (res !== null && res !== undefined) {
        data.id = res.id;
        data.created_date = res.created_date;
        data.register_name = res.register_name;
        data.stock = res.stock;
        setAppendRowData({ ...data });
        message.success(data.name + ' 등록');
      }
    });

    resetData();
  };

  const productStorage = (rowData) => {
    setData({ ...data, product_id: rowData.id, name: rowData.name, product_category: rowData.category });
  };

  const enterCode = () => {
    if (window.event.keyCode === 13) {
      if (data.name === '') {
        message.warning('제품명/코드를 입력해주세요.');
        return null;
      }
      searchProduct();
    }
  };

  const handleEmpty = (e) => {
    if (isEmptyObject(e.target.value)) {
      setData({ ...data, [e.target.name]: 1 });
    } else {
      setData({ ...data, [e.target.name]: parseInt(e.target.value) });
    }
  };

  const handlePackageSelect = (pkg) => {
    requestReleasePackage(pkg.id).then((res) => {
      if (res !== null && res !== undefined) {
        setAppendMultipleRows(res.releases);
      }
    });
  };

  return (
      <Aux>
        <MemoedProductSearchModal visible={searchModalVisible} searchText={searchText} productStorage={productStorage} />

        <PackageSelectModal
            visible={packageModalVisible}
            onCancel={() => setPackageModalVisible(false)}
            onSelect={handlePackageSelect}
        />

        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={6} xl={3}>
                    <Form onSubmit={(e) => e.preventDefault()}>
                      <Form.Group controlId="releaseInput01">
                        <Form.Label>제품명/코드</Form.Label>
                        <InputGroup className="mb-3">
                          <Form.Control
                              type="text"
                              placeholder="제품명/코드"
                              value={data.name}
                              onChange={(e) => {
                                setData({ ...data, name: e.target.value });
                              }}
                              onKeyUp={() => enterCode()}
                          />
                          <InputGroup.Append>
                            <Button variant="primary" style={{ marginLeft: '2px' }} onClick={() => searchProduct()}>
                              검색
                            </Button>
                          </InputGroup.Append>
                        </InputGroup>
                      </Form.Group>
                    </Form>
                  </Col>
                  <Col md={6} xl={3}>
                    <Form.Group controlId="releaseInput02">
                      <Form.Label>수량</Form.Label>
                      <InputGroup className="mb-3">
                        <Form.Control type="number" value={data.amount} name="amount" onChange={(e) => handleEmpty(e)} />
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

                  <Col md={6} xl={3}>
                    <Form.Group>
                      <Form.Label>패키지 출고</Form.Label>
                      <div>
                        <Button
                            onClick={() => setPackageModalVisible(true)}
                            style={{
                              width: '100%',
                              backgroundColor: '#0d47a1',
                              borderColor: '#0d47a1',
                              color: '#fff',
                            }}
                        >
                          📦 패키지 선택
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <MemoedReleaseGrid
                appendRowData={appendRowData}
                appendMultipleRows={appendMultipleRows}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <MemoedReleaseLogGrid />
          </Col>
        </Row>
      </Aux>
  );
};

export default ReleaseTable;