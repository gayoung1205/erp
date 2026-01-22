import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestPendingStockDelete = async (id) => {
    let token = sessionStorage.getItem('token');

    await axios({
        url: `${config.backEndServerAddress}api/pending-stock/${id}/`,
        method: 'DELETE',
        headers: { Authorization: `JWT ${token}` },
    }).catch((err) => {
        CheckToken(err);
        throw err;
    });
};

export default requestPendingStockDelete;