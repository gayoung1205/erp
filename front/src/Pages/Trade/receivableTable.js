import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import '../../assets/css/react-contextmenu.css';
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

const CustomerTable = (props) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' }); // deviceWidth > 768
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' }); // deviceWidth < 768
  const history = useHistory(); // location 객체 접근

  let token = sessionStorage.getItem('token'); // Login Token
  let { type } = props.match.params; // plus or minus

  const [state, setState] = useState({ visible: false }); // Modal Visible
  const [data, setData] = useState([]); // Customer Data
  const [rowData, setRowData] = useState({}); // DbClick 할 때 target rowData 저장할 변수
  const [totalReceivable, setTotalReceivable] = useState();
  const [gridColumns, setGridColumns] = useState([]);
  const [contextMenuText, setContextMenuText] = useState('확대');

  // type이 변경될 때마다 requestCustomerGet() 실행되도록
  useEffect(() => {
    const permission = window.sessionStorage.getItem('permission');
    if (!(permission === '0' || permission === '2' || permission === '3' || permission === '5')) {
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
        // {results}는 얕은 복사(주소 참조 ex)point ), deep copy X
        let { results } = res.data.data;

        // null check
        results = notNull(results);

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

  // DbCLick 할 때 update Modal
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

  return (
    <>
      {isDesktop && (
        <>
          <ContextMenuTrigger id="receivableTableContextMenu">
            <div className="receivableTableContextMenuDiv">
              <Grid
                data={data}
                scrollX={true}
                scrollY={true}
                columns={gridColumns}
                rowHeight={25} //row 높이
                bodyHeight="auto" //height 높이
                columnOptions={{ resizable: true }} //column width 조절 가능
                selectionUnit="cell" //grid select unit, 그리드 선택단위, ('row', 'cell')
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
                  position: 'top', // 'top' or 'bottom'
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
          </ContextMenu>
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
              {data.map((el, i) => {
                return (
                  <Card className="Recent-Users" key={i}>
                    <Card.Header>
                      <Card.Title as="h5">{el.name}</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <div style={{ display: 'block' }}>
                        {el.tel !== '' && el.tel !== ' ' && <Card.Text>Tel : {el.tel}</Card.Text>}
                        {el.phone !== '' && el.phone !== ' ' && <Card.Text>Phone : {el.phone}</Card.Text>}
                        <Card.Text>총미수금 : {setComma(el.receivable)}</Card.Text>
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
