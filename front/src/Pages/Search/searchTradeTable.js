import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { isEmptyObject } from 'jquery';
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
import CollectionPaymentUpdateModal from '../Trade/CollectionPayment/collectionPaymentUpdateModal';
import MemoUpdateModal from '../Trade/Memo/memoUpdateModal';
import requestSearchTableGet from '../../Axios/Search/requestSearchTableGet';
import searchTradeTableGridColumns from './searchTradeTableGridColumns';

const SearchTradeTable = (props) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' }); // deviceWidth > 768
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' }); // deviceWidth < 768

  const [colPayVisible, setColPayVisible] = useState(false); // CollectionPayment Modal Visible
  const [memoVisible, setMemoVisible] = useState(false); // Memo Modal Visible
  const [data, setData] = useState([]); // Trade Data
  const [colPayId, setColPayId] = useState();
  const [memoId, setMemoId] = useState();
  const gridRef = React.createRef(); // Grid Function 쓰기 위해서
  const history = useHistory(); // location 객체 접근
  const [gridColumns, setGridColumns] = useState([]);
  const [contextMenuText, setContextMenuText] = useState('확대');

  // requestTradeGet()이 처음에만 실행되도록
  useEffect(() => {
    requestSearchTableGet(props).then((res) => {
      if (isEmptyObject(res)) {
        message.warning('검색내용이 없습니다.');
        props.handleCancel();
        return null;
      } else {
        // null 값 제거
        res = notNull(res);

        for (const i in res) {
          // price값 등을 이용해서 table에 뿌려줄 column
          let col = ['collect', 'payment', 'transaction', 'payment_2', 'receivable'];

          // category_1 : AS=0, COLLECTION=1, PAYMENT=2, SELL=3, PURCHASE=4, INCOME=5, OUTCOME=6, DELIVER=7, MEMO=8
          // category_2 : ACCEPT=0, COMPLETE=1, ONGOING=2, CANCEL=3;
          // category_3 : INSIDE=0, OUTSIDE=1

          // column 생성 -> insert 0
          for (const j in col) res[i][col[j]] = 0;

          // category_1이 수금, 지불일 경우 결제금액과 수금일 경우 수금금액, 지불일 경우 지불금액 설정
          if (res[i].category_1 === 1 || res[i].category_1 === 2) {
            res[i].payment_2 = res[i].total_price;
            res[i].category_1 === 1 ? (res[i].collect = res[i].total_price) : (res[i].payment = res[i].total_price);
          }
          // 수금, 판매, 구매 일 때 거래금액 = total_price
          if (res[i].category_1 === 3 || res[i].category_1 === 4 || res[i].category_2 === 1) {
            res[i].transaction = res[i].total_price;
          }
          // 수금, 구매 일 때 당일미수금 = -total_price
          if (res[i].category_1 === 1 || res[i].category_1 === 4) {
            res[i].receivable = -res[i].total_price;
          }
          // 지불, 판매, AS완료 일 때 당일미수금 = total_price
          if (res[i].category_1 === 2 || res[i].category_1 === 3 || res[i].category_2 === 1) {
            res[i].receivable = res[i].total_price;
          }
        }
        // trade data 저장
        setData(res);
      }
    });
  }, [props.count]);

  useEffect(() => {
    let dummyColumns = cloneDeep(searchTradeTableGridColumns);

    for (const i in dummyColumns) {
      dummyColumns[i].minWidth = 100;
      dummyColumns[i].ellipsis = true;
    }

    setGridColumns(dummyColumns);
  }, []);

  // category_1에 따른 수정 방식(page 이동과 Modal)
  const moveTradePage = (id, customer_id, category_name1) => {
    window.sessionStorage.setItem('customerId', customer_id);

    // ['AS', '수금', '지불', '판매', '구매', '수입', '지출', '메모', '납품'];
    switch (category_name1) {
      case 'AS':
        history.push(`/Trade/As/asUpdate/${id}`);
        props.handleCancel();
        break;

      case '수금':
      case '지불':
        setColPayId(id);
        setColPayVisible(!colPayVisible.visible);
        break;

      case '판매':
      case '구매':
        history.push(`/Trade/BuySale/buySaleUpdate/${id}`);
        props.handleCancel();
        break;

      case '수입':
      case '지출':
        break;

      case '메모':
        setMemoId(id);
        setMemoVisible(!memoVisible.visible);
        break;

      case '납품':
        history.push(`/Trade/Delivery/deliveryUpdate/${id}`);
        props.handleCancel();
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
      dummyColumns = cloneDeep(searchTradeTableGridColumns);

      for (const i in dummyColumns) {
        dummyColumns[i].minWidth = 100;
        dummyColumns[i].ellipsis = true;
      }

      setContextMenuText('확대');
    }

    setGridColumns(dummyColumns);
  };

  return (
    <>
      {isDesktop && (
        <>
          <ContextMenuTrigger id="searchTradeTableContextMenu">
            <div className="searchTradeTableContextMenuDiv">
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
                  if (
                    e.targetType === 'columnHeader' &&
                    e.nativeEvent.target.className.indexOf('tui-grid-cell-header') !== -1
                  ) {
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
          <ContextMenu id="searchTradeTableContextMenu">
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
                      {el.category_name2 !== ' ' ? (
                        <Card.Title as="h5">
                          {el.register_date.slice(0, 10)} {el.category_name1}({el.category_name2})
                        </Card.Title>
                      ) : (
                        <Card.Title as="h5">
                          {el.register_date.slice(0, 10)} {el.category_name1}
                        </Card.Title>
                      )}
                    </Card.Header>
                    <Card.Body>
                      <div style={{ display: 'block' }}>
                        {el.engineer_name !== '' && <Card.Text>담당자 : {el.engineer_name}</Card.Text>}
                        {el.content !== '' && <Card.Text>거래내역 : {el.content}</Card.Text>}
                        {el.symptom !== '' && <Card.Text>고장증상 : {el.symptom}</Card.Text>}
                        {el.completed_content !== '' && <Card.Text>완료내역 : {el.completed_content}</Card.Text>}
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
            </Col>
          </Row>
        </Aux>
      )}
      <CollectionPaymentUpdateModal visible={colPayVisible} id={colPayId} />
      <MemoUpdateModal visible={memoVisible} id={memoId} />
    </>
  );
};

export default SearchTradeTable;
