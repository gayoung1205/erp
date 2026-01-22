import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestPendingStockSell = async (id, data) => {
    let token = sessionStorage.getItem('token');
    let returnData;

    // data = { trade_id, price, tax_category }
    await axios({
        url: `${config.backEndServerAddress}api/pending-stock/${id}/sell/`,
        method: 'POST',
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

export default requestPendingStockSell;