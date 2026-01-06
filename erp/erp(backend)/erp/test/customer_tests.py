from model import models
import pytest
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from utils import update_model, create_customer, setup_model


def delete_customer(customer):
    customer.delete()


@pytest.mark.django_db
class TestCustomer:
    pytestmark = pytest.mark.django_db

    def setup(self):
        setup_model()

    def test_create_customer(self):
        assert models.Customer.objects.get(name="테스트")

    def test_get_fail_customer(self):

        with pytest.raises(ObjectDoesNotExist):
            models.Customer.objects.get(name="테스")

    def test_put_customer(self):
        customer = models.Customer.objects.get(name="테스트")
        change_data = {"name": "테스트 변경"}
        update_model(customer, change_data)
        assert models.Customer.objects.get(name="테스트 변경")

    def test_get_total_receivable(self):
        customer = models.Customer.objects.all()[0]
        assert customer.get_total_receivable() == 50000

