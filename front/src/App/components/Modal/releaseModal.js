import React, { useState, useEffect } from 'react';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import requestReleaseGet from '../../../Axios/Release/requestReleaseGet';
import releaseModalGridColumns from './releaseModalGridColumns';

const ReleaseModal = (props) => {
  const [flag, setFlag] = useState(false);
  const [visible, setVisible] = useState(false); // Modal Visible
  const [data, setData] = useState([]); // Product Search Data

  useEffect(() => {
    requestReleaseGet().then((res) => {
      res === undefined ? handleCancel() : setData(res);
    });
  }, []);

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

  const insertRelease = (rowKey) => {
    props.insertRelease(data[rowKey]);
    handleCancel();
  };

  return (
    <>
      <Modal title="출고 목록" visible={visible} footer={null} onCancel={() => handleCancel()} width="50%" zIndex={1030}>
        <Grid
          data={data}
          scrollX={true}
          scrollY={true}
          columns={releaseModalGridColumns}
          rowHeight={25}
          bodyHeight="auto" //height 길이
          columnOptions={{ resizable: true }} //column width 조절 가능
          selectionUnit="cell" //grid select unit, 그리드 선택단위, ('row', 'cell')
          onDblclick={(e) => {
            if (e.targetType !== 'etc') insertRelease(e.rowKey);
          }}
        />
      </Modal>
    </>
  );
};

export default ReleaseModal;
