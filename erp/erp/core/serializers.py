from rest_framework import serializers
from model.models import (
    Customer,
    Product,
    Trade,
    History,
    Calendar,
    Category,
    Engineer,
    CTrade,
    CHistory,
    Record,
    Attendance,
    Vacation,
    ReleaseLog,
    ProductPackage,
    ProductPackageItem,
    PendingStock,
)
from django.forms.models import model_to_dict


def create_receivable(tra):
    result = 0
    tra = tra.filter(is_active=True)
    
    for i in tra:
        flags = 1
        if i.category_1 in [1, 4]:
            flags = -1
        if i.category_1 in [5, 6]:
            pass
        else:
            result += total_price(i) * flags

    return result


def total_price(his):
    result = 0
    
    try:
        if his.category_1 in [1, 2, 5, 6]:
            
            return abs(his.cash + his.bank + his.credit)
        else:
            his = History.objects.filter(trade_id=his.id)
            return total_price(his)
    except:
        try:
            for i in his:
                tax = 0
                try:
                    if i.tax_category == 1:
                        tax = round(i.price * 0.1)
                except Exception as e:
                    print(e)
                    pass
                result += (i.price + tax) * i.amount
        except:
            tax = 0
            try:
                if his.tax_category == 1:
                    tax = his.price * 0.1
            except Exception as e:
                print(e)
                pass
            result += (his.price + tax) * his.amount
        return result


def ccreate_receivable(tra):
    result = 0
    for i in tra:
        flags = 1
        if i.category_1 == 4 or i.category_1 == 1:
            flags *= -1
        if i.category_1 in [5, 6]:
            pass
        else:
            result += ctotal_price(i) * flags
    return result


def ctotal_price(his):
    result = 0
    try:
        if his.category_1 in [1, 2, 5, 6]:
            return his.cash + his.bank + his.credit
        else:
            his = his.histories.all()
            return ctotal_price(his)
    except:
        for i in his:
            tax = 0
            try:
                if i.tax_category == 1:
                    tax = i.price * 0.1
            except:
                pass
            result += (i.price + tax) * i.amount
        return result


class CustomerSerializer(serializers.ModelSerializer):
    receivable = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    last_receivable_date = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = "__all__"

    def get_receivable(self, obj):
        tra = Trade.objects.filter(customer_id=obj.id)
        return create_receivable(tra)

    def get_address(self, obj):
        address_sum = ""
        if obj.address_1:
            address_sum += obj.address_1
            if obj.address_2:
                address_sum += obj.address_2
        return address_sum

    def get_last_receivable_date(self, obj):
        # 미수금 발생 거래: AS(0), 판매(3), 납품(7)
        last_trade = Trade.objects.filter(
            customer_id=obj.id,
            category_1__in=[0, 3, 7]
        ).order_by('-register_date').first()

        if last_trade and last_trade.register_date:
            return last_trade.register_date

        return None


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class TradeSerializer(serializers.ModelSerializer):
    total_price = serializers.SerializerMethodField()
    total_receivable = serializers.SerializerMethodField()
    # content_modify = serializers.SerializerMethodField()
    category_name1 = serializers.SerializerMethodField()
    category_name2 = serializers.SerializerMethodField()
    category_name3 = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    tel = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    customer_id = serializers.SerializerMethodField()
    engineer_id = serializers.SerializerMethodField()
    engineer_name = serializers.SerializerMethodField()

    class Meta:
        model = Trade
        fields = "__all__"

    def get_customer_id(self, obj):
        return obj.customer_id

    def get_engineer_id(self, obj):
        return obj.engineer_id

    def get_engineer_name(self, obj):
        try:
            return obj.engineer.name
        except:
            return

    def get_phone(self, obj):
        try:
            return obj.customer.phone
        except:
            return

    def get_tel(self, obj):
        try:
            return obj.customer.tel
        except:
            return

    def get_address(self, obj):
        try:
            return obj.customer.address_1 + obj.customer.address_2
        except:
            return

    def get_total_price(self, obj):
        return total_price(obj)

    def get_total_receivable(self, obj):
        
        tra = Trade.objects.filter(customer_id=obj.customer_id).filter(
            created_date__lte=obj.created_date
        )
        return create_receivable(tra)

    def get_content_modify(self, obj):
        his = History.objects.filter(trade_no=obj.no)
        contents = ""
        if len(his) == 0:
            return obj.content
        for i in his:
            contents += f"{i.name},"
        return contents[:-1]

    def get_category_name1(self, obj):
        category = ["AS", "수금", "지불", "판매", "구매", "수입", "지출", "납품", "메모"]
        return category[obj.category_1]

    def get_category_name2(self, obj):
        if obj.category_2 == None:
            return " "
        category = ["접수", "완료", "진행", "취소"]
        return category[obj.category_2]

    def get_category_name3(self, obj):
        if obj.category_3 == None:
            return " "
        category = ["출장", "내방", "공사", "내부처리"]
        return category[obj.category_3]


class AllTradeSerializer(serializers.ModelSerializer):
    total_price = serializers.SerializerMethodField()
    total_receivable = serializers.SerializerMethodField()

    class Meta:
        model = Trade
        fields = "__all__"

    def get_total_price(self, obj):
        return total_price(obj)

    def get_total_receivable(self, obj):
        tra = Trade.objects.all()

        return create_receivable(tra)


class HistorySerializer(serializers.ModelSerializer):
    total_price = serializers.SerializerMethodField()
    trade_id = serializers.SerializerMethodField()
    product_id = serializers.SerializerMethodField()
    product_category = serializers.SerializerMethodField()
    in_price = serializers.SerializerMethodField()
    out_price = serializers.SerializerMethodField()
    sale_price = serializers.SerializerMethodField()
    stock = serializers.SerializerMethodField()

    class Meta:
        model = History
        fields = [
            "id",
            "name",
            "amount",
            "price",
            "tax_category",
            "trade_id",
            "product_id",
            "total_price",
            "product_category",
            "in_price",
            "out_price",
            "sale_price",
            "created_date",
            "register_name",
            "memo",
            "stock",
        ]

    def get_total_price(self, obj):
        return total_price(obj)

    def get_trade_id(self, obj):
        return obj.trade_id

    def get_product_id(self, obj):
        return obj.product_id

    def get_product_category(self, obj):
        try:
            return obj.product.category
        except:
            return

    def get_in_price(self, obj):
        try:
            return obj.product.in_price
        except:
            return 0

    def get_out_price(self, obj):
        try:
            return obj.product.out_price
        except:
            return 0

    def get_sale_price(self, obj):
        try:
            return obj.product.sale_price
        except:
            return 0

    def get_stock(self, obj):
        try:
            return obj.product.stock
        except:
            return


class RecordSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()

    class Meta:
        model = Record
        fields = "__all__"

    def get_title(self, obj):
        engineer = Engineer.objects.get(user=obj.user)
        return f"{obj.date} - {engineer.name} {obj.category}입니다."

    def get_username(self, obj):
        engineer = Engineer.objects.get(user=obj.user)
        return engineer.name

    def get_status(self, obj):
        # 제출O, 승인X, 반려X
        if obj.is_submit and not obj.is_approved and not obj.is_reject:
            return 0
        # 제출O, 승인O, 반려X
        elif obj.is_submit and obj.is_approved and not obj.is_reject:
            return 1
        # 제출O, 승인X, 반려O
        elif obj.is_submit and obj.is_reject:
            return 2
        else:
            return -1

    def get_department(self, obj):
        category = ["경영관리", "기술지원", "대표이사", "서버관리자", "연구개발", "전략기획", "생산품질관리", "영업홍보"]
        return category[Engineer.objects.get(user=obj.user).category]


class AttendanceSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()
    calendarId = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()
    bgColor = serializers.SerializerMethodField()
    dragColor = serializers.SerializerMethodField()
    borderColor = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    isAllDay = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = "__all__"

    def get_username(self, obj):
        engineer = Engineer.objects.get(user=obj.user)

        return engineer.name

    def get_start(self, obj):
        return obj.created_date

    def get_end(self, obj):
        return obj.created_date

    def get_calendarId(self, obj):
        return "attendance"

    def get_color(self, obj):
        return "#FFFFFF"

    def get_dragColor(self, obj):
        return "#FFFFFF"

    def get_bgColor(self, obj):
        return "#FF5583"

    def get_borderColor(self, obj):
        return "#FF5583"

    def get_title(self, obj):
        return "출근"

    def get_isAllDay(self, obj):
        return True

    def get_category(self, obj):
        return "time"


class VacationSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = Vacation
        fields = "__all__"

    def get_username(self, obj):
        engineer = Engineer.objects.get(user=obj.user)

        return engineer.name


class CalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class EngineerSerializer(serializers.ModelSerializer):
    text_category = serializers.SerializerMethodField()
    user_id = serializers.SerializerMethodField()

    class Meta:
        model = Engineer
        fields = "__all__"

    def get_text_category(self, obj):
        return obj.get_category_display()

    def get_user_id(self, obj):
        return obj.user.username


class ReleaseLogSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()

    class Meta:
        model = ReleaseLog
        fields = "__all__"

    def get_category(self, obj):
        return obj.get_release_log_category_display()


class CTradeSerializer(serializers.ModelSerializer):
    # total_price = serializers.SerializerMethodField()
    total_receivable = serializers.SerializerMethodField()

    class Meta:
        model = CTrade
        fields = "__all__"

    # def get_total_price(self, obj):
    #     return ctotal_price(obj)

    def get_total_receivable(self, obj):

        tra = (
            CTrade.objects.prefetch_related("histories")
            .filter(customer_id=obj.customer_id)
            .filter(created_date__lte=obj.created_date)
        )
        return ccreate_receivable(tra)


class CCustomerSerializer(serializers.ModelSerializer):
    receivable = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = "__all__"

    def get_receivable(self, obj):
        # tra = Trade.objects.filter(customer_id=obj.no)
        tra = obj.trades.prefetch_related("histories").all()
        return ccreate_receivable(tra)

class ProductPackageItemSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    product_category = serializers.SerializerMethodField()
    product_code = serializers.SerializerMethodField()

    class Meta:
        model = ProductPackageItem
        fields = "__all__"

    def get_product_name(self, obj):
        return obj.product.name if obj.product else ""

    def get_product_category(self, obj):
        return obj.product.category if obj.product else ""

    def get_product_code(self, obj):
        return obj.product.code if obj.product else ""


class ProductPackageSerializer(serializers.ModelSerializer):
    items = ProductPackageItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = ProductPackage
        fields = "__all__"

    def get_item_count(self, obj):
        return obj.items.count()

class PendingStockSerializer(serializers.ModelSerializer):
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = PendingStock
        fields = [
            "id",
            "product",
            "product_name",
            "product_category",
            "amount",
            "price",
            "status",
            "status_display",
            "trade",
            "history",
            "supplier_name",
            "register_name",
            "memo",
            "confirmed_date",
            "created_date",
            "updated_date",
        ]

    def get_status_display(self, obj):
        status_map = {0: "입고대기", 1: "입고완료", 2: "바로판매", 3: "취소"}
        return status_map.get(obj.status, "알수없음")

from model.models import AsInternalProcess

class AsInternalProcessSerializer(serializers.ModelSerializer):
    engineer_name = serializers.SerializerMethodField()

    class Meta:
        model = AsInternalProcess
        fields = "__all__"

    def get_engineer_name(self, obj):
        return obj.engineer.name if obj.engineer else ""