import React, { useState, useEffect } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import '../../assets/css/react-contextmenu.css';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import 'tui-pagination/dist/tui-pagination.css';
import { Modal, Spin } from 'antd';
import 'antd/dist/antd.css';
import cloneDeep from 'lodash/cloneDeep';
import requestSearchProductNameGet from '../../Axios/Product/requestSearchProductNameGet';
import productSearchModalGridColumns from './productSearchModalGridColumns';

const ProductSearchModal = (props) => {
  const [visible, setVisible] = useState(false); // Modal Visible
  const [data, setData] = useState([]); // Product Search Data
  const [gridColumns, setGridColumns] = useState([]);
  const [contextMenuText, setContextMenuText] = useState('확대');
  const [isLoading, setIsLoading] = useState(false);

  // 모달 열릴 때마다 검색 실행
  useEffect(() => {
    if (props.visible) {
      setVisible(true);

      if (props.loading !== false) {
        setIsLoading(true);
        setData([]);

        requestSearchProductNameGet(props.searchText).then((res) => {
          setIsLoading(false);

          if (res === undefined || res.length === 0) {
            setData([]);
          } else {
            setData(res);
          }
        }).catch(() => {
          setIsLoading(false);
          setData([]);
        });
      }
    }
  }, [props.visible, props.loading, props.searchText]);

  useEffect(() => {
    let dummyColumns = cloneDeep(productSearchModalGridColumns);

    for (const i in dummyColumns) {
      dummyColumns[i].minWidth = 100;
      dummyColumns[i].ellipsis = true;
    }

    setGridColumns(dummyColumns);
  }, []);

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
          {isLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
                <p style={{ marginTop: '15px', color: '#666' }}>검색 중...</p>
              </div>
          ) : (
              <>
                {data.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
                      <p style={{ fontSize: '16px' }}>검색 결과가 없습니다.</p>
                    </div>
                ) : (
                    <ContextMenuTrigger id="productSearchTableContextMenu">
                      <div className="productSearchTableContextMenuDiv">
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
                )}
                <ContextMenu id="productSearchTableContextMenu">
                  <MenuItem onClick={() => handleContextMenu()}>전체 열 {contextMenuText}</MenuItem>
                </ContextMenu>
              </>
          )}
        </Modal>
      </>
  );
};

export default ProductSearchModal;