import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card } from 'react-bootstrap';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import Aux from '../../hoc/_Aux';
import { Spin, message } from 'antd';
import 'antd/dist/antd.css';
import requestReleaseLogGet from '../../Axios/Release/requestReleaseLogGet';

const ReleaseLogTable = () => {
    const history = useHistory();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasPermission, setHasPermission] = useState(true);

    useEffect(() => {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // [수정] 프론트엔드 하드코딩 권한 체크 제거
        // 백엔드 API가 권한을 체크하므로, API 응답에 따라 처리
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        requestReleaseLogGet()
            .then((res) => {
                if (res !== undefined && res !== null) {
                    setData(res);
                    setHasPermission(true);
                } else {
                    // API에서 권한 없음 (403) 또는 에러 발생 시
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
                                    <i className="feather icon-lock" style={{ fontSize: '48px', marginBottom: '15px', display: 'block' }} />
                                    <p>출고 로그 열람 권한이 없습니다.</p>
                                    <p style={{ fontSize: '12px' }}>관리자에게 권한을 요청하세요.</p>
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