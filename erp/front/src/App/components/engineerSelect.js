import React, { useState, useEffect } from 'react';
import requestEngineerGet from '../../Axios/Engineer/requestEngineerGet';

const EngineerSelect = (props) => {
  const [data, setData] = useState([]); // Engineer Data
  const [isLoading, setLoading] = useState(true); // isLoading이 false일 경우에만 Return Options

  useEffect(() => {
    if (props.loading !== false) {
      requestEngineerGet().then((res) => {
        setData(res);
        setLoading(false);
      });
    }
  }, [props.loading]);

  // isLoading이 false일 경우에만 Return Options
  const Options = () => {
    let opLabel = ['관리팀', '지원팀', '대표이사', '관리자', '연구개발', '전략기획', '생산', '영업'];
    return opLabel.map((i, j) => {
      if (j !== 3 && j !== 4) {
        return (
          <optgroup label={opLabel[j]} key={j}>
            {data.map((k, l) => {
              if (k.category === j) {
                return (
                  <option key={l} value={k.id}>
                    {k.name}
                  </option>
                );
              }
            })}
          </optgroup>
        );
      }
    });
  };

  return isLoading ? <option></option> : <Options />;
};

export default EngineerSelect;
