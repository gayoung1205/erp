import React from 'react';
import { Button } from 'react-bootstrap';

const AllDeleteButton = (props) => {
  return (
    <Button
      variant="primary"
      style={{ float: 'right' }}
      onClick={() => {
        props.allHistoryDelete();
      }}
    >
      내역삭제
    </Button>
  );
};

export default AllDeleteButton;
