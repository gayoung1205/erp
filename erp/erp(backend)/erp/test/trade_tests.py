from model import models
import pytest
from django.core.exceptions import ObjectDoesNotExist
from asgiref.sync import sync_to_async
from customer_tests import create_customer
from utils import update_model, create_user, create_trade, setup_model
import time


@pytest.mark.django_db
class TestTrade:
    pytestmark = pytest.mark.django_db

    def setup(self):
        setup_model()

    def test_get_trade(self):

        customer = models.Customer.objects.all()[0]
        assert models.Trade.objects.get(customer_id=customer.id)

    def test_get_fail_trade(self):
        with pytest.raises(ObjectDoesNotExist):
            models.Trade.objects.get(customer_id=2)

    def test_put_trade(self):
        customer = models.Customer.objects.all()[0]
        trade = models.Trade.objects.get(customer_id=customer.id)
        change_data = {"memo": "변경되어진 메모", "symptom": "변경되어진 테스트 증상"}
        update_model(trade, change_data)
        assert models.Trade.objects.get(customer_id=customer.id).memo == "변경되어진 메모"

    def test_get_total_price(self):
        trade = models.Trade.objects.prefetch_related("histories").all()[0]
        assert trade.total_price() == 50000

    def test_get_receivable(self):
        trade = models.Trade.objects.prefetch_related("histories").all()[0]
        assert trade.get_receivable() == 50000

