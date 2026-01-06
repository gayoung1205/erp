
import React, { useState, useEffect, createRef, useCallback, memo, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { Button } from 'react-bootstrap';
import userSample from './calendarUsers';
import CalendarMobileCreatePopup from './calendarMobileCreatePopup';
import CalendarMobileUpdatePopup from './calendarMobileUpdatePopup';
import requestCalendarGet from '../../Axios/Calendar/requestCalendarGet';
import requestCalendarCreate from '../../Axios/Calendar/requestCalendarCreate';
import requestCalendarDelete from '../../Axios/Calendar/requestCalendarDelete';
import requestCalendarUpdate from '../../Axios/Calendar/requestCalendarUpdate';

const MemoedCalendar = memo(Calendar);
const MemoedCalendarMobileCreatePopup = memo(CalendarMobileCreatePopup);
const MemoedCalendarMobileUpdatePopup = memo(CalendarMobileUpdatePopup);

const CalendarMain = () => {
  const [schedules, setSchedules] = useState([]); // calendar data
  const [users, setUsers] = useState();
  const isDesktop = useMediaQuery({ query: '(min-device-width: 480px)' }); // DeviceWidth > 480
  const calendarRef = useRef(null); // toast ui calendar function을 쓰기 위해서
  const [createVisible, setCreateVisible] = useState(false);
  const [createData, setCreateData] = useState({});
  const [updateVisible, setUpdateVisible] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const handlePopup = isDesktop ? true : false;
  
  // count가 변경될 때마다 requestCalendarGet()이 실행
  useEffect(() => {
    requestCalendarGet().then((res) => setSchedules(res));
  }, []);

  // calendar user에 해당하는 계정일 경우 정렬
  useEffect(() => {
    const username = window.sessionStorage.getItem('username');
    let nameList = [];
    let userList = [];
    for (const i in userSample) {
      nameList.push(userSample[i].name);
    }
    if (nameList.includes(username)) {
      for (const i in userSample) {
        if (username === userSample[i].name) {
          userList.splice(0, 0, userSample[i]);
        } else {
          userList.push(userSample[i]);
        }
      }
      setUsers(userList);
    } else {
      setUsers(userSample);
    }
  }, []);

  // span fromStartToEndDate Text 변경
  const fromStartToEndDate = useCallback(() => {
    const calendarInstance = calendarRef.current;
    if (calendarInstance && calendarInstance.getInstance) {
      const calendar = calendarInstance.getInstance();
    
      if (calendar) {
        if (calendar.getViewName() === 'week') {
          const start = calendar.getDateRangeStart()._date.toLocaleDateString();
          const end = calendar.getDateRangeEnd()._date.toLocaleDateString();
          document.getElementById('fromStartToEndDate').textContent = `${start}~${end}`;
        } else {
          const month = calendar.getDate()._date.toLocaleDateString().split('.');
          document.getElementById('fromStartToEndDate').textContent = `${month[0]}. ${month[1]}`;
        }
      }
    }
  }, [calendarRef]);

  // Today Button Click 시에 오늘 날짜로 이동
  const handleClickTodayButton = useCallback(() => {
    const calendarInstance = calendarRef.current;
    if (!calendarInstance) {
      return; // calendarRef.current가 null이면 함수를 종료합니다.
    }
  
    const calendar = calendarInstance.getInstance();
    if (!calendar) {
      return; // calendar 인스턴스가 없으면 함수를 종료합니다.
    }
  
    calendar.today();
    fromStartToEndDate();
  }, [calendarRef, fromStartToEndDate]);

  // > Button Click 시 다음으로 이동
  const handleClickNextButton = useCallback(() => {
    const calendarInstance = calendarRef.current;
    if (!calendarInstance) {
      return; // calendarRef.current가 null이면 함수를 종료합니다.
    }
  
    const calendar = calendarInstance.getInstance();
    if (!calendar) {
      return; // calendar 인스턴스가 없으면 함수를 종료합니다.
    }
  
    calendar.next();
    fromStartToEndDate();
  }, [calendarRef, fromStartToEndDate]);

  // < Button Click 시 이전으로 이동
  const handleClickPreviousButton = useCallback(() => {
    const calendarInstance = calendarRef.current;
    if (!calendarInstance) {
      return; // calendarRef.current가 null이면 함수를 종료합니다.
    }
  
  const calendar = calendarInstance.getInstance();
  if (!calendar) {
      return; // calendar 인스턴스가 없으면 함수를 종료합니다.
  }
  
    calendar.prev();
    fromStartToEndDate();
  }, [calendarRef, fromStartToEndDate]);

  // 변경 Button Click 시 month, week 변경
  const handleChangeViewButton = useCallback(() => {
    const calendarInstance = calendarRef.current;
    if (!calendarInstance) {
      return; // calendarRef.current가 null이면 함수를 종료합니다.
    }
    
    const calendar = calendarInstance.getInstance();
    if (!calendar) {
      return; // calendar 인스턴스가 없으면 함수를 종료합니다.
    }
  
    const viewName = calendar.getViewName();
    if (viewName === 'week') {
      calendar.changeView('month', true);
    } else {
      calendar.changeView('week', true);
    }
    fromStartToEndDate();
  }, [calendarRef, fromStartToEndDate]);

  const RangeDate = useCallback(() => {
    return (
      <>
        <span id="fromStartToEndDate" style={{ fontSize: '19px', verticalAlign: 'middle' }}></span>
      </>
    );
  }, []);

  const ChangeViewButton = useCallback(() => {
    return (
      <>
        <Button variant="outline-primary" size="sm" onClick={handleChangeViewButton}>
          변경
        </Button>
      </>
    );
  }, [handleChangeViewButton]);

  const ClickTodayButton = useCallback(() => {
    return (
      <>
        <Button variant="outline-primary" size="sm" onClick={handleClickTodayButton}>
          Today
        </Button>
      </>
    );
  }, [handleClickTodayButton]);

  const ClickPreviousButton = useCallback(() => {
    return (
      <>
        <Button variant="outline-primary" size="sm" onClick={handleClickPreviousButton}>
          <BsChevronLeft />
        </Button>
      </>
    );
  }, [handleClickPreviousButton]);

  const ClickNextButton = useCallback(() => {
    return (
      <>
        <Button variant="outline-primary" size="sm" onClick={handleClickNextButton}>
          <BsChevronRight />
        </Button>
      </>
    );
  }, [handleClickNextButton]);

  const desktopCreate = (e) => {
    if (e.title !== undefined) {
      let schedule = {
        calendarId: e.calendarId,
        title: e.title,
        isAllDay: e.isAllDay,
        start: e.start._date,
        end: e.end._date,
        category: e.isAllDay ? 'allday' : 'time',
        // location: e.location,
      };
  
      requestCalendarCreate(schedule).then((res) => {
        if (calendarRef.current) { // Ensure calendarRef.current exists and is not null
          calendarRef.current.getInstance().createSchedules([
            {
              id: res,
              calendarId: schedule.calendarId,
              title: schedule.title,
              isAllDay: schedule.isAllDay,
              start: schedule.start,
              end: schedule.end,
              category: schedule.category,
            },
          ]);
        } else {
          // Handle the case when calendarRef.current is null or undefined
        }
      }).catch((error) => {
        // Handle requestCalendarCreate() error, if any
        console.error("Error creating schedule:", error);
      });
    }
  };

  const mobileCreate = (data) => {
    let schedule = {
      calendarId: data.calendarId,
      title: data.title,
      isAllDay: false,
      start: data.start,
      end: data.end,
      category: 'time',
      // location: e.location,
    };

    requestCalendarCreate(schedule).then((res) => {
      calendarRef.current.getInstance().createSchedules([
        {
          id: res,
          calendarId: schedule.calendarId,
          title: schedule.title,
          isAllDay: schedule.isAllDay,
          start: schedule.start,
          end: schedule.end,
          category: schedule.category,
        },
      ]);
    });
  };
  const handleDeleteSchedule = ({ schedule }) => {
    const calendarInstance = calendarRef.current && calendarRef.current.getInstance();

    if (calendarInstance) {
      requestCalendarDelete(schedule.id)
        .then(() => {
          calendarInstance.deleteSchedule(schedule.id, schedule.calendarId);
        })
        .catch((error) => {
          console.error("Error deleting schedule:", error);
        });
    } else {
      console.error("Calendar instance or its method getInstance() is not available.");
    }
  };

  const handleMobileCreate = (e) => {
    setCreateVisible(!createVisible);
    setCreateData({ start: e.start._date, end: e.end._date });
  };

  const handleMobileUpdate = (data) => {
    setUpdateVisible(!updateVisible);
    setUpdateData({
      id: data.id,
      calendarId: data.calendarId,
      title: data.title,
      start: data.start._date,
      end: data.end._date,
    });
  };

  const DesktopUpdate = (e) => {
    if (e.changes.hasOwnProperty('start')) e.changes.start = e.changes.start._date;
    if (e.changes.hasOwnProperty('end')) e.changes.end = e.changes.end._date;

    requestCalendarUpdate(e.schedule.id, e.changes).then(() => {
      calendarRef.current.getInstance().updateSchedule(e.schedule.id, e.schedule.calendarId, e.changes);
    });
  };

  const mobileUpdate = (data) => {
    requestCalendarUpdate(data.id, data).then(() => {
      window.location.reload();
    });
  };

  return (
    <>
      <div style={{ padding: '10px' }}>
        <span>
          <ChangeViewButton />
          <ClickTodayButton />
          <ClickPreviousButton />
          <ClickNextButton />
        </span>
        {isDesktop ? (
          <RangeDate />
        ) : (
          <div>
            <RangeDate />
          </div>
        )}
      </div>
      {isDesktop ? null : (
        <MemoedCalendarMobileCreatePopup visible={createVisible} data={createData} users={users} create={(data) => mobileCreate(data)} />
      )}
      {isDesktop ? null : (
        <MemoedCalendarMobileUpdatePopup visible={updateVisible} data={updateData} users={users} update={(data) => mobileUpdate(data)} />
      )}
      <MemoedCalendar
        height="1000px"
        ref={calendarRef}
        schedules={schedules} // calendar data
        calendars={users} // calendar user
        defaultView="week" // set 'week' or 'day'
        taskView={false} // task 사용
        scheduleView={['time']} //
        timezones={[{ timezoneOffset: 540, tooltip: 'Seoul' }]} // set timezone config
        disableDblClick={true} // dbClick 사용 X
        disableClick={false} // Click 사용
        useDetailPopup={true}
        useCreationPopup={handlePopup}
        week={{ hourStart: 8 }}
        onAfterRenderSchedule={(e) => {
          fromStartToEndDate();
        }} // Rendering 후에 event
        onBeforeCreateSchedule={(e) => {
          isDesktop ? desktopCreate(e) : handleMobileCreate(e);
        }} // Create
        onBeforeDeleteSchedule={handleDeleteSchedule} // Delete
        onBeforeUpdateSchedule={(e) => {
          isDesktop ? DesktopUpdate(e) : handleMobileUpdate(e.schedule);
        }} // Update
      />
    </>
  );
};

export default CalendarMain;
