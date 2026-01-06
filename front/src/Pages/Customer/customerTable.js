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

const CustomerTable = ({ match }) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' }); // deviceWidth > 768
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' }); // deviceWidth < 768

  const [state, setState] = useState({ visible: false }); //Modal visible
  const [data, setData] = useState([]); // Customer Data
  const [rowData, setRowData] = useState({}); // DbClick 할 때 target rowData 저장할 변수
  const [gridColumns, setGridColumns] = useState([]);
  const [contextMenuText, setContextMenuText] = useState('확대');
  const page = parseInt(match.params.page);
  const [maxPage, setMaxPage] = useState();
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);

  // requestCustomerGet()가 처음에만 실행되도록
  useEffect(() => {
    requestAllCustomerGet(page).then((res) => {
      // {results}는 얕은 복사(주소 참조 ex)point ), deep copy X
      let { results } = res;

      setMaxPage(res.max_page);

      // null check
      results = notNull(results);

      setData(results);
    });
  }, []);

  useEffect(() => {
    let dummyColumns = cloneDeep(customerTableGridColumns);

    for (const i in dummyColumns) {
      dummyColumns[i].minWidth = 100;
      dummyColumns[i].ellipsis = true;
    }

    setGridColumns(dummyColumns);
  }, []);

  // DbClick 할 때 update Modal
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

  return (
    <>
      {isDesktop && (
        <>
          <ContextMenuTrigger id="customerTableContextMenu">
            <div className="customerTableContextMenuDiv">
              <Grid
                data={data}
                scrollX={true}
                scrollY={false}
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
              />
            </div>
          </ContextMenuTrigger>
          <ContextMenu id="customerTableContextMenu">
            <MenuItem onClick={() => handleContextMenu()}>전체 열 {contextMenuText}</MenuItem>
            <MenuItem onClick={() => downloadModalProcessing(true)}>엑셀 출력</MenuItem>
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
                        {el.memo !== '' && <Card.Text>{el.memo}</Card.Text>}
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
