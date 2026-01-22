import React, { useState, useEffect } from 'react';
import { Modal, Table, Button } from 'react-bootstrap';
import { Spin, message } from 'antd';
import 'antd/dist/antd.css';
import requestPackageGet from '../../Axios/Package/requestPackageGet';

const PackageSelectModal = (props) => {
    const { visible, onCancel, onSelect } = props;
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        if (visible) {
            setLoading(true);
            requestPackageGet().then((res) => {
                if (res !== undefined) {
                    setPackages(res);
                }
                setLoading(false);
            });
        }
    }, [visible]);

    // 패키지 선택
    const handleSelect = (pkg) => {
        onSelect(pkg);
        onCancel();
    };

    // 구성품 토글
    const toggleExpand = (pkgId) => {
        if (expandedId === pkgId) {
            setExpandedId(null);
        } else {
            setExpandedId(pkgId);
        }
    };

    // 테이블 셀 공통 스타일
    const cellStyle = {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
    };

    return (
        <Modal show={visible} onHide={onCancel} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>패키지 선택</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: '15px', color: '#666' }}>로딩 중...</p>
                    </div>
                ) : packages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
                        <p>등록된 패키지가 없습니다.</p>
                        <p>제품관리 → 패키지관리에서 패키지를 먼저 등록해주세요.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <Table striped bordered hover style={{ tableLayout: 'fixed', width: '100%' }}>
                            <thead>
                            <tr>
                                <th style={{ width: '40px', textAlign: 'center' }}></th>
                                <th style={{ width: '30%' }}>패키지명</th>
                                <th style={{ width: '80px', textAlign: 'center' }}>구성품</th>
                                <th style={{ width: '30%' }}>메모</th>
                                <th style={{ width: '100px', textAlign: 'center' }}></th>
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
                                        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                            <Button variant="primary" size="sm" onClick={() => handleSelect(pkg)}>
                                                선택
                                            </Button>
                                        </td>
                                    </tr>
                                    {expandedId === pkg.id && pkg.items && (
                                        <tr>
                                            <td colSpan={5} style={{ backgroundColor: '#f8f9fa', padding: '15px 20px' }}>
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
                                                        <th style={{ width: '35%' }}>제품명</th>
                                                        <th style={{ width: '25%' }}>분류</th>
                                                        <th style={{ width: '25%' }}>코드</th>
                                                        <th style={{ width: '15%', textAlign: 'center' }}>수량</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {pkg.items.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td style={cellStyle}>{item.product_name}</td>
                                                            <td style={cellStyle}>{item.product_category}</td>
                                                            <td style={cellStyle}>{item.product_code || '-'}</td>
                                                            <td style={{ textAlign: 'center' }}>{item.amount}개</td>
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
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    닫기
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PackageSelectModal;