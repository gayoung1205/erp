import logging
from model.models import Customer, Trade, History

logger = logging.getLogger(__name__)


def _calculate_trade_price(trade, histories_cache=None):
  """
  개별 거래의 금액 계산 (기존 total_price() 로직과 동일)

  - 수금/지불/수입/지출: cash + bank + credit
  - AS/판매/구매/납품: History에서 (단가+부가세) × 수량 합계
  """
  if trade.category_1 in [1, 2, 5, 6]:
    return abs((trade.cash or 0) + (trade.bank or 0) + (trade.credit or 0))

  # histories_cache가 있으면 사용 (prefetch된 데이터)
  if histories_cache is not None:
    histories = histories_cache
  else:
    histories = History.objects.filter(trade_id=trade.id)

  result = 0
  for h in histories:
    tax = 0
    price = h.price or 0
    amount = h.amount or 0
    if h.tax_category == 1:
      tax = round(price * 0.1)
    result += (price + tax) * amount

  return result


def recalculate_customer_receivable(customer_id):
  """
  특정 고객의 미수금을 재계산하고 DB에 저장

  기존 create_receivable() 로직과 100% 동일:
  - category_1이 수금(1), 구매(4) → 마이너스 (미수금 감소)
  - category_1이 수입(5), 지출(6) → 무시
  - 나머지 (AS, 판매, 지불, 납품, 메모) → 플러스 (미수금 증가)

  + 최적화: prefetch_related로 한 번에 로드
  """
  # 해당 고객의 활성 거래를 History와 함께 한 번에 로드
  trades = Trade.objects.filter(
      customer_id=customer_id,
      is_active=True
  ).prefetch_related('histories')

  receivable = 0
  last_date = None

  for trade in trades:
    # 수입(5), 지출(6)은 미수금에 영향 없음
    if trade.category_1 in [5, 6]:
      continue

    # 수금(1), 구매(4)는 미수금을 줄이는 방향
    flags = -1 if trade.category_1 in [1, 4] else 1

    # 금액 계산 (prefetch된 histories 사용)
    if trade.category_1 in [1, 2, 5, 6]:
      price = abs((trade.cash or 0) + (trade.bank or 0) + (trade.credit or 0))
    else:
      price = 0
      for h in trade.histories.all():  # prefetch됨 → 추가 쿼리 없음
        tax = round((h.price or 0) * 0.1) if h.tax_category == 1 else 0
        price += ((h.price or 0) + tax) * (h.amount or 0)

    receivable += price * flags

    # 미수금 관련 거래의 마지막 날짜 추적
    if trade.category_1 in [0, 1, 2, 3, 4, 7] and trade.register_date:
      if last_date is None or trade.register_date > last_date:
        last_date = trade.register_date

  # DB에 저장 (Customer 레코드 직접 업데이트)
  Customer.objects.filter(id=customer_id).update(
      receivable=receivable,
      last_receivable_date=last_date
  )

  return receivable


def recalculate_all_receivables():
  """
  전체 고객의 미수금을 일괄 재계산
  - 최초 1회 실행용 (management command에서 호출)
  - 이후에는 거래 생성/수정/삭제 시 개별 업데이트
  """
  customers = Customer.objects.all()
  total = customers.count()
  updated = 0

  for i, customer in enumerate(customers):
    try:
      recalculate_customer_receivable(customer.id)
      updated += 1
    except Exception as e:
      logger.error(f"고객 {customer.id}({customer.name}) 미수금 계산 실패: {e}")

    if (i + 1) % 100 == 0:
      logger.info(f"진행: {i + 1}/{total}")

  logger.info(f"미수금 재계산 완료: {updated}/{total}")
  return updated