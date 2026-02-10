import axios from 'axios';
import config from '../../config.js';
import CheckToken from '../../App/components/checkToken';

const requestAsInternalProcessDelete = async (processId) => {
    let token = sessionStorage.getItem('token');
    let returnData;

    await axios({
        url: `${config.backEndServerAddress}api/as-internal-process/${processId}/`,
        method: 'DELETE',
        headers: { Authorization: `JWT ${token}` },
    })
        .then((res) => {
            returnData = res.data;
        })
        .catch((err) => {
            CheckToken(err);
        });

    return returnData;
};

export default requestAsInternalProcessDelete;