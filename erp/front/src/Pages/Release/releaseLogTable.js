import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import Aux from '../../hoc/_Aux';
import { Spin, message } from 'antd';
import 'antd/dist/antd.css';
import requestReleaseLogGet from '../../Axios/Release/requestReleaseLogGet';

const ReleaseLogTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasPermission, setHasPermission] = useState(true);

    useEffect(() => {
        requestReleaseLogGet()
            .then((res) => {
                if (res !== undefined) {
                    setData(res);
                } else {
                    setHasPermission(false);
                }
                setLoading(false);
            })
            .catch((err) => {
                setHasPermission(false);
                setLoading(false);
            });
    }, []);

    const columns = [
        {
            name: 'release_created_date',
            header: '출고등록일',
            width: 120,
            align: 'center',
            formatter({ value }) {
                return value ? `${value.slice(0, 10)}` : '-';
            },
        },
        {
            name: 'release_register_name',
            header: '출고등록자',
            width: 100,
            align: 'center',
            formatter({ value }) {
                return value ? value : '-';
            },
        },
        {
            name: 'created_date',
            header: '처리일',
            width: 120,
            align: 'center',
            formatter({ value }) {
                return value ? `${value.slice(0, 10)}` : '-';
            },
        },
        {
            name: 'category',
            header: '구분',
            width: 80,
            align: 'center',
        },
        {
            name: 'name',
            header: '제품명',
            minWidth: 200,
            align: 'center'
        },
        {
            name: 'product_category',
            header: '제품분류',
            width: 100,
            align: 'center'
        },
        {
            name: 'amount',
            header: '수량',
            width: 80,
            align: 'center'
        },
        {
            name: 'memo',
            header: '메모',
            minWidth: 150,
            align: 'center'
        },
        {
            name: 'register_name',
            header: '처리자',
            width: 100,
            align: 'center'
        },
    ];

    return (
        <Aux>
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <Card.Title as="h5">출고 로그 내역</Card.Title>
                            <span className="d-block m-t-5">출고등록, 판매, 삭제 내역을 조회합니다.</span>
                        </Card.Header>
                        <Card.Body>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                                    <Spin size="large" />
                                    <p style={{ marginTop: '15px', color: '#666' }}>로딩 중...</p>
                                </div>
                            ) : !hasPermission ? (
                                <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
                                    <p style={{ fontSize: '16px' }}>열람 권한이 없습니다.</p>
                                    <p>관리자에게 문의하세요.</p>
                                </div>
                            ) : data.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
                                    <p style={{ fontSize: '16px' }}>조회된 내역이 없습니다.</p>
                                </div>
                            ) : (
                                <Grid
                                    data={data}
                                    columns={columns}
                                    rowHeight={30}
                                    bodyHeight={500}
                                    columnOptions={{ resizable: true }}
                                    pageOptions={{
                                        useClient: true,
                                        perPage: 20,
                                    }}
                                />
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Aux>
    );
};

export default ReleaseLogTable;