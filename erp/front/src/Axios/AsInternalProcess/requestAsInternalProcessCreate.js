import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestAsInternalProcessCreate = async (data) => {
    let token = sessionStorage.getItem('token');
    let returnData;

    await axios({
        url: `${config.backEndServerAddress}api/as-internal-processes`,
        method: 'POST',
        headers: { Authorization: `JWT ${token}` },
        data: data,
    })
        .then((res) => {
            returnData = res.data;
        })
        .catch((err) => {
            CheckToken(err);
        });

    return returnData;
};

export default requestAsInternalProcessCreate;