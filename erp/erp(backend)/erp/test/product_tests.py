from model import models
import pytest
from django.core.exceptions import ObjectDoesNotExist
from utils import update_model, create_product


@pytest.mark.django_db
class TestProduct:
    pytestmark = pytest.mark.django_db

    def setup(self):
        create_product()

    def test_get_product(self):
        assert models.Product.objects.get(name="테스트 제품")

    def test_get_fail_product(self):
        with pytest.raises(ObjectDoesNotExist):
            assert models.Product.objects.get(name="테스트 제품1")

    def test_put_product(self):
        product = models.Product.objects.get(name="테스트 제품")
        change_data = {"name": "테스트 제품1", "stock": 100, "category": "테스트 카테고리1"}
        update_model(product, change_data)
        assert models.Product.objects.get(name="테스트 제품1").stock == 100

