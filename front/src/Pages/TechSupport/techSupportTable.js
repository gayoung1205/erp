import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { Input, Result } from 'antd';
import 'antd/dist/antd.css';
import Aux from '../../hoc/_Aux';
import requestTechSupportAllGet from '../../Axios/TechSupport/requestTechSupportAllGet';
import requestTechSupportSearch from '../../Axios/TechSupport/requestTechSupportSearch';

const TechSupportTable = () => {
  const [data, setData] = useState([]); // Document Data
  const [isData, setIsData] = useState(true);
  const [searchWidth, setSearchWidth] = useState('');
  const history = useHistory(); // location 객체 접근
  const isDesktop = useMediaQuery({ query: '(min-device-width: 480px)' }); // DeviceWidth > 480
  const isMobile = useMediaQuery({ query: '(max-width: 480px)' }); // DeviceWidth < 480

  // requestDocumentGet이 변경될 때마다 실행
  useEffect(() => {
    requestTechSupportAllGet().then((data) => setData(data));
  }, []);

  // 해상도에 따라서 검색입력박스 너비 조절
  useEffect(() => {
    isDesktop ? setSearchWidth('30%') : setSearchWidth('100%');
  }, [isDesktop]);

  const techSupportTrStyle = {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textAlign: 'center',
  };

  const handleSearch = (text) => {
    if (text.length !== 0) {
      requestTechSupportSearch(text).then((res) => {
        if (res.length === 0) {
          setIsData(false);
          setData([]);
        } else {
          setIsData(true);
          setData(res);
        }
      });
    } else {
      setIsData(true);
      requestTechSupportAllGet().then((data) => setData(data));
    }
  };

  const TableBody = () => {
    if (!isData) {
      if (isDesktop) {
        return (
          <>
            <tr>
              <td colSpan="5">
                <Result status="warning" title="검색 결과가 없습니다." />
              </td>
            </tr>
          </>
        );
      } else {
        return (
          <>
            <Card className="Recent-Users">
              <Card.Body>
                <Result status="warning" title="검색 결과가 없습니다." />
              </Card.Body>
            </Card>
          </>
        );
      }
    } else {
      if (isDesktop) {
        return (
          <>
            {data.map((el, i) => {
              return (
                <tr className="unread" key={i}>
                  <td style={techSupportTrStyle} title={el.title}>
                    <span className="m-0">{el.title}</span>
                  </td>
                  <td style={techSupportTrStyle} title={el.content}>
                    <span className="m-0">{el.content}</span>
                  </td>
                  <td style={techSupportTrStyle} title={el.created_date ? el.created_date.slice(0, 10) : null}>
                    <span className="m-0">{el.created_date ? el.created_date.slice(0, 10) : null}</span>
                  </td>
                  <td style={techSupportTrStyle} title={el.username}>
                    <span className="m-0">{el.username}</span>
                  </td>
                  <td style={techSupportTrStyle}>
                    <Button
                      className="label theme-bg text-white f-12"
                      style={{ padding: '5px 10px' }}
                      onClick={() => history.push(`/TechSupport/techSupportView/${el.id}`)}
                    >
                      조회
                    </Button>
                    {el.is_approved ? (
                      <Button
                        className="label theme-bg text-white f-12"
                        style={{ padding: '5px 10px' }}
                        onClick={() => history.push(`/TechSupport/techSupportUpdate/${el.id}`)}
                      >
                        수정
                      </Button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </>
        );
      } else {
        return (
          <>
            {data.map((el, i) => {
              return (
                <Card className="Recent-Users" key={i}>
                  <Card.Header>
                    <Card.Title as="h5" title={el.title}>
                      <span>{el.title}</span>
                    </Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div style={{ display: 'block' }}>
                      <Card.Text>{el.content}</Card.Text>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                      <Button
                        className="label theme-bg text-white f-12"
                        style={{ padding: '5px 10px' }}
                        onClick={() => history.push(`/TechSupport/techSupportView/${el.id}`)}
                      >
                        조회
                      </Button>
                      {el.is_approved ? (
                        <Button
                          className="label theme-bg text-white f-12"
                          style={{ padding: '5px 10px' }}
                          onClick={() => history.push(`/TechSupport/techSupportUpdate/${el.id}`)}
                        >
                          수정
                        </Button>
                      ) : null}
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </>
        );
      }
    }
  };

  return (
    <Aux>
      <Row>
        <Col md={12} xl={12} className="m-b-30">
          <Input.Group compact>
            <Input.Search
              allowClear
              style={{ width: searchWidth, marginBottom: '10px' }}
              placeholder="제목 + 내용 검색"
              onChange={(e) => {
                handleSearch(e.target.value);
              }}
            />
          </Input.Group>
          {isDesktop && (
            <>
              <Card className="Recent-Users">
                <Card.Body className="px-0 py-2">
                  <Button
                    variant="outline-primary"
                    style={{ padding: '5px 10px', float: 'right' }}
                    onClick={() => history.push('/TechSupport/techSupportCreate')}
                  >
                    작성
                  </Button>
                  <Table hover style={{ tableLayout: 'fixed', marginBottom: '0' }}>
                    <thead style={{ textAlign: 'center' }}>
                      <tr>
                        <th>제목</th>
                        <th>내용</th>
                        <th>등록일</th>
                        <th>작성자</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <TableBody />
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </>
          )}
          {isMobile && (
            <>
              <div>
                <Button
                  variant="outline-primary"
                  style={{ padding: '5px 10px', width: '100%' }}
                  onClick={() => history.push('/TechSupport/techSupportCreate')}
                >
                  작성
                </Button>
              </div>
              <TableBody />
            </>
          )}
        </Col>
      </Row>
    </Aux>
  );
};

export default TechSupportTable;
