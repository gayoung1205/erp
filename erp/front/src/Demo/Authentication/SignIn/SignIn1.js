import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './../../../assets/scss/style.scss';
import Aux from '../../../hoc/_Aux';
import { message } from 'antd';
import 'antd/dist/antd.css';
import requestTokenCreate from '../../../Axios/Token/requestTokenCreate';

const SignIn1 = () => {
  const [auth, setAuth] = useState({}); // 아이디, 비밀번호 값
  const history = useHistory(); // location 객체 접근

  // 로그인 클릭시 실행
  const requestLogin = () => {
    requestTokenCreate(auth)
      .then((res) => {
        sessionStorage.setItem('token', res);
        message.success('로그인 성공!');
        history.push(`/dashboard/default`);
        window.location.reload();
      })
      .catch((err) => {
        message.error('존재하지 않은 아이디이거나, 잘못된 비밀번호입니다.');
      });
  };

  return (
    <Aux>
      {/* <Breadcrumb /> */}
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="auth-bg">
            <span className="r" />
            <span className="r s" />
            <span className="r s" />
            <span className="r" />
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="mb-4">
                <i className="feather icon-unlock auth-icon" />
              </div>
              <h3 className="mb-4">Login</h3>
              <div className="input-group mb-3">
                <input
                  className="form-control"
                  placeholder="ID"
                  onChange={(e) => {
                    setAuth({ ...auth, username: e.target.value });
                  }}
                />
              </div>
              <div className="input-group mb-4">
                <input
                  type="password"
                  className="form-control"
                  placeholder="PASSWORD"
                  onChange={(e) => {
                    setAuth({ ...auth, password: e.target.value });
                  }}
                  onKeyUp={() => {
                    if (window.event.keyCode === 13) {
                      requestLogin();
                    }
                  }}
                />
              </div>
              <div className="form-group text-left">
                {/* <div className="checkbox checkbox-fill d-inline">
                  <input type="checkbox" name="checkbox-fill-1" id="checkbox-fill-a1" />
                  <label htmlFor="checkbox-fill-a1" className="cr">
                    {' '}
                    Save credentials
                  </label>
                </div> */}
              </div>
              <button className="btn btn-primary shadow-2 mb-4" onClick={requestLogin}>
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </Aux>
  );
};

export default SignIn1;
