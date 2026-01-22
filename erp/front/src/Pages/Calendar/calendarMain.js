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
  const [schedules, setSchedules] = useState([]);
  const [users, setUsers] = useState();
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)' });
  const calendarRef = useRef(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [createData, setCreateData] = useState({});
  const [updateVisible, setUpdateVisible] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const handlePopup = isDesktop ? true : false;

  useEffect(() => {
    requestCalendarGet().then((res) => setSchedules(res));
  }, []);

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

  useEffect(() => {
    const calendarInstance = calendarRef.current;
    if (calendarInstance && calendarInstance.getInstance) {
      const calendar = calendarInstance.getInstance();
      if (calendar) {
        if (isDesktop) {
          calendar.changeView('week', true);
        } else {
          calendar.changeView('day', true);
        }
        fromStartToEndDate();
      }
    }
  }, [isDesktop]);

  const fromStartToEndDate = useCallback(() => {
    const calendarInstance = calendarRef.current;
    if (calendarInstance && calendarInstance.getInstance) {
      const calendar = calendarInstance.getInstance();

      if (calendar) {
        const viewName = calendar.getViewName();
        if (viewName === 'week') {
          const start = calendar.getDateRangeStart()._date.toLocaleDateString();
          const end = calendar.getDateRangeEnd()._date.toLocaleDateString();
          document.getElementById('fromStartToEndDate').textContent = `${start}~${end}`;
        } else if (viewName === 'day') {
          // ⭐ 일간 뷰 날짜 표시 추가
          const date = calendar.getDate()._date.toLocaleDateString();
          document.getElementById('fromStartToEndDate').textContent = date;
        } else {
          const month = calendar.getDate()._date.toLocaleDateString().split('.');
          document.getElementById('fromStartToEndDate').textContent = `${month[0]}. ${month[1]}`;
        }
      }
    }
  }, [calendarRef]);

  const handleClickTodayButton = useCallback(() => {
    const calendarInstance = calendarRef.current;
    if (!calendarInstance) {
      return;
    }

    const calendar = calendarInstance.getInstance();
    if (!calendar) {
      return;
    }

    calendar.today();
    fromStartToEndDate();
  }, [calendarRef, fromStartToEndDate]);

  const handleClickNextButton = useCallback(() => {
    const calendarInstance = calendarRef.current;
    if (!calendarInstance) {
      return;
    }

    const calendar = calendarInstance.getInstance();
    if (!calendar) {
      return;
    }

    calendar.next();
    fromStartToEndDate();
  }, [calendarRef, fromStartToEndDate]);

  const handleClickPreviousButton = useCallback(() => {
    const calendarInstance = calendarRef.current;
    if (!calendarInstance) {
      return;
    }

    const calendar = calendarInstance.getInstance();
    if (!calendar) {
      return;
    }

    calendar.prev();
    fromStartToEndDate();
  }, [calendarRef, fromStartToEndDate]);

  // ⭐ 수정: 모바일에서는 day ↔ week, 데스크톱에서는 week ↔ month
  const handleChangeViewButton = useCallback(() => {
    const calendarInstance = calendarRef.current;
    if (!calendarInstance) {
      return;
    }

    const calendar = calendarInstance.getInstance();
    if (!calendar) {
      return;
    }

    const viewName = calendar.getViewName();

    if (isDesktop) {
      // 데스크톱: week ↔ month
      if (viewName === 'week') {
        calendar.changeView('month', true);
      } else {
        calendar.changeView('week', true);
      }
    } else {
      // 모바일: day ↔ week
      if (viewName === 'day') {
        calendar.changeView('week', true);
      } else {
        calendar.changeView('day', true);
      }
    }
    fromStartToEndDate();
  }, [calendarRef, fromStartToEndDate, isDesktop]);

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
      };

      requestCalendarCreate(schedule).then((res) => {
        if (calendarRef.current) {
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
        }
      }).catch((error) => {
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
            height={isDesktop ? "1000px" : "700px"}  // ⭐ 모바일 높이 조정
            ref={calendarRef}
            schedules={schedules}
            calendars={users}
            defaultView={isDesktop ? "week" : "day"}  // ⭐ 모바일은 일간 뷰!
            taskView={false}
            scheduleView={['time']}
            timezones={[{ timezoneOffset: 540, tooltip: 'Seoul' }]}
            disableDblClick={true}
            disableClick={false}
            useDetailPopup={true}
            useCreationPopup={handlePopup}
            week={{
              hourStart: 8,
              hourEnd: 22,  // ⭐ 표시 시간 범위 설정
            }}
            // ⭐ 모바일용 템플릿 (시간 슬롯 높이 증가)
            template={{
              timegridDisplayPrimayTime: function(time) {
                return time.hour + ':00';
              },
            }}
            onAfterRenderSchedule={(e) => {
              fromStartToEndDate();
            }}
            onBeforeCreateSchedule={(e) => {
              isDesktop ? desktopCreate(e) : handleMobileCreate(e);
            }}
            onBeforeDeleteSchedule={handleDeleteSchedule}
            onBeforeUpdateSchedule={(e) => {
              isDesktop ? DesktopUpdate(e) : handleMobileUpdate(e.schedule);
            }}
        />

        {/* ⭐ 모바일용 CSS 추가 */}
        {!isDesktop && (
            <style>{`
          .tui-full-calendar-timegrid-hour {
            height: 60px !important;
          }
          .tui-full-calendar-timegrid-gridline {
            height: 60px !important;
          }
          .tui-full-calendar-time-schedule {
            font-size: 14px !important;
          }
          .tui-full-calendar-weekday-grid-line {
            height: 80px !important;
          }
        `}</style>
        )}
      </>
  );
};

export default CalendarMain;