import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import '../../assets/css/react-contextmenu.css';
import Aux from '../../hoc/_Aux';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import 'tui-pagination/dist/tui-pagination.css';
import { message } from 'antd';
import 'antd/dist/antd.css';
import cloneDeep from 'lodash/cloneDeep';
import notNull from '../../App/components/notNull.js';
import setComma from '../../App/components/setComma.js';
import CollectionPaymentUpdateModal from './CollectionPayment/collectionPaymentUpdateModal';
import IncomeOutcomeUpdateModal from './IncomeOutcome/incomeOutcomeUpdateModal';
import requestAllTradeGet from '../../Axios/Trade/requestAllTradeGet';
import accountingTableGridColumns from './accountingTableGridColumns';
import AccountingCalcModal from '../../App/components/Modal/accountingCalcModal';
import { parseInt } from 'lodash';
import PaginationComponent from '../../App/components/PaginationComponent';
// ⭐ 변경: SelectDateExcelExportModal 대신 DynamicProgress 직접 사용
import DynamicProgress from '../../App/components/DynamicProgress';
import requestExcelPermissionCheck from '../../Axios/Excel/requestExcelPermissionCheck';

const AccountingTable = ({ match }) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' });
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const [colPayVisible, setColPayVisible] = useState(false);
  const [ioVisible, setIoVisible] = useState(false);
  const [accountingCalcVisible, setAccountingCalcVisible] = useState(false);
  const [data, setData] = useState([]);
  const [colPayId, setColPayId] = useState();
  const [ioId, setIoId] = useState();
  const gridRef = React.createRef();
  const history = useHistory();
  const [gridColumns, setGridColumns] = useState([]);
  const [contextMenuText, setContextMenuText] = useState('확대');
  const page = parseInt(match.params.page);
  const [maxPage, setMaxPage] = useState();
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [excelPermission, setExcelPermission] = useState(false);

  useEffect(() => {
    requestAllTradeGet(page, 'accounting').then((res) => {
      setMaxPage(res.max_page);
      let results = notNull(res.results);
      setData(results);
    });
  }, [page]);

  useEffect(() => {
    let dummyColumns = cloneDeep(accountingTableGridColumns);
    for (const i in dummyColumns) {
      dummyColumns[i].minWidth = 100;
      dummyColumns[i].ellipsis = true;
    }
    setGridColumns(dummyColumns);
  }, []);

  useEffect(() => {
    requestExcelPermissionCheck().then((res) => {
      setExcelPermission(res.can_export_accounting);
    });
  }, []);

  const moveTradePage = (id, customer_id, category_name1) => {
    window.sessionStorage.setItem('customerId', customer_id);

    switch (category_name1) {
      case 'AS':
        history.push(`/Trade/As/asUpdate/${id}`);
        break;
      case '수금':
      case '지불':
        setColPayId(id);
        setColPayVisible(!colPayVisible);
        break;
      case '수입':
      case '지출':
        setIoId(id);
        setIoVisible(!ioVisible);
        break;
      case '판매':
      case '구매':
        history.push(`/Trade/BuySale/buySaleUpdate/${id}`);
        break;
      case '납품':
        history.push(`/Trade/Delivery/deliveryUpdate/${id}`);
        break;
      default:
        break;
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
      dummyColumns = cloneDeep(accountingTableGridColumns);
      for (const i in dummyColumns) {
        dummyColumns[i].minWidth = 100;
        dummyColumns[i].ellipsis = true;
      }
      setContextMenuText('확대');
    }
    setGridColumns(dummyColumns);
  };

  const handleAccountingCalc = () => {
    setAccountingCalcVisible(!accountingCalcVisible);
  };

  // ⭐ 변경: 함수 이름 변경
  const downloadModalProcessing = (isVisible) => {
    setDownloadModalVisible(isVisible);
  };

  return (
      <>
        {isDesktop && (
            <>
              <div style={{ marginBottom: '10px', textAlign: 'right' }}>
                {/* ⭐ 변경: 함수 호출 변경 */}
                <Button variant="success" size="sm" onClick={() => downloadModalProcessing(true)}>
                  📥 엑셀 출력
                </Button>
              </div>

              <ContextMenuTrigger id="accountingTableContextMenu">
                <div className="accountingTableContextMenuDiv">
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
                      onDblclick={(e) => {
                        if (e.targetType !== 'etc') {
                          let rowData = gridRef.current.getInstance().getRow(e.rowKey);
                          moveTradePage(rowData.id, rowData.customer_id, rowData.category_name1);
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
              <ContextMenu id="accountingTableContextMenu">
                <MenuItem onClick={() => handleContextMenu()}>전체 열 {contextMenuText}</MenuItem>
                <MenuItem onClick={() => handleAccountingCalc()}>손익 계산</MenuItem>
                {excelPermission ? (
                    // ⭐ 변경: 함수 호출 변경
                    <MenuItem onClick={() => downloadModalProcessing(true)}>엑셀 출력</MenuItem>
                ) : (
                    <MenuItem disabled>엑셀 출력 (권한 없음)</MenuItem>
                )}
              </ContextMenu>
              <AccountingCalcModal visible={accountingCalcVisible} />
              {/* ⭐ 변경: SelectDateExcelExportModal → DynamicProgress */}
              <DynamicProgress
                  visible={downloadModalVisible}
                  type={'accounting'}
                  downloadModalProcessing={downloadModalProcessing}
              />
              <PaginationComponent page={page} maxPage={maxPage} url={'/Trade/accountingTable/'} />
            </>
        )}
        {isMobile && (
            <Aux>
              <Row>
                <Col md={12} xl={12} className="m-b-30">
                  {data.map((el, i) => {
                    return (
                        <Card className="Recent-Users" key={i}>
                          <Card.Header>
                            <Card.Title as="h5">
                              {el.register_date.slice(0, 10)} {el.category_name1}
                            </Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <div style={{ display: 'block' }}>
                              {el.content !== '' && <Card.Text>거래내역 : {el.content}</Card.Text>}
                              {el.completed_content !== '' && <Card.Text>완료내역 : {el.completed_content}</Card.Text>}
                              {(el.category_name1 === '수금' || el.category_name1 === '수입') && <Card.Text>수입금액 : {setComma(el.in_price)}</Card.Text>}
                              {(el.category_name1 === '지불' || el.category_name1 === '지출') && <Card.Text>지출금액 : {setComma(el.out_price)}</Card.Text>}
                              {(el.category_name1 === '수금' ||
                                  el.category_name1 === '수입' ||
                                  el.category_name1 === '지불' ||
                                  el.category_name1 === '지출') && <Card.Text>결제금액 : {setComma(el.total_price)}</Card.Text>}
                              {(el.category_name1 === '판매' ||
                                  el.category_name1 === '구매' ||
                                  el.category_name1 === 'AS' ||
                                  el.category_name1 === '납품') && <Card.Text>공급가 : {setComma(el.supply_price)}</Card.Text>}
                              {(el.category_name1 === '판매' ||
                                  el.category_name1 === '구매' ||
                                  el.category_name1 === 'AS' ||
                                  el.category_name1 === '납품') && <Card.Text>부가세 : {setComma(el.tax_price)}</Card.Text>}
                              {el.memo !== '' && <Card.Text>메모 : {el.memo}</Card.Text>}
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                              <Button
                                  variant="primary"
                                  size="sm"
                                  style={{ borderRadius: '15px' }}
                                  onClick={() => moveTradePage(el.id, el.customer_id, el.category_name1)}
                              >
                                이동
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                    );
                  })}
                  <PaginationComponent page={page} maxPage={maxPage} url={'/Trade/accountingTable/'} />
                </Col>
              </Row>
            </Aux>
        )}
        <CollectionPaymentUpdateModal visible={colPayVisible} id={colPayId} />
        <IncomeOutcomeUpdateModal visible={ioVisible} id={ioId} />
      </>
  );
};

export default AccountingTable;
