import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import Aux from '../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import CategoryModal from '../../App/components/categoryModal';
import Category from '../../App/components/category';
import requestProductCreate from '../../Axios/Product/requestProductCreate';

const ProductRegistration = () => {
  const history = useHistory(); // location 객체 접근
  const [data, setData] = useState({}); // Product Data

  // Product Create
  const productCreate = () => {
    if (data.name === undefined || data.category === undefined) {
      message.warning('필수 입력사항을 입력해주세요.');
      return null;
    }

    requestProductCreate(data)
      .then(() => history.push(`/Product/productTable/1`))
      .catch((err) => {
        if (err.message === 'Request failed with status code 400') {
          message.warning('중복되는 코드입니다. 코드를 변경해주세요.');
          return null;
        }
      });
  };

  return (
    <Aux>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">제품등록</Card.Title>
            </Card.Header>
            <Card.Body>
              <h6 style={{ color: 'red' }}>* 표시는 필수 입력사항입니다.</h6>
              <hr />
              <Row>
                <Col md={6}>
                  <Form>
                    <Form.Group controlId="productInput1">
                      <Form.Label>
                        <span style={{ color: 'red' }}>*</span> 제품분류
                      </Form.Label>
                      <InputGroup className="mb-3">
                        <Form.Control
                          as="select"
                          value={data.category || ''}
                          onChange={(e) => {
                            setData({ ...data, category: e.target.value });
                          }}
                        >
                          <option>제품분류 선택</option>
                          <Category data={1} />
                        </Form.Control>
                        <InputGroup.Append>
                          <CategoryModal data={1} />
                        </InputGroup.Append>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="productInput2">
                      <Form.Label>
                        <span style={{ color: 'red' }}>*</span> 제품명
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="제품명 입력"
                        value={data.name || ''}
                        onChange={(e) => {
                          setData({ ...data, name: e.target.value });
                        }}
                      />
                    </Form.Group>

                    <Form.Group controlId="productInput3">
                      <Form.Label>제조사</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="제조사"
                        value={data.supplier || ''}
                        onChange={(e) => {
                          setData({ ...data, supplier: e.target.value });
                        }}
                      />
                    </Form.Group>

                    <Form.Group controlId="productInput4">
                      <Form.Label>보관위치</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="보관위치"
                        value={data.container || ''}
                        onChange={(e) => {
                          setData({ ...data, container: e.target.value });
                        }}
                      />
                    </Form.Group>

                    <Form.Group controlId="productInput5">
                      <Form.Label>주매입처</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="주매입처"
                        value={data.purchase || ''}
                        onChange={(e) => {
                          setData({ ...data, purchase: e.target.value });
                        }}
                      />
                    </Form.Group>

                    <Form.Group controlId="productInput6">
                      <Form.Label>재고량</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="재고량"
                        value={data.stock || 0}
                        onChange={(e) => {
                          setData({ ...data, stock: e.target.value });
                        }}
                      />
                    </Form.Group>
                  </Form>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="productInput7">
                    <Form.Label>Code</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Code 입력, 한/영 주의"
                      value={data.code || ''}
                      onChange={(e) => {
                        setData({ ...data, code: e.target.value });
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="productInput8">
                    <Form.Label>매입금액</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="매입금액"
                      value={data.in_price || 0}
                      onChange={(e) => {
                        setData({ ...data, in_price: e.target.value });
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="productInput9">
                    <Form.Label>매출금액</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="매출금액"
                      value={data.out_price || 0}
                      onChange={(e) => {
                        setData({ ...data, out_price: e.target.value });
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="productInput10">
                    <Form.Label>소비자금액</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="소비자금액"
                      value={data.sale_price || 0}
                      onChange={(e) => {
                        setData({ ...data, sale_price: e.target.value });
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="productInput11">
                    <Form.Label>메모</Form.Label>
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
                </Col>
              </Row>
              <Row>
                <Col style={{ textAlign: 'right' }}>
                  <Button variant="primary" onClick={() => productCreate()}>
                    등록
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

export default ProductRegistration;
