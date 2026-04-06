import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Card, Table, Tabs, Tab, Button, Form, Pagination } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { Select, message } from 'antd';
import 'antd/dist/antd.css';
import Aux from '../../hoc/_Aux';
import DocumentCreateModal from './documentCreateModal.js';
import DocumentUpdateModal from './documentUpdateModal.js';
import requestRecordListGet from '../../Axios/Record/requestRecordListGet';
import requestEngineerGet from '../../Axios/Engineer/requestEngineerGet';
import requestExcelExport from '../../Axios/Excel/requestExcelExport';

const { Option } = Select;

const DocumentTable = () => {
  const [data, setData] = useState([]);
  const [createModal, setCreateModal] = useState({ visible: false });
  const [updateModal, setUpdateModal] = useState({ visible: false });
  const [updateId, setUpdateId] = useState();
  const [category, setCategory] = useState(0);
  const [viewType, setViewType] = useState('mine');

  const [engineerList, setEngineerList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasTeamDocs, setHasTeamDocs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);

  const currentUsername = sessionStorage.getItem('username');
  const permission = sessionStorage.getItem('permission');
  const isManager = permission === '2';
  const canExportExcel = ['0', '2', '3'].includes(permission);

  const isDesktop = useMediaQuery({ query: '(min-device-width: 480px)' });
  const isMobile = useMediaQuery({ query: '(max-width: 480px)' });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    requestEngineerGet(true).then((res) => {
      if (res) {
        setEngineerList(res);
      }
    });
  }, []);

  // 데이터 로드
  const fetchData = useCallback((targetPage, currentViewType, currentUserId, dateRange) => {
    setLoading(true);
    const dr = dateRange || {};
    if (startDate && !dr.startDate) dr.startDate = startDate;
    if (endDate && !dr.endDate) dr.endDate = endDate;
    const dateParam = (dr.startDate || dr.endDate) ? dr : undefined;

    requestRecordListGet(
        category, undefined, targetPage, dateParam, currentViewType, currentUserId
    ).then((res) => {
      if (res && res.data) {
        setData(res.data.results || []);
        setMaxPage(res.data.max_page || 1);
        setTotalCount(res.data.count || 0);
        if (res.data.has_team_docs !== undefined) {
          setHasTeamDocs(res.data.has_team_docs);
        }
      } else if (res && Array.isArray(res)) {
        setData(res);
        setMaxPage(1);
        setTotalCount(res.length);
      } else {
        setData([]);
        setMaxPage(1);
        setTotalCount(0);
      }
      setLoading(false);
    }).catch(() => {
      setData([]);
      setLoading(false);
    });
  }, [category, startDate, endDate]);

  useEffect(() => {
    setPage(1);
    setSelectedUserId(null);
    fetchData(1, viewType, null);
  }, [category]);

  useEffect(() => {
    setPage(1);
    setSelectedUserId(null);
    fetchData(1, viewType, null);
  }, [viewType]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > maxPage || newPage === page) return;
    setPage(newPage);
    fetchData(newPage, viewType, selectedUserId);
  };

  const handleEmployeeChange = (userId) => {
    const actualUserId = userId === '' ? null : (userId || null);
    setSelectedUserId(actualUserId);
    setPage(1);
    fetchData(1, viewType, actualUserId);
  };

  // 기간검색
  const handleDateSearch = () => {
    setPage(1);
    fetchData(1, viewType, selectedUserId, { startDate, endDate });
  };

  const handleDateReset = () => {
    setStartDate('');
    setEndDate('');
    setSelectedUserId(null);
    setPage(1);
    requestRecordListGet(category, undefined, 1, undefined, viewType, null)
    .then((res) => {
      if (res && res.data) {
        setData(res.data.results || []);
        setMaxPage(res.data.max_page || 1);
        setTotalCount(res.data.count || 0);
        if (res.data.has_team_docs !== undefined) {
          setHasTeamDocs(res.data.has_team_docs);
        }
      }
    });
  };

  const handleExcelExport = () => {
    setExcelLoading(true);

    let dateData = null;
    if (startDate || endDate) {
      dateData = {};
      if (startDate) dateData.startDate = startDate;
      if (endDate) dateData.endDate = endDate;
    }

    const extraData = {};
    if (selectedUserId) {
      extraData.user_id = selectedUserId;
    }

    requestExcelExport('record', null, dateData, (e) => {
      // 진행률 (선택사항)
    }, extraData)
    .then(() => {
      message.success('업무일지 엑셀 다운로드 완료!');
    })
    .catch(() => {
      message.error('엑셀 다운로드 실패');
    })
    .finally(() => {
      setExcelLoading(false);
    });
  };

  const handleStatusIcon = (status) => {
    switch (status) {
      case 0: return <i className="feather icon-upload text-c-blue f-20 m-r-5" />;
      case 1: return <i className="feather icon-check text-c-green f-20 m-r-5" />;
      case 2: return <i className="feather icon-x text-c-red f-20 m-r-5" />;
      default: return <i className="feather icon-loader text-c-black f-20 m-r-5" />;
    }
  };

  const canViewTeamDocs = hasTeamDocs || isManager;

  // 선택된 직원 이름 표시
  const getSelectedEngineerName = () => {
    if (!selectedUserId) return null;
    const eng = engineerList.find(e => String(e.user_id) === String(selectedUserId));
    return eng ? eng.name : null;
  };

  // 페이지네이션
  const PaginationBar = () => {
    if (maxPage <= 1) return null;
    const items = [];
    let startP, endP;
    if (maxPage <= 5) { startP = 1; endP = maxPage; }
    else if (page <= 3) { startP = 1; endP = 5; }
    else if (page >= maxPage - 2) { startP = maxPage - 4; endP = maxPage; }
    else { startP = page - 2; endP = page + 2; }

    for (let i = startP; i <= endP; i++) {
      items.push(
          <Pagination.Item key={i} active={i === page} onClick={() => handlePageChange(i)}>{i}</Pagination.Item>
      );
    }
    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
          <Pagination>
            <Pagination.First onClick={() => handlePageChange(1)} disabled={page === 1} />
            <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
            {items}
            <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === maxPage} />
            <Pagination.Last onClick={() => handlePageChange(maxPage)} disabled={page === maxPage} />
          </Pagination>
        </div>
    );
  };

  // 문서 목록
  const DocumentList = () => {
    const dashboardTrStyle = {
      textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', textAlign: 'center',
    };
    const showUsernameColumn = viewType === 'team';

    return (
        <Aux>
          {viewType === 'team' && (
              <Card className="mb-3">
                <Card.Body style={{ padding: '15px' }}>
                  <Row style={{ alignItems: 'center' }}>
                    <Col md={4} sm={6} xs={12}>
                      <Form.Label style={{ fontSize: '14px', marginBottom: '5px' }}>직원 선택</Form.Label>
                      <Select
                          showSearch
                          allowClear
                          placeholder="직원을 선택하세요"
                          value={selectedUserId || undefined}
                          onChange={handleEmployeeChange}
                          style={{ width: '100%' }}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                              option.children.toLowerCase().includes(input.toLowerCase())
                          }
                      >
                        <Option key="all" value="">전체</Option>
                        {engineerList.map((eng) => (
                            <Option key={eng.user_id} value={String(eng.user_id)}>
                              {eng.name} ({eng.text_category || ''})
                            </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col md={8} sm={6} xs={12} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', marginTop: isMobile ? '10px' : '0' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {selectedUserId && getSelectedEngineerName()
                        ? `${getSelectedEngineerName()}: `
                        : ''
                    }
                    총 {totalCount}건
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

          {/* mine 탭 건수 */}
          {viewType === 'mine' && (
              <div style={{ textAlign: 'right', marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
              총 {totalCount}건
              {(startDate || endDate) && (
                  <span style={{ fontSize: '13px', color: '#888', marginLeft: '8px' }}>
                  ({startDate || '처음'} ~ {endDate || '현재'})
                </span>
              )}
            </span>
              </div>
          )}

          {/* 기간검색 + 엑셀 출력 (한 줄) */}
          <Row className="mb-3" style={{ alignItems: 'center' }}>
            <Col xs={12} md="auto" className="mb-2 mb-md-0">
              <span style={{ fontWeight: 'bold' }}>기간검색</span>
            </Col>
            <Col xs={5} md="auto" className="mb-2 mb-md-0">
              <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                            style={{ width: isMobile ? '100%' : '170px' }} />
            </Col>
            <Col xs={1} md="auto" className="mb-2 mb-md-0" style={{ textAlign: 'center', padding: '0' }}>~</Col>
            <Col xs={5} md="auto" className="mb-2 mb-md-0">
              <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                            style={{ width: isMobile ? '100%' : '170px' }} />
            </Col>
            <Col xs={12} md="auto">
              <Button variant="primary" size="sm" onClick={handleDateSearch} style={{ marginRight: '5px' }}>검색</Button>
              <Button variant="outline-secondary" size="sm" onClick={handleDateReset} style={{ marginRight: '10px' }}>초기화</Button>
              {/* ★ 엑셀 출력: 현재 화면 조건 그대로 */}
              {canExportExcel && (
                  <Button
                      variant="success"
                      size="sm"
                      onClick={handleExcelExport}
                      disabled={excelLoading}
                  >
                    {excelLoading ? '다운로드 중...' : '📥 엑셀 출력'}
                  </Button>
              )}
            </Col>
          </Row>

          {loading && (
              <div style={{ textAlign: 'center', padding: '20px' }}><span>로딩중...</span></div>
          )}

          {/* 데스크톱 테이블 */}
          {!loading && isDesktop && (
              <>
                <Card className="Recent-Users">
                  <Card.Body className="px-0 py-2">
                    {viewType === 'mine' && (
                        <Button variant="outline-primary" style={{ padding: '5px 10px', float: 'right' }}
                                onClick={() => handleCreateModal()}>문서 생성</Button>
                    )}
                    <Table hover style={{ tableLayout: 'fixed', marginBottom: '0' }}>
                      <thead style={{ textAlign: 'center' }}>
                      <tr>
                        <th style={{ width: '80px' }}>상태</th>
                        {showUsernameColumn && <th style={{ width: '100px' }}>직원명</th>}
                        <th>제목</th>
                        <th>내용</th>
                        <th>부서</th>
                        <th style={{ width: '110px' }}>등록일</th>
                        {category === 1 && <th style={{ width: '110px' }}>시작일</th>}
                        {category === 1 && <th style={{ width: '110px' }}>완료일</th>}
                        <th style={{ width: '80px' }}>Action</th>
                      </tr>
                      </thead>
                      <tbody>
                      {data.map((el, i) => (
                          <tr className="unread" key={i}>
                            <td style={dashboardTrStyle}>{handleStatusIcon(el.status)}</td>
                            {showUsernameColumn && <td style={dashboardTrStyle}>{el.username}</td>}
                            <td style={dashboardTrStyle} title={el.title}><span className="m-0">{el.title}</span></td>
                            <td style={dashboardTrStyle} title={el.content_preview}><span className="m-0">{el.content_preview}</span></td>
                            <td style={dashboardTrStyle} title={el.department}><span className="m-0">{el.department}</span></td>
                            <td style={dashboardTrStyle}><span className="m-0">{el.date ? el.date.slice(0, 10) : null}</span></td>
                            {category === 1 && (
                                <td style={dashboardTrStyle}><span className="m-0">{el.start_date ? el.start_date.slice(0, 10) : null}</span></td>
                            )}
                            {category === 1 && (
                                <td style={dashboardTrStyle}><span className="m-0">{el.end_date ? el.end_date.slice(0, 10) : null}</span></td>
                            )}
                            <td style={dashboardTrStyle}>
                              <Button className="label theme-bg text-white f-12" style={{ padding: '5px 10px' }}
                                      onClick={() => handleUpdateModal(el.id)}>조회</Button>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </Table>
                    <PaginationBar />
                  </Card.Body>
                </Card>
              </>
          )}

          {/* 모바일 카드 */}
          {!loading && isMobile && (
              <>
                {viewType === 'mine' && (
                    <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                      <Button variant="outline-primary" style={{ padding: '5px 10px' }} onClick={() => handleCreateModal()}>
                        문서 생성
                      </Button>
                    </div>
                )}
                {data.map((el, i) => (
                    <Card key={i} className="mb-2">
                      <Card.Body>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span>{el.category}</span>
                          {handleStatusIcon(el.status)}
                        </div>
                        <div>
                          {showUsernameColumn && <Card.Text><strong>직원명:</strong> {el.username}</Card.Text>}
                          <Card.Text><strong>제목:</strong> {el.title}</Card.Text>
                          {el.content_preview && <Card.Text><strong>내용:</strong> {el.content_preview}</Card.Text>}
                          <Card.Text><strong>부서:</strong> {el.department}</Card.Text>
                          <Card.Text><strong>등록일:</strong> {el.date ? el.date.slice(0, 10) : null}</Card.Text>
                          {category === 1 && <Card.Text><strong>완료일:</strong> {el.end_date ? el.end_date.slice(0, 10) : null}</Card.Text>}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                          <Button className="label theme-bg text-white f-12" style={{ padding: '5px 10px' }}
                                  onClick={() => handleUpdateModal(el.id)}>조회</Button>
                        </div>
                      </Card.Body>
                    </Card>
                ))}
                <PaginationBar />
                <p style={{ textAlign: 'center', margin: '5px 10px 5px 0' }}>
                  <i className="feather icon-upload text-c-blue f-14 m-r-5" />= 제출완료
                </p>
                <p style={{ textAlign: 'center', margin: '5px 10px 5px 0' }}>
                  <i className="feather icon-check text-c-green f-14 m-r-5" />= 승인,{'  '}
                  <i className="feather icon-x text-c-red f-14 m-r-5" />= 반려
                </p>
              </>
          )}

          {!loading && data.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>등록된 문서가 없습니다.</div>
          )}
        </Aux>
    );
  };

  const handleViewTypeChange = (key) => {
    setViewType(key);
    setSelectedUserId(null);
  };

  const handleCreateModal = () => { setCreateModal({ visible: !createModal.visible }); };
  const handleUpdateModal = (id) => { setUpdateId(id); setUpdateModal({ visible: !updateModal.visible }); };

  return (
      <Aux>
        <Row>
          <Col md={12} xl={12} className="m-b-30">
            <Tabs activeKey={viewType} id="document-view-tabs"
                  onSelect={(key) => handleViewTypeChange(key)} className="mb-3">
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