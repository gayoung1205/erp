import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Button, Table } from 'react-bootstrap';
import Aux from '../../hoc/_Aux';
import { message, Modal, Spin } from 'antd';
import 'antd/dist/antd.css';
import requestPackageGet from '../../Axios/Package/requestPackageGet';
import requestPackageDelete from '../../Axios/Package/requestPackageDelete';

const PackageList = () => {
    const history = useHistory();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    // 패키지 목록 조회
    const fetchPackages = () => {
        setLoading(true);
        requestPackageGet().then((res) => {
            if (res !== undefined) {
                setPackages(res);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    // 구성품 토글
    const toggleExpand = (pkgId) => {
        if (expandedId === pkgId) {
            setExpandedId(null);
        } else {
            setExpandedId(pkgId);
        }
    };

    // 패키지 수정 페이지로 이동
    const goToUpdate = (packageId) => {
        history.push(`/Package/packageUpdate/${packageId}`);
    };

    // 패키지 삭제
    const deletePackage = (pkg) => {
        Modal.confirm({
            title: '패키지 삭제',
            content: `[${pkg.name}] 패키지를 삭제하시겠습니까?`,
            okText: '삭제',
            okType: 'danger',
            cancelText: '취소',
            onOk: () => {
                requestPackageDelete(pkg.id).then((res) => {
                    if (res) {
                        message.success('패키지가 삭제되었습니다.');
                        fetchPackages(); // 목록 새로고침
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
        verticalAlign: 'middle',
    };

    return (
        <Aux>
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <Card.Title as="h5" style={{ display: 'inline-block' }}>
                                패키지 관리
                            </Card.Title>
                            <Button
                                variant="primary"
                                style={{ float: 'right' }}
                                onClick={() => history.push('/Package/packageCreate')}
                            >
                                + 패키지 등록
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                                    <Spin size="large" />
                                    <p style={{ marginTop: '15px', color: '#666' }}>로딩 중...</p>
                                </div>
                            ) : packages.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
                                    <p>등록된 패키지가 없습니다.</p>
                                    <Button variant="primary" onClick={() => history.push('/Package/packageCreate')}>
                                        패키지 등록하기
                                    </Button>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <Table striped bordered hover style={{ tableLayout: 'fixed', width: '100%' }}>
                                        <thead>
                                        <tr>
                                            <th style={{ width: '40px', textAlign: 'center' }}></th>
                                            <th style={{ width: '25%' }}>패키지명</th>
                                            <th style={{ width: '80px', textAlign: 'center' }}>구성품</th>
                                            <th style={{ width: '25%' }}>메모</th>
                                            <th style={{ width: '100px' }}>등록자</th>
                                            <th style={{ width: '120px' }}>등록일</th>
                                            <th style={{ width: '140px', textAlign: 'center' }}>관리</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {packages.map((pkg) => (
                                            <React.Fragment key={pkg.id}>
                                                <tr>
                                                    <td
                                                        style={{ textAlign: 'center', cursor: 'pointer', verticalAlign: 'middle' }}
                                                        onClick={() => toggleExpand(pkg.id)}
                                                    >
                                                        {expandedId === pkg.id ? '▼' : '▶'}
                                                    </td>
                                                    <td style={cellStyle}>{pkg.name}</td>
                                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                        {pkg.item_count}개
                                                    </td>
                                                    <td style={cellStyle}>{pkg.memo || '-'}</td>
                                                    <td style={cellStyle}>{pkg.register_name || '-'}</td>
                                                    <td style={cellStyle}>
                                                        {pkg.created_date ? pkg.created_date.slice(0, 10) : '-'}
                                                    </td>
                                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                        <Button
                                                            variant="info"
                                                            size="sm"
                                                            className="mr-1"
                                                            onClick={() => goToUpdate(pkg.id)}
                                                        >
                                                            편집
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => deletePackage(pkg)}
                                                        >
                                                            삭제
                                                        </Button>
                                                    </td>
                                                </tr>
                                                {expandedId === pkg.id && pkg.items && (
                                                    <tr>
                                                        <td
                                                            colSpan={7}
                                                            style={{ backgroundColor: '#f8f9fa', padding: '15px 20px' }}
                                                        >
                                                            <strong>구성품 목록:</strong>
                                                            <Table
                                                                size="sm"
                                                                bordered
                                                                style={{
                                                                    marginTop: '10px',
                                                                    marginBottom: 0,
                                                                    tableLayout: 'fixed',
                                                                    width: '100%',
                                                                }}
                                                            >
                                                                <thead>
                                                                <tr>
                                                                    <th style={{ width: '30%' }}>제품명</th>
                                                                    <th style={{ width: '20%' }}>분류</th>
                                                                    <th style={{ width: '25%' }}>코드</th>
                                                                    <th style={{ width: '15%', textAlign: 'center' }}>
                                                                        수량
                                                                    </th>
                                                                </tr>
                                                                </thead>
                                                                <tbody>
                                                                {pkg.items.map((item, idx) => (
                                                                    <tr key={idx}>
                                                                        <td style={cellStyle}>{item.product_name}</td>
                                                                        <td style={cellStyle}>{item.product_category}</td>
                                                                        <td style={cellStyle}>{item.product_code || '-'}</td>
                                                                        <td style={{ textAlign: 'center' }}>
                                                                            {item.amount}개
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                </tbody>
                                                            </Table>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Aux>
    );
};

export default PackageList;