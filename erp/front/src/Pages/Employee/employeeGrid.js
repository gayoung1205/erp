import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Card, Form } from 'react-bootstrap';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';

import employeeGridColumns from './employeeGridColumns';
import requestEngineerGet from '../../Axios/Engineer/requestEngineerGet';

const EmployeeGrid = () => {
  const [data, setData] = useState([]);
  const gridRef = React.createRef(); // Grid Function 쓰기 위해서
  const history = useHistory(); // location 객체 접근
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    requestEngineerGet(isVisible).then((res) => {
      console.log(res);
      setData(res);
    });
  }, [isVisible]);

  // category_1에 따른 수정 방식(page 이동과 Modal)
  const movePage = (id) => {
    history.push(`/Employee/employeeUpdate/${id}`);
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title as="h5">직원목록</Card.Title>
        <Form.Check
          type="switch"
          id="custom-inline-switch-01"
          label="비활성 직원 감추기"
          checked={isVisible}
          style={{ float: 'right' }}
          onChange={() => {
            isVisible ? setIsVisible(false) : setIsVisible(true);
          }}
        />
      </Card.Header>

      <Card.Body>
        <Grid
          ref={gridRef}
          data={data}
          scrollX={true}
          scrollY={true}
          columns={employeeGridColumns}
          rowHeight={25}
          bodyHeight="auto" //height 길이
          columnOptions={{ resizable: true }} //column width 조절 가능
          selectionUnit="row" //grid select unit, 그리드 선택단위, ('row', 'cell')
          onDblclick={(e) => {
            if (e.targetType !== 'etc') {
              let rowData = gridRef.current.getInstance().getRow(e.rowKey);
              movePage(rowData.id);
            }
          }}
        />
      </Card.Body>
    </Card>
  );
};

export default EmployeeGrid;
