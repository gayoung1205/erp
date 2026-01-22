const notNull = (data) => {
  for (const i in data) {
    for (const j in data[i]) {
      if (data[i][j] === null || data[i][j] === 'null') {
        data[i][j] = ' ';
      }
    }
  }

  return data;
};

export default notNull;
