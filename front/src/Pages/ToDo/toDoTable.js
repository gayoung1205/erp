import React, { useState, memo, useCallback } from 'react';
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { isEmptyObject } from 'jquery';
import Aux from '../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import ReleaseGrid from './toDoGrid';
import requestSearchProductCodeGet from '../../Axios/Product/requestSearchProductCodeGet';
import requestReleaseCreate from '../../Axios/Release/requestReleaseCreate';

const MemoedReleaseGrid = memo(ReleaseGrid);

const ToDoTable = () => {
  const [searchModalVisible, setSearchModalVisible] = useState(false); // Product Search Modal Visible
  const [searchText, setSearchText] = useState(''); // 검색 텍스트
  const [appendRowData, setAppendRowData] = useState({}); // grid에 올라갈 데이터
  const [data, setData] = useState({
    name: '',
    amount: 1,
  }); // Data

  // Product Search Button Click => Product Search Modal Visible false->true, Product Search Data GET
  const searchProduct = useCallback(() => {
    setSearchText(data.name);
    setSearchModalVisible(!searchModalVisible);
  }, [data.name, searchModalVisible]);

  const resetData = () => {
    setData({
      name: '',
      amount: 1,
    });
  };

  // History Insert
  const insertHistory = () => {
    // 제품명이 입력되지 않은 경우 등록X
    if (data.name === '') {
      message.warning('제품명을 입력해주세요.');
      return null;
    }

    // 등록되어 있지 않은 제품을 등록할 경우X
    if (data.product_id === undefined) {
      message.warning('등록되어 있지 않은 제품입니다.');
      return null;
    }

    // Release Create
    requestReleaseCreate(data).then((res) => {
      if (res !== null && res !== undefined) {
        data.id = res.id;
        data.created_date = res.created_date;
        data.register_name = res.register_name;
        data.stock = res.stock;
        setAppendRowData(data);
        message.success(data.name + ' 등록');
      }
    });

    // Data 초기화
    resetData();
  };

  const productStorage = (rowData) => {
    setData({ ...data, product_id: rowData.id, name: rowData.name, product_category: rowData.category });
  };

  // 제품명/코드 InputText에서 Enter 시 자동 검색 기능
  const enterCode = () => {
    if (window.event.keyCode === 13) {
      if (data.name === '') {
        message.warning('코드를 입력해주세요.');
        return null;
      }
      requestSearchProductCodeGet(data.name).then((res) => {
        if (res !== null && res !== undefined) {
          let releaseData = {
            product_id: res.id,
            name: res.name,
            product_category: res.category,
            amount: 1,
          };
          requestReleaseCreate(releaseData).then((res) => {
            if (res !== null && res !== undefined) {
              releaseData.id = res.id;
              releaseData.created_date = res.created_date;
              releaseData.register_name = res.register_name;
              setAppendRowData(releaseData);
              message.success(releaseData.name + ' 등록');
            }
          });
        }
      });

      resetData();
    }
  };

  // 수량 값이 비게 될 경우 0으로 변경
  const handleEmpty = (e) => {
    if (isEmptyObject(e.target.value)) {
      setData({ ...data, [e.target.name]: 1 });
    } else {
      setData({ ...data, [e.target.name]: parseInt(e.target.value) });
    }
  };

  return (
    <Aux>
      <Row>
        <Col>
          <MemoedReleaseGrid appendRowData={appendRowData} />
        </Col>
      </Row>
    </Aux>
  );
};

export default ToDoTable;
