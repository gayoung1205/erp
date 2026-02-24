from google.oauth2 import service_account
from googleapiclient.discovery import build
import os
import logging
import datetime as dt

logger = logging.getLogger("core")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CREDENTIALS_PATH = os.path.join(BASE_DIR, "credentials", "google_calendar_credentials.json")

CALENDAR_ID = "aisol.gjlab@gmail.com"

SCOPES = ["https://www.googleapis.com/auth/calendar"]

def _to_datetime(value):
  if isinstance(value, dt.datetime):
    return value
  if isinstance(value, str):
    for fmt in ("%Y-%m-%dT%H:%M", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M"):
      try:
        return dt.datetime.strptime(value, fmt)
      except ValueError:
        continue
  return None

def get_calendar_service():
  try:
    credentials = service_account.Credentials.from_service_account_file(
        CREDENTIALS_PATH, scopes=SCOPES
    )
    service = build("calendar", "v3", credentials=credentials)
    return service
  except Exception as e:
    logger.error(f"Google Calendar 서비스 생성 실패: {e}")
    return None


def create_google_event(title, start, end, is_all_day=False):
  service = get_calendar_service()
  if not service:
    return None

  try:
    start = _to_datetime(start)
    end = _to_datetime(end)
    if not start or not end:
      logger.error(f"Google Calendar 일정 생성 실패: start 또는 end 변환 불가")
      return None

    if is_all_day:
      # 종일 일정
      event_body = {
        "summary": title,
        "start": {"date": start.strftime("%Y-%m-%d"), "timeZone": "Asia/Seoul"},
        "end": {"date": end.strftime("%Y-%m-%d"), "timeZone": "Asia/Seoul"},
        "reminders": {"useDefault": True},
      }
    else:
      # 시간 지정 일정
      event_body = {
        "summary": title,
        "start": {"dateTime": start.strftime("%Y-%m-%dT%H:%M:%S"), "timeZone": "Asia/Seoul"},
        "end": {"dateTime": end.strftime("%Y-%m-%dT%H:%M:%S"), "timeZone": "Asia/Seoul"},
        "reminders": {"useDefault": True},
      }

    event = service.events().insert(calendarId=CALENDAR_ID, body=event_body).execute()
    logger.info(f"Google Calendar 일정 생성 성공: {event.get('id')}")
    return event.get("id")

  except Exception as e:
    logger.error(f"Google Calendar 일정 생성 실패: {e}")
    return None


def update_google_event(google_event_id, title, start, end, is_all_day=False):
  service = get_calendar_service()
  if not service or not google_event_id:
    return False

  try:
    start = _to_datetime(start)
    end = _to_datetime(end)
    if not start or not end:
      logger.error(f"Google Calendar 일정 수정 실패: start 또는 end 변환 불가")
      return False

    if is_all_day:
      event_body = {
        "summary": title,
        "start": {"date": start.strftime("%Y-%m-%d"), "timeZone": "Asia/Seoul"},
        "end": {"date": end.strftime("%Y-%m-%d"), "timeZone": "Asia/Seoul"},
      }
    else:
      event_body = {
        "summary": title,
        "start": {"dateTime": start.strftime("%Y-%m-%dT%H:%M:%S"), "timeZone": "Asia/Seoul"},
        "end": {"dateTime": end.strftime("%Y-%m-%dT%H:%M:%S"), "timeZone": "Asia/Seoul"},
      }

    service.events().update(
        calendarId=CALENDAR_ID, eventId=google_event_id, body=event_body
    ).execute()
    logger.info(f"Google Calendar 일정 수정 성공: {google_event_id}")
    return True

  except Exception as e:
    logger.error(f"Google Calendar 일정 수정 실패: {e}")
    return False


def delete_google_event(google_event_id):
  service = get_calendar_service()
  if not service or not google_event_id:
    return False

  try:
    service.events().delete(calendarId=CALENDAR_ID, eventId=google_event_id).execute()
    logger.info(f"Google Calendar 일정 삭제 성공: {google_event_id}")
    return True

  except Exception as e:
    logger.error(f"Google Calendar 일정 삭제 실패: {e}")
    return False


def sync_google_events_to_db():
  from model.models import Calendar as Cal

  service = get_calendar_service()
  if not service:
    return {"created": 0, "updated": 0, "deleted": 0}

  try:
    events_result = service.events().list(
        calendarId=CALENDAR_ID,
        maxResults=500,
        singleEvents=True,
        orderBy="startTime",
    ).execute()

    google_events = events_result.get("items", [])

    db_events = {
      cal.google_event_id: cal
      for cal in Cal.objects.filter(google_event_id__isnull=False).exclude(google_event_id='')
    }

    created_count = 0
    updated_count = 0

    for g_event in google_events:
      g_id = g_event.get("id")
      title = g_event.get("summary", "(제목없음)")

      start_raw = g_event.get("start", {})
      end_raw = g_event.get("end", {})

      is_all_day = "date" in start_raw and "dateTime" not in start_raw

      if is_all_day:
        start_str = start_raw.get("date")
        end_str = end_raw.get("date")
        start_dt = dt.datetime.strptime(start_str, "%Y-%m-%d")
        end_dt = dt.datetime.strptime(end_str, "%Y-%m-%d")
      else:
        start_str = start_raw.get("dateTime", "")
        end_str = end_raw.get("dateTime", "")
        start_str = start_str[:19]
        end_str = end_str[:19]
        try:
          start_dt = dt.datetime.strptime(start_str, "%Y-%m-%dT%H:%M:%S")
          end_dt = dt.datetime.strptime(end_str, "%Y-%m-%dT%H:%M:%S")
        except:
          continue

      if g_id in db_events:
        cal = db_events[g_id]
        changed = False

        if cal.title != title:
          cal.title = title
          changed = True
        if cal.start != start_dt:
          cal.start = start_dt
          changed = True
        if cal.end != end_dt:
          cal.end = end_dt
          changed = True
        if cal.isAllDay != is_all_day:
          cal.isAllDay = is_all_day
          changed = True

        if changed:
          cal.save()
          updated_count += 1

        del db_events[g_id]
      else:
        Cal.objects.create(
            title=title,
            start=start_dt,
            end=end_dt,
            isAllDay=is_all_day,
            category="allday" if is_all_day else "time",
            google_event_id=g_id,
            bg_color="#00a9ff",
        )
        created_count += 1

    deleted_count = 0
    for g_id, cal in db_events.items():
      cal.delete()
      deleted_count += 1

    logger.info(f"Google Calendar 동기화 완료: 생성 {created_count}, 수정 {updated_count}, 삭제 {deleted_count}")
    return {"created": created_count, "updated": updated_count, "deleted": deleted_count}

  except Exception as e:
    logger.error(f"Google Calendar 동기화 실패: {e}")
    return {"created": 0, "updated": 0, "deleted": 0, "error": str(e)}