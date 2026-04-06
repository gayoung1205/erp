import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Tabs, Tab, Button } from 'react-bootstrap';
import { message } from 'antd';
import { useMediaQuery } from 'react-responsive';
import Aux from '../../hoc/_Aux';
import DocumentUpdateModal from './documentUpdateModal.js';
import requestRecordListGet from '../../Axios/Record/requestRecordListGet';
import PaginationComponent from '../../App/components/PaginationComponent';
import { parseInt } from 'lodash';
import requestExcelExport from '../../Axios/Excel/requestExcelExport';

const DocumentStorage = ({ match }) => {
  const [data, setData] = useState([]);
  const [updateModal, setUpdateModal] = useState({ visible: false });
  const [updateId, setUpdateId] = useState();
  const [category, setCategory] = useState(0);
  const page = parseInt(match.params.page);
  const [maxPage, setMaxPage] = useState();
  const [excelLoading, setExcelLoading] = useState(false);

  const isDesktop = useMediaQuery({ query: '(min-device-width: 480px)' });
  const isMobile = useMediaQuery({ query: '(max-width: 480px)' });

  useEffect(() => {
    requestRecordListGet(category, 1, page).then((res) => {
      if (res.data === undefined) {
        message.warning('승인된 문서가 없습니다.');
      } else {
        setData(res.data.results);
        setMaxPage(res.data.max_page);
      }
    });
  }, [category, page]);

  const handleStatusIcon = (status) => {
    switch (status) {
      case 1:
        return <i className="feather icon-check text-c-green f-20 m-r-5" />;
      case 2:
        return <i className="feather icon-x text-c-red f-20 m-r-5" />;
      default:
        return <i className="feather icon-loader text-c-black f-20 m-r-5" />;
    }
  };

  // ★ 핵심: type을 'record_accepted'로 보냄 (requestExcelExport.js는 수정 안 함!)
  const handleExcelExport = () => {
    setExcelLoading(true);
    requestExcelExport('record_accepted', null, null, (e) => {})
    .then(() => {
      message.success('문서보관함 엑셀 다운로드 완료!');
    })
    .catch(() => {
      message.error('엑셀 다운로드 실패');
    })
    .finally(() => {
      setExcelLoading(false);
    });
  };

  const DocumentList = (documentData) => {
    const dashboardTrStyle = {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textAlign: 'center',
    };

    return (
        <Aux>
          {isDesktop && (
              <>
                <Card className="Recent-Users">
                  <Card.Body className="px-0 py-2">
                    <Button
                        variant="success"
                        size="sm"
                        style={{ padding: '5px 10px', float: 'right' }}
                        onClick={handleExcelExport}
                        disabled={excelLoading}
                    >
                      {excelLoading ? '다운로드 중...' : '📥 엑셀 출력'}
                    </Button>
                    <Table hover style={{ tableLayout: 'fixed', marginBottom: '0' }}>
                      <thead style={{ textAlign: 'center' }}>
                      <tr>
                        <th>상태</th>
                        <th>제목</th>
                        <th>내용</th>
                        <th>등록일</th>
                        {category === 1 && <th>시작일</th>}
                        {category === 1 && <th>완료일</th>}
                        <th>Action</th>
                      </tr>
                      </thead>
                      <tbody>
                      {documentData.map((el, i) => {
                        return (
                            <tr className="unread" key={i}>
                              <td style={dashboardTrStyle}>{handleStatusIcon(el.status)}</td>
                              <td style={dashboardTrStyle} title={el.title}>
                                <span className="m-0">{el.title}</span>
                              </td>
                              <td style={dashboardTrStyle} title={el.content_preview}>
                                <span className="m-0">{el.content_preview}</span>
                              </td>
                              <td style={dashboardTrStyle} title={el.date ? el.date.slice(0, 10) : null}>
                                <span className="m-0">{el.date ? el.date.slice(0, 10) : null}</span>
                              </td>
                              {category === 1 && (
                                  <td style={dashboardTrStyle} title={el.start_date ? el.start_date.slice(0, 10) : null}>
                                    <span className="m-0">{el.start_date ? el.start_date.slice(0, 10) : null}</span>
                                  </td>
                              )}
                              {category === 1 && (
                                  <td style={dashboardTrStyle} title={el.end_date ? el.end_date.slice(0, 10) : null}>
                                    <span className="m-0">{el.end_date ? el.end_date.slice(0, 10) : null}</span>
                                  </td>
                              )}
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
                  <PaginationComponent page={page} maxPage={maxPage} url={'/Document/documentStorage/'} />
                </Card>
              </>
          )}
          {isMobile && (
              <>
                <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                  <Button
                      variant="success"
                      size="sm"
                      onClick={handleExcelExport}
                      disabled={excelLoading}
                  >
                    {excelLoading ? '다운로드 중...' : '📥 엑셀 출력'}
                  </Button>
                </div>
                {documentData.map((el, i) => {
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
                            {category === 1 && <Card.Text>완료일 : {el.end_date ? el.end_date.slice(0, 10) : null}</Card.Text>}
                            <Card.Text>{el.content_preview}</Card.Text>
                          </div>
                          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <Button className="label theme-bg text-white f-12" style={{ padding: '5px 10px' }} onClick={() => handleUpdateModal(el.id)}>
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
                <PaginationComponent page={page} maxPage={maxPage} url={'/Document/documentStorage/'} />
              </>
          )}
        </Aux>
    );
  };

  const handleChangeTab = (key) => {
    switch (key) {
      case 'dailyWork':
        setCategory(0);
        break;
      case 'vacation':
        setCategory(1);
        break;
      default:
        setCategory(0);
        break;
    }
  };

  const handleUpdateModal = (id) => {
    setUpdateId(id);
    setUpdateModal({ visible: !updateModal.visible });
  };

  return (
      <Aux>
        <Row>
          <Col md={12} xl={12} className="m-b-30">
            <Tabs defaultActiveKey="dailyWork" id="uncontrolled-tab-example" onSelect={(key) => handleChangeTab(key)}>
              <Tab eventKey="dailyWork" title="업무일지">
                {category === 0 ? DocumentList(data) : null}
              </Tab>
            </Tabs>
          </Col>
        </Row>
        <DocumentUpdateModal visible={updateModal.visible} id={updateId} />
      </Aux>
  );
};

export default DocumentStorage;