import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import Aux from '../../hoc/_Aux';
import DocumentUpdateModal from './documentUpdateModal.js';
import requestRecordListGet from '../../Axios/Record/requestRecordListGet';

const DashboardDocumentModalTable = () => {
  const [data, setData] = useState([]); //Document Data
  const [updateModal, setUpdateModal] = useState({ visible: false }); // Update Modal Visible
  const [updateId, setUpdateId] = useState(); // 조회할 문서 ID

  const isDesktop = useMediaQuery({ query: '(min-device-width: 480px)' }); // DeviceWidth > 480
  const isMobile = useMediaQuery({ query: '(max-width: 480px)' }); // DeviceWidth < 480

  // requestDocumentGet이 변경될 때마다 실행
  useEffect(() => {
    requestRecordListGet('empty', 'all').then((res) => {
      res = res.slice(0, 7);
      setData(res);
    });
  }, []);

  // Status에 따라서 상태 아이콘 변경, status 0=제출, 1=승인, 2=반려
  const handleStatusIcon = (status) => {
    switch (status) {
      case 0:
        // 제출완료
        return <i className="feather icon-upload text-c-blue f-20 m-r-5" />;
      case 1:
        // 승인
        return <i className="feather icon-check text-c-green f-20 m-r-5" />;
      case 2:
        // 반려
        return <i className="feather icon-x text-c-red f-20 m-r-5" />;
      default:
        return <i className="feather icon-loader text-c-black f-20 m-r-5" />;
    }
  };

  const dashboardTrStyle = {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textAlign: 'center',
  };

  // Create Modal 보여주기?
  const handleUpdateModal = (id) => {
    setUpdateId(id);
    setUpdateModal({ visible: !updateModal.visible });
  };

  return (
    <Aux>
      <Row>
        <Col md={12} xl={12} className="m-b-30">
          {isDesktop && (
            <>
              <Card className="Recent-Users">
                <Card.Body className="px-0 py-2">
                  <Table hover style={{ tableLayout: 'fixed', marginBottom: '0' }}>
                    <thead style={{ textAlign: 'center' }}>
                      <tr>
                        <th>분류</th>
                        <th>상태</th>
                        <th>제목</th>
                        <th>내용</th>
                        <th>등록일</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((el, i) => {
                        return (
                          <tr className="unread" key={i}>
                            <td style={dashboardTrStyle}>{el.category}</td>
                            <td style={dashboardTrStyle}>{handleStatusIcon(el.status)}</td>
                            <td style={dashboardTrStyle} title={el.title}>
                              <span className="m-0">{el.title}</span>
                            </td>
                            <td style={dashboardTrStyle} title={el.content}>
                              <span className="m-0">{el.content}</span>
                            </td>
                            <td style={dashboardTrStyle} title={el.date ? el.date.slice(0, 10) : null}>
                              <span className="m-0">{el.date ? el.date.slice(0, 10) : null}</span>
                            </td>
                            <td style={dashboardTrStyle}>
                              <Button
                                className="label theme-bg text-white f-12"
                                style={{ padding: '5px 10px' }}
                                onClick={() => handleUpdateModal(el.id)}
                              >
                                조회
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                  <span style={{ float: 'right', margin: '5px 10px 5px 0' }}>
                    <i className="feather icon-upload text-c-blue f-14 m-r-5" />= 제출완료,{'  '}
                    <i className="feather icon-check text-c-green f-14 m-r-5" />= 승인,{'  '}
                    <i className="feather icon-x text-c-red f-14 m-r-5" />= 반려
                  </span>
                </Card.Body>
              </Card>
            </>
          )}
          {isMobile && (
            <>
              {data.map((el, i) => {
                return (
                  <Card className="Recent-Users" key={i}>
                    <Card.Header>
                      <Card.Title as="h5" title={el.title}>
                        <span>{el.title}</span>
                      </Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <div style={{ display: 'block' }}>
                        <Card.Text>상태 : {handleStatusIcon(el.status)}</Card.Text>
                        <Card.Text>등록일 : {el.date ? el.date.slice(0, 10) : null}</Card.Text>
                        <Card.Text>{el.content}</Card.Text>
                      </div>
                      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <Button
                          className="label theme-bg text-white f-12"
                          style={{ padding: '5px 10px' }}
                          onClick={() => handleUpdateModal(el.id)}
                        >
                          조회
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
              <p style={{ textAlign: 'center', margin: '5px 10px 5px 0' }}>
                <i className="feather icon-upload text-c-blue f-14 m-r-5" />= 제출완료
              </p>
              <p style={{ textAlign: 'center', margin: '5px 10px 5px 0' }}>
                <i className="feather icon-check text-c-green f-14 m-r-5" />= 승인,{'  '}
                <i className="feather icon-x text-c-red f-14 m-r-5" />= 반려
              </p>
            </>
          )}
        </Col>
      </Row>
      <DocumentUpdateModal visible={updateModal.visible} id={updateId} />
    </Aux>
  );
};

export default DashboardDocumentModalTable;
