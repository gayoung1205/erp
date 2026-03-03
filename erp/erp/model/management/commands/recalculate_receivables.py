from django.core.management.base import BaseCommand
from core.receivable_utils import recalculate_all_receivables


class Command(BaseCommand):
  help = '전체 고객의 미수금을 일괄 재계산합니다'

  def handle(self, *args, **options):
    self.stdout.write('미수금 일괄 재계산을 시작합니다...')
    updated = recalculate_all_receivables()
    self.stdout.write(self.style.SUCCESS(f'완료! {updated}명의 고객 미수금이 업데이트되었습니다.'))