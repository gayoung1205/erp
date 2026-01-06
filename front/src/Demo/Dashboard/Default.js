import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Tabs, Tab } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import Aux from '../../hoc/_Aux';
import setComma from '../../App/components/setComma.js';
import requestDashboardGet from '../../Axios/Dashboard/requestDashboardGet';
import DashboardDocumentModal from '../../Pages/Document/dashboardDocumentModal';

const Dashboard = () => {
  const isDesktop = useMediaQuery({ query: '(min-device-width: 768px)' }); // deviceWidth > 768
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' }); // deviceWidth < 768
  const [data, setData] = useState([]); // Dashboard Data
  const [dashboardModalVisible, setDashboardModalVisible] = useState(false);

  // 처음 실행 시 requestDashboard 실행
  useEffect(() => {
    requestDashboardGet().then((res) => {
      // username, permission이 저장 안되있을 경우에 저장하고 새로고침
      if (sessionStorage.getItem('username') === null || sessionStorage.getItem('permission') === null) {
        sessionStorage.setItem('username', res.username);
        sessionStorage.setItem('permission', res.permission);
        window.location.reload();
      } else {
        if (sessionStorage.getItem('dashboardModalCheck') === null) {
          setDashboardModalVisible(true);
          sessionStorage.setItem('dashboardModalCheck', true);
        }
      }

      setData(res);
    });
  }, []);

  // Dashboard ~Sales Icon, val>0 => +, val<0 => -, val=0 => -
  const salesIcon = (val) => {
    if (val === 0) {
      return (
        <>
          <i className="feather icon-minus text-c-black f-30 m-r-5" /> {val}
        </>
      );
    } else if (val < 0) {
      return (
        <>
          <i className="feather icon-arrow-down text-c-red f-30 m-r-5" /> {setComma(val)}
        </>
      );
    } else {
      return (
        <>
          <i className="feather icon-arrow-up text-c-green f-30 m-r-5" /> {setComma(val)}
        </>
      );
    }
  };

  // sessionStorage 고객아이디 변경
  const toAs = (customerId) => {
    window.sessionStorage.setItem('customerId', customerId);
  };

  // AS Tab List
  const AsList = (asData) => {
    // Tr Style
    const dashboardTrStyle = {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textAlign: 'center',
    };

    return (
      <Aux>
        {isDesktop && (
          <>
            <Card className="Recent-Users">
              <Card.Body className="px-0 py-2">
                <Table hover style={{ tableLayout: 'fixed' }}>
                  <thead style={{ textAlign: 'center' }}>
                    <tr>
                      <th>고객(거래처)명</th>
                      <th>AS상태</th>
                      <th>출장/내방</th>
                      <th>담당자</th>
                      <th>접수 내용</th>
                      <th>접수일</th>
                      <th>방문일</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asData.map((el, i) => {
                      return (
                        <tr className="unread" key={i}>
                          <td style={dashboardTrStyle} title={el.customer_name}>
                            <span className="m-0">{el.customer_name}</span>
                          </td>
                          <td style={dashboardTrStyle} title={el.category_name2}>
                            <span className="m-0">{el.category_name2}</span>
                          </td>
                          <td style={dashboardTrStyle} title={el.category_name3}>
                            <span className="m-0">{el.category_name3}</span>
                          </td>
                          <td style={dashboardTrStyle} title={el.engineer_name}>
                            <span className="m-0">{el.engineer_name}</span>
                          </td>
                          <td style={dashboardTrStyle} title={el.content}>
                            <span className="m-0">{el.content}</span>
                          </td>
                          <td style={dashboardTrStyle} title={el.register_date ? el.register_date.slice(0, 10) : null}>
                            <span className="m-0">{el.register_date ? el.register_date.slice(0, 10) : null}</span>
                          </td>
                          <td
                            style={dashboardTrStyle}
                            title={el.visit_date ? el.visit_date.slice(0, 10) : el.visit_date}
                          >
                            <span className="m-0">{el.visit_date ? el.visit_date.slice(0, 10) : el.visit_date}</span>
                          </td>
                          <td style={dashboardTrStyle}>
                            <a
                              href={`/Trade/As/asUpdate/${el.id}`}
                              className="label theme-bg text-white f-12"
                              onClick={() => toAs(el.customer_id)}
                            >
                              이동
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </>
        )}
        {isMobile && (
          <>
            {asData.map((el, i) => {
              return (
                <Card className="Recent-Users" key={i}>
                  <Card.Header>
                    <Card.Title as="h5">{el.customer_name}</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div style={{ display: 'block' }}>
                      <Card.Text>
                        {el.category_name2}/{el.category_name3}/{el.engineer_name}
                      </Card.Text>
                      <Card.Text>접수일 : {el.register_date.slice(0, 10)}</Card.Text>
                      {el.category_name2 === '진행' ? (
                        <Card.Text>방문일 : {el.visit_date.slice(0, 10)}</Card.Text>
                      ) : null}
                      <Card.Text>{el.content}</Card.Text>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                      <a
                        href={`/Trade/As/asUpdate/${el.id}`}
                        className="label theme-bg text-white f-12"
                        onClick={() => toAs(el.customer_id)}
                        style={{ borderRadius: '15px' }}
                      >
                        이동
                      </a>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </>
        )}
      </Aux>
    );
  };

  return (
    <Aux>
      <DashboardDocumentModal visible={dashboardModalVisible} />
      <Row>
        {(sessionStorage.getItem('permission') === '3' || sessionStorage.getItem('permission') === '2') && (
          <>
            <Col md={6} xl={4}>
              <Card>
                <Card.Body>
                  <h6 className="mb-4">Daily Sales</h6>
                  <div className="row d-flex align-items-center">
                    <div className="col-9">
                      <h3 className="f-w-300 d-flex align-items-center m-b-0">{salesIcon(data.now_amount)}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} xl={4}>
              <Card>
                <Card.Body>
                  <h6 className="mb-4">Monthly Sales</h6>
                  <div className="row d-flex align-items-center">
                    <div className="col-9">
                      <h3 className="f-w-300 d-flex align-items-center m-b-0">{salesIcon(data.month_amount)}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={12} xl={4}>
              <Card>
                <Card.Body>
                  <h6 className="mb-4">Yearly Sales</h6>
                  <div className="row d-flex align-items-center">
                    <div className="col-9">
                      <h3 className="f-w-300 d-flex align-items-center m-b-0">{salesIcon(data.year_amount)}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}

        <Col md={6} xl={3}>
          <Card>
            <Card.Body className="border-bottom">
              <div className="row d-flex align-items-center">
                <div className="col-auto">
                  <i className="feather icon-bell f-30 text-c-yellow" />
                </div>
                <div className="col">
                  <h3 className="f-w-300">{data.accepted_as}</h3>
                  <span className="d-block text-uppercase">이번 달 접수된 AS</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card>
            <Card.Body className="border-bottom">
              <div className="row d-flex align-items-center">
                <div className="col-auto">
                  <i className="feather icon-loader f-30 text-c-green" />
                </div>
                <div className="col">
                  <h3 className="f-w-300">{data.ongoing_as}</h3>
                  <span className="d-block text-uppercase">이번 달 진행 중인 AS</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card>
            <Card.Body>
              <div className="row d-flex align-items-center">
                <div className="col-auto">
                  <i className="feather icon-check-circle f-30 text-c-blue" />
                </div>
                <div className="col">
                  <h3 className="f-w-300">{data.completed_as}</h3>
                  <span className="d-block text-uppercase">이번 달 완료된 AS</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card>
            <Card.Body>
              <div className="row d-flex align-items-center">
                <div className="col-auto">
                  <i className="feather icon-x f-30 text-c-red" />
                </div>
                <div className="col">
                  <h3 className="f-w-300">{data.canceled_as}</h3>
                  <span className="d-block text-uppercase">이번 달 취소된 AS</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12} xl={12} className="m-b-30">
          <Tabs defaultActiveKey="today" id="uncontrolled-tab-example">
            <Tab eventKey="today" title="AS">
              {data.total_as ? AsList(data.total_as) : null}
            </Tab>
            {/* <Tab eventKey="week" title="Test">
              {tabContent}
            </Tab> */}
            {/* <Tab eventKey="all" title="All">
              {tabContent}
            </Tab> */}
          </Tabs>
        </Col>
      </Row>
    </Aux>
  );
};

export default Dashboard;
