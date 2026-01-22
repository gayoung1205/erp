import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import Aux from '../../hoc/_Aux';
import 'antd/dist/antd.css';
import { message, Modal, Progress } from 'antd';
import requestTechSupportGet from '../../Axios/TechSupport/requestTechSupportGet';
import requestFileDownload from '../../Axios/TechSupportFile/requestFileDownload';

const TechSupportView = (props) => {
  const [data, setData] = useState({}); // TechSupport Data
  const [file, setFile] = useState([]); // File Data
  const techSupport_id = props.match.params.techSupport_id;
  const [downloadVisible, setDownloadVisible] = useState(false); // 다운로드 모달 가시성
  const [progress, setProgress] = useState(0); // 진행률 %

  useEffect(() => {
    requestTechSupportGet(techSupport_id).then((res) => {
      setData(res.data[0]);
      setFile(res.file);
    });
  }, []);

  const download = (file) => {
    setDownloadVisible(true);
    requestFileDownload(file, (e) => {
      setProgress(Math.round((100 * e.loaded) / e.total));
    })
      .then(() => {
        handleCancel();
      })
      .catch(() => {
        setProgress(0);
        message.error('파일 다운로드 실패');
      });
  };

  const handleCancel = () => {
    setDownloadVisible(false);
  };

  return (
    <Aux>
      <Modal
        title="진행상황"
        visible={downloadVisible}
        onCancel={() => handleCancel()}
        maskClosable={true}
        footer={null}
      >
        <Progress percent={progress} />
      </Modal>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">기술지원 조회</Card.Title>
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
                        readOnly
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
                        readOnly
                      />
                    </Form.Group>
                    <span>첨부파일 : </span>
                    {file.map((el, i) => {
                      return (
                        <Button variant="link" onClick={() => download(el)} style={{ padding: 5 }} key={i}>
                          {el.filename}
                        </Button>
                      );
                    })}
                  </Form>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Aux>
  );
};

export default TechSupportView;
