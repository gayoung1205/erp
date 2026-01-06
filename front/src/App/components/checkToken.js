import { message } from 'antd';

const CheckToken = async (err) => {
  // err message
  console.log(err);

  if (err.response === undefined) {
    return null;
  }

  // 데이터가 이상함
  if (err.response.status === 400) {
    message.error('요청한 데이터가 이상합니다. 데이터를 확인해주세요.');
    return null;
  }

  // 로그인 만료
  if (err.response.status === 401) {
    await message.error('로그인이 만료되었습니다.');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('permission');
    window.location.reload();
  }

  // 권한 없음
  if (err.response.status === 403) {
    message.error('권한이 없습니다.');
    return null;
  }

  // 없는 페이지
  if (err.response.status === 404) {
    message.error('페이지가 존재하지 않습니다.');
    return null;
  }

  // 참조하는 거래내역
  if (err.response.status === 406) {
    message.error('참조하는 거래내역이 있어서 삭제할 수 없습니다.');
    return null;
  }

  // 서버 에러
  if (err.response.status === 500) {
    message.error('서버에 문제가 있습니다.');
    return null;
  }
};

export default CheckToken;
