import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestPendingStockUpdate = async (id, data) => {
    let token = sessionStorage.getItem('token');
    let returnData;

    await axios({
        url: `${config.backEndServerAddress}api/pending-stock/${id}/`,
        method: 'PUT',
        headers: { Authorization: `JWT ${token}` },
        data: data,
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

export default requestPendingStockUpdate;