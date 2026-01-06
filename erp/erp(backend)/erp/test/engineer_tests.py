from model import models
import pytest
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from utils import update_model, create_user, create_engineer


@pytest.mark.django_db
class TestEngineer:
    pytestmark = pytest.mark.django_db

    def setup(self):
        create_user()
        id = User.objects.all()[0].id
        create_engineer(id)

    def test_get_engineer(self):
        assert models.Engineer.objects.get(name="테스트 엔지니어")

    def test_get_fail_engineer(self):
        with pytest.raises(ObjectDoesNotExist):
            models.Engineer.objects.get(name="테스트 엔지니어1")

    def test_deactivate_engineer(self):
        engineer = models.Engineer.objects.get(name="테스트 엔지니어")
        engineer.deactivate()
        assert engineer.is_active == False
