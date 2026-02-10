import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestProductDeactivate = async (id) => {
    let token = sessionStorage.getItem('token');

    const response = await axios({
        url: `${config.backEndServerAddress}api/product/${id}/`,
        method: 'PATCH',
        headers: { Authorization: `JWT ${token}` },
        data: { action: 'deactivate' },
    }).catch((err) => {
        CheckToken(err);
        throw err;
    });

    return response;
};

export default requestProductDeactivate;