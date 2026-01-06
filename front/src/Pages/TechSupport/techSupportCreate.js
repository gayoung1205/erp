import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import Aux from '../../hoc/_Aux';
import { message, Modal, Progress, Spin } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import 'antd/dist/antd.css';
import requestTechSupportCreate from '../../Axios/TechSupport/requestTechSupportCreate';
import requestFileCreate from '../../Axios/TechSupportFile/requestFileCreate';

const TechSupportCreate = () => {
  const history = useHistory(); // location 객체 접근
  const [data, setData] = useState({}); // TechSupport Data
  const [files, setFiles] = useState(); // File Data
  const [downloadVisible, setDownloadVisible] = useState(false); // 다운로드 모달 가시성
  const [progress, setProgress] = useState(0); // 진행률 %
  const [buttonDisabled, setButtonDisabled] = useState(true); // 다운로드 모달 버튼 클릭 여부 true -> 클릭X, false -> 클릭O

  // TechSupport Create
  const techSupportCreate = () => {
    if (data.title === undefined) {
      message.warning('필수 입력사항을 입력해주세요.');
      return null;
    }
    setDownloadVisible(true);
    requestTechSupportCreate(data).then((res) => {
      if (!files) {
        history.push('/TechSupport/techSupportTable');
      } else {
        requestFileCreate(res, files, (e) => {
          setProgress(Math.round((100 * e.loaded) / e.total));
        })
          .then(() => {
            setButtonDisabled(false);
          })
          .catch(() => {
            setProgress(0);
            message.error('파일 업로드 실패');
          });
      }
    });
  };

  const handleCancel = () => {
    if (progress === 100) {
      setDownloadVisible(false);
      history.push('/TechSupport/techSupportTable');
    } else {
      message.error('서버에 파일 업로드 중입니다. 잠시만 기다려 주십시오.');
    }
  };

  return (
    <Aux>
      <Modal
        title="진행상황"
        visible={downloadVisible}
        onCancel={() => handleCancel()}
        onOk={() => handleCancel()}
        okText="이동"
        okButtonProps={{ disabled: buttonDisabled }}
        cancelButtonProps={{ disabled: buttonDisabled }}
      >
        <div style={{ textAlign: 'center' }}>
          <span>파일 업로드 완료 후 서버에 저장되기까지 잠시 시간이 걸릴 수 있습니다.</span>
        </div>
        <div
          style={{
            margin: '20px 0',
            marginBottom: '20px',
            padding: '30px 50px',
            textAlign: 'center',
          }}
        >
          {buttonDisabled ? (
            <Spin size="large" />
          ) : (
            <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: '50px' }} />
          )}
        </div>
        <span>파일 업로드 진행률</span>
        <Progress percent={progress} />
      </Modal>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">기술지원 작성</Card.Title>
            </Card.Header>
            <Card.Body>
              <h6 style={{ color: 'red' }}>* 표시는 필수 입력사항입니다.</h6>
              <hr />
              <Row>
                <Col md={12}>
                  <Form>
                    <Form.Group controlId="techSupportInput01">
                      <Form.Label>
                        <span style={{ color: 'red' }}>*</span> 제목
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="제목 입력"
                        onChange={(e) => {
                          setData({ ...data, title: e.target.value });
                        }}
                        required
                      />
                    </Form.Group>
                    <Form.Group controlId="techSupportInput02">
                      <Form.Label>내용</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows="10"
                        placeholder="내용 입력"
                        onChange={(e) => {
                          setData({ ...data, content: e.target.value });
                        }}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.File
                        id="techSupportInputFile"
                        onChange={(e) => {
                          setFiles(e.target.files);
                        }}
                        multiple
                      />
                    </Form.Group>
                  </Form>
                </Col>
              </Row>
              <Row>
                <Col style={{ textAlign: 'right' }}>
                  <Button variant="primary" onClick={() => techSupportCreate()}>
                    등록
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Aux>
  );
};

export default TechSupportCreate;
