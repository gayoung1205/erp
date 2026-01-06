import React from 'react';
import { Button } from 'react-bootstrap';

const UpdateButton = (props) => {
  return (
    <Button
      variant="primary"
      style={{ float: 'right' }}
      onClick={() => {
        props.update();
      }}
    >
      수정
    </Button>
  );
};

export default UpdateButton;
