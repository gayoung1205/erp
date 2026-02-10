import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Table, Form } from 'react-bootstrap';
import Aux from '../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import requestReleaseLogPermissionGet from '../../Axios/Release/requestReleaseLogPermissionGet';
import requestReleaseLogPermissionUpdate from '../../Axios/Release/requestReleaseLogPermissionUpdate';

const ReleaseLogPermission = () => {
    const history = useHistory();
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const ALWAYS_PERMITTED_DEPARTMENTS = [0, 2];

    const isAlwaysPermitted = (department) => {
        return ALWAYS_PERMITTED_DEPARTMENTS.includes(department);
    };

    const hasExcelPermission = (perm) => {
        return perm.can_export_customer ||
            perm.can_export_trade ||
            perm.can_export_product ||
            perm.can_export_release ||
            perm.can_export_release_log ||
            perm.can_export_accounting ||
            perm.can_export_receivable;
    };

    const hasReleaseLogPermission = (perm) => {
        return perm.can_view_register || perm.can_view_sale || perm.can_view_delete;
    };

    useEffect(() => {
        const permission = window.sessionStorage.getItem('permission');
        if (!(permission === '0' || permission === '2' || permission === '3')) {
            message.error('권한이 없습니다.');
            history.goBack();
        }
    }, []);

    // 권한 목록 조회
    useEffect(() => {
        requestReleaseLogPermissionGet().then((res) => {
            if (res !== undefined) {
                setPermissions(res);
            }
            setLoading(false);
        });
    }, []);

    const handleReleaseLogPermissionChange = (department, value) => {
        if (isAlwaysPermitted(department)) {
            message.warning('관리와 대표이사는 항상 모든 권한이 있습니다.');
            return;
        }

        const updatedPermissions = permissions.map((perm) => {
            if (perm.department === department) {
                return {
                    ...perm,
                    can_view_register: value,
                    can_view_sale: value,
                    can_view_delete: value,
                };
            }
            return perm;
        });
        setPermissions(updatedPermissions);

        const targetPerm = updatedPermissions.find((p) => p.department === department);
        savePermission({
            ...targetPerm,
            can_view_register: value,
            can_view_sale: value,
            can_view_delete: value,
        });
    };

    const handleExcelPermissionChange = (department, value) => {
        if (isAlwaysPermitted(department)) {
            message.warning('관리와 대표이사는 항상 모든 권한이 있습니다.');
            return;
        }

        const updatedPermissions = permissions.map((perm) => {
            if (perm.department === department) {
                return {
                    ...perm,
                    can_export_customer: value,
                    can_export_trade: value,
                    can_export_product: value,
                    can_export_release: value,
                    can_export_release_log: value,
                    can_export_accounting: value,
                    can_export_receivable: value,
                };
            }
            return perm;
        });
        setPermissions(updatedPermissions);

        const targetPerm = updatedPermissions.find((p) => p.department === department);
        savePermission({
            ...targetPerm,
            can_export_customer: value,
            can_export_trade: value,
            can_export_product: value,
            can_export_release: value,
            can_export_release_log: value,
            can_export_accounting: value,
            can_export_receivable: value,
        });
    };

    const savePermission = (targetPerm) => {
        requestReleaseLogPermissionUpdate({
            department: targetPerm.department,
            can_view_register: targetPerm.can_view_register,
            can_view_sale: targetPerm.can_view_sale,
            can_view_delete: targetPerm.can_view_delete,
            can_export_customer: targetPerm.can_export_customer,
            can_export_trade: targetPerm.can_export_trade,
            can_export_product: targetPerm.can_export_product,
            can_export_release: targetPerm.can_export_release,
            can_export_release_log: targetPerm.can_export_release_log,
            can_export_accounting: targetPerm.can_export_accounting,
            can_export_receivable: targetPerm.can_export_receivable,
        }).then((res) => {
            if (res) {
                message.success('권한이 저장되었습니다.');
            } else {
                message.error('권한 저장에 실패했습니다.');
            }
        });
    };

    const getRowStyle = (department) => {
        if (isAlwaysPermitted(department)) {
            return { backgroundColor: '#e8f5e9' };
        }
        return {};
    };

    return (
        <Aux>
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <Card.Title as="h5">부서별 권한 관리</Card.Title>
                            <span className="d-block m-t-5">부서별로 출고 로그 열람 및 엑셀 다운로드 권한을 설정합니다.</span>
                        </Card.Header>
                        <Card.Body>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '50px 0' }}>로딩 중...</div>
                            ) : (
                                <>

                                    <Table striped hover responsive style={{ fontSize: '14px' }}>
                                        <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ textAlign: 'center', verticalAlign: 'middle', width: '150px' }}>부서</th>
                                            <th style={{ textAlign: 'center' }}>출고로그</th>
                                            <th style={{ textAlign: 'center', backgroundColor: '#e3f2fd' }}>엑셀 다운로드</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {permissions.map((perm) => (
                                            <tr key={perm.department} style={getRowStyle(perm.department)}>
                                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                    <strong>{perm.department_name}</strong>
                                                    {isAlwaysPermitted(perm.department) && (
                                                        <span style={{
                                                            display: 'block',
                                                            fontSize: '10px',
                                                            color: '#4caf50',
                                                            fontWeight: 'normal'
                                                        }}>
                                                                (전체권한)
                                                            </span>
                                                    )}
                                                </td>

                                                {/* 출고로그 */}
                                                <td style={{ textAlign: 'center' }}>
                                                    <Form.Check
                                                        type="switch"
                                                        id={`releaselog-${perm.department}`}
                                                        checked={isAlwaysPermitted(perm.department) ? true : hasReleaseLogPermission(perm)}
                                                        disabled={isAlwaysPermitted(perm.department)}
                                                        onChange={(e) =>
                                                            handleReleaseLogPermissionChange(perm.department, e.target.checked)
                                                        }
                                                    />
                                                </td>

                                                {/* 엑셀 다운로드 (통합) */}
                                                <td style={{ textAlign: 'center', backgroundColor: isAlwaysPermitted(perm.department) ? '#e8f5e9' : '#f5f9ff' }}>
                                                    <Form.Check
                                                        type="switch"
                                                        id={`excel-${perm.department}`}
                                                        checked={isAlwaysPermitted(perm.department) ? true : hasExcelPermission(perm)}
                                                        disabled={isAlwaysPermitted(perm.department)}
                                                        onChange={(e) =>
                                                            handleExcelPermissionChange(perm.department, e.target.checked)
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Aux>
    );
};

export default ReleaseLogPermission;