import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Tabs, Tab, Button } from 'react-bootstrap';
import { message } from 'antd';
import { useMediaQuery } from 'react-responsive';
import Aux from '../../hoc/_Aux';
import DocumentUpdateModal from './documentUpdateModal.js';
import requestRecordListGet from '../../Axios/Record/requestRecordListGet';
import PaginationComponent from '../../App/components/PaginationComponent';
import { parseInt } from 'lodash';
import DynamicProgress from '../../App/components/DynamicProgress';

const DocumentStorage = ({ match }) => {
  const [data, setData] = useState([]); //Document Data
  const [updateModal, setUpdateModal] = useState({ visible: false }); // Update Modal Visible
  const [updateId, setUpdateId] = useState(); // 조회할 문서 ID
  const [category, setCategory] = useState(0); // 탭 변경될 때마다 바뀌는 업무일지, 휴가신청 번호. 0 = 업무일지, 1 = 휴가신청
  const page = parseInt(match.params.page);
  const [maxPage, setMaxPage] = useState();
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);

  const isDesktop = useMediaQuery({ query: '(min-device-width: 480px)' }); // DeviceWidth > 480
  const isMobile = useMediaQuery({ query: '(max-width: 480px)' }); // DeviceWidth < 480

  // requestDocumentGet이 변경될 때마다 실행
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

  // Status에 따라서 상태 아이콘 변경, status 0=제출, 1=승인, 2=반려. 해당없음은 console.log
  const handleStatusIcon = (status) => {
    switch (status) {
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

  // Tab 변경에 따른 문서 리스트
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
                <Button variant="outline-primary" style={{ padding: '5px 10px', float: 'right' }} onClick={() => downloadModalProcessing(true)}>
                  엑셀출력
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
                          <td style={dashboardTrStyle} title={el.content}>
                            <span className="m-0">{el.content}</span>
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
              {/* <DynamicProgress visible={downloadModalVisible} type={'record'} downloadModalProcessing={downloadModalProcessing} /> */}
              <DynamicProgress visible={downloadModalVisible} type={'deliver'} downloadModalProcessing={downloadModalProcessing} />
              <PaginationComponent page={page} maxPage={maxPage} url={'/Document/documentStorage/'} />
            </Card>
          </>
        )}
        {isMobile && (
          <>
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
                      <Card.Text>{el.content}</Card.Text>
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

  // Tab 바뀔때마다 Category 값 변경
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

  const downloadModalProcessing = (isVisible) => {
    setDownloadModalVisible(isVisible);
  };

  return (
    <Aux>
      <Row>
        <Col md={12} xl={12} className="m-b-30">
          <Tabs defaultActiveKey="dailyWork" id="uncontrolled-tab-example" onSelect={(key) => handleChangeTab(key)}>
            <Tab eventKey="dailyWork" title="업무일지">
              {category === 0 ? DocumentList(data) : null}
            </Tab>
            {/* <Tab eventKey="vacation" title="휴가신청">
              {category === 1 ? DocumentList(data) : null}
            </Tab> */}
          </Tabs>
        </Col>
      </Row>
      <DocumentUpdateModal visible={updateModal.visible} id={updateId} />
    </Aux>
  );
};

export default DocumentStorage;
