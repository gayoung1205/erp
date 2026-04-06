import React, { useState, useEffect } from 'react';
import requestEngineerGet from '../../Axios/Engineer/requestEngineerGet';

const EngineerSelect = (props) => {
  const [data, setData]           = useState([]);
  const [isLoading, setLoading]   = useState(true);

  useEffect(() => {
    if (props.loading !== false) {
      requestEngineerGet().then((res) => {
        // ★ 활성화된 직원만 필터링 (is_active가 false인 직원 제외)
        const activeOnly = res.filter((eng) => eng.is_active !== false);
        setData(activeOnly);
        setLoading(false);
      });
    }
  }, [props.loading]);

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