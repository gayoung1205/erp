import React, { useState, useEffect, useCallback, useRef } from 'react';
import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';
import { useMediaQuery } from 'react-responsive';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { Button } from 'react-bootstrap';
import { message } from 'antd';

import requestCalendarGet from '../../Axios/Calendar/requestCalendarGet';
import requestCalendarCreate from '../../Axios/Calendar/requestCalendarCreate';
import requestCalendarUpdate from '../../Axios/Calendar/requestCalendarUpdate';
import requestCalendarDelete from '../../Axios/Calendar/requestCalendarDelete';
import requestEngineerGet from '../../Axios/Engineer/requestEngineerGet';

import CalendarMobileCreatePopup from './calendarMobileCreatePopup';
import CalendarMobileUpdatePopup from './calendarMobileUpdatePopup';

const CalendarMain = () => {
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)' });
  const [schedules, setSchedules] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [calendarTypes, setCalendarTypes] = useState([]);
  const [createPopupVisible, setCreatePopupVisible] = useState(false);
  const [updatePopupVisible, setUpdatePopupVisible] = useState(false);
  const [createPopupData, setCreatePopupData] = useState({});
  const [updatePopupData, setUpdatePopupData] = useState({});

  const calendarRef = useRef(null);
  const calendarTypesRef = useRef([]);
  const currentViewRef = useRef(isDesktop ? 'month' : 'day');

  const engineerColors = {
    '류승영': '#FF5583',
    '김영기': '#FFBB3B',
    '서우종': '#03BD9E',
    '고영훈': '#4169E1',
    '김태우': '#FF4500',
    '임환규': '#bdb76b',
    '김상중': '#9e5fff',
    '조윤아': '#00a9ff',
    '김현수': '#607d8b',
    '문가영': '#e91e63',
    '김현숙': '#2196f3',
  };
  const defaultColor = '#888888';

  const formatTZDate = (d) => {
    if (!d) return null;
    if (typeof d === 'string') return d.slice(0, 19);
    let date;
    if (d._date instanceof Date) {
      date = d._date;
    } else if (d instanceof Date) {
      date = d;
    } else {
      return null;
    }
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const formatSchedules = (calRes, types) => {
    return calRes.map((item) => {
      const assignedType = types.find(t => String(t.id) === String(item.engineer));
      const itemColor = item.bg_color || (assignedType ? assignedType.bgColor : defaultColor);
      const isCompleted = item.title && item.title.includes('완료');
      return {
        id: String(item.id),
        calendarId: String(item.engineer || (types[0] && types[0].id) || '1'),
        title: item.title,
        start: item.start,
        end: item.end,
        isAllDay: item.isAllDay || false,
        category: item.isAllDay ? 'allday' : 'time',
        color: isCompleted ? '#999999' : '#FFFFFF',
        bgColor: isCompleted ? '#d3d3d3' : itemColor,
        borderColor: isCompleted ? '#aaaaaa' : itemColor,
        bg_color: itemColor,
        customStyle: isCompleted ? 'text-decoration: line-through;' : '',
      };
    });
  };

  const refreshCalendar = useCallback(() => {
    requestCalendarGet().then((calRes) => {
      if (!calRes) return;
      setSchedules(formatSchedules(calRes, calendarTypesRef.current));
    });
  }, []);

  useEffect(() => {
    requestEngineerGet(true).then((res) => {
      if (res) {
        setEngineers(res);
        const types = res.map((eng) => {
          const bgColor = engineerColors[eng.name] || defaultColor;
          return {
            id: String(eng.id),
            name: eng.name,
            color: '#FFFFFF',
            bgColor: bgColor,
            borderColor: bgColor,
          };
        });
        setCalendarTypes(types);
        calendarTypesRef.current = types;
        requestCalendarGet().then((calRes) => {
          if (calRes) setSchedules(formatSchedules(calRes, types));
        });
      }
    });
  }, []);

  // schedules 갱신 시 현재 뷰 복원
  useEffect(() => {
    setTimeout(() => {
      const inst = calendarRef.current && calendarRef.current.getInstance();
      if (inst && inst.getViewName() !== currentViewRef.current) {
        inst.changeView(currentViewRef.current, true);
      }
      updateDateRange();
    }, 100);
  }, [schedules]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const calInstance = calendarRef.current && calendarRef.current.getInstance();
      if (calInstance) {
        const targetView = isDesktop ? 'month' : 'day';
        if (calInstance.getViewName() !== targetView) {
          calInstance.changeView(targetView, true);
        }
        updateDateRange();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isDesktop]);

  const updateDateRange = () => {
    const calInstance = calendarRef.current && calendarRef.current.getInstance();
    if (!calInstance) return;
    const viewName = calInstance.getViewName();
    const el = document.getElementById('calendarDateRange');
    if (!el) return;
    if (viewName === 'week') {
      const start = calInstance.getDateRangeStart()._date.toLocaleDateString();
      const end = calInstance.getDateRangeEnd()._date.toLocaleDateString();
      el.textContent = `${start} ~ ${end}`;
    } else if (viewName === 'day') {
      el.textContent = calInstance.getDate()._date.toLocaleDateString();
    } else {
      const parts = calInstance.getDate()._date.toLocaleDateString().split('.');
      el.textContent = `${parts[0]}. ${parts[1]}`;
    }
  };

  const handlePrev = () => {
    calendarRef.current.getInstance().prev();
    updateDateRange();
  };

  const handleNext = () => {
    calendarRef.current.getInstance().next();
    updateDateRange();
  };

  const handleChangeView = () => {
    const calInstance = calendarRef.current.getInstance();
    const currentView = calInstance.getViewName();
    let newView;
    if (isDesktop) {
      newView = currentView === 'week' ? 'month' : 'week';
    } else {
      newView = currentView === 'day' ? 'week' : 'day';
    }
    calInstance.changeView(newView, true);
    currentViewRef.current = newView;
    updateDateRange();
  };

  const handleBeforeCreateSchedule = useCallback((scheduleData) => {
    const calInstance = calendarRef.current && calendarRef.current.getInstance();
    if (calInstance) calInstance.render();
    setCreatePopupData({ start: scheduleData.start, end: scheduleData.end });
    setCreatePopupVisible(Date.now());
  }, []);

  const createSchedule = (data) => {
    const engineerType = calendarTypes.find(t => String(t.id) === String(data.calendarId));
    const engineerColor = engineerType ? engineerType.bgColor : defaultColor;
    const newData = {
      title: data.title,
      start: data.start,
      end: data.end,
      calendarId: String(data.calendarId),
      engineer_id: data.calendarId,
      isAllDay: false,
      category: 'time',
      bg_color: engineerColor,
    };
    requestCalendarCreate(newData).then((res) => {
      if (res) {
        message.success('일정이 등록되었습니다. (구글 캘린더 동기화 완료)');
        refreshCalendar();
      } else {
        message.error('일정 등록에 실패했습니다.');
      }
    });
  };

  const handleClickSchedule = useCallback((e) => {
    const { schedule } = e;
    const originalSchedule = schedules.find((s) => s.id === schedule.id);
    setUpdatePopupData({
      id: schedule.id,
      calendarId: schedule.calendarId,
      title: schedule.title,
      start: schedule.start,
      end: schedule.end,
      bg_color: (originalSchedule && originalSchedule.bg_color) || defaultColor,
    });
    setUpdatePopupVisible(Date.now());
  }, [schedules]);

  const updateSchedule = (data) => {
    const engineerType = calendarTypes.find(t => String(t.id) === String(data.calendarId));
    const engineerColor = engineerType ? engineerType.bgColor : defaultColor;
    const updateData = {
      title: data.title,
      start: data.start,
      end: data.end,
      calendarId: String(data.calendarId),
      engineer_id: data.calendarId,
      bg_color: engineerColor,
    };
    requestCalendarUpdate(data.id, updateData).then(() => {
      message.success('일정이 수정되었습니다. (구글 캘린더 동기화 완료)');
      refreshCalendar();
    });
  };

  // ✅ onBeforeDeleteSchedule 제거, 팝업에서 직접 호출
  const deleteSchedule = (id) => {
    requestCalendarDelete(id).then(() => {
      message.success('일정이 삭제되었습니다. (구글 캘린더 동기화 완료)');
      refreshCalendar();
    });
  };

  const handleBeforeUpdateSchedule = useCallback((e) => {
    const { schedule, changes } = e;
    const newStart = formatTZDate(changes.start || schedule.start);
    const newEnd = formatTZDate(changes.end || schedule.end);
    if (!newStart || !newEnd) {
      message.error('날짜 변환에 실패했습니다.');
      return;
    }
    const originalSchedule = schedules.find((s) => s.id === String(schedule.id));
    const bgColor = (originalSchedule && originalSchedule.bg_color)
        || schedule.bgColor
        || defaultColor;
    const updateData = {
      title: changes.title || schedule.title,
      start: newStart,
      end: newEnd,
      calendarId: changes.calendarId || schedule.calendarId,
      engineer_id: changes.calendarId || schedule.calendarId,
      bg_color: bgColor,
    };
    requestCalendarUpdate(schedule.id, updateData).then(() => {
      message.success('일정이 수정되었습니다. (구글 캘린더 동기화 완료)');
      refreshCalendar();
    });
  }, [refreshCalendar, schedules]);

  return (
      <>
        <div style={{ padding: '10px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5px' }}>
            <Button variant="outline-primary" size="sm" onClick={handleChangeView}>변경</Button>
            <Button variant="outline-primary" size="sm" onClick={handlePrev}><BsChevronLeft /></Button>
            <Button variant="outline-primary" size="sm" onClick={handleNext}><BsChevronRight /></Button>
            <span
                id="calendarDateRange"
                style={{ paddingLeft: '12px', fontSize: '19px', verticalAlign: 'middle' }}
            ></span>
          </div>
        </div>

        <div style={{ padding: '0 10px' }}>
          <Calendar
              key={isDesktop ? 'pc-month' : 'mobile-day'}
              height={isDesktop ? '800px' : '500px'}
              ref={calendarRef}
              schedules={schedules}
              calendars={calendarTypes}
              defaultView={isDesktop ? 'month' : 'day'}
              taskView={false}
              scheduleView={['time', 'allday']}
              timezones={[{ timezoneOffset: 540, tooltip: 'Seoul' }]}
              useCreationPopup={false}
              useDetailPopup={false}
              isReadOnly={false}
              onBeforeCreateSchedule={handleBeforeCreateSchedule}
              onClickSchedule={handleClickSchedule}
              onBeforeUpdateSchedule={handleBeforeUpdateSchedule}
              // ✅ onBeforeDeleteSchedule 완전 제거
              onAfterRenderSchedule={() => { updateDateRange(); }}
          />
        </div>

        <CalendarMobileCreatePopup
            visible={createPopupVisible}
            data={createPopupData}
            users={engineers}
            create={createSchedule}
        />

        <CalendarMobileUpdatePopup
            visible={updatePopupVisible}
            data={updatePopupData}
            users={engineers}
            update={updateSchedule}
            delete={deleteSchedule}
        />
      </>
  );
};

export default CalendarMain;