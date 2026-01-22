import React, { useState, useEffect } from 'react';

// Modal
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import SearchProductTable from './searchProductTable';
// Modal

const SearchProductTableModal = (props) => {
  const [state, setState] = useState({ visible: false }); //Modal visible
  const [flag, setFlag] = useState(false);
  const [count, setCount] = useState(0);

  // requestCustomerGet()가 처음에만 실행되도록
  useEffect(() => {
    if (!flag) {
      setFlag(true);
      setState({ visible: props.visible });
    } else {
      setState({ visible: true });
    }
    setCount(count + 1);
  }, [props.visible]);

  // Modal
  const handleCancel = () => {
    setState({
      visible: false,
    });
  };
  // Modal

  return (
    <>
      <Modal
        title="제품 검색"
        visible={state.visible}
        footer={null}
        onCancel={() => {
          handleCancel();
        }}
        width="90%"
        zIndex={1030}
      >
        <SearchProductTable count={count} tables={props.tables} tags={props.tags} productCategory={props.productCategory} handleCancel={handleCancel} />
      </Modal>
    </>
  );
};

export default SearchProductTableModal;
