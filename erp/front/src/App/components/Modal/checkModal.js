import React, { useState, useEffect } from 'react';
import Aux from '../../../hoc/_Aux';

import { Modal } from 'antd';
import 'antd/dist/antd.css';

const CheckModal = (props) => {
  const [visible, setVisible] = useState(false); // Modal Visible
  const [flag, setFlag] = useState(false); // Modal Visible 조절 변수

  // props.visible이 변경될 때마다 실행
  useEffect(() => {
    if (!flag) {
      setFlag(true);
      setVisible(props.visible);
    } else {
      setVisible(true);
    }
  }, [props.visible]);

  // Delivery Delete Modal Ok
  const handleOk = (e) => {
    props.delete(props.id);
    setVisible(false);
  };

  // Modal Visible true->false
  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <Aux>
      <Modal visible={visible} onOk={() => handleOk()} onCancel={() => handleCancel()} zIndex={1030}>
        <p>삭제하시겠습니까?</p>
      </Modal>
    </Aux>
  );
};

export default CheckModal;
