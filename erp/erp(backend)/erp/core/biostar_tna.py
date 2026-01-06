# Module Imports
import mariadb
import sys
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from model.models import Attendance
from model.models import Engineer as Eng
from util.views import ReturnAccept
import logging

# logger = logging.getLogger(__name__)

# today = datetime.today().strftime("%Y-%m-%d")

# sched = BackgroundScheduler(timezone='Asia/Seoul')

# @sched.scheduled_job("cron", hour="9,10,11,12,13,14,15,16,17,18")
def interval_tna():
    # Connect to MariaDB Platform
    # try:
    #     conn = mariadb.connect(
    #         user="root",
    #         password="qwe123!@#",
    #         host="localhost",
    #         port=3308,
    #         database="aisoltna",
    #     )
    # except mariadb.Error as e:
    #     print(f"Error connecting to MariaDB Platform: {e}")
    #     sys.exit(1)

    # # Get Cursor
    # cur = conn.cursor()

    # cur.execute(
    #     "SELECT user_name, bsevtdt FROM punchlog WHERE tk=? AND user_name IS NOT NULL AND DATE(bsevtdt)=?",
    #     ("1", today,),
    # )

    # tna_data = []

    # # 같은 날짜로 된 출근이 있을 경우 제외
    # for i in cur:
    #     if tna_data == []:
    #         tna_data.append({"user": i[0], "date": i[1]})
    #     else:
    #         for j in tna_data:
    #             if (
    #                 i[0] == j["user"]
    #                 and str(i[1])[slice(0, 10)] == str(j["date"])[slice(0, 10)]
    #             ):
    #                 pass
    #         tna_data.append({"user": i[0], "date": i[1]})

    # # 오늘 날짜로 된 출근이 있을 경우에만 실행
    # if tna_data != []:
    #     for tna in tna_data:
    #         try:
    #             eng = Eng.objects.get(name=tna["user"])
    #         except:
    #             return Response(
    #                 data={"message": "해당하는 데이터가 존재하지 않습니다."},
    #                 status=status.HTTP_204_NO_CONTENT,
    #             )

    #         # 아이디와 날짜가 같은 데이터가 있는지 확인
    #         if (
    #             Attendance.objects.filter(user=eng.user)
    #             .filter(date__icontains=today)
    #             .count()
    #             == 0
    #         ):
    #             attendance = Attendance.objects.create(user=eng.user, date=tna["date"])
    #             logger.info(
    #                 f"{eng.name} 이 [{attendance.id}] [{attendance.date}]  출근부를 생성하였습니다."
    #             )
    # conn.close()
    return ReturnAccept()

    


# # sched = BackgroundScheduler()

# # # 매일 9시부터 18시까지 1시간 마다 실행
# # sched.add_job(
# #     interval_tna,
# #     "interval",
# #     hours=1,
# #     start_date=f"{today} 09:00:00",
# #     end_date=f"{today} 18:00:00",
# # )

# sched.start()