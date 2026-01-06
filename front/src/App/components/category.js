import React, { useState, useEffect } from 'react';
import requestCategoryGet from '../../Axios/Category/requestCategoryGet';

const Category = (props) => {
  const category = props.data; // Customer Category, Product Category 구분값
  const [data, setData] = useState([]); // Category Data
  const [isLoading, setLoading] = useState(true); // isLoading이 False일 경우만 Category Option Return

  // category가 바뀔 때마다 requestCategoryGet 실행
  useEffect(() => {
    requestCategoryGet(category).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [category]);

  // isLoading이 False일 경우에만 Options Return
  const Options = () => {
    return data.map((v, k) => {
      return <option key={k}>{v.name}</option>;
    });
  };

  return isLoading ? <option></option> : <Options />;
};

export default Category;
