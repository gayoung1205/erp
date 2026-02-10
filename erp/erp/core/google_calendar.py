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
  """
  문자열이든 datetime 객체든 상관없이 datetime으로 변환
  """
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
  """
  Google Calendar API 서비스 객체를 생성하여 반환
  """
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
  """
  구글 캘린더에서 일정 삭제
  """
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
  """
  구글 캘린더의 일정을 ERP DB로 가져오기 (초기 동기화용)
  """
  service = get_calendar_service()
  if not service:
    return []

  try:
    events_result = service.events().list(
        calendarId=CALENDAR_ID,
        maxResults=250,
        singleEvents=True,
        orderBy="startTime",
    ).execute()

    events = events_result.get("items", [])
    return events

  except Exception as e:
    logger.error(f"Google Calendar 동기화 실패: {e}")
    return []