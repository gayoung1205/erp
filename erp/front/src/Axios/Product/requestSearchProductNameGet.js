import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';
import { message } from 'antd';

const requestSearchProductNameGet = async (searchText) => {
    let token = sessionStorage.getItem('token');
    let productData;

    const encodedText = encodeURIComponent(searchText);

    const baseUrl = `${config.backEndServerAddress}api/products?name=${encodedText}&code=${encodedText}`;

    await axios({
        url: baseUrl + '&page=1',
        method: 'GET',
        headers: { Authorization: `JWT ${token}` },
    })
    .then(async (res) => {
        if (!res.data || !res.data.data || !res.data.data.results || res.data.data.results.length === 0) {
            message.warning('검색 내용이 없습니다.');
            return;
        }

        const { results, max_page } = res.data.data;
        let allResults = [...results];

        if (max_page > 1) {
            for (let page = 2; page <= max_page; page++) {
                await axios({
                    url: baseUrl + `&page=${page}`,
                    method: 'GET',
                    headers: { Authorization: `JWT ${token}` },
                })
                .then((pageRes) => {
                    if (pageRes.data?.data?.results) {
                        allResults = [...allResults, ...pageRes.data.data.results];
                    }
                })
                .catch((err) => CheckToken(err));
            }
        }

        productData = allResults;
    })
    .catch((err) => {
        CheckToken(err);
    });

    return productData;
};

export default requestSearchProductNameGet;