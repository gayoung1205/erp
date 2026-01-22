import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { isEmptyObject } from 'jquery';
import { useMediaQuery } from 'react-responsive';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import '../../assets/css/react-contextmenu.css';
import Aux from '../../hoc/_Aux';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import 'tui-pagination/dist/tui-pagination.css';
import { message, Modal } from 'antd';  // ⭐ Modal 추가
import 'antd/dist/antd.css';
import cloneDeep from 'lodash/cloneDeep';
import notNull from '../../App/components/notNull.js';
import CustomerUpdateModal from '../Customer/customerUpdateModal';
import requestSearchTableGet from '../../Axios/Search/requestSearchTableGet';
import searchCustomerTableGridColumns from './searchCustomerTableGridColumns';

const SearchCustomerTable = (props) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' });
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const [state, setState] = useState({ visible: false });
  const [data, setData] = useState([]);
  const [rowData, setRowData] = useState({});
  const [gridColumns, setGridColumns] = useState([]);
  const [contextMenuText, setContextMenuText] = useState('확대');
  // ⭐ 메모 모달용 state 추가
  const [memoModal, setMemoModal] = useState({ visible: false, content: '', title: '' });

  useEffect(() => {
    requestSearchTableGet(props).then((res) => {
      if (isEmptyObject(res)) {
        message.warning('검색내용이 없습니다.');
        props.handleCancel();
        return null;
      } else {
        res = notNull(res);
        setData(res);
      }
    });
  }, [props.count]);

  useEffect(() => {
    let dummyColumns = cloneDeep(searchCustomerTableGridColumns);

    for (const i in dummyColumns) {
      dummyColumns[i].minWidth = 100;
      dummyColumns[i].ellipsis = true;
    }

    setGridColumns(dummyColumns);
  }, []);

  const updateModal = (rowKey) => {
    if (rowKey === undefined) return null;
    setRowData(data[rowKey]);
    setState({ visible: !state.visible });
    setData([]);
    props.handleCancel();
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
      dummyColumns = cloneDeep(searchCustomerTableGridColumns);

      for (const i in dummyColumns) {
        dummyColumns[i].minWidth = 100;
        dummyColumns[i].ellipsis = true;
      }

      setContextMenuText('확대');
    }

    setGridColumns(dummyColumns);
  };

  // ⭐ 메모 모달 열기
  const openMemoModal = (name, memo) => {
    setMemoModal({ visible: true, content: memo, title: name });
  };

  return (
      <>
        {/* ⭐ 메모 전체보기 모달 */}
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
            zIndex={1050}  // ⭐ 검색 모달보다 위에 표시
        >
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6' }}>
            {memoModal.content}
          </div>
        </Modal>

        {isDesktop && (
            <>
              <ContextMenuTrigger id="searchCustomerTableContextMenu">
                <div className="searchCustomerTableContextMenuDiv">
                  <Grid
                      data={data}
                      scrollX={true}
                      scrollY={true}
                      columns={gridColumns}
                      rowHeight={25}
                      bodyHeight="auto"
                      columnOptions={{ resizable: true }}
                      selectionUnit="cell"
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
                      pageOptions={{
                        useClient: true,
                        perPage: 30,
                        type: 'pagination',
                      }}
                  />
                </div>
              </ContextMenuTrigger>
              <ContextMenu id="searchCustomerTableContextMenu">
                <MenuItem onClick={() => handleContextMenu()}>전체 열 {contextMenuText}</MenuItem>
              </ContextMenu>
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
                              {(el.tel !== '' || el.phone !== '') && (
                                  <Card.Text>
                                    {el.tel !== '' && `Tel : ${el.tel}`}
                                    {el.tel !== '' && el.phone !== '' && ' / '}
                                    {el.phone !== '' && `Phone : ${el.phone}`}
                                  </Card.Text>
                              )}
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

export default SearchCustomerTable;