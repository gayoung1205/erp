import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestPendingStockGet = async (page = 1, status = '0') => {
    let token = sessionStorage.getItem('token');
    let returnData;

    await axios({
        url: `${config.backEndServerAddress}api/pending-stocks`,
        method: 'GET',
        headers: { Authorization: `JWT ${token}` },
        params: {
            page: page,
            status: status,
        },
    })
        .then((res) => {
            returnData = res.data.data;
        })
        .catch((err) => CheckToken(err));

    return returnData;
};

export default requestPendingStockGet;