import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import requestReleaseLogRecentGet from '../../Axios/Release/requestReleaseLogRecentGet';

const ReleaseLogGrid = (props) => {
  const [data, setData] = useState([]);
  const gridRef = React.createRef();

  useEffect(() => {
    requestReleaseLogRecentGet().then((res) => {
      if (res) {
        setData(res);
      }
    });
  }, []);

  const historyColumns = [
    {
      name: 'release_created_date',
      header: '출고등록일',
      width: 'auto',
      minWidth: 100,
      align: 'center',
      formatter({ value }) {
        return value ? `${value.slice(0, 10)}` : '';
      },
    },
    {
      name: 'release_register_name',
      header: '출고등록자',
      width: 'auto',
      minWidth: 100,
      align: 'center'
    },
    {
      name: 'created_date',
      header: '판매처리일',
      width: 'auto',
      minWidth: 100,
      align: 'center',
      formatter({ value }) {
        return `${value.slice(0, 10)}`;
      },
    },
    { name: 'category', header: '구분', width: 'auto', minWidth: 80, align: 'center' },
    { name: 'name', header: '제품명', align: 'center', minWidth: 200 },
    { name: 'product_category', header: '제품분류', width: 'auto', minWidth: 100, align: 'center' },
    {
      name: 'amount',
      header: '수량',
      align: 'center',
      width: 'auto',
      minWidth: 80,
    },
    {
      name: 'memo',
      header: '메모',
      align: 'center',
      minWidth: 200,
    },
    { name: 'register_name', header: '판매처리자', width: 'auto', minWidth: 200, sortable: true, align: 'center' },
  ];

  return (
      <Card>
        <Card.Header>
          <Card.Title as="h5">최근 출고판매내역</Card.Title>
        </Card.Header>
        <Card.Body>
          <Grid
              ref={gridRef}
              data={data}
              scrollX={true}
              columns={historyColumns}
              rowHeight={25}
              bodyHeight={400}
              columnOptions={{ resizable: true }}
              selectionUnit="row"
          />
        </Card.Body>
      </Card>
  );
};

export default ReleaseLogGrid;