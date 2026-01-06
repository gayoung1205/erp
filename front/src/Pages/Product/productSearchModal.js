import React, { useState, useEffect } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import '../../assets/css/react-contextmenu.css';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import 'tui-pagination/dist/tui-pagination.css';
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import cloneDeep from 'lodash/cloneDeep';
import requestSearchProductNameGet from '../../Axios/Product/requestSearchProductNameGet';
import productSearchModalGridColumns from './productSearchModalGridColumns';

const ProductSearchModal = (props) => {
  const [flag, setFlag] = useState(false);
  const [visible, setVisible] = useState(false); // Modal Visible
  const [data, setData] = useState([]); // Product Search Data
  const [gridColumns, setGridColumns] = useState([]);
  const [contextMenuText, setContextMenuText] = useState('확대');

  useEffect(() => {
    if (props.loading !== false) {
      requestSearchProductNameGet(props.searchText).then((res) => {
        res === undefined ? handleCancel(0) : setData(res);
      });
    }
  }, [props.loading, props.searchText]);

  useEffect(() => {
    let dummyColumns = cloneDeep(productSearchModalGridColumns);

    for (const i in dummyColumns) {
      dummyColumns[i].minWidth = 100;
      dummyColumns[i].ellipsis = true;
    }

    setGridColumns(dummyColumns);
  }, []);

  useEffect(() => {
    if (!flag) {
      setFlag(true);
      setVisible(props.visible);
    } else {
      setVisible(true);
    }
  }, [props.visible]);

  // Visible True -> False
  const handleCancel = (val) => {
    if (val === 0) {
      setData([]);
    }
    setVisible(false);
  };

  const insertProduct = (rowKey) => {
    props.productStorage(data[rowKey]);
    handleCancel(1);
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
      dummyColumns = cloneDeep(productSearchModalGridColumns);

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
      <Modal title="제품 검색" visible={visible} footer={null} onCancel={() => handleCancel(1)} width="50%" zIndex={1030}>
        <ContextMenuTrigger id="productSearchTableContextMenu">
          <div className="productSearchTableContextMenuDiv">
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
                if (e.targetType !== 'etc') insertProduct(e.rowKey);
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
        <ContextMenu id="productSearchTableContextMenu">
          <MenuItem onClick={() => handleContextMenu()}>전체 열 {contextMenuText}</MenuItem>
        </ContextMenu>
      </Modal>
    </>
  );
};

export default ProductSearchModal;
