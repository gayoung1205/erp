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
import axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import CheckToken from '../../App/components/checkToken';
import notNull from '../../App/components/notNull.js';
import config from '../../config.js';
import currentSituationTableGridColumns from './currentSituationTableGridColumns';

const CurrentSituationTableCopy = (props) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' }); // deviceWidth > 768
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' }); // deviceWidth < 768

  let token = sessionStorage.getItem('token'); // Login Token
  let { type } = props.match.params; // delivery or as or myas

  const [data, setData] = useState([]); // Trade Data
  const gridRef = React.createRef(); // Grid Function 쓰기 위해서
  const history = useHistory(); // location 객체 접근
  const [gridColumns, setGridColumns] = useState([]);
  const [contextMenuText, setContextMenuText] = useState('확대');

  const requestTradeGet = () => {
    let url;

    switch (type) {
      case 'delivery':
        url = `trades?category=7`;
        break;

      case 'myas':
        url = `myas`;
        break;

      default:
        // as현황
        url = `trades?category=0`;
        break;
    }
    axios({
      url: `${config.backEndServerAddress}api/${url}`,
      method: 'GET',
      headers: { Authorization: `JWT ${token}` },
    })
      .then((res) => {
        let results;

        type === 'myas' ? (results = res.data.data) : (results = res.data.data.results);

        results = notNull(results);

        setData(results);
      })
      .catch((err) => CheckToken(err));
  };

  useEffect(() => {
    requestTradeGet();
  }, [type]);

  useEffect(() => {
    let dummyColumns = cloneDeep(currentSituationTableGridColumns);

    for (const i in dummyColumns) {
      dummyColumns[i].minWidth = 100;
      dummyColumns[i].ellipsis = true;
    }

    setGridColumns(dummyColumns);
  }, []);

  // category_1에 따른 수정 방식(page 이동과 Modal)
  const moveTradePage = (id, customer_id) => {
    window.sessionStorage.setItem('customerId', customer_id);
    // ['AS', '수금', '지불', '판매', '구매', '수입', '지출', '메모', '납품'];

    // deliveryUpdate로 이동
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

  return (
    <>
      {isDesktop && (
        <>
          <ContextMenuTrigger id="currentSituationTableContextMenu">
            <div className="currentSituationTableContextMenuDiv">
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

export default CurrentSituationTableCopy;
