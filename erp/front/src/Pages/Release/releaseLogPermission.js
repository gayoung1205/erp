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

    // 권한 체크 (대표이사, 관리자만 접근 가능)
    useEffect(() => {
        const permission = window.sessionStorage.getItem('permission');
        if (!(permission === '2' || permission === '3')) {
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

    // 권한 변경 핸들러
    const handlePermissionChange = (department, field, value) => {
        // 화면 업데이트
        const updatedPermissions = permissions.map((perm) => {
            if (perm.department === department) {
                return { ...perm, [field]: value };
            }
            return perm;
        });
        setPermissions(updatedPermissions);

        // 서버에 저장
        const targetPerm = updatedPermissions.find((p) => p.department === department);
        requestReleaseLogPermissionUpdate({
            department: department,
            can_view_register: targetPerm.can_view_register,
            can_view_sale: targetPerm.can_view_sale,
            can_view_delete: targetPerm.can_view_delete,
        }).then((res) => {
            if (res) {
                message.success('권한이 저장되었습니다.');
            } else {
                message.error('권한 저장에 실패했습니다.');
            }
        });
    };

    return (
        <Aux>
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <Card.Title as="h5">출고 로그 권한 관리</Card.Title>
                            <span className="d-block m-t-5">부서별로 출고등록, 판매내역, 삭제내역 열람 권한을 설정합니다.</span>
                        </Card.Header>
                        <Card.Body>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '50px 0' }}>로딩 중...</div>
                            ) : (
                                <Table striped hover responsive>
                                    <thead>
                                    <tr>
                                        <th style={{ textAlign: 'center' }}>부서</th>
                                        <th style={{ textAlign: 'center' }}>출고등록 열람</th>
                                        <th style={{ textAlign: 'center' }}>판매내역 열람</th>
                                        <th style={{ textAlign: 'center' }}>삭제내역 열람</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {permissions.map((perm) => (
                                        <tr key={perm.department}>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                <strong>{perm.department_name}</strong>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <Form.Check
                                                    type="switch"
                                                    id={`register-${perm.department}`}
                                                    checked={perm.can_view_register}
                                                    onChange={(e) =>
                                                        handlePermissionChange(perm.department, 'can_view_register', e.target.checked)
                                                    }
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <Form.Check
                                                    type="switch"
                                                    id={`sale-${perm.department}`}
                                                    checked={perm.can_view_sale}
                                                    onChange={(e) =>
                                                        handlePermissionChange(perm.department, 'can_view_sale', e.target.checked)
                                                    }
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <Form.Check
                                                    type="switch"
                                                    id={`delete-${perm.department}`}
                                                    checked={perm.can_view_delete}
                                                    onChange={(e) =>
                                                        handlePermissionChange(perm.department, 'can_view_delete', e.target.checked)
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Aux>
    );
};

export default ReleaseLogPermission;