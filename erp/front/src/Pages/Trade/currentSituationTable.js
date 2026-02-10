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
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  let { type } = match.params;
  const [data, setData] = useState([]);
  const gridRef = React.createRef();
  const history = useHistory();
  const [gridColumns, setGridColumns] = useState([]);
  const [contextMenuText, setContextMenuText] = useState('확대');
  const page = parseInt(match.params.page);
  const [maxPage, setMaxPage] = useState();
  const [excelLoading, setExcelLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [excelPermission, setExcelPermission] = useState(false);
  const [overdueCount, setOverdueCount] = useState(0);
  const [excelModalVisible, setExcelModalVisible] = useState(false);
  const [downloadType, setDownloadType] = useState('range');
  const [dateRange, setDateRange] = useState(null);

  const statusButtons = [
    { label: '전체', value: 'all' },
    { label: '접수', value: '0' },
    { label: '진행', value: '2' },
    { label: '완료', value: '1' },
    { label: '취소', value: '3' },
  ];

  const isOverdue = (registerDate, category2) => {
    if (category2 === 1 || category2 === 3) return false;
    const regDate = new Date(registerDate);
    const today = new Date();
    const diffTime = today - regDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 7;
  };

  const getDaysOverdue = (registerDate) => {
    const regDate = new Date(registerDate);
    const today = new Date();
    const diffTime = today - regDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const filter = statusFilter === 'all' ? null : statusFilter;
    requestCurrentSituationTradeGet(page, type, false, filter).then((res) => {
      setMaxPage(res.max_page);
      let results = notNull(res.results);

      let count = 0;
      results.forEach(item => {
        if (isOverdue(item.register_date, item.category_2)) {
          count++;
          const days = getDaysOverdue(item.register_date);
          item._attributes = {
            className: {
              row: [days >= 14 ? 'overdue-row-severe' : 'overdue-row']
            }
          };
        }
      });
      setOverdueCount(count);
      setData(results);
    });
  }, [type, page, statusFilter]);

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    if (page !== 1) {
      history.push(`/Trade/currentSituationTable/${type}/1`);
    }
  };

  useEffect(() => {
    let dummyColumns = cloneDeep(currentSituationTableGridColumns);
    for (const i in dummyColumns) {
      dummyColumns[i].minWidth = 100;
      dummyColumns[i].ellipsis = true;
    }
    setGridColumns(dummyColumns);
  }, []);

  useEffect(() => {
    requestExcelPermissionCheck().then((res) => {
      setExcelPermission(res.can_export_trade);
    });
  }, []);

  const moveTradePage = (id, customer_id) => {
    window.sessionStorage.setItem('customerId', customer_id);
    type === 'delivery' ? history.push(`/Trade/Delivery/deliveryUpdate/${id}`) : history.push(`/Trade/As/asUpdate/${id}`);
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
      dummyColumns = cloneDeep(currentSituationTableGridColumns);
      for (const i in dummyColumns) {
        dummyColumns[i].minWidth = 100;
        dummyColumns[i].ellipsis = true;
      }
      setContextMenuText('확대');
    }
    setGridColumns(dummyColumns);
  };

  const openExcelModal = () => {
    setExcelModalVisible(true);
    setDownloadType('range');
    setDateRange(null);
  };

  const closeExcelModal = () => {
    setExcelModalVisible(false);
    setDateRange(null);
    setDownloadType('range');
  };

  const exportToExcel = async () => {
    setExcelModalVisible(false);
    setExcelLoading(true);
    message.loading('데이터를 가져오는 중...', 0);

    try {
      const filter = statusFilter === 'all' ? null : statusFilter;
      const res = await requestCurrentSituationTradeGet(1, type, true, filter);
      let allData = notNull(res.results);

      if (downloadType === 'range' && dateRange && dateRange.length === 2) {
        const startDate = dateRange[0].format('YYYY-MM-DD');
        const endDate = dateRange[1].format('YYYY-MM-DD');

        allData = allData.filter(item => {
          const regDate = item.register_date ? item.register_date.slice(0, 10) : '';
          return regDate >= startDate && regDate <= endDate;
        });
      }

      const exportData = allData.map(item => ({
        '등록일': item.register_date ? item.register_date.slice(0, 10) : '',
        '고객명': item.customer_name || '',
        '담당자': item.engineer_name || '',
        '내용': item.content || '',
        '증상': item.symptom || '',
        '상태': item.category_name2 || '',
        '방문일': item.visit_date ? item.visit_date.slice(0, 10) : '',
        '완료일': item.complete_date ? item.complete_date.slice(0, 10) : '',
        '내부처리': item.internal_process_count > 0
            ? `${item.internal_process_count}건${item.internal_process_engineers ? ` (${item.internal_process_engineers})` : ''}`
            : '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
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
      default: return 'AS현황';
    }
  };

  const quickRanges = {
    '오늘': [moment(), moment()],
    '이번 주': [moment().startOf('week'), moment().endOf('week')],
    '이번 달': [moment().startOf('month'), moment().endOf('month')],
    '지난 달': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    '최근 3개월': [moment().subtract(3, 'month'), moment()],
    '올해': [moment().startOf('year'), moment()],
  };

  return (
      <>
        <Modal
            title={`${getTypeTitle()} 엑셀 다운로드`}
            visible={excelModalVisible}
            onOk={exportToExcel}
            onCancel={closeExcelModal}
            okText="다운로드"
            cancelText="취소"
            okButtonProps={{
              disabled: downloadType === 'range' && (!dateRange || dateRange.length !== 2)
            }}
            centered
        >
          <Radio.Group
              value={downloadType}
              onChange={(e) => setDownloadType(e.target.value)}
              style={{ marginBottom: '20px' }}
          >
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

        {isDesktop && (
            <Aux>
              <Row>
                <Col>
                  <Card>
                    <Card.Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Card.Title as="h5" style={{ marginBottom: 0 }}>{getTypeTitle()}</Card.Title>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {type === 'as' && (
                            <div>
                              {statusButtons.map((btn) => (
                                  <Button
                                      key={btn.value}
                                      variant={statusFilter === btn.value ? 'primary' : 'outline-primary'}
                                      size="sm"
                                      style={{ marginRight: '4px' }}
                                      onClick={() => handleStatusFilter(btn.value)}
                                  >
                                    {btn.label}
                                  </Button>
                              ))}
                            </div>
                        )}
                        {excelPermission && (
                            <Button
                                variant="success"
                                size="sm"
                                onClick={openExcelModal}
                                disabled={excelLoading}
                            >
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
                      <ContextMenuTrigger id="currentSituationTableContextMenu">
                        <div className="currentSituationTableContextMenuDiv">
                          <Grid
                              ref={gridRef}
                              data={data}
                              scrollX={true}
                              scrollY={true}
                              columns={gridColumns}
                              rowHeight={25}
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
                                if (e.targetType === 'columnHeader' && e.nativeEvent.target.className.indexOf('tui-grid-cell-header') !== -1) {
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
                              }}
                          />
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenu id="currentSituationTableContextMenu">
                        <MenuItem onClick={() => handleContextMenu()}>전체 열 {contextMenuText}</MenuItem>
                        {excelPermission && (
                            <MenuItem onClick={openExcelModal}>엑셀 출력</MenuItem>
                        )}
                      </ContextMenu>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <PaginationComponent page={page} maxPage={maxPage} url={`/Trade/currentSituationTable/${type}/`} />
            </Aux>
        )}
        {isMobile && (
            <Aux>
              <Row>
                <Col md={12} xl={12} className="m-b-30">
                  <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    {type === 'as' && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {statusButtons.map((btn) => (
                              <Button
                                  key={btn.value}
                                  variant={statusFilter === btn.value ? 'primary' : 'outline-primary'}
                                  size="sm"
                                  onClick={() => handleStatusFilter(btn.value)}
                              >
                                {btn.label}
                              </Button>
                          ))}
                        </div>
                    )}
                    {excelPermission && (
                        <Button
                            variant="success"
                            size="sm"
                            onClick={openExcelModal}
                            disabled={excelLoading}
                        >
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
                    const days = getDaysOverdue(el.register_date);
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
                                  <span style={{
                                    marginLeft: '10px',
                                    padding: '2px 8px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    borderRadius: '10px',
                                    fontSize: '12px'
                                  }}>
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