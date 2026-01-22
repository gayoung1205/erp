import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestCurrentSituationTradeGet = async (page, type, fetchAll = false) => {
  let token = sessionStorage.getItem('token');
  let returnData;
  let url = `trades?page=${page}`;

  if (type) {
    switch (type) {
      case 'delivery':
        url += `&category=7`;
        break;
      case 'myas':
        url = `myas?page=${page}`;  // ⭐ page 파라미터 추가!
        break;
      default:
        url += `&category=0`;
        break;
    }
  }

  await axios({
    url: `${config.backEndServerAddress}api/${url}`,
    method: 'GET',
    headers: { Authorization: `JWT ${token}` },
  })
      .then((res) => {
        returnData = res.data.data;
      })
      .catch((err) => CheckToken(err));

  // 전체 데이터 가져오기
  if (fetchAll && returnData && returnData.max_page > 1) {
    let allResults = [...returnData.results];

    for (let i = 2; i <= returnData.max_page; i++) {
      let nextUrl;
      if (type === 'myas') {
        nextUrl = `myas?page=${i}`;  // ⭐ 수정
      } else {
        nextUrl = `trades?page=${i}&category=${type === 'delivery' ? 7 : 0}`;
      }

      await axios({
        url: `${config.backEndServerAddress}api/${nextUrl}`,
        method: 'GET',
        headers: { Authorization: `JWT ${token}` },
      })
          .then((res) => {
            allResults = [...allResults, ...res.data.data.results];
          })
          .catch((err) => CheckToken(err));
    }

    returnData.results = allResults;
  }

  return returnData;
};

export default requestCurrentSituationTradeGet;