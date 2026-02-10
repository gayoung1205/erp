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
import { message } from 'antd';
import 'antd/dist/antd.css';
import axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import CheckToken from '../../App/components/checkToken';
import notNull from '../../App/components/notNull.js';
import config from '../../config.js';
import setComma from '../../App/components/setComma.js';
import CustomerUpdateModal from '../Customer/customerUpdateModal';
import receivableTableGridColumns from './receivableTableGridColumns';
import DynamicProgress from '../../App/components/DynamicProgress';
import requestExcelPermissionCheck from '../../Axios/Excel/requestExcelPermissionCheck';

const CustomerTable = (props) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' });
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const history = useHistory();

  let token = sessionStorage.getItem('token');
  let { type } = props.match.params;

  const [state, setState] = useState({ visible: false });
  const [data, setData] = useState([]);
  const [rowData, setRowData] = useState({});
  const [totalReceivable, setTotalReceivable] = useState();
  const [gridColumns, setGridColumns] = useState([]);
  const [contextMenuText, setContextMenuText] = useState('확대');
  const [excelPermission, setExcelPermission] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [overdueCount, setOverdueCount] = useState(0);

  const isOverdue = (lastReceivableDate) => {
    if (!lastReceivableDate) return false;

    const lastDate = new Date(lastReceivableDate);
    const today = new Date();
    const diffTime = today - lastDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 7;
  };

  const getDaysOverdue = (lastReceivableDate) => {
    if (!lastReceivableDate) return 0;
    const lastDate = new Date(lastReceivableDate);
    const today = new Date();
    const diffTime = today - lastDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const permission = window.sessionStorage.getItem('permission');
    if (!(permission === '0' || permission === '2' || permission === '3')) {
      message.error('권한이 없습니다.');
      history.goBack();
    }
    let url = type === 'plus' ? `?receivable=1` : `?receivable=0`;

    axios({
      url: `${config.backEndServerAddress}api/customers${url}`,
      method: 'GET',
      headers: { Authorization: `JWT ${token}` },
    })
        .then((res) => {
          let { results } = res.data.data;
          results = notNull(results);

          let count = 0;
          results.forEach(item => {
            if (isOverdue(item.last_receivable_date)) {
              count++;
              const days = getDaysOverdue(item.last_receivable_date);
              item._attributes = {
                className: {
                  row: [days >= 14 ? 'overdue-row-severe' : 'overdue-row']
                }
              };
            }
          });
          setOverdueCount(count);

          if (isMobile) {
            let total = 0;
            for (const i in results) {
              total += results[i].receivable;
            }
            setTotalReceivable(total);
          }

          setData(results);
        })
        .catch((err) => CheckToken(err));
  }, [token, type]);

  useEffect(() => {
    let dummyColumns = cloneDeep(receivableTableGridColumns);
    for (const i in dummyColumns) {
      dummyColumns[i].minWidth = 100;
      dummyColumns[i].ellipsis = true;
    }
    setGridColumns(dummyColumns);
  }, []);

  useEffect(() => {
    requestExcelPermissionCheck().then((res) => {
      setExcelPermission(res.can_export_receivable);
    });
  }, []);

  const updateModal = (rowKey) => {
    if (rowKey === undefined) return null;
    setRowData(data[rowKey]);
    setState({ visible: !state.visible });
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
      dummyColumns = cloneDeep(receivableTableGridColumns);
      for (const i in dummyColumns) {
        dummyColumns[i].minWidth = 100;
        dummyColumns[i].ellipsis = true;
      }
      setContextMenuText('확대');
    }
    setGridColumns(dummyColumns);
  };

  const downloadModalProcessing = (isVisible) => {
    setDownloadModalVisible(isVisible);
  };

  const receivableType = type === 'plus' ? 'receivable' : 'receivable_minus';

  return (
      <>
        {isDesktop && (
            <>
              {overdueCount > 0 && (
                  <Alert variant="danger" style={{ margin: '0 15px 15px 15px' }}>
                    ⚠️ <strong>1주일 이상 경과된 미수금이 {overdueCount}건 있습니다!</strong>
                    <span style={{ marginLeft: '10px', fontSize: '12px' }}>
              (연한 빨강: 1주일 경과 / 진한 빨강: 2주일 이상)
            </span>
                  </Alert>
              )}

              <div style={{ marginBottom: '10px', textAlign: 'right', paddingRight: '15px' }}>
                <Button
                    variant="success"
                    size="sm"
                    onClick={() => downloadModalProcessing(true)}
                    disabled={!excelPermission}
                >
                  {excelPermission ? '📥 엑셀 출력 (전체)' : '📥 엑셀 출력 (권한 없음)'}
                </Button>
              </div>

              <ContextMenuTrigger id="receivableTableContextMenu">
                <div className="receivableTableContextMenuDiv">
                  <Grid
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
                        if (e.targetType !== 'etc') updateModal(e.rowKey);
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
                      summary={{
                        height: 40,
                        position: 'top',
                        columnContent: {
                          receivable: {
                            template: function (val) {
                              return `TOTAL = ${setComma(val.sum)}`;
                            },
                          },
                        },
                      }}
                  />
                </div>
              </ContextMenuTrigger>
              <ContextMenu id="receivableTableContextMenu">
                <MenuItem onClick={() => handleContextMenu()}>전체 열 {contextMenuText}</MenuItem>
                {excelPermission ? (
                    <MenuItem onClick={() => downloadModalProcessing(true)}>엑셀 출력</MenuItem>
                ) : (
                    <MenuItem disabled>엑셀 출력 (권한 없음)</MenuItem>
                )}
              </ContextMenu>
              <DynamicProgress
                  visible={downloadModalVisible}
                  type={receivableType}
                  downloadModalProcessing={downloadModalProcessing}
              />
            </>
        )}
        {isMobile && (
            <Aux>
              <Row>
                <Col md={12} xl={12} className="m-b-30">
                  <Card className="Recent-Users">
                    <Card.Header>
                      <Card.Title as="h5">
                        총{type === 'plus' ? '미수' : '지불'}금액 : {setComma(totalReceivable)}
                      </Card.Title>
                    </Card.Header>
                  </Card>
                  {overdueCount > 0 && (
                      <Alert variant="danger" style={{ marginBottom: '10px' }}>
                        ⚠️ 1주일 이상 경과: <strong>{overdueCount}건</strong>
                      </Alert>
                  )}
                  {data.map((el, i) => {
                    const overdue = isOverdue(el.last_receivable_date);
                    const days = getDaysOverdue(el.last_receivable_date);
                    return (
                        <Card
                            className="Recent-Users"
                            key={i}
                            style={overdue ? { borderLeft: '4px solid #dc3545', backgroundColor: '#fff5f5' } : {}}
                        >
                          <Card.Header>
                            <Card.Title as="h5">
                              {el.name}
                              {overdue && (
                                  <span style={{
                                    marginLeft: '10px',
                                    padding: '2px 8px',
                                    backgroundColor: days >= 14 ? '#c62828' : '#dc3545',
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
                              {el.tel !== '' && el.tel !== ' ' && <Card.Text>Tel : {el.tel}</Card.Text>}
                              {el.phone !== '' && el.phone !== ' ' && <Card.Text>Phone : {el.phone}</Card.Text>}
                              <Card.Text>총미수금 : {setComma(el.receivable)}</Card.Text>
                              {el.last_receivable_date && (
                                  <Card.Text style={{ color: overdue ? '#dc3545' : 'inherit' }}>
                                    마지막 거래일 : {el.last_receivable_date.slice(0, 10)}
                                  </Card.Text>
                              )}
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                              <Button variant="primary" size="sm" style={{ borderRadius: '15px' }} onClick={() => updateModal(i)}>
                                수정
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                    );
                  })}
                </Col>
              </Row>
            </Aux>
        )}
        <CustomerUpdateModal visible={state.visible} data={rowData} />
      </>
  );
};

export default CustomerTable;