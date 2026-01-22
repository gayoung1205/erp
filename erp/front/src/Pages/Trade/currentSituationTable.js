import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
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
import { message } from 'antd';

const CurrentSituationTable = ({ match }) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' });
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  let { type } = match.params;
  const [data, setData] = useState([]);
  const gridRef = React.createRef();
  const history = useHistory();
  const [gridColumns, setGridColumns] = useState([]);
  const page = parseInt(match.params.page);
  const [maxPage, setMaxPage] = useState();
  const [excelLoading, setExcelLoading] = useState(false);  // ⭐ 엑셀 로딩 상태

  useEffect(() => {
    requestCurrentSituationTradeGet(page, type).then((res) => {
      setMaxPage(res.max_page);
      let results = notNull(res.results);
      setData(results);
    });
  }, [type, page]);

  useEffect(() => {
    let dummyColumns = cloneDeep(currentSituationTableGridColumns);
    for (const i in dummyColumns) {
      dummyColumns[i].minWidth = 100;
      dummyColumns[i].ellipsis = true;
    }
    setGridColumns(dummyColumns);
  }, []);

  const moveTradePage = (id, customer_id) => {
    window.sessionStorage.setItem('customerId', customer_id);
    type === 'delivery' ? history.push(`/Trade/Delivery/deliveryUpdate/${id}`) : history.push(`/Trade/As/asUpdate/${id}`);
  };

  // ⭐ 엑셀 출력 (전체 데이터)
  const exportAllToExcel = async () => {
    setExcelLoading(true);
    message.loading('전체 데이터를 가져오는 중...', 0);

    try {
      // 전체 데이터 가져오기
      const res = await requestCurrentSituationTradeGet(1, type, true);
      const allData = notNull(res.results);

      const exportData = allData.map(item => ({
        '등록일': item.register_date ? item.register_date.slice(0, 10) : '',
        '구분1': item.category_name1 || '',
        '거래내역/접수내용': item.content || '',
        '수입금액': item.in_price || 0,
        '지출금액': item.out_price || 0,
        '결제금액': item.total_price || 0,
        '공급가액': item.supply_price || 0,
        '부가세': item.tax_price || 0,
        '현금결제': item.cash || 0,
        '카드결제': item.credit || 0,
        '은행입금': item.bank || 0,
        '메모': item.memo || '',
        '등록자ID': item.register_id || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      const typeName = type === 'delivery' ? '납품현황' : type === 'myas' ? 'MY_AS' : 'AS현황';

      XLSX.utils.book_append_sheet(workbook, worksheet, typeName);
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `${typeName}_전체.xlsx`);

      message.destroy();
      message.success(`총 ${allData.length}건 엑셀 출력 완료!`);
    } catch (err) {
      message.destroy();
      message.error('엑셀 출력 중 오류가 발생했습니다.');
    }

    setExcelLoading(false);
  };

  return (
      <>
        {isDesktop && (
            <>
              {/* ⭐ 엑셀 출력 버튼 */}
              <div style={{ marginBottom: '10px', textAlign: 'right' }}>
                <Button variant="success" size="sm" onClick={exportAllToExcel} disabled={excelLoading}>
                  {excelLoading ? '로딩중...' : '📥 엑셀 출력 (전체)'}
                </Button>
              </div>

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
              <PaginationComponent page={page} maxPage={maxPage} url={`/Trade/currentSituationTable/${type}/`} />
            </>
        )}
        {isMobile && (
            <Aux>
              <Row>
                <Col md={12} xl={12} className="m-b-30">
                  <div style={{ marginBottom: '10px', textAlign: 'right' }}>
                    <Button variant="success" size="sm" onClick={exportAllToExcel} disabled={excelLoading}>
                      {excelLoading ? '로딩중...' : '📥 엑셀 출력 (전체)'}
                    </Button>
                  </div>
                  {data.map((el, i) => {
                    return (
                        <Card className="Recent-Users" key={i}>
                          <Card.Header>
                            <Card.Title as="h5">
                              {el.customer_name} ({el.category_name2})
                            </Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <div style={{ display: 'block' }}>
                              {el.tel !== '' && el.tel !== ' ' && <Card.Text>Tel : {el.tel}</Card.Text>}
                              {el.phone !== '' && el.phone !== ' ' && <Card.Text>Phone : {el.phone}</Card.Text>}
                              {el.address !== '' && el.address !== ' ' && <Card.Text>주소 : {el.address}</Card.Text>}
                              {el.content !== '' && el.content !== ' ' && <Card.Text>거래내역 : {el.content}</Card.Text>}
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
                </Col>
              </Row>
            </Aux>
        )}
      </>
  );
};

export default CurrentSituationTable;