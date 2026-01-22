import React, { useState, useEffect, useCallback } from 'react';
import { Card } from 'react-bootstrap';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import requestToDoGet from '../../Axios/ToDo/requestToDoGet';
import requestToDoDelete from '../../Axios/ToDo/requestToDoDelete';
import requestToDoUpdate from '../../Axios/ToDo/requestToDoUpdate';
import setComma from '../../App/components/setComma';
import CustomNumberEditor from '../../App/components/CustomNumberEditor';
import CustomTextEditor from '../../App/components/CustomTextEditor';
import CustomButton from '../../App/components/CustomButton';
import { isEmptyObject } from 'jquery';

const ToDoGrid = (props) => {
  const [data, setData] = useState([]);
  const gridRef = React.createRef(); // Grid Function 쓰기 위해서

  useEffect(() => {
    requestToDoGet().then((res) => {
      //   setData(res);
    });
  }, []);

  useEffect(() => {
    if (!isEmptyObject(props.appendRowData)) {
      // History Grid Row 추가
      gridRef.current.getInstance().appendRow(props.appendRowData, { at: 0, extendPrevRowSpan: false });
    }
  }, [props.appendRowData]);

  const handleClick = useCallback(
    (e) => {
      if (e.columnName === 'action' && e.targetType !== 'columnHeader') {
        let rowData = gridRef.current.getInstance().getRow(e.rowKey);
        gridRef.current.getInstance().removeRow(e.rowKey);
        requestToDoDelete(rowData.id);
      }
    },
    [gridRef]
  );

  //내역테이블 columns
  const historyColumns = [
    {
      name: 'created_date',
      header: '등록일',
      width: 'auto',
      minWidth: 100,
      sortable: true,
      align: 'center',
      formatter({ value }) {
        return `${value.slice(0, 10)}`;
      },
    },
    { name: 'title', header: '제품명', sortable: true, align: 'center', minWidth: 200 },
    { name: 'product_category', header: '제품분류', width: 'auto', minWidth: 100, sortable: true, align: 'center' },
    {
      name: 'amount',
      header: '수량',
      sortable: true,
      minWidth: 80,
      width: 'auto',
      align: 'center',
      onAfterChange(e) {
        let rowData = gridRef.current.getInstance().getRow(e.rowKey);
        requestToDoUpdate(rowData);
      },
      editor: {
        type: CustomNumberEditor,
      },
      formatter({ value }) {
        return `${setComma(value)}`;
      },
    },
    {
      name: 'stock',
      header: '재고수량',
      width: 'auto',
      minWidth: 80,
      sortable: true,
      align: 'center',
      formatter({ value }) {
        return `${setComma(value)}`;
      },
    },
    { name: 'register_name', header: '등록자', width: 'auto', minWidth: 100, sortable: true, align: 'center' },
    {
      name: 'memo',
      header: '메모',
      minWidth: 200,
      align: 'center',
      onAfterChange(e) {
        let rowData = gridRef.current.getInstance().getRow(e.rowKey);
        requestToDoUpdate(rowData);
      },
      editor: {
        type: CustomTextEditor,
        options: {
          maxLength: 100,
        },
      },
    },
    {
      name: 'action',
      header: '삭제',
      width: 'auto',
      align: 'center',
      renderer: {
        type: CustomButton,
      },
    },
  ];

  return (
    <Card>
      <Card.Header>
        <Card.Title as="h5">To Do</Card.Title>
      </Card.Header>
      <Card.Body>
        <Grid
          ref={gridRef}
          data={data}
          scrollX={true}
          bodyHeight={400}
          columns={historyColumns}
          rowHeight={25}
          columnOptions={{ resizable: true }} //column width 조절 가능
          selectionUnit="row" //grid select unit, 그리드 선택단위, ('row', 'cell')
          onClick={(e) => {
            handleClick(e);
          }}
        />
      </Card.Body>
    </Card>
  );
};

export default ToDoGrid;
