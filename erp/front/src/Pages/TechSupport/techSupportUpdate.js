import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Form, Button, ButtonGroup } from 'react-bootstrap';
import Aux from '../../hoc/_Aux';
import { message, Modal, Progress, Spin } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import 'antd/dist/antd.css';
import CheckModal from '../../App/components/Modal/checkModal';
import requestTechSupportGet from '../../Axios/TechSupport/requestTechSupportGet';
import requestTechSupportUpdate from '../../Axios/TechSupport/requestTechSupportUpdate';
import requestTechSupportDelete from '../../Axios/TechSupport/requsetTechSupportDelete';
import requestFileDelete from '../../Axios/TechSupportFile/requestFileDelete';
import requestFileCreate from '../../Axios/TechSupportFile/requestFileCreate';

const TechSupportUpdate = (props) => {
  const history = useHistory(); // location 객체 접근
  const techSupport_id = props.match.params.techSupport_id;
  const [data, setData] = useState({}); // TechSupport Data
  const [file, setFile] = useState([]); // File Data
  const [newFiles, setNewFiles] = useState(); // New File Data
  const [checkModalVisible, setCheckModalVisible] = useState(false);
  const [downloadVisible, setDownloadVisible] = useState(false); // 다운로드 모달 가시성
  const [progress, setProgress] = useState(0); // 진행률 %
  const [buttonDisabled, setButtonDisabled] = useState(true); // 다운로드 모달 버튼 클릭 여부 true -> 클릭X, false -> 클릭O

  useEffect(() => {
    requestTechSupportGet(techSupport_id).then((res) => {
      setData(res.data[0]);
      setFile(res.file);
    });
  }, []);

  // TechSupport Update
  const techSupportUpdate = () => {
    requestTechSupportUpdate(techSupport_id, data).then(() => {
      if (!newFiles) {
        history.push('/TechSupport/techSupportTable');
      } else {
        setDownloadVisible(true);
        requestFileCreate(techSupport_id, newFiles, (e) => {
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

  // TechSupport Delete
  const techSupportDelete = () => {
    requestTechSupportDelete(techSupport_id).then(() => history.push('/TechSupport/techSupportTable'));
  };

  const handleCheckModal = () => {
    setCheckModalVisible(!checkModalVisible);
  };

  const techSupportFileDelete = (id, i) => {
    requestFileDelete(id).then(() => {
      let copy_file = file.slice();
      copy_file.splice(i, 1);
      setFile(copy_file);
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
              <Card.Title as="h5">기술지원 수정</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={12}>
                  <Form>
                    <Form.Group controlId="techSupportInput01">
                      <Form.Label>제목</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="제목 입력"
                        value={data.title ? data.title : ''}
                        onChange={(e) => {
                          setData({ ...data, title: e.target.value });
                        }}
                        required
                      />
                    </Form.Group>
                    <Form.Group controlId="techSupportInput03">
                      <Form.Label>내용</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows="10"
                        placeholder="내용 입력"
                        value={data.content}
                        onChange={(e) => {
                          setData({ ...data, content: e.target.value });
                        }}
                      />
                    </Form.Group>
                    <span>첨부파일 : </span>
                    {file.map((el, i) => {
                      return (
                        <ButtonGroup aria-label="Basic example" key={i}>
                          <Button variant="link" style={{ padding: 0, paddingLeft: 5 }}>
                            {el.filename}
                          </Button>
                          <Button
                            variant="link"
                            style={{ padding: 0 }}
                            onClick={() => {
                              techSupportFileDelete(el.id, i);
                            }}
                          >
                            <i className="feather icon-x" style={{ margin: 0, color: 'red' }} />
                          </Button>
                        </ButtonGroup>
                      );
                    })}
                    <Form.Group>
                      <Form.File
                        id="techSupportInputFile"
                        onChange={(e) => {
                          setNewFiles(e.target.files);
                        }}
                        multiple
                      />
                    </Form.Group>
                  </Form>
                </Col>
              </Row>
              <Row>
                <Col style={{ textAlign: 'right' }}>
                  {data.is_approved ? (
                    <>
                      <Button variant="primary" onClick={() => techSupportUpdate()}>
                        수정
                      </Button>
                      <Button variant="primary" onClick={() => handleCheckModal()}>
                        삭제
                      </Button>
                      <CheckModal visible={checkModalVisible} delete={() => techSupportDelete()} />
                    </>
                  ) : null}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Aux>
  );
};

export default TechSupportUpdate;
