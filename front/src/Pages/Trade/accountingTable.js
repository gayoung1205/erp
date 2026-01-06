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
import SelectDateExcelExportModal from '../../App/components/Modal/selectDateExcelExportModal';

const AccountingTable = ({ match }) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' }); // deviceWidth > 768
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' }); // deviceWidth < 768

  const [colPayVisible, setColPayVisible] = useState(false); // CollectionPayment Modal Visible
  const [ioVisible, setIoVisible] = useState(false); // IncomeOutcome Modal Visible
  const [accountingCalcVisible, setAccountingCalcVisible] = useState(false); // AccountingCalc Modal Visible
  const [data, setData] = useState([]); // Trade Data
  const [colPayId, setColPayId] = useState(); // CollectionPayment Id
  const [ioId, setIoId] = useState(); // IncomeOutcome Id
  const gridRef = React.createRef(); // Grid Function 쓰기 위해서
  const history = useHistory(); // location 객체 접근
  const [gridColumns, setGridColumns] = useState([]);
  const [contextMenuText, setContextMenuText] = useState('확대');
  const page = parseInt(match.params.page);
  const [maxPage, setMaxPage] = useState();
  const [selectDateExcelExportModalVisible, setSelectDateExcelExportModalVisible] = useState(false);

  // tradeGet()이 처음에만 실행되도록
  useEffect(() => {
    const permission = window.sessionStorage.getItem('permission');
    if (!(permission === '0' || permission === '2' || permission === '3' || permission === '5')) {
      message.error('권한이 없습니다.');
      history.goBack();
    }
    requestAllTradeGet(page, 'accounting').then((res) => {
      setMaxPage(res.max_page);

      // trade data 복사
      let { results } = res;

      // null 값 제거
      results = notNull(results);

      // category_1 === 8, 메모일 경우 자르기
      for (const i in results) {
        if (results[i].category_1 === 8) {
          results.splice(i, 1);
        }
      }

      for (const i in results) {
        // 결제금액 초기화
        results[i].total_price = 0;

        // 수금, 지불, 수입, 지출일 경우 결제금액  = 공급가 + 부가세
        if (results[i].category_1 === 1 || results[i].category_1 === 2 || results[i].category_1 === 5 || results[i].category_1 === 6) {
          results[i].total_price = parseInt(results[i].cash) + parseInt(results[i].credit) + parseInt(results[i].bank);
        }
      }

      // trade data 저장
      setData(results);
    });
  }, []);

  useEffect(() => {
    let dummyColumns = cloneDeep(accountingTableGridColumns);

    for (const i in dummyColumns) {
      dummyColumns[i].minWidth = 100;
      dummyColumns[i].ellipsis = true;
    }

    setGridColumns(dummyColumns);
  }, []);

  // category_1에 따른 수정 방식(page 이동과 Modal)
  const moveTradePage = (id, customer_id, category_name1) => {
    if (category_name1 !== '수입' && category_name1 !== '지출') {
      // Customer Id 초기화
      window.sessionStorage.setItem('customerId', customer_id);
    }

    // ['AS', '수금', '지불', '판매', '구매', '수입', '지출', '메모', '납품'];
    switch (category_name1) {
      case 'AS':
        history.push(`/Trade/As/asUpdate/${id}`);
        break;

      case '수금':
      case '지불':
        setColPayId(id);
        setColPayVisible(!colPayVisible);
        break;

      case '판매':
      case '구매':
        history.push(`/Trade/BuySale/buySaleUpdate/${id}`);
        break;

      case '수입':
      case '지출':
        setIoId(id);
        setIoVisible(!ioVisible);
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

  const selectDateExcelExportModalProcessing = (isVisible) => {
    setSelectDateExcelExportModalVisible(isVisible);
  };

  return (
    <>
      {isDesktop && (
        <>
          <ContextMenuTrigger id="accountingTableContextMenu">
            <div className="accountingTableContextMenuDiv">
              <Grid
                ref={gridRef}
                data={data}
                scrollX={true}
                scrollY={true}
                columns={gridColumns}
                rowHeight={25} // row 높이
                bodyHeight="auto" // height 높이
                columnOptions={{ resizable: true }} // column width 조절 가능
                selectionUnit="cell" // grid select unit, 그리드 선택단위, ('row', 'cell')
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
            <MenuItem onClick={() => selectDateExcelExportModalProcessing(true)}>엑셀 출력</MenuItem>
          </ContextMenu>
          <AccountingCalcModal visible={accountingCalcVisible} />
          <SelectDateExcelExportModal
            visible={selectDateExcelExportModalVisible}
            selectDateExcelExportModalProcessing={selectDateExcelExportModalProcessing}
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
