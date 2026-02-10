import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import '../../assets/css/react-contextmenu.css';
import Aux from '../../hoc/_Aux';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import 'tui-pagination/dist/tui-pagination.css';
import 'antd/dist/antd.css';
import cloneDeep from 'lodash/cloneDeep';
import notNull from '../../App/components/notNull.js';
import CustomerUpdateModal from './customerUpdateModal';
import requestAllCustomerGet from '../../Axios/Customer/requestAllCustomerGet';
import customerTableGridColumns from './customerTableGridColumns';
import PaginationComponent from '../../App/components/PaginationComponent';
import { parseInt } from 'lodash';
import DynamicProgress from '../../App/components/DynamicProgress';
import { Modal } from 'antd';
import { Tooltip } from 'antd';
import requestExcelPermissionCheck from '../../Axios/Excel/requestExcelPermissionCheck';

const CustomerTable = ({ match }) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' });
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const [state, setState] = useState({ visible: false });
  const [data, setData] = useState([]);
  const [rowData, setRowData] = useState({});
  const [gridColumns, setGridColumns] = useState([]);
  const [contextMenuText, setContextMenuText] = useState('확대');
  const page = parseInt(match.params.page);
  const [maxPage, setMaxPage] = useState();
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);

  const [memoPopup, setMemoPopup] = useState({ visible: false, content: '', x: 0, y: 0 });
  const [memoModal, setMemoModal] = useState({ visible: false, content: '', title: '' });

  const openMemoModal = (name, memo) => {
    setMemoModal({ visible: true, content: memo, title: name });
  };

  const [excelPermission, setExcelPermission] = useState(false);

  useEffect(() => {
    requestAllCustomerGet(page).then((res) => {
      let { results } = res;
      setMaxPage(res.max_page);
      results = notNull(results);
      setData(results);
    });
  }, [page]);

  useEffect(() => {
    let dummyColumns = cloneDeep(customerTableGridColumns);

    for (const i in dummyColumns) {
      dummyColumns[i].minWidth = 100;
      dummyColumns[i].ellipsis = true;
    }

    setGridColumns(dummyColumns);
  }, []);

  useEffect(() => {
    requestExcelPermissionCheck().then((res) => {
      setExcelPermission(res.can_export_customer);
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
      dummyColumns = cloneDeep(customerTableGridColumns);

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

  const handleCellClick = (e) => {
    if (e.columnName === 'memo' && e.rowKey !== undefined) {
      const memo = data[e.rowKey]?.memo;
      if (memo) {
        setMemoPopup({
          visible: true,
          content: memo,
          x: e.nativeEvent.clientX,
          y: e.nativeEvent.clientY,
        });
      }
    }
  };

  return (
      <>
        {memoPopup.visible && (
            <div
                style={{
                  position: 'fixed',
                  left: memoPopup.x,
                  top: memoPopup.y,
                  backgroundColor: '#333',
                  color: '#fff',
                  padding: '15px',
                  borderRadius: '8px',
                  maxWidth: '400px',
                  maxHeight: '300px',
                  overflow: 'auto',
                  zIndex: 9999,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  whiteSpace: 'pre-wrap',
                  fontSize: '14px',
                }}
                onClick={() => setMemoPopup({ ...memoPopup, visible: false })}
            >
              <div style={{ marginBottom: '10px', fontWeight: 'bold', borderBottom: '1px solid #555', paddingBottom: '5px' }}>
                📝 메모 (클릭하면 닫힘)
              </div>
              {memoPopup.content}
            </div>
        )}

        <Modal
            title={`📝 ${memoModal.title} 메모`}
            visible={memoModal.visible}
            onCancel={() => setMemoModal({ ...memoModal, visible: false })}
            footer={[
              <Button key="close" variant="secondary" onClick={() => setMemoModal({ ...memoModal, visible: false })}>
                닫기
              </Button>
            ]}
            bodyStyle={{ maxHeight: '60vh', overflow: 'auto' }}
            zIndex={1050}
        >
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6' }}>
            {memoModal.content}
          </div>
        </Modal>

        {isDesktop && (
            <>
              <div style={{ marginBottom: '10px', textAlign: 'right' }}>
                <Button variant="success" size="sm" onClick={() => downloadModalProcessing(true)}>
                  📥 엑셀 출력
                </Button>
              </div>

              <ContextMenuTrigger id="customerTableContextMenu">
                <div className="customerTableContextMenuDiv">
                  <Grid
                      data={data}
                      scrollX={true}
                      scrollY={false}
                      columns={gridColumns}
                      contextMenu={null}
                      rowHeight={25}
                      bodyHeight="auto"
                      columnOptions={{ resizable: true }}
                      selectionUnit="cell"
                      onDblclick={(e) => {
                        if (e.targetType !== 'etc') updateModal(e.rowKey);
                      }}
                      onClick={(e) => {
                        handleCellClick(e);

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
              <ContextMenu id="customerTableContextMenu">
                <MenuItem onClick={() => handleContextMenu()}>전체 열 {contextMenuText}</MenuItem>
                {excelPermission ? (
                    <MenuItem onClick={() => downloadModalProcessing(true)}>엑셀 출력</MenuItem>
                ) : (
                    <MenuItem disabled>엑셀 출력 (권한 없음)</MenuItem>
                )}
              </ContextMenu>
              <DynamicProgress visible={downloadModalVisible} type={'customer'} downloadModalProcessing={downloadModalProcessing} />
              <PaginationComponent page={page} maxPage={maxPage} url={'/Customer/customerTable/'} />
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
                            <Card.Title as="h5">{el.name}</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <div style={{ display: 'block' }}>
                              {el.tel !== '' && <Card.Text>Tel : {el.tel}</Card.Text>}
                              {el.phone !== '' && <Card.Text>Phone : {el.phone}</Card.Text>}
                              {el.address !== '' && <Card.Text>주소 : {el.address}</Card.Text>}
                            </div>
                            {el.memo !== '' && (
                                <div
                                    style={{
                                      marginTop: '10px',
                                      padding: '12px',
                                      backgroundColor: '#f8f9fa',
                                      borderRadius: '8px',
                                      border: '1px solid #e9ecef',
                                    }}
                                >
                                  <strong style={{ fontSize: '12px', color: '#6c757d', display: 'block', marginBottom: '5px' }}>
                                    메모
                                  </strong>
                                  <div
                                      style={{
                                        fontSize: '15px',
                                        lineHeight: '1.6',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        color: '#212529',
                                      }}
                                  >
                                    {el.memo}
                                  </div>
                                </div>
                            )}
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