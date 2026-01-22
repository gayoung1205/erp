import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { isEmptyObject } from 'jquery';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import '../../assets/css/react-contextmenu.css';
import Aux from '../../hoc/_Aux';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import { message } from 'antd';
import 'antd/dist/antd.css';
import cloneDeep from 'lodash/cloneDeep';
import notNull from '../../App/components/notNull.js';
import ProductUpdateModal from '../Product/productUpdateModal';
import requestSearchTableGet from '../../Axios/Search/requestSearchTableGet';
import searchProductTableGridColumns from './searchProductTableGridColumns';

const ProductTable = (props) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' }); // deviceWidth > 768
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' }); // deviceWidth < 768

  const [state, setState] = useState({ visible: false }); //Modal visible
  const [data, setData] = useState([]); // Product Data
  const [rowData, setRowData] = useState({}); // DbClick 할 때 target rowData 저장할 변수
  const [gridColumns, setGridColumns] = useState([]);
  const [contextMenuText, setContextMenuText] = useState('확대');

  // requestProductGet()이 처음에만 실행되도록
  useEffect(() => {
    requestSearchTableGet(props).then((res) => {
      if (isEmptyObject(res)) {
        message.warning('검색내용이 없습니다.');
        props.handleCancel();
        return null;
      } else {
        // Null Check
        res = notNull(res);

        setData(res);
      }
    });
  }, [props.count]);

  useEffect(() => {
    let dummyColumns = cloneDeep(searchProductTableGridColumns);

    for (const i in dummyColumns) {
      dummyColumns[i].minWidth = 100;
      dummyColumns[i].ellipsis = true;
    }

    setGridColumns(dummyColumns);
  }, []);

  // DbClick 시에 실행되는 Function
  const updateModal = (rowKey) => {
    if (rowKey === undefined) return null;
    setRowData(data[rowKey]);
    setState({ visible: !state.visible });
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
      dummyColumns = cloneDeep(searchProductTableGridColumns);

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
          <ContextMenuTrigger id="searchProductTableContextMenu">
            <div className="searchProductTableContextMenuDiv">
              <Grid
                data={data}
                scrollX={true}
                scrollY={true}
                columns={gridColumns}
                rowHeight={25}
                bodyHeight="auto" //height 길이
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
                pageOptions={{
                  useClient: true,
                  perPage: 30,
                  type: 'pagination',
                }}
              />
            </div>
          </ContextMenuTrigger>
          <ContextMenu id="searchProductTableContextMenu">
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
            </Col>
          </Row>
        </Aux>
      )}
      <ProductUpdateModal visible={state.visible} data={rowData} />
    </>
  );
};

export default ProductTable;
