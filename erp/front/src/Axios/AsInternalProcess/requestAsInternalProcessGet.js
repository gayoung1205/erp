import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestAsInternalProcessGet = async (tradeId) => {
    let token = sessionStorage.getItem('token');
    let returnData;

    await axios({
        url: `${config.backEndServerAddress}api/as-internal-processes?trade_id=${tradeId}`,
        method: 'GET',
        headers: { Authorization: `JWT ${token}` },
    })
        .then((res) => {
            returnData = res.data.data;
        })
        .catch((err) => {
            CheckToken(err);
        });

    return returnData;
};

export default requestAsInternalProcessGet;