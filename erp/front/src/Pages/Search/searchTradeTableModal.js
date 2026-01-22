import React, { useState, useEffect } from 'react';

// Modal
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import SearchTradeTable from './searchTradeTable';
// Modal

const SearchTradeTableModal = (props) => {
  const [visible, setVisible] = useState(false); //Modal visible
  const [flag, setFlag] = useState(false);
  const [count, setCount] = useState(0);

  // requestCustomerGet()가 처음에만 실행되도록
  useEffect(() => {
    if (!flag) {
      setFlag(true);
      setVisible(props.visible);
    } else {
      setVisible(true);
    }
    setCount(count + 1);
  }, [props.visible]);

  // Modal
  const handleCancel = () => {
    setVisible(false);
  };
  // Modal

  return (
    <>
      <Modal
        title="AS 및 거래 검색"
        visible={visible}
        footer={null}
        onCancel={() => {
          handleCancel();
        }}
        width="90%"
        zIndex={1030}
      >
        <SearchTradeTable count={count} tables={props.tables} tags={props.tags} handleCancel={() => handleCancel()} />
      </Modal>
    </>
  );
};

export default SearchTradeTableModal;
