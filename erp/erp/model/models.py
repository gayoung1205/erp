# from django.db import models
from django.db import models
from django.conf import settings

# Create your models here.
class Customer(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, null=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    tel = models.CharField(max_length=50, null=True, blank=True)
    address_1 = models.CharField(max_length=255, null=True, blank=True)
    address_2 = models.CharField(max_length=255, null=True, blank=True)
    post_number = models.CharField(max_length=50, null=True, blank=True)
    fax_number = models.CharField(max_length=50, null=True, blank=True)
    email = models.CharField(max_length=50, null=True, blank=True)
    updated_date = models.DateTimeField(auto_now=True, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    customer_grade = models.CharField(max_length=50, null=True, blank=True)
    price_grade = models.CharField(max_length=50, null=True)
    memo = models.TextField(null=True, blank=True)
    register_id = models.CharField(max_length=50, null=True, blank=True)

    def get_total_receivable(self):
        result = 0
        for trade in self.trades.all():
            result += trade.total_price()
        return result


class Engineer(models.Model):
    MANAGE = 0
    SUPPORT = 1
    CHIEF = 2
    ADMIN = 3
    RESEARCH = 4
    PLANNING = 5
    PRODUCTION = 6
    SALES = 7
    STATUS_CHOICES = (
        (MANAGE, "경영관리"),
        (SUPPORT, "기술지원"),
        (CHIEF, "대표이사"),
        (ADMIN, "관리자"),
        (RESEARCH, "연구개발"),
        (PLANNING, "전략기획"),
        (PRODUCTION, "생산품질관리"),
        (SALES, "영업홍보")
    )
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    category = models.IntegerField(choices=STATUS_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="engineers",
        related_query_name="engineer",
    )
    join_date = models.DateField(null=True, blank=True)
    updated_date = models.DateTimeField(auto_now=True, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def deactivate(self):
        self.is_active = False


class Product(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, null=True)
    category = models.CharField(max_length=50, null=True)
    supplier = models.CharField(max_length=50, null=True, blank=True)
    container = models.CharField(max_length=255, null=True, blank=True)
    purchase = models.CharField(max_length=255, null=True, blank=True)
    code = models.CharField(max_length=255, null=True, blank=True)
    stock = models.IntegerField(null=True, blank=True, default=0)
    memo = models.TextField(null=True, blank=True)
    in_price = models.IntegerField(null=True, blank=True, default=0)
    out_price = models.IntegerField(null=True, blank=True, default=0)
    sale_price = models.IntegerField(null=True, blank=True, default=0)
    register_id = models.CharField(max_length=50, null=True, blank=True)
    updated_date = models.DateTimeField(auto_now=True, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def minus_stock(self, amount):
        try:
            self.stock -= amount
            self.save()
        except:
            return False
        return True

    def add_stock(self, amount):
        try:
            self.stock += amount
            self.save()
        except:
            return False
        return True


class Trade(models.Model):
    AS = 0  # 히스토리 존재 미수금 값 +
    COLLECTION = 1  # 히스토리 미존재 미수금 값 -
    PAYMENT = 2  # 히스토리 미존재 미수금 값 +
    SELL = 3  # 히스토리 존재 미수금 값 +
    PURCHASE = 4  # 히스토리 존재 미수금 값 -
    INCOME = 5  # 히스토리 미존재 미수금 미존재
    OUTCOME = 6  # 히스토리 미존재 미수금 미존재
    DELIVER = 7  # 히스토리 존재 미수금 값 +
    MEMO = 8  # 메모

    STATUS_CHOICES_1 = (
        (AS, "AS"),
        (COLLECTION, "COLLECTION"),
        (PAYMENT, "PAYMENT"),
        (SELL, "SELL"),
        (PURCHASE, "PURCHASE"),
        (INCOME, "INCOME"),
        (OUTCOME, "OUTCOME"),
        (DELIVER, "DELIVER"),
        (MEMO, "MEMO"),
    )

    ACCEPT = 0
    COMPLETE = 1
    ONGOING = 2
    CANCEL = 3

    STATUS_CHOICES_2 = (
        (ACCEPT, "ACCEPT"),
        (COMPLETE, "COMPLETE"),
        (ONGOING, "ONGOING"),
        (CANCEL, "CANCEL"),
    )

    INSIDE = 0
    OUTSIDE = 1

    STATUS_CHOICES_3 = ((INSIDE, "INSIDE"), (OUTSIDE, "OUTSIDE"))

    id = models.AutoField(primary_key=True)
    category_1 = models.IntegerField(choices=STATUS_CHOICES_1, null=True)
    category_2 = models.IntegerField(choices=STATUS_CHOICES_2, null=True, blank=True)
    category_3 = models.IntegerField(choices=STATUS_CHOICES_3, null=True, blank=True)
    content = models.TextField(null=True, blank=True, default="")
    memo = models.TextField(null=True, blank=True, default="")
    symptom = models.TextField(null=True, blank=True, default="")
    completed_content = models.TextField(null=True, blank=True, default="")
    engineer = models.ForeignKey(
        Engineer,
        default=None,
        blank=True,
        null=True,
        related_query_name="trade",
        related_name="trades",
        on_delete=models.DO_NOTHING,
    )
    visit_date = models.DateTimeField(null=True, blank=True)
    register_date = models.DateTimeField(null=True, blank=True)
    complete_date = models.DateTimeField(null=True, blank=True)
    tax = models.BooleanField(null=True, blank=True)
    cash = models.IntegerField(null=True, blank=True, default=0)
    credit = models.IntegerField(null=True, blank=True, default=0)
    bank = models.IntegerField(null=True, blank=True, default=0)
    customer = models.ForeignKey(
        Customer,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="trades",
        related_query_name="trade",
    )
    customer_name = models.TextField(max_length=50, null=True, blank=True)
    register_id = models.TextField(max_length=50, null=True, blank=True)
    updated_date = models.DateTimeField(auto_now=True, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def get_category(self):
        return ["AS", "수금", "지불", "판매", "구매", "수입", "지출", "납품", "메모"][self.category_1]

    def get_category_name2(self):
        if obj.category_2 == None:
            return " "
        category = ["접수", "완료", "진행", "취소"]
        return category[obj.category_2]

    def get_category_name3(self):
        if obj.category_3 == None:
            return " "
        category = ["출장", "내방"]
        return category[obj.category_3]

    def get_engineer_name(self):
        try:
            return self.engineer.name
        except:
            return

    def total_price(self):
        price = tax = 0
        for history in self.histories.all():
            result = history.total_price()
            price += result["price"]
            tax += result["tax"]
        return {"price": price, "tax": tax}

    def in_price(self):
        if self.category_1 in [1, 5]:
            return self.cash + self.bank + self.credit
        return 0

    def out_price(self):
        if self.category_1 in [2, 6]:
            return self.cash + self.bank + self.credit
        return 0

    def get_receivable(self):
        flags = 1
        if self.is_active == False:
            return 0
        if self.category_1 in [5, 6, 8]:
            return 0

        if self.category_1 in [1, 4]:
            flags = -1

        if self.category_1 in [1, 2]:
            return (self.cash + self.bank + self.credit) * flags

        price = self.total_price()

        if type(price) == dict:
            return (price["price"] + price["tax"]) * flags
        return self.total_price() * flags

    def calculate_money(self):
        if self.category_1 not in [1, 2, 5, 6]:
            return 0
        flags = -1 if self.category_1 in [2, 6] else 1

        return (self.cash + self.bank + self.credit) * flags

    def active(self):
        self.is_active = True


class Category(models.Model):
    CUSTOMER = 0
    PRODUCT = 1

    STATUS_CHOICES = ((CUSTOMER, "CUSTOMER"), (PRODUCT, "PRODUCT"))

    name = models.TextField(null=True, blank=True)
    category = models.IntegerField(choices=STATUS_CHOICES, null=True, blank=True)
    updated_date = models.DateTimeField(auto_now=True)
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("name", "category")


class History(models.Model):
    SELL = 0
    PURCHACE = 1
    AS = 2
    DELIVER = 3

    NO_TAX = 0
    TAX = 1
    CONTAIN_TAX = 2

    STATUS_CHOICES = (
        (SELL, "SELL"),
        (PURCHACE, "PURCHASE"),
        (AS, "AS"),
        (DELIVER, "DELIVER"),
    )
    STATUS_CHOICES_2 = ((NO_TAX, "NO_TAX"), (TAX, "TAX"), (CONTAIN_TAX, "CONTAIN_TAX"))
    id = models.AutoField(primary_key=True)
    name = models.TextField(null=True, blank=True)
    amount = models.IntegerField(null=True, blank=True, default=0)
    price = models.IntegerField(null=True, blank=True, default=0)
    tax_category = models.IntegerField(choices=STATUS_CHOICES_2, null=True, blank=True)
    product = models.ForeignKey(
        Product,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        related_name="histories",
        related_query_name="history",
    )
    trade = models.ForeignKey(
        Trade,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="histories",
        related_query_name="history",
    )
    is_released = models.BooleanField(default=False)
    register_name = models.TextField(max_length=50, null=True, blank=True)
    memo = models.TextField(null=True, blank=True)
    updated_date = models.DateTimeField(auto_now=True, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def total_price(self):
        tax = 0
        price = 0
        if self.tax_category == 1:
            tax = self.price * 0.1
        tax = self.amount * tax
        price = self.amount * self.price
        return {"price": price, "tax": tax}


class Calendar(models.Model):
    calendarId = models.CharField(max_length=50, null=True, blank=True)
    id = models.AutoField(primary_key=True, blank=True)
    isAllDay = models.BooleanField(null=True, blank=True)
    title = models.TextField(default="", blank=True, null=True)
    start = models.DateTimeField(null=True, blank=True)
    end = models.DateTimeField(null=True, blank=True)
    category = models.TextField(null=True, blank=True, default="time")
    engineer = models.ForeignKey(
        Engineer,
        on_delete=models.CASCADE,
        related_name="calendars",
        related_query_name="calendar",
        default=None,
        blank=True,
        null=True,
    )
    updated_date = models.DateTimeField(auto_now=True)
    created_date = models.DateTimeField(auto_now_add=True)


class Record(models.Model):
    DAILY_WORK = "업무일지"
    # APPROVAL = "결재"
    # REPORT = "보고"
    VACATION = "휴가신청"

    CHOICES = [
        (DAILY_WORK, "업무일지"),
        # (APPROVAL, "결재"),
        # (REPORT, "보고"),
        (VACATION, "휴가신청"),
    ]
    id = models.AutoField(primary_key=True)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="records",
        related_query_name="record",
    )
    category = models.CharField(max_length=100, choices=CHOICES, default=DAILY_WORK)
    content = models.TextField(null=True, blank=True, default="")
    remark = models.TextField(default="", blank=True, null=True)
    plan = models.TextField(default="", blank=True, null=True)
    is_submit = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    reject_content = models.TextField(default="", blank=True)
    is_reject = models.BooleanField(default=False)
    date = models.DateField(blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    updated_date = models.DateTimeField(auto_now=True)
    created_date = models.DateTimeField(auto_now_add=True)


class Vacation(models.Model):
    id = models.AutoField(primary_key=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    record = models.ForeignKey(
        Record,
        related_name="vacations",
        related_query_name="vacation",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    updated_date = models.DateTimeField(auto_now=True)
    created_date = models.DateTimeField(auto_now_add=True)


class Attendance(models.Model):
    id = models.AutoField(primary_key=True)
    date = models.DateTimeField(blank=True, null=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="attendances",
        related_query_name="attendance",
    )
    updated_date = models.DateTimeField(auto_now=True)
    created_date = models.DateTimeField(auto_now_add=True)


class ReleaseLog(models.Model):
    CREATE = 0  # 출고생성
    SALE = 1  # 출고판매
    UPDATE_AMOUNT = 2  # 출고수정(수량)
    UPDATE_MEMO = 3  # 출고수정(메모)
    DELETE = 4  # 출고삭제

    STATUS_CHOICES = (
        (CREATE, "등록"),
        (SALE, "판매"),
        (UPDATE_AMOUNT, "수량 변경"),
        (UPDATE_MEMO, "메모 변경"),
        (DELETE, "삭제"),
    )
    id = models.AutoField(primary_key=True)
    release_log_category = models.IntegerField(
        choices=STATUS_CHOICES, null=True, blank=True
    )
    name = models.TextField(null=True, blank=True)
    product_category = models.TextField(null=True, blank=True)
    amount = models.IntegerField(null=True, blank=True, default=0)
    register_name = models.TextField(max_length=50, null=True, blank=True)
    memo = models.TextField(null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    release_register_name = models.TextField(max_length=50, null=True, blank=True)
    release_created_date = models.DateTimeField(null=True, blank=True)

class ReleaseLogPermission(models.Model):
    """
    부서별 출고 로그 열람 권한
    """
    id = models.AutoField(primary_key=True)
    department = models.IntegerField(unique=True)  # 부서 (Engineer.category 값)
    can_view_register = models.BooleanField(default=False)
    can_view_sale = models.BooleanField(default=False)
    can_view_delete = models.BooleanField(default=False)
    can_export_customer = models.BooleanField(default=False)
    can_export_trade = models.BooleanField(default=False)
    can_export_product = models.BooleanField(default=False)
    can_export_release = models.BooleanField(default=False)
    can_export_release_log = models.BooleanField(default=False)
    can_export_accounting = models.BooleanField(default=False)
    can_export_receivable = models.BooleanField(default=False)
    updated_date = models.DateTimeField(auto_now=True)
    created_date = models.DateTimeField(auto_now_add=True)

class ProductPackage(models.Model):
    """
    제품 패키지 (예: 사무용PC, 게이밍PC)
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    memo = models.TextField(null=True, blank=True)
    register_name = models.CharField(max_length=50, null=True, blank=True)
    updated_date = models.DateTimeField(auto_now=True)
    created_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ProductPackageItem(models.Model):
    """
    패키지 구성품
    """
    id = models.AutoField(primary_key=True)
    package = models.ForeignKey(
        ProductPackage,
        on_delete=models.CASCADE,
        related_name="items",
        related_query_name="item",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="package_items",
        related_query_name="package_item",
    )
    amount = models.IntegerField(default=1)
    updated_date = models.DateTimeField(auto_now=True)
    created_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.package.name} - {self.product.name} x {self.amount}"

class PendingStock(models.Model):
    """
    입고대기 (제품구매 시 바로 재고반영 X, 입고확정 시 재고반영)
    """
    PENDING = 0      # 입고대기
    CONFIRMED = 1    # 입고완료
    SOLD = 2         # 바로판매 (입고 후 즉시 출고)
    CANCELED = 3     # 취소

    STATUS_CHOICES = (
        (PENDING, "입고대기"),
        (CONFIRMED, "입고완료"),
        (SOLD, "바로판매"),
        (CANCELED, "취소"),
    )

    id = models.AutoField(primary_key=True)
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="pending_stocks",
        related_query_name="pending_stock",
    )
    product_name = models.CharField(max_length=100, null=True, blank=True)  # 제품명 (조회용)
    product_category = models.CharField(max_length=100, null=True, blank=True)  # 제품분류
    amount = models.IntegerField(default=0)  # 입고 수량
    price = models.IntegerField(default=0)   # 매입단가
    status = models.IntegerField(choices=STATUS_CHOICES, default=PENDING)
    trade = models.ForeignKey(
        Trade,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pending_stocks",
        related_query_name="pending_stock",
    )
    history = models.ForeignKey(
        "History",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pending_stocks",
        related_query_name="pending_stock",
    )
    supplier_name = models.CharField(max_length=100, null=True, blank=True)  # 구입처명
    register_name = models.CharField(max_length=50, null=True, blank=True)   # 등록자
    memo = models.TextField(null=True, blank=True)
    confirmed_date = models.DateTimeField(null=True, blank=True)  # 입고확정일
    updated_date = models.DateTimeField(auto_now=True)
    created_date = models.DateTimeField(auto_now_add=True)

    def confirm_stock(self):
        """입고 확정 - 재고 증가"""
        import datetime
        if self.status == self.PENDING:
            self.product.add_stock(self.amount)
            self.status = self.CONFIRMED
            self.confirmed_date = datetime.datetime.now()
            self.save()
            return True
        return False

    def sell_directly(self):
        """바로 판매 - 입고 후 즉시 출고 (재고 변동 없음)"""
        import datetime
        if self.status == self.PENDING:
            # 입고 + 즉시 출고 = 재고 변동 없음
            self.status = self.SOLD
            self.confirmed_date = datetime.datetime.now()
            self.save()
            return True
        return False

    def cancel(self):
        """취소"""
        if self.status == self.PENDING:
            self.status = self.CANCELED
            self.save()
            return True
        return False

    def get_status_display_korean(self):
        """상태 한글 표시"""
        status_map = {0: "입고대기", 1: "입고완료", 2: "바로판매", 3: "취소"}
        return status_map.get(self.status, "알수없음")


class CCategory(models.Model):
    CUSTOMER = 0
    PRODUCT = 1

    STATUS_CHOICES = ((CUSTOMER, "CUSTOMER"), (PRODUCT, "PRODUCT"))

    id = models.AutoField(primary_key=True)
    name = models.TextField(null=True, blank=True)
    category = models.IntegerField(choices=STATUS_CHOICES, null=True, blank=True)
    updated_date = models.DateTimeField(auto_now=True)
    created_date = models.DateTimeField(auto_now_add=True)


class CCustomer(models.Model):
    no = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, null=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    tel = models.CharField(max_length=50, null=True, blank=True)
    address_1 = models.CharField(max_length=255, null=True, blank=True)
    address_2 = models.CharField(max_length=255, null=True, blank=True)
    post_number = models.CharField(max_length=50, null=True, blank=True)
    fax_number = models.CharField(max_length=50, null=True, blank=True)
    email = models.CharField(max_length=50, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True, blank=True)
    updated_date = models.DateTimeField(auto_now=True, blank=True)
    customer_grade = models.ForeignKey(
        CCategory,
        on_delete=models.DO_NOTHING,
        related_name="customers",
        related_query_name="customer",
        null=True,
        blank=True,
    )
    price_grade = models.CharField(max_length=50, null=True)
    memo = models.TextField(null=True, blank=True)
    receivable = models.IntegerField(blank=True, default=0, null=True)
    register = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.DO_NOTHING,
        related_name="customers",
        related_query_name="customer",
    )


class CProduct(models.Model):
    no = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, null=True)
    category = models.ForeignKey(
        CCategory,
        on_delete=models.DO_NOTHING,
        related_name="products",
        related_query_name="product",
    )
    supplier = models.CharField(max_length=50, null=True, blank=True)
    container = models.CharField(max_length=255, null=True, blank=True)
    purchase = models.CharField(max_length=255, null=True, blank=True)
    code = models.CharField(max_length=255, null=True, blank=True, unique=True)
    stock = models.IntegerField(null=True, blank=True, default=0)
    memo = models.TextField(null=True, blank=True)
    in_price = models.IntegerField(null=True, blank=True, default=0)
    out_price = models.IntegerField(null=True, blank=True, default=0)
    sale_price = models.IntegerField(null=True, blank=True, default=0)
    register = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.DO_NOTHING,
        related_name="products",
        related_query_name="product",
    )
    updated_date = models.DateTimeField(auto_now=True)
    created_date = models.DateTimeField(auto_now_add=True)


class CTrade(models.Model):
    AS = 0
    COLLECTION = 1  # -
    PAYMENT = 2  # +
    SELL = 3
    PURCHASE = 4
    INCOME = 5  #
    OUTCOME = 6  #
    DELIVER = 7
    MEMO = 8

    STATUS_CHOICES_1 = (
        (AS, "AS"),
        (COLLECTION, "COLLECTION"),
        (PAYMENT, "PAYMENT"),
        (SELL, "SELL"),
        (PURCHASE, "PURCHASE"),
        (INCOME, "INCOME"),
        (OUTCOME, "OUTCOME"),
        (DELIVER, "DELIVER"),
        (MEMO, "MEMO"),
    )

    ACCEPT = 0
    COMPLETE = 1
    ONGOING = 2
    CANCEL = 3

    STATUS_CHOICES_2 = (
        (ACCEPT, "ACCEPT"),
        (COMPLETE, "COMPLETE"),
        (ONGOING, "ONGOING"),
        (CANCEL, "CANCEL"),
    )

    INSIDE = 0
    OUTSIDE = 1

    STATUS_CHOICES_3 = ((INSIDE, "INSIDE"), (OUTSIDE, "OUTSIDE"))

    no = models.AutoField(primary_key=True)
    category_1 = models.IntegerField(choices=STATUS_CHOICES_1, null=True)
    category_2 = models.IntegerField(choices=STATUS_CHOICES_2, null=True, blank=True)
    category_3 = models.IntegerField(choices=STATUS_CHOICES_3, null=True, blank=True)
    content = models.TextField(null=True, blank=True)
    memo = models.TextField(null=True, blank=True)
    symptom = models.TextField(null=True, blank=True)
    completed_content = models.TextField(null=True, blank=True)
    engineer = models.ForeignKey(
        Engineer,
        on_delete=models.DO_NOTHING,
        related_name="ctrades",
        related_query_name="ctrade",
        blank=True,
        null=True,
    )
    visit_date = models.DateTimeField(null=True, blank=True)
    register_date = models.DateTimeField(null=True, blank=True)
    complete_date = models.DateTimeField(null=True, blank=True)
    price = models.IntegerField(null=True, blank=True)
    tax = models.BooleanField(null=True, blank=True)
    cash = models.IntegerField(null=True, blank=True, default=0)
    credit = models.IntegerField(null=True, blank=True, default=0)
    bank = models.IntegerField(null=True, blank=True, default=0)
    customer = models.ForeignKey(
        CCustomer,
        on_delete=models.CASCADE,
        related_name="trades",
        related_query_name="trade",
    )
    register = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.DO_NOTHING,
        related_name="trades",
        related_query_name="trade",
    )
    updated_date = models.DateTimeField(auto_now=True)
    created_date = models.DateTimeField(auto_now_add=True)


class CHistory(models.Model):

    SELL = 0
    PURCHACE = 1
    AS = 2
    DELIVER = 3

    NO_TAX = 0
    TAX = 1
    CONTAIN_TAX = 2

    STATUS_CHOICES = (
        (SELL, "SELL"),
        (PURCHACE, "PURCHASE"),
        (AS, "AS"),
        (DELIVER, "DELIVER"),
    )
    STATUS_CHOICES_2 = ((NO_TAX, "NO_TAX"), (TAX, "TAX"), (CONTAIN_TAX, "CONTAIN_TAX"))
    no = models.AutoField(primary_key=True)
    product = models.ForeignKey(
        CProduct,
        on_delete=models.DO_NOTHING,
        related_name="histories",
        related_query_name="history",
    )
    amount = models.IntegerField(null=True, blank=True, default=0)
    price = models.IntegerField(null=True, blank=True, default=0)
    tax_category = models.IntegerField(choices=STATUS_CHOICES_2, null=True, blank=True)
    trade_category = models.IntegerField(choices=STATUS_CHOICES, null=True, blank=True)
    trade = models.ForeignKey(
        CTrade,
        on_delete=models.CASCADE,
        related_name="histories",
        related_query_name="history",
    )
    updated_date = models.DateTimeField(auto_now=True)
    created_date = models.DateTimeField(auto_now_add=True)
