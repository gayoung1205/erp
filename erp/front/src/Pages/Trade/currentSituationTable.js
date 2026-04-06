import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import '../../assets/css/react-contextmenu.css';
import '../../assets/css/overdue-style.css';
import Aux from '../../hoc/_Aux';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import 'tui-pagination/dist/tui-pagination.css';
import cloneDeep from 'lodash/cloneDeep';
import notNull from '../../App/components/notNull.js';
import currentSituationTableGridColumns from './currentSituationTableGridColumns';
import constructionSituationTableGridColumns from './constructionSituationTableGridColumns';
import requestCurrentSituationTradeGet from '../../Axios/Trade/requestCurrnetSituationTradeGet';
import PaginationComponent from '../../App/components/PaginationComponent';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { message, Modal, Radio, Space, DatePicker } from 'antd';
import moment from 'moment';
import requestExcelPermissionCheck from '../../Axios/Excel/requestExcelPermissionCheck';

const { RangePicker } = DatePicker;

const CurrentSituationTable = ({ match }) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' });
  const isMobile  = useMediaQuery({ query: '(max-width: 768px)' });
  let { type } = match.params;
  const [data, setData]               = useState([]);
  const gridRef                       = React.createRef();
  const history                       = useHistory();
  const [gridColumns, setGridColumns] = useState([]);
  const [contextMenuText, setContextMenuText] = useState('확대');
  const page                          = parseInt(match.params.page);
  const [maxPage, setMaxPage]         = useState();
  const [excelLoading, setExcelLoading] = useState(false);
  const [statusFilters, setStatusFilters] = useState(['all']);
  const [excelPermission, setExcelPermission]   = useState(false);
  const [overdueCount, setOverdueCount]         = useState(0);
  const [excelModalVisible, setExcelModalVisible] = useState(false);
  const [downloadType, setDownloadType]         = useState('range');
  const [dateRange, setDateRange]               = useState(null);
  const [searchDateRange, setSearchDateRange] = useState(null);
  const [ordering, setOrdering] = useState(null);

  const statusButtons = [
    { label: '전체', value: 'all' },
    { label: '접수', value: '0'   },
    { label: '진행', value: '2'   },
    { label: '완료', value: '1'   },
    { label: '취소', value: '3'   },
  ];

  useEffect(() => {
    setData([]);
    setStatusFilters(['all']);
    setOverdueCount(0);
    setMaxPage(undefined);
    setSearchDateRange(null);
    setOrdering(null);
  }, [type]);

  const isOverdue = (registerDate, category2) => {
    if (category2 === 1 || category2 === 3) return false;
    const diffDays = Math.ceil((new Date() - new Date(registerDate)) / (1000 * 60 * 60 * 24));
    return diffDays >= 7;
  };

  const getDaysOverdue = (registerDate) => {
    return Math.ceil((new Date() - new Date(registerDate)) / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    let cancelled = false;

    let startDate = null;
    let endDate = null;
    if (searchDateRange && searchDateRange.length === 2) {
      startDate = searchDateRange[0].format('YYYY-MM-DD');
      endDate = searchDateRange[1].format('YYYY-MM-DD');
    }

    requestCurrentSituationTradeGet(page, type, false, statusFilters, startDate, endDate, ordering).then((res) => {
      if (cancelled || !res) return;
      setMaxPage(res.max_page);
      let results = notNull(res.results);

      let count = 0;
      results.forEach((item) => {
        if (isOverdue(item.register_date, item.category_2)) {
          count++;
          const days = getDaysOverdue(item.register_date);
          item._attributes = {
            className: { row: [days >= 14 ? 'overdue-row-severe' : 'overdue-row'] },
          };
        }
      });
      setOverdueCount(count);
      setData(results);
    });

    return () => { cancelled = true; };
  }, [type, page, statusFilters, searchDateRange, ordering]);

  const handleStatusFilter = (value) => {
    let next;

    if (value === 'all') {
      // 전체 클릭 → 전체만 선택
      next = ['all'];
    } else {
      // 개별 클릭
      const without = statusFilters.filter((v) => v !== 'all' && v !== value);
      const isAlreadySelected = statusFilters.includes(value);

      if (isAlreadySelected) {
        next = without.length === 0 ? ['all'] : without;
      } else {
        next = [...without, value];
      }
    }

    setStatusFilters(next);
    if (page !== 1) history.push(`/Trade/currentSituationTable/${type}/1`);
  };

  const handleSearchDateChange = (dates) => {
    setSearchDateRange(dates);
    if (page !== 1) history.push(`/Trade/currentSituationTable/${type}/1`);
  };

  const handleResetSearch = () => {
    setSearchDateRange(null);
    setOrdering(null);
    if (page !== 1) history.push(`/Trade/currentSituationTable/${type}/1`);
  };

  const handleSortColumn = (columnName) => {
    const sortableColumns = ['register_date', 'visit_date', 'complete_date', 'category_name2'];
    if (!sortableColumns.includes(columnName)) return false;

    const serverField = columnName === 'category_name2' ? 'category_2' : columnName;

    let newOrdering;

    if (serverField === 'category_2') {
      const statusCycle = ['category_2_0', 'category_2_2', 'category_2_1', 'category_2_3'];
      const currentIndex = statusCycle.indexOf(ordering);
      if (currentIndex === -1) {
        newOrdering = statusCycle[0];
      } else {
        newOrdering = statusCycle[(currentIndex + 1) % statusCycle.length];
      }
    } else {
      if (ordering === `-${serverField}`) {
        newOrdering = serverField;
      } else {
        newOrdering = `-${serverField}`;
      }
    }

    setOrdering(newOrdering);
    if (page !== 1) history.push(`/Trade/currentSituationTable/${type}/1`);
    return true;
  };

  const getSortLabel = () => {
    if (!ordering) return null;
    const labels = {
      '-register_date': '등록일 ↓', 'register_date': '등록일 ↑',
      '-visit_date': '방문일 ↓', 'visit_date': '방문일 ↑',
      '-complete_date': '완료일 ↓', 'complete_date': '완료일 ↑',
    };
    return labels[ordering] || null;
  };

  useEffect(() => {
    const baseColumns = type === 'construction'
        ? cloneDeep(constructionSituationTableGridColumns)
        : cloneDeep(currentSituationTableGridColumns);
    for (const i in baseColumns) {
      if (baseColumns[i].name === 'participants_names') {
        baseColumns[i].width = 200;
        baseColumns[i].minWidth = 80;
        baseColumns[i].ellipsis = false;
      } else {
        baseColumns[i].minWidth = 100;
        baseColumns[i].ellipsis = true;
      }
    }
    setGridColumns(baseColumns);
  }, [type]);

  useEffect(() => {
    requestExcelPermissionCheck().then((res) => {
      setExcelPermission(res.can_export_trade);
    });
  }, []);

  const moveTradePage = (id, customer_id) => {
    window.sessionStorage.setItem('customerId', customer_id);
    if (type === 'delivery') {
      history.push(`/Trade/Delivery/deliveryUpdate/${id}`);
    } else if (type === 'construction') {
      history.push(`/Trade/Construction/constructionUpdate/${id}`);
    } else {
      history.push(`/Trade/As/asUpdate/${id}`);
    }
  };

  const handleContextMenu = () => {
    let dummyColumns;
    if (contextMenuText === '확대') {
      dummyColumns = gridColumns.slice();
      for (const i in dummyColumns) {
        dummyColumns[i].width = 'auto';
        dummyColumns[i].ellipsis = false;
      }
      setContextMenuText('축소');
    } else {
      const base = type === 'construction'
          ? cloneDeep(constructionSituationTableGridColumns)
          : cloneDeep(currentSituationTableGridColumns);
      for (const i in base) {
        if (base[i].name === 'participants_names') {
          base[i].width = 200;
          base[i].minWidth = 80;
          base[i].ellipsis = false;
        } else {
          base[i].minWidth = 100;
          base[i].ellipsis = true;
        }
      }
      dummyColumns = base;
      setContextMenuText('확대');
    }
    setGridColumns(dummyColumns);
  };

  const openExcelModal  = () => { setExcelModalVisible(true);  setDownloadType('range'); setDateRange(null); };
  const closeExcelModal = () => { setExcelModalVisible(false); setDateRange(null);       setDownloadType('range'); };

  const exportToExcel = async () => {
    setExcelModalVisible(false);
    setExcelLoading(true);
    message.loading('데이터를 가져오는 중...', 0);

    try {
      let startDate = null;
      let endDate   = null;
      if (downloadType === 'range' && dateRange && dateRange.length === 2) {
        startDate = dateRange[0].format('YYYY-MM-DD');
        endDate   = dateRange[1].format('YYYY-MM-DD');
      }

      const res = await requestCurrentSituationTradeGet(
          1, type, true, statusFilters, startDate, endDate, ordering
      );
      const allData = notNull(res.results);

      const exportData = allData.map((item) => ({
        '등록일': item.register_date ? item.register_date.slice(0, 10) : '',
        '고객명': item.customer_name || '',
        '담당자': item.engineer_name || '',
        '내용':   item.content || '',
        '증상':   item.symptom || '',
        '상태':   item.category_name2 || '',
        '방문일': item.visit_date    ? item.visit_date.slice(0, 10)    : '',
        '완료일': item.complete_date ? item.complete_date.slice(0, 10) : '',
        '내부처리': item.internal_process_count > 0
            ? `${item.internal_process_count}건${item.internal_process_engineers ? ` (${item.internal_process_engineers})` : ''}`
            : '',
        '내부처리 내용': item.internal_process_contents || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook  = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const typeText = type === 'delivery' ? '납품현황' : type === 'myas' ? 'MY_AS' : 'AS현황';
      const fileName = `${typeText}_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);

      message.destroy();
      message.success(`${allData.length}건 다운로드 완료!`);
    } catch (error) {
      message.destroy();
      message.error('엑셀 다운로드 실패');
      console.error(error);
    } finally {
      setExcelLoading(false);
      setDateRange(null);
      setDownloadType('range');
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'delivery': return '납품현황';
      case 'myas': return 'MY AS';
      case 'construction': return '공사현황';
      default: return 'AS현황';
    }
  };

  const quickRanges = {
    '오늘':      [moment(), moment()],
    '이번 주':   [moment().startOf('week'),  moment().endOf('week')],
    '이번 달':   [moment().startOf('month'), moment().endOf('month')],
    '지난 달':   [moment().subtract(1,'month').startOf('month'), moment().subtract(1,'month').endOf('month')],
    '최근 3개월':[moment().subtract(3,'month'), moment()],
    '올해':      [moment().startOf('year'),  moment()],
  };

  const FilterButtons = () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {statusButtons.map((btn) => {
          const isActive =
              btn.value === 'all'
                  ? statusFilters.includes('all')
                  : statusFilters.includes(btn.value);
          return (
              <Button
                  key={btn.value}
                  variant={isActive ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => handleStatusFilter(btn.value)}
              >
                {btn.label}
              </Button>
          );
        })}
      </div>
  );

  return (
      <>
        {/* 엑셀 다운로드 모달 */}
        <Modal
            title={`${getTypeTitle()} 엑셀 다운로드`}
            visible={excelModalVisible}
            onOk={exportToExcel}
            onCancel={closeExcelModal}
            okText="다운로드"
            cancelText="취소"
            okButtonProps={{ disabled: downloadType === 'range' && (!dateRange || dateRange.length !== 2) }}
            centered
        >
          <Radio.Group value={downloadType} onChange={(e) => setDownloadType(e.target.value)} style={{ marginBottom: '20px' }}>
            <Space direction="vertical">
              <Radio value="range">기간 선택</Radio>
              <Radio value="all">전체 (오래 걸릴 수 있음)</Radio>
            </Space>
          </Radio.Group>

          {downloadType === 'range' && (
              <RangePicker
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  ranges={quickRanges}
                  placeholder={['시작일', '종료일']}
              />
          )}
          {downloadType === 'all' && (
              <div style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
                ⚠️ 전체 데이터는 시간이 오래 걸릴 수 있습니다.
              </div>
          )}
        </Modal>

        {/* ===== 데스크톱 ===== */}
        {isDesktop && (
            <Aux>
              <Row>
                <Col>
                  <Card>
                    <Card.Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <Card.Title as="h5" style={{ marginBottom: 0 }}>{getTypeTitle()}</Card.Title>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {/* ★ [추가] 기간 검색 */}
                        <RangePicker
                            value={searchDateRange}
                            onChange={handleSearchDateChange}
                            format="YYYY-MM-DD"
                            ranges={quickRanges}
                            placeholder={['시작일', '종료일']}
                            size="small"
                            style={{ width: '280px' }}
                        />
                        {(searchDateRange || ordering) && (
                            <Button variant="outline-secondary" size="sm" onClick={handleResetSearch}>
                              초기화
                            </Button>
                        )}
                        {/* ★ 3탭 모두 필터 버튼 표시 */}
                        <FilterButtons />
                        {excelPermission && (
                            <Button variant="success" size="sm" onClick={openExcelModal} disabled={excelLoading}>
                              {excelLoading ? '다운로드 중...' : '📥 엑셀 출력'}
                            </Button>
                        )}
                      </div>
                    </Card.Header>
                    <Card.Body>
                      {overdueCount > 0 && (
                          <Alert variant="warning" style={{ marginBottom: '15px' }}>
                            ⚠️ <strong>1주일 이상 미처리 건이 {overdueCount}건 있습니다!</strong>
                          </Alert>
                      )}
                      {/* ★ [추가] 현재 검색/정렬 상태 표시 */}
                      {(searchDateRange || ordering) && (
                          <div style={{ marginBottom: '10px', fontSize: '13px', color: '#666' }}>
                            {searchDateRange && searchDateRange.length === 2 && (
                                <span style={{ marginRight: '15px' }}>
                                  📅 {searchDateRange[0].format('YYYY-MM-DD')} ~ {searchDateRange[1].format('YYYY-MM-DD')}
                                </span>
                            )}
                            {getSortLabel() && (
                                <span>🔽 정렬: {getSortLabel()}</span>
                            )}
                          </div>
                      )}
                      <ContextMenuTrigger id="currentSituationTableContextMenu">
                        <div className="currentSituationTableContextMenuDiv">
                          <Grid
                              ref={gridRef}
                              data={data}
                              scrollX={true}
                              scrollY={true}
                              columns={gridColumns}
                              rowHeight={'auto'}
                              bodyHeight="auto"
                              columnOptions={{ resizable: true }}
                              selectionUnit="cell"
                              contextMenu={null}
                              rowHeaders={['rowNum']}
                              onDblclick={(e) => {
                                if (e.targetType !== 'etc') {
                                  let rowData = gridRef.current.getInstance().getRow(e.rowKey);
                                  moveTradePage(rowData.id, rowData.customer_id);
                                }
                              }}
                              onClick={(e) => {
                                if (e.targetType === 'columnHeader') {
                                  const handled = handleSortColumn(e.columnName);
                                  if (handled) {
                                    try { gridRef.current.getInstance().unsort(); } catch (err) {}
                                    return;
                                  }

                                  if (e.nativeEvent.target.className.indexOf('tui-grid-cell-header') !== -1) {
                                    for (const i in gridColumns) {
                                      if (gridColumns[i].name === e.columnName) {
                                        if (gridColumns[i].width === undefined) {
                                          gridColumns[i].width = 'auto';
                                          gridColumns[i].ellipsis = false;
                                        } else {
                                          delete gridColumns[i].width;
                                          gridColumns[i].ellipsis = true;
                                        }
                                        setGridColumns([...gridColumns]);
                                      }
                                    }
                                  }
                                }
                              }}
                          />
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenu id="currentSituationTableContextMenu">
                        <MenuItem onClick={() => handleContextMenu()}>전체 열 {contextMenuText}</MenuItem>
                        {excelPermission && <MenuItem onClick={openExcelModal}>엑셀 출력</MenuItem>}
                      </ContextMenu>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <PaginationComponent page={page} maxPage={maxPage} url={`/Trade/currentSituationTable/${type}/`} />
            </Aux>
        )}

        {/* ===== 모바일 ===== */}
        {isMobile && (
            <Aux>
              <Row>
                <Col md={12} xl={12} className="m-b-30">
                  <div style={{ marginBottom: '8px' }}>
                    <RangePicker
                        value={searchDateRange}
                        onChange={handleSearchDateChange}
                        format="YYYY-MM-DD"
                        ranges={quickRanges}
                        placeholder={['시작일', '종료일']}
                        size="small"
                        style={{ width: '100%' }}
                    />
                  </div>
                  {(searchDateRange || ordering) && (
                      <div style={{ marginBottom: '8px' }}>
                        <Button variant="outline-secondary" size="sm" onClick={handleResetSearch}>
                          초기화
                        </Button>
                        {getSortLabel() && (
                            <span style={{ marginLeft: '10px', fontSize: '13px', color: '#666' }}>
                              🔽 정렬: {getSortLabel()}
                            </span>
                        )}
                      </div>
                  )}
                  <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <FilterButtons />
                    {excelPermission && (
                        <Button variant="success" size="sm" onClick={openExcelModal} disabled={excelLoading}>
                          {excelLoading ? '다운로드 중...' : '📥 엑셀 출력'}
                        </Button>
                    )}
                  </div>
                  {overdueCount > 0 && (
                      <Alert variant="warning" style={{ marginBottom: '10px' }}>
                        ⚠️ 1주일 이상 미처리: <strong>{overdueCount}건</strong>
                      </Alert>
                  )}
                  {data.map((el, i) => {
                    const overdue = isOverdue(el.register_date, el.category_2);
                    const days    = getDaysOverdue(el.register_date);
                    return (
                        <Card
                            className="Recent-Users"
                            key={i}
                            onClick={() => moveTradePage(el.id, el.customer_id)}
                            style={overdue ? { borderLeft: '4px solid #dc3545', backgroundColor: '#fff5f5' } : {}}
                        >
                          <Card.Header>
                            <Card.Title as="h5">
                              {el.customer_name}
                              {overdue && (
                                  <span style={{ marginLeft: '10px', padding: '2px 8px', backgroundColor: '#dc3545', color: 'white', borderRadius: '10px', fontSize: '12px' }}>
                            {days}일 경과
                          </span>
                              )}
                            </Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <div style={{ display: 'block' }}>
                              <Card.Text>등록일 : {el.register_date ? el.register_date.slice(0, 10) : ''}</Card.Text>
                              <Card.Text>담당자 : {el.engineer_name}</Card.Text>
                              <Card.Text>내용 : {el.content}</Card.Text>
                              <Card.Text>상태 : {el.category_name2}</Card.Text>
                              {el.internal_process_count > 0 && (
                                  <Card.Text style={{ color: '#e65100', fontWeight: 'bold' }}>
                                    🔧 내부처리 : {el.internal_process_count}건
                                    {el.internal_process_engineers ? ` (${el.internal_process_engineers})` : ''}
                                  </Card.Text>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                    );
                  })}
                  <PaginationComponent page={page} maxPage={maxPage} url={`/Trade/currentSituationTable/${type}/`} />
                </Col>
              </Row>
            </Aux>
        )}
      </>
  );
};

export default CurrentSituationTable;