import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import CheckModal from '../Modal/checkModal';

const DeleteButton = (props) => {
  const [checkModalVisible, setCheckModalVisible] = useState(false); // Check Modal Visible

  const showModal = (e) => {
    setCheckModalVisible(!checkModalVisible);
  };

  return (
    <>
      <Button variant="primary" onClick={() => showModal()}>
        삭제
      </Button>
      <CheckModal visible={checkModalVisible} id={props.tradeId} delete={() => props.delete()} />
    </>
  );
};

export default DeleteButton;
