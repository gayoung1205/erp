import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import Aux from '../../hoc/_Aux';
import { Modal, message, Spin, Empty } from 'antd';
import 'antd/dist/antd.css';
import requestInactiveProductGet from '../../Axios/Product/requestInactiveProductGet';
import requestProductActivate from '../../Axios/Product/requestProductActivate';

const InactiveProductTable = () => {
    const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' });
    const isMobile = useMediaQuery({ query: '(max-device-width: 767px)' });

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // 비활성화 제품 목록 조회
    useEffect(() => {
        fetchInactiveProducts();
    }, []);

    const fetchInactiveProducts = () => {
        setLoading(true);
        requestInactiveProductGet()
            .then((res) => {
                if (res && res.length > 0) {
                    setData(res);
                } else {
                    setData([]);
                }
                setLoading(false);
            })
            .catch(() => {
                setData([]);
                setLoading(false);
            });
    };

    // 제품 활성화
    const productActivate = (product) => {
        Modal.confirm({
            title: '제품 활성화',
            content: `[${product.name}] 제품을 다시 활성화하시겠습니까? 활성화된 제품은 제품목록에 다시 나타나며, 거래 등록 시 검색됩니다.`,
            okText: '활성화',
            okType: 'primary',
            cancelText: '취소',
            onOk: () => {
                requestProductActivate(product.id)
                    .then(() => {
                        message.success(`[${product.name}] 제품이 활성화되었습니다.`);
                        fetchInactiveProducts(); // 목록 새로고침
                    })
                    .catch(() => {
                        message.error('활성화에 실패했습니다.');
                    });
            },
        });
    };

    // 로딩 중
    if (loading) {
        return (
            <Aux>
                <Row>
                    <Col>
                        <Card>
                            <Card.Header>
                                <Card.Title as="h5">비활성화 제품 목록</Card.Title>
                            </Card.Header>
                            <Card.Body style={{ textAlign: 'center', padding: '50px' }}>
                                <Spin size="large" />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Aux>
        );
    }

    return (
        <Aux>
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <Card.Title as="h5">비활성화 제품 목록</Card.Title>
                            <span className="d-block m-t-5">
                                비활성화된 제품들입니다. 필요 시 다시 활성화할 수 있습니다.
                            </span>
                        </Card.Header>
                        <Card.Body>
                            {data.length === 0 ? (
                                <Empty
                                    description="비활성화된 제품이 없습니다."
                                    style={{ padding: '50px 0' }}
                                />
                            ) : (
                                <>
                                    {isDesktop && (
                                        <Table striped bordered hover responsive>
                                            <thead>
                                            <tr>
                                                <th style={{ textAlign: 'center' }}>제품명</th>
                                                <th style={{ textAlign: 'center' }}>제품분류</th>
                                                <th style={{ textAlign: 'center' }}>제조사</th>
                                                <th style={{ textAlign: 'center' }}>코드</th>
                                                <th style={{ textAlign: 'center' }}>재고량</th>
                                                <th style={{ textAlign: 'center' }}>메모</th>
                                                <th style={{ textAlign: 'center', width: '100px' }}>관리</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {data.map((product, index) => (
                                                <tr key={index}>
                                                    <td style={{ textAlign: 'center' }}>{product.name}</td>
                                                    <td style={{ textAlign: 'center' }}>{product.category}</td>
                                                    <td style={{ textAlign: 'center' }}>{product.supplier}</td>
                                                    <td style={{ textAlign: 'center' }}>{product.code}</td>
                                                    <td style={{ textAlign: 'center' }}>{product.stock}</td>
                                                    <td style={{ textAlign: 'center' }}>{product.memo}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() => productActivate(product)}
                                                        >
                                                            활성화
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </Table>
                                    )}

                                    {isMobile && (
                                        <div>
                                            {data.map((product, index) => (
                                                <Card className="mb-3" key={index}>
                                                    <Card.Header>
                                                        <Card.Title as="h6">{product.name}</Card.Title>
                                                    </Card.Header>
                                                    <Card.Body>
                                                        <p style={{ margin: '5px 0' }}>
                                                            <strong>제품분류:</strong> {product.category}
                                                        </p>
                                                        <p style={{ margin: '5px 0' }}>
                                                            <strong>제조사:</strong> {product.supplier}
                                                        </p>
                                                        <p style={{ margin: '5px 0' }}>
                                                            <strong>코드:</strong> {product.code}
                                                        </p>
                                                        <p style={{ margin: '5px 0' }}>
                                                            <strong>재고량:</strong> {product.stock}
                                                        </p>
                                                        {product.memo && (
                                                            <p style={{ margin: '5px 0' }}>
                                                                <strong>메모:</strong> {product.memo}
                                                            </p>
                                                        )}
                                                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                onClick={() => productActivate(product)}
                                                            >
                                                                활성화
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Aux>
    );
};

export default InactiveProductTable;