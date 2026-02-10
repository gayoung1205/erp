import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { Button } from 'react-bootstrap';
import { BsBoxArrowUpRight } from 'react-icons/bs';

const CalendarMain = () => {
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)' });

  const calendarSrc = "https://calendar.google.com/calendar/embed?src=aisol.gjlab%40gmail.com&ctz=Asia%2FSeoul";

  const openGoogleCalendar = () => {
    window.open('https://calendar.google.com/calendar/u/0/r?cid=aisol.gjlab@gmail.com', '_blank');
  };

  return (
      <>
        <div style={{ padding: '10px' }}>
          <Button
              variant="primary"
              onClick={openGoogleCalendar}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <BsBoxArrowUpRight />
            Google 캘린더 열기 (일정 등록/수정)
          </Button>
          <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
            💡 일정 등록/수정은 Google 캘린더에서 직접 하세요. 등록된 일정은 아래에서 바로 확인됩니다.
          </p>
        </div>

        <div style={{
          width: '100%',
          height: isDesktop ? 'calc(100vh - 200px)' : 'calc(100vh - 250px)',
          minHeight: isDesktop ? '600px' : '400px'
        }}>
          <iframe
              src={calendarSrc}
              style={{
                border: 0,
                width: '100%',
                height: '100%'
              }}
              frameBorder="0"
              scrolling="no"
              title="회사 공용 캘린더"
          />
        </div>
      </>
  );
};

export default CalendarMain;