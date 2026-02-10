import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import '../../assets/css/react-contextmenu.css';
import Aux from '../../hoc/_Aux';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import cloneDeep from 'lodash/cloneDeep';
import notNull from '../../App/components/notNull.js';
import ProductUpdateModal from './productUpdateModal';
import requestProductGet from '../../Axios/Product/requestProductGet';
import productTableGridColumns from './productTableGridColumns';
import PaginationComponent from '../../App/components/PaginationComponent';
import { parseInt } from 'lodash';
import ExportProductData from '../../App/components/exportProductData';
import DynamicProgress from '../../App/components/DynamicProgress';
import requestExcelPermissionCheck from '../../Axios/Excel/requestExcelPermissionCheck';

const ProductTable = ({ match }) => {
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
  const [excelPermission, setExcelPermission] = useState(false);

  useEffect(() => {
    requestProductGet(page).then((res) => {
      setMaxPage(res.max_page);
      setData(notNull(res.results));
    });
  }, [page]);

  useEffect(() => {
    let dummyColumns = cloneDeep(productTableGridColumns);
    for (const i in dummyColumns) {
      dummyColumns[i].minWidth = 100;
      dummyColumns[i].ellipsis = true;
    }
    setGridColumns(dummyColumns);
  }, []);

  useEffect(() => {
    requestExcelPermissionCheck().then((res) => {
      setExcelPermission(res.can_export_product);
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
      dummyColumns = cloneDeep(productTableGridColumns);
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

  return (
      <>
        {isDesktop && (
            <>
              <div style={{ marginBottom: '10px', textAlign: 'right' }}>
                <Button variant="success" size="sm" onClick={() => downloadModalProcessing(true)}>
                  📥 엑셀 출력
                </Button>
              </div>

              <ContextMenuTrigger id="productTableContextMenu">
                <div className="productTableContextMenuDiv">
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
                  />
                </div>
              </ContextMenuTrigger>
              <ContextMenu id="productTableContextMenu">
                <MenuItem onClick={() => handleContextMenu()}>전체 열 {contextMenuText}</MenuItem>
                {excelPermission ? (
                    <MenuItem onClick={() => downloadModalProcessing(true)}>엑셀 출력</MenuItem>
                ) : (
                    <MenuItem disabled>엑셀 출력 (권한 없음)</MenuItem>
                )}
              </ContextMenu>
              <DynamicProgress visible={downloadModalVisible} type={'product'} downloadModalProcessing={downloadModalProcessing} />
              <PaginationComponent page={page} maxPage={maxPage} url={'/Product/productTable/'} />
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
                              <Card.Text>
                                제품분류 : {el.category} / 제조사 : {el.supplier}
                              </Card.Text>
                              <Card.Text>
                                보관장소 : {el.container} / 주매입처 : {el.purchase}
                              </Card.Text>
                              <Card.Text>재고량 : {el.stock}</Card.Text>
                              <Card.Text>{el.memo}</Card.Text>
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
                  <PaginationComponent page={page} maxPage={maxPage} url={'/Product/productTable/'} />
                </Col>
              </Row>
            </Aux>
        )}
        <ProductUpdateModal visible={state.visible} data={rowData} />
      </>
  );
};

export default ProductTable;