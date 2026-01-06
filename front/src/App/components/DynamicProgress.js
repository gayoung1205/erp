import { message, Modal, Progress } from 'antd';
import React, { useEffect, useState } from 'react';
import requestExcelExport from '../../Axios/Excel/requestExcelExport';
import '../../assets/css/dynamic-progress-modal.css';

const DynamicProgress = (props) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (props.visible) {
      requestExcelExport(props.type, props.customerId, props.date, (e) => {
        setPercent(Math.round((100 * e.loaded) / e.total));
      })
        .then(() => {
          props.downloadModalProcessing(false);
          setPercent(0);
        })
        .catch(() => {
          setPercent(0);
          message.error('파일 다운로드 실패');
        });
    }
  }, [props.visible, props.type, props]);

  return (
    <>
      <Modal
        className="dynamic-progress-modal"
        centered
        visible={props.visible}
        closable={false}
        maskClosable={true}
        footer={null}
        zIndex={1031}
        width="auto"
      >
        <Progress type="circle" percent={percent} />
      </Modal>
    </>
  );
};

export default React.memo(DynamicProgress);
