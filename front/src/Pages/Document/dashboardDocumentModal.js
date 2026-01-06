import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import DashboardDocumentModalTable from './dashboardDocumentModalTable';

const DashboardDocumentModal = (props) => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' }); // deviceWidth > 768
  const [visible, setVisible] = useState(false); // Modal visible
  const [flag, setFlag] = useState(false); // Modal Visible 조절 변수
  const [modalWidth, setModalWidth] = useState('50%');

  // props.visible이 변경될 때마다 실행
  useEffect(() => {
    if (!flag) {
      setFlag(true);
      setVisible(props.visible);
    } else {
      setVisible(true);
    }
  }, [props.visible]);

  useEffect(() => {
    isDesktop ? setModalWidth('50%') : setModalWidth('100%');
  }, [isDesktop]);

  // Modal Visible true -> false
  const handleCancel = (e) => {
    setVisible(false);
  };

  return (
    <>
      <Modal
        title="최근 문서"
        visible={visible}
        onCancel={() => handleCancel()}
        width={modalWidth}
        footer={null}
        zIndex={1030}
      >
        <DashboardDocumentModalTable />
      </Modal>
    </>
  );
};

export default DashboardDocumentModal;
