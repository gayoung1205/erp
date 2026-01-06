from model import models
import pytest
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from utils import update_model
from trade_tests import create_trade
from product_tests import create_product
from customer_tests import create_customer
from utils import setup_model, setup_model


@pytest.mark.django_db
class TestHistory:
    pytestmark = pytest.mark.django_db

    def setup(self):
        setup_model()

    def test_get_history(self):
        assert models.History.objects.get(name="테스트 거래내역")

    def test_get_fail_history(self):
        with pytest.raises(ObjectDoesNotExist):
            models.History.objects.get(name="테스트 거래내역1")

    def test_calc_total_price(self):
        history = models.History.objects.all()[0]
        assert history.total_price() == 50000
        history.tax_category = 1
        history.save()
        assert history.total_price() == 55000

