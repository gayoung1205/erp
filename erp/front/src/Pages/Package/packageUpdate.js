import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import Aux from '../../hoc/_Aux';
import { message, Modal, InputNumber, Spin } from 'antd';
import 'antd/dist/antd.css';
import requestPackageDetailGet from '../../Axios/Package/requestPackageDetailGet';
import requestPackageUpdate from '../../Axios/Package/requestPackageUpdate';
import requestPackageDelete from '../../Axios/Package/requestPackageDelete';
import requestSearchProductNameGet from '../../Axios/Product/requestSearchProductNameGet';

const PackageUpdate = (props) => {
    const history = useHistory();
    const packageId = props.match.params.package_id;
    const [packageData, setPackageData] = useState({
        name: '',
        memo: '',
    });
    const [items, setItems] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    // 패키지 상세 조회
    useEffect(() => {
        requestPackageDetailGet(packageId).then((res) => {
            if (res) {
                setPackageData({
                    name: res.name,
                    memo: res.memo || '',
                });
                setItems(
                    res.items.map((item) => ({
                        product_id: item.product,
                        product_name: item.product_name,
                        product_category: item.product_category,
                        product_code: item.product_code,
                        amount: item.amount,
                    }))
                );
            }
            setLoading(false);
        });
    }, [packageId]);

    // 제품 검색
    const searchProduct = () => {
        if (searchText === '') {
            message.warning('제품명/코드를 입력해주세요.');
            return;
        }
        requestSearchProductNameGet(searchText).then((res) => {
            if (res && res.length > 0) {
                setSearchResults(res);
                setSearchModalVisible(true);
            } else {
                message.warning('검색 결과가 없습니다.');
            }
        });
    };

    // 제품 추가
    const addProduct = (product) => {
        const exists = items.find((item) => item.product_id === product.id);
        if (exists) {
            message.warning('이미 추가된 제품입니다.');
            return;
        }

        setItems([
            ...items,
            {
                product_id: product.id,
                product_name: product.name,
                product_category: product.category,
                product_code: product.code,
                amount: 1,
            },
        ]);
        message.success(`[${product.name}] 추가됨`);
    };

    // 제품 삭제
    const removeProduct = (productId) => {
        setItems(items.filter((item) => item.product_id !== productId));
    };

    // 수량 변경
    const changeAmount = (productId, amount) => {
        setItems(
            items.map((item) => {
                if (item.product_id === productId) {
                    return { ...item, amount: amount };
                }
                return item;
            })
        );
    };

    // 패키지 수정
    const updatePackage = () => {
        if (packageData.name === '') {
            message.warning('패키지명을 입력해주세요.');
            return;
        }
        if (items.length === 0) {
            message.warning('구성품을 1개 이상 추가해주세요.');
            return;
        }

        requestPackageUpdate(packageId, {
            name: packageData.name,
            memo: packageData.memo,
            items: items.map((item) => ({
                product_id: item.product_id,
                amount: item.amount,
            })),
        }).then((res) => {
            if (res) {
                history.push('/Package/packageList');
            }
        });
    };

    // 패키지 삭제
    const deletePackage = () => {
        Modal.confirm({
            title: '패키지 삭제',
            content: `[${packageData.name}] 패키지를 삭제하시겠습니까?`,
            okText: '삭제',
            okType: 'danger',
            cancelText: '취소',
            onOk: () => {
                requestPackageDelete(packageId).then((res) => {
                    if (res) {
                        message.success('패키지가 삭제되었습니다.');
                        history.push('/Package/packageList');
                    }
                });
            },
        });
    };

    // 테이블 셀 공통 스타일
    const cellStyle = {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    };

    if (loading) {
        return (
            <Aux>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: '15px', color: '#666' }}>로딩 중...</p>
                </div>
            </Aux>
        );
    }

    return (
        <Aux>
            {/* 제품 검색 모달 */}
            <Modal
                title="제품 검색"
                visible={searchModalVisible}
                onCancel={() => setSearchModalVisible(false)}
                footer={null}
                width="80%"
                style={{ maxWidth: '1000px' }}
            >
                <div style={{ overflowX: 'auto' }}>
                    <Table striped bordered hover size="sm" style={{ tableLayout: 'fixed', width: '100%' }}>
                        <thead>
                        <tr>
                            <th style={{ width: '25%' }}>제품명</th>
                            <th style={{ width: '15%' }}>분류</th>
                            <th style={{ width: '15%' }}>제조사</th>
                            <th style={{ width: '20%' }}>코드</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>재고</th>
                            <th style={{ width: '15%', textAlign: 'center' }}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {searchResults.map((product) => (
                            <tr key={product.id}>
                                <td style={cellStyle}>{product.name}</td>
                                <td style={cellStyle}>{product.category}</td>
                                <td style={cellStyle}>{product.supplier || '-'}</td>
                                <td style={cellStyle}>{product.code}</td>
                                <td style={{ textAlign: 'center' }}>{product.stock}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <Button size="sm" onClick={() => addProduct(product)}>
                                        추가
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>
            </Modal>

            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <Card.Title as="h5">패키지 수정</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {/* 패키지 정보 */}
                            <Row>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>패키지명 *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={packageData.name}
                                            onChange={(e) => setPackageData({ ...packageData, name: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>메모</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={packageData.memo}
                                            onChange={(e) => setPackageData({ ...packageData, memo: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />

                            {/* 제품 검색 */}
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Label>제품 추가</Form.Label>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <Form.Control
                                            type="text"
                                            placeholder="제품명/코드 입력"
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                            onKeyUp={(e) => {
                                                if (e.keyCode === 13) searchProduct();
                                            }}
                                        />
                                        <Button
                                            variant="primary"
                                            style={{ whiteSpace: 'nowrap' }}
                                            onClick={searchProduct}
                                        >
                                            검색
                                        </Button>
                                    </div>
                                </Col>
                            </Row>

                            {/* 구성품 목록 */}
                            <Row>
                                <Col>
                                    <Form.Label>구성품 목록 ({items.length}개)</Form.Label>
                                    {items.length === 0 ? (
                                        <div
                                            style={{
                                                padding: '30px',
                                                textAlign: 'center',
                                                border: '1px dashed #ddd',
                                                color: '#999',
                                            }}
                                        >
                                            제품을 검색하여 추가해주세요.
                                        </div>
                                    ) : (
                                        <div style={{ overflowX: 'auto' }}>
                                            <Table striped bordered hover style={{ tableLayout: 'fixed', width: '100%' }}>
                                                <thead>
                                                <tr>
                                                    <th style={{ width: '30%' }}>제품명</th>
                                                    <th style={{ width: '20%' }}>분류</th>
                                                    <th style={{ width: '25%' }}>코드</th>
                                                    <th style={{ width: '100px' }}>수량</th>
                                                    <th style={{ width: '80px' }}></th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {items.map((item) => (
                                                    <tr key={item.product_id}>
                                                        <td style={cellStyle}>{item.product_name}</td>
                                                        <td style={cellStyle}>{item.product_category}</td>
                                                        <td style={cellStyle}>{item.product_code}</td>
                                                        <td>
                                                            <InputNumber
                                                                min={1}
                                                                value={item.amount}
                                                                onChange={(value) => changeAmount(item.product_id, value)}
                                                                style={{ width: '100%' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => removeProduct(item.product_id)}
                                                            >
                                                                삭제
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </Col>
                            </Row>

                            <hr />

                            {/* 버튼 */}
                            <Row>
                                <Col>
                                    <Button variant="danger" onClick={deletePackage}>
                                        패키지 삭제
                                    </Button>
                                </Col>
                                <Col style={{ textAlign: 'right' }}>
                                    <Button variant="secondary" onClick={() => history.goBack()} className="mr-2">
                                        취소
                                    </Button>
                                    <Button variant="primary" onClick={updatePackage}>
                                        저장
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

export default PackageUpdate;