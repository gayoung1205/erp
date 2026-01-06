from model import models
from django.contrib.auth.models import User


def create_customer():
    models.Customer.objects.create(
        name="테스트",
        phone="010-1234-1234",
        tel="061-1234-1234",
        address_1="테스트 주소1",
        address_2="테스트 주소2",
        post_number="01234",
        fax_number="fax",
        email="email@test.com",
        customer_grade="분류1",
        price_grade="매출단가 적용",
        memo="어꺠 뽀사져",
        register_id="test user",
    )


def create_user():
    user = User.objects.create(username="테스트 유저")
    user.set_password("test1234")
    user.save()


def create_customer_category():
    models.Category.objects.create(name="테스트 고객 카테고리", category=0)


def create_product_category():
    models.Category.objects.create(name="테스트 제품 카테고리", category=1)


def create_engineer(id):
    models.Engineer.objects.create(name="테스트 엔지니어", category=0, user_id=id)


def create_product():
    models.Product.objects.create(name="테스트 제품", stock=1000, category="테스트 카테고리")


def create_trade(id):
    models.Trade.objects.create(
        customer_id=id,
        category_1=0,
        memo="테스트 메모",
        symptom="테스트 증상",
        register_id="test user",
    )


def create_history(trade_id, product_id):
    models.History.objects.create(
        trade_id=trade_id,
        product_id=product_id,
        amount=5,
        price=10000,
        tax_category=0,
        name="테스트 거래내역",
    )


def update_model(model, dict_data):
    for key in dict_data:
        setattr(model, key, dict_data[key])
    model.save()


def setup_model():
    create_customer()
    create_product()
    customer_id = models.Customer.objects.all()[0].id
    create_trade(customer_id)
    trade_id = models.Trade.objects.all()[0].id
    product_id = models.Product.objects.all()[0].id
    create_history(trade_id, product_id)
