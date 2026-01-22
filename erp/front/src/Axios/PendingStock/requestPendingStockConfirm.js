import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestPendingStockConfirm = async (id) => {
    let token = sessionStorage.getItem('token');
    let returnData;

    await axios({
        url: `${config.backEndServerAddress}api/pending-stock/${id}/confirm/`,
        method: 'POST',
        headers: { Authorization: `JWT ${token}` },
    })
        .then((res) => {
            returnData = res.data;
        })
        .catch((err) => {
            CheckToken(err);
            throw err;
        });

    return returnData;
};

export default requestPendingStockConfirm;