import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Tabs, Tab, Button, Form } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import Aux from '../../hoc/_Aux';
import DocumentCreateModal from './documentCreateModal.js';
import DocumentUpdateModal from './documentUpdateModal.js';
import requestRecordListGet from '../../Axios/Record/requestRecordListGet';

const DocumentTable = () => {
  const [data, setData] = useState([]); // 표시할 데이터
  const [allData, setAllData] = useState([]); // 전체 데이터
  const [createModal, setCreateModal] = useState({ visible: false });
  const [updateModal, setUpdateModal] = useState({ visible: false });
  const [updateId, setUpdateId] = useState();
  const [category, setCategory] = useState(0);
  const [viewType, setViewType] = useState('mine');

  const [searchName, setSearchName] = useState('');

  const currentUsername = sessionStorage.getItem('username');
  const permission = sessionStorage.getItem('permission');
  const isManager = permission === '2';

  const isDesktop = useMediaQuery({ query: '(min-device-width: 480px)' });
  const isMobile = useMediaQuery({ query: '(max-width: 480px)' });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDateSearch = () => {
    const dateRange = {};
    if (startDate) dateRange.startDate = startDate;
    if (endDate) dateRange.endDate = endDate;

    requestRecordListGet(category, undefined, undefined, dateRange).then((res) => {
      const allRecords = res?.data || res || [];
      const sortedData = [...allRecords].sort((a, b) =>
          new Date(b.date || 0) - new Date(a.date || 0)
      );
      setAllData(sortedData);
      if (searchName) {
        setData(sortedData.filter(item => item.username?.includes(searchName)));
      } else {
        setData(sortedData);
      }
    });
  };

  const handleDateReset = () => {
    setStartDate('');
    setEndDate('');
    requestRecordListGet(category).then((res) => {
      const allRecords = res?.data || res || [];
      const sortedData = [...allRecords].sort((a, b) =>
          new Date(b.date || 0) - new Date(a.date || 0)
      );
      setAllData(sortedData);
      if (searchName) {
        setData(sortedData.filter(item => item.username?.includes(searchName)));
      } else {
        setData(sortedData);
      }
    });
  };

  useEffect(() => {
    requestRecordListGet(category).then((res) => {
      if (res) {
        const sortedData = [...res].sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          return dateB - dateA;
        });
        setAllData(sortedData);
        setSearchName('');
      }
    });
  }, [category]);

  useEffect(() => {
    let filtered = [...allData];

    if (viewType === 'mine') {
      filtered = filtered.filter(item => item.username === currentUsername);
    } else {
      filtered = filtered.filter(item => item.username !== currentUsername);

      if (searchName !== '') {
        filtered = filtered.filter(item =>
            item.username && item.username.toLowerCase().includes(searchName.toLowerCase())
        );
      }
    }

    setData(filtered);
  }, [viewType, searchName, allData, currentUsername]);

  // Status 아이콘
  const handleStatusIcon = (status) => {
    switch (status) {
      case 0:
        return <i className="feather icon-upload text-c-blue f-20 m-r-5" />;
      case 1:
        return <i className="feather icon-check text-c-green f-20 m-r-5" />;
      case 2:
        return <i className="feather icon-x text-c-red f-20 m-r-5" />;
      default:
        return <i className="feather icon-loader text-c-black f-20 m-r-5" />;
    }
  };

  const handleReset = () => {
    setSearchName('');
  };

  const canViewTeamDocs = allData.some(item => item.username !== currentUsername);

  const DocumentList = () => {
    const dashboardTrStyle = {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textAlign: 'center',
    };

    const showUsernameColumn = viewType === 'team';

    return (
        <Aux>
          {viewType === 'team' && (
              <Card className="mb-3">
                <Card.Body style={{ padding: '15px' }}>
                  <Row>
                    <Col md={4} sm={6} xs={12}>
                      <Form.Group style={{ marginBottom: '0' }}>
                        <Form.Label style={{ fontSize: '14px', marginBottom: '5px' }}>직원명 검색</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="직원 이름을 입력하세요"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2} sm={6} xs={12} style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <Button
                          variant="outline-secondary"
                          onClick={handleReset}
                          style={{ marginTop: isMobile ? '10px' : '0' }}
                      >
                        초기화
                      </Button>
                    </Col>
                    <Col md={6} sm={12} xs={12} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    총 {data.length}건
                                      {(startDate || endDate) && (
                                          <span style={{ fontSize: '13px', color: '#888', marginLeft: '8px' }}>
                        ({startDate || '처음'} ~ {endDate || '현재'})
                      </span>
                                      )}
                  </span>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
          )}

          <Row className="mb-3" style={{ alignItems: 'center' }}>
            <Col xs={12} md="auto" className="mb-2 mb-md-0">
              <span style={{ fontWeight: 'bold' }}>기간검색</span>
            </Col>
            <Col xs={5} md="auto" className="mb-2 mb-md-0">
              <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: isMobile ? '100%' : '170px' }}
              />
            </Col>
            <Col xs={1} md="auto" className="mb-2 mb-md-0" style={{ textAlign: 'center', padding: '0' }}>
              ~
            </Col>
            <Col xs={5} md="auto" className="mb-2 mb-md-0">
              <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: isMobile ? '100%' : '170px' }}
              />
            </Col>
            <Col xs={12} md="auto">
              <Button variant="primary" size="sm" onClick={handleDateSearch} style={{ marginRight: '5px' }}>
                기간검색
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={handleDateReset}>
                초기화
              </Button>
            </Col>
          </Row>

          {isDesktop && (
              <>
                <Card className="Recent-Users">
                  <Card.Body className="px-0 py-2">
                    {viewType === 'mine' && (
                        <Button
                            variant="outline-primary"
                            style={{ padding: '5px 10px', float: 'right' }}
                            onClick={() => handleCreateModal()}
                        >
                          문서 생성
                        </Button>
                    )}
                    <Table hover style={{ tableLayout: 'fixed', marginBottom: '0' }}>
                      <thead style={{ textAlign: 'center' }}>
                      <tr>
                        <th style={{ width: '80px' }}>상태</th>
                        {showUsernameColumn && <th style={{ width: '100px' }}>직원명</th>}
                        <th>제목</th>
                        <th>내용</th>
                        <th style={{ width: '110px' }}>등록일</th>
                        {category === 1 && <th style={{ width: '110px' }}>시작일</th>}
                        {category === 1 && <th style={{ width: '110px' }}>완료일</th>}
                        <th style={{ width: '80px' }}>Action</th>
                      </tr>
                      </thead>
                      <tbody>
                      {data.map((el, i) => {
                        return (
                            <tr className="unread" key={i}>
                              <td style={dashboardTrStyle}>{handleStatusIcon(el.status)}</td>
                              {showUsernameColumn && <td style={dashboardTrStyle}>{el.username}</td>}
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
                  </Card.Body>
                </Card>
              </>
          )}

          {isMobile && (
              <>
                {viewType === 'mine' && (
                    <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                      <Button variant="outline-primary" style={{ padding: '5px 10px' }} onClick={() => handleCreateModal()}>
                        문서 생성
                      </Button>
                    </div>
                )}
                {data.map((el, i) => {
                  return (
                      <Card key={i} className="mb-2">
                        <Card.Body>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span>{el.category}</span>
                            {handleStatusIcon(el.status)}
                          </div>
                          <div>
                            {/* ★ 직원명 표시 - 직원 문서 탭에서만 */}
                            {showUsernameColumn && <Card.Text><strong>직원명:</strong> {el.username}</Card.Text>}
                            <Card.Text><strong>제목:</strong> {el.title}</Card.Text>
                            <Card.Text><strong>등록일:</strong> {el.date ? el.date.slice(0, 10) : null}</Card.Text>
                            {category === 1 && <Card.Text><strong>완료일:</strong> {el.end_date ? el.end_date.slice(0, 10) : null}</Card.Text>}
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
        </Aux>
    );
  };

  const handleViewTypeChange = (key) => {
    setViewType(key);
    setSearchName('');
  };

  const handleCreateModal = () => {
    setCreateModal({ visible: !createModal.visible });
  };

  const handleUpdateModal = (id) => {
    setUpdateId(id);
    setUpdateModal({ visible: !updateModal.visible });
  };

  return (
      <Aux>
        <Row>
          <Col md={12} xl={12} className="m-b-30">
            <Tabs
                activeKey={viewType}
                id="document-view-tabs"
                onSelect={(key) => handleViewTypeChange(key)}
                className="mb-3"
            >
              <Tab eventKey="mine" title="내 업무일지">
                {viewType === 'mine' ? DocumentList() : null}
              </Tab>
              {canViewTeamDocs && (
                  <Tab eventKey="team" title="직원 업무일지">
                    {viewType === 'team' ? DocumentList() : null}
                  </Tab>
              )}
            </Tabs>
          </Col>
        </Row>
        <DocumentCreateModal visible={createModal.visible} />
        <DocumentUpdateModal visible={updateModal.visible} id={updateId} />
      </Aux>
  );
};

export default DocumentTable;