from model import models
import pytest
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from utils import update_model, create_user
import requests


@pytest.mark.django_db()
class TestUser:
    def setup(self):
        create_user()

    def test_login_fail(self):
        URL = "http://localhost:8000/api-token-auth/"
        data = {"username": "aisol", "password": "12456"}
        res = requests.post(URL, data=data)
        assert res.status_code == 400

    def test_login_success(self):
        URL = "http://localhost:8000/api-token-auth/"
        data = {"username": "aisol", "password": "123456"}
        res = requests.post(URL, data=data)
        assert res.status_code == 200

    def test_count_user(self):
        assert User.objects.all().count() == 1
