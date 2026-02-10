import axios from 'axios'
import config from '../../config.js'
import CheckToken from "../../App/components/checkToken";

const requestEngineerDelete = async (id) => {
    let token = sessionStorage.getItem('token');
    let result = false;

    await axios({
        url: `${config.backEndServerAddress}api/engineer/${id}/`,
        method: 'DELETE',
        headers: { Authorization: `JWT ${token}` },
    })
        .then(() => {
            result = true;
        })
        .catch((err) => {
            CheckToken(err);
            result = false;
        });

    return result;
};

export default requestEngineerDelete;