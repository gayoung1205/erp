import React from 'react';
import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';

// import 'tui-date-picker/dist/tui-date-picker.css';
// import 'tui-time-picker/dist/tui-time-picker.css';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { Button } from 'react-bootstrap';
import requestAttendanceCreate from '../../Axios/Attendance/requestAttendanceCreate';
import requestAttendanceListGet from '../../Axios/Attendance/requestAttendanceListGet';
import requestRecordListGet from '../../Axios/Record/requestRecordListGet';

const AttendanceMain = () => {
  const [schedules, setSchedules] = React.useState([]); // calendar data
  const types = [
    {
      id: 'attendance',
      name: '부서이름',
      color: '#FFFFFF',
      bgColor: '#FF5583',
      borderColor: '#FF5583',
    },
    {
      id: 'vacation',
      name: '휴가',
      color: '#FFFFFF',
      bgColor: '#FFBB3B',
      borderColor: '#FFBB3B',
    },
  ]; // calendar user

  // requestCalendarGet()이 처음 한번만 실행되게끔
  React.useEffect(() => {
    requestAttendanceListGet().then((attendanceRes) => {
      let data = attendanceRes;

      for (const i in data) {
        data[i].calendarId = types[0].id;
        data[i].color = types[0].color;
        data[i].bgColor = types[0].bgColor;
        data[i].borderColor = types[0].borderColor;
        data[i].title = `${data[i].username} ${data[i].date.slice(0, 10)} ${data[i].date.slice(11, 16)} 출근`;
      }
      requestRecordListGet(1, 1).then((recordRes) => {
        for (const i in recordRes) {
          if (recordRes[i].status === 2) {
            recordRes[i].calendarId = types[1].id;
            recordRes[i].color = types[1].color;
            recordRes[i].bgColor = types[1].bgColor;
            recordRes[i].borderColor = types[1].borderColor;
            recordRes[i].category = 'allday';
            recordRes[i].start = recordRes[i].start_date;
            recordRes[i].end = recordRes[i].end_date;
            recordRes[i].isAllDay = true;
            data.push(recordRes[i]);
          }
        }
        setSchedules(data);
      });
    });
  }, []);

  // toast ui calendar function을 쓰기 위해서
  const calendarRef = React.createRef();

  // Today Button Click 시에 오늘 날짜로 이동
  const handleClickTodayButton = () => {
    calendarRef.current.getInstance().today();
    fromStartToEndDate();
  };

  // > Button Click 시 다음으로 이동
  const handleClickNextButton = () => {
    calendarRef.current.getInstance().next();
    fromStartToEndDate();
  };

  // < Button Click 시 이전으로 이동
  const handleClickPreviousButton = () => {
    calendarRef.current.getInstance().prev();
    fromStartToEndDate();
  };

  // 변경 Button Click 시 month, week 변경
  const handleChangeViewButton = () => {
    calendarRef.current.getInstance().getViewName() === 'week'
      ? calendarRef.current.getInstance().changeView('month', true)
      : calendarRef.current.getInstance().changeView('week', true);
    fromStartToEndDate();
  };

  // span fromStartToEndDate Text 변경
  const fromStartToEndDate = () => {
    let calendar = calendarRef.current.getInstance();

    // week일 경우 변경 Button Click 시 month로 변경, month일 경우 week로 변경
    if (calendar.getViewName() === 'week') {
      let start = calendar.getDateRangeStart()._date.toLocaleDateString();
      let end = calendar.getDateRangeEnd()._date.toLocaleDateString();
      document.getElementById('fromStartToEndDate').textContent = `${start}~${end}`;
    } else {
      let month = calendar.getDate()._date.toLocaleDateString();
      month = month.split('.');
      document.getElementById('fromStartToEndDate').textContent = `${month[0]}. ${month[1]}`;
    }
  };

  const handleClickAttendanceButton = () => {
    requestAttendanceCreate();
    window.location.reload();
  };

  return (
    <>
      <div style={{ padding: '10px' }}>
        <span>
          <Button variant="outline-primary" onClick={() => handleChangeViewButton()}>
            변경
          </Button>
          <Button variant="outline-primary" onClick={() => handleClickTodayButton()}>
            Today
          </Button>
          <Button variant="outline-primary" onClick={() => handleClickPreviousButton()}>
            <BsChevronLeft />
          </Button>
          <Button variant="outline-primary" onClick={() => handleClickNextButton()}>
            <BsChevronRight />
          </Button>
          <Button variant="outline-primary" onClick={() => handleClickAttendanceButton()}>
            출근조회
          </Button>
          <span id="fromStartToEndDate" style={{ paddingLeft: ' 12px', fontSize: '19px', verticalAlign: 'middle' }}></span>
        </span>
        <span id="renderRange"></span>
      </div>
      <Calendar
        height="auto"
        ref={calendarRef}
        schedules={schedules} // calendar data
        calendars={types} // calendar user
        defaultView="month" // set 'week' or 'day'
        taskView={false} // task 사용
        scheduleView={['allday']} //
        timezones={[{ timezoneOffset: 540, tooltip: 'Seoul' }]} // set timezone config
        useDetailPopup={true}
        onAfterRenderSchedule={() => {
          fromStartToEndDate();
        }} // Rendering 후에 event
        isReadOnly={true}
      />
    </>
  );
};

export default AttendanceMain;
