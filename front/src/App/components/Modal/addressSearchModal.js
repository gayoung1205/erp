import React, { useState, useEffect } from 'react';
import DaumPostcode from 'react-daum-postcode';
import { Modal } from 'antd';
import 'antd/dist/antd.css';

const AddressSearchModal = (props) => {
  const [flag, setFlag] = useState(false);
  const [visible, setVisible] = useState(false); // Modal Visible

  useEffect(() => {
    if (!flag) {
      setFlag(true);
      setVisible(props.visible);
    } else {
      setVisible(true);
    }
  }, [props.visible]);

  // Visible True -> False
  const handleCancel = () => {
    setVisible(false);
  };

  const handleComplete = (data) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }
    props.insertAddress(fullAddress);
    handleCancel();
  };

  return (
    <>
      <Modal title="주소 검색" visible={visible} footer={null} onCancel={() => handleCancel()} width="50%" zIndex={1030}>
        <DaumPostcode onComplete={handleComplete} />
      </Modal>
    </>
  );
};

export default AddressSearchModal;
