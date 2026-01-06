from model import models
import pytest
from django.core.exceptions import ObjectDoesNotExist
from utils import update_model, create_customer_category, create_product_category


@pytest.mark.django_db
class TestCategory:
    pytestmark = pytest.mark.django_db

    def setup(self):
        create_customer_category()
        create_product_category()

    def test_create_customer_category(self):
        assert models.Category.objects.get(name="테스트 고객 카테고리").category == 0

    def test_create_product_category(self):
        assert models.Category.objects.get(name="테스트 제품 카테고리").category == 1

    def test_get_fail_category(self):
        with pytest.raises(ObjectDoesNotExist):
            models.Category.objects.get(name="테스트 카테고리")

        with pytest.raises(ObjectDoesNotExist):
            models.Category.objects.get(name="테스트 카테고리")

    def test_put_category(self):
        category = models.Category.objects.get(name="테스트 고객 카테고리")
        change_data = {"name": "테스트 부품 카테고리 2", "category": 1}
        update_model(category, change_data)
        assert models.Category.objects.get(name="테스트 부품 카테고리 2").category == 1

    def test_delete_category(self):
        models.Category.objects.get(name="테스트 제품 카테고리").delete()

        with pytest.raises(ObjectDoesNotExist):
            models.Category.objects.get(name="테스트 제품 카테고리")

