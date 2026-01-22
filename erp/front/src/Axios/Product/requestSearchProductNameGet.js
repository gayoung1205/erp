import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';
import { message } from 'antd';

const requestSearchProductNameGet = async (searchText) => {
    let token = sessionStorage.getItem('token');
    let productData;

    const encodedText = encodeURIComponent(searchText);

    await axios({
        url: `${config.backEndServerAddress}api/products?name=${encodedText}&code=${encodedText}`,
        method: 'GET',
        headers: { Authorization: `JWT ${token}` },
    })
        .then((res) => {
            if (!res.data || !res.data.data || !res.data.data.results || res.data.data.results.length === 0) {
                message.warning('검색 내용이 없습니다.');
            } else {
                productData = res.data.data.results;
            }
        })
        .catch((err) => {
            CheckToken(err);
        });

    return productData;
};

export default requestSearchProductNameGet;