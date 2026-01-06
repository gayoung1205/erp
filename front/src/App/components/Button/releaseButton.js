import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import ReleaseModal from '../Modal/releaseModal';

const ReleaseButton = (props) => {
  const [releaseModalVisible, setReleaseModalVisible] = useState(false); // 출고 Modal Visible

  const showModal = () => {
    setReleaseModalVisible(!releaseModalVisible);
  };

  return (
    <>
      <Button variant="primary" onClick={() => showModal()}>
        출고
      </Button>
      <ReleaseModal visible={releaseModalVisible} insertRelease={(data) => props.insertRelease(data)} />
    </>
  );
};

export default ReleaseButton;
