const setComma = (data) => {
  const changeComma = (changeText) => {
    // number 로 변환한 값을 담을 변수
    let num = '';

    // - 분리 dataArr[1]->undefined이면 -가 없는 경우
    let dataArr = changeText.toString().split('-');

    // -부호가 없을 때
    if (dataArr[1] === undefined) {
      num = parseInt(changeText);
      return num.toLocaleString();
    }

    // -부호가 있을 때
    else {
      num = parseInt(dataArr[1]);
      return '-' + num.toLocaleString();
    }
  };

  // 데이터가 객체일 경우
  if (typeof data === 'object') {
    for (const i in data) {
      for (const j in data[i]) {
        if (typeof data[i][j] === 'number') {
          data[i][j] = changeComma(data[i][j]);
        }
      }
    }
  }
  // 데이터가 숫자일 경우
  else if (typeof data === 'number') {
    data = changeComma(data);
  } else {
  }

  return data;
};

export default setComma;
