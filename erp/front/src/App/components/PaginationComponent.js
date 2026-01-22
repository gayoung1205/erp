import React, { useEffect, useState } from 'react';
import { Pagination } from 'react-bootstrap';
import config from '../../config';

const PaginationComponent = (props) => {
  const [maxPage, setMaxPage] = useState();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (props.maxPage) {
      setMaxPage(props.maxPage);
    }
  }, [props.maxPage]);

  useEffect(() => {
    if (props.page) {
      setPage(props.page);
    }
  }, [props.page]);

  const NumberPage = () => {
    if (maxPage < 6) {
      const pageArr = new Array(maxPage);
      for (let i = 0; i < maxPage; i++) pageArr[i] = i + 1;
      return (
        <>
          {pageArr.map((n) => {
            if (props.url === '') {
              return (
                <Pagination.Item onClick={props.handleRequestGet(n)} active={page === n} key={n}>
                  {n}
                </Pagination.Item>
              );
            } else {
              return (
                <Pagination.Item href={`${config.basename}${props.url}${n}`} active={page === n} key={n}>
                  {n}
                </Pagination.Item>
              );
            }
          })}
        </>
      );
    } else {
      const pageArr = new Array(5);
      if (page < 4) {
        for (let i = 0; i < 5; i++) pageArr[i] = i + 1;
      } else if (page > maxPage - 2) {
        for (let i = maxPage - 4; i <= maxPage; i++) pageArr[i] = i;
      } else {
        for (let i = page - 2; i < page + 3; i++) pageArr[i] = i;
      }
      return (
        <>
          {pageArr.map((n) => {
            return (
              <Pagination.Item href={`${config.basename}${props.url}${n}`} active={page === n} key={n}>
                {n}
              </Pagination.Item>
            );
          })}
        </>
      );
    }
  };

  const PrevPage = () => {
    const prevPage = page <= 1 ? 1 : page - 1;
    return <Pagination.Prev href={`${config.basename}${props.url}${prevPage}`} />;
  };

  const NextPage = () => {
    const nextPage = page >= maxPage ? maxPage : page + 1;
    return <Pagination.Next href={`${config.basename}${props.url}${nextPage}`} />;
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {maxPage && (
          <Pagination>
            <Pagination.First href={`${config.basename}${props.url}1`} />
            <PrevPage />
            <NumberPage />
            <NextPage />
            <Pagination.Last href={`${config.basename}${props.url}${maxPage}`} />
          </Pagination>
        )}
      </div>
    </>
  );
};

export default React.memo(PaginationComponent);
