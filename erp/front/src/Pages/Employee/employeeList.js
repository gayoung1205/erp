import React, { memo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Aux from '../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import EmployeeGrid from './employeeGrid';

const MemoedEmployeeGrid = memo(EmployeeGrid);

const EmployeeList = () => {
  const history = useHistory(); // location 객체 접근

  useEffect(() => {
    const permission = window.sessionStorage.getItem('permission');
    if (!(permission === '0' || permission === '2' || permission === '3')) {
      message.error('권한이 없습니다.');
      history.goBack();
    }
  }, []);

  return (
    <Aux>
      <MemoedEmployeeGrid />
    </Aux>
  );
};

export default EmployeeList;
