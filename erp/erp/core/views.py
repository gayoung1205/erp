from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
import datetime
import io
from urllib.parse import quote
import xlsxwriter
from django.db import transaction
from django.contrib.auth.models import User
from model.models import Customer as Cus
from model.models import Product as Pro
from model.models import Trade as Tra
from model.models import History as His
from model.models import Calendar as Cal
from model.models import Category as Cat
from model.models import Engineer as Eng
from model.models import Vacation, Record, Attendance
from model.models import ReleaseLog
from model.models import ProductPackage, ProductPackageItem
from model.models import PendingStock
from .serializers import PendingStockSerializer

from rest_framework import status
from .serializers import (
    CustomerSerializer,
    ProductSerializer,
    TradeSerializer,
    HistorySerializer,
    CalendarSerializer,
    AllTradeSerializer,
    CategorySerializer,
    EngineerSerializer,
    RecordSerializer,
    AttendanceSerializer,
    VacationSerializer,
    ReleaseLogSerializer,
    ProductPackageSerializer,
    ProductPackageItemSerializer,
)
from util.views import (
    ReturnDelete,
    ReturnNoContent,
    ReturnGood,
    ReturnCreate,
    ReturnAccept,
    ReturnError,
    ReturnData,
    FindMissingData,
    CustomResponse,
    get_category_name1,
    get_category_name2,
    get_category_name3,
)
from django.contrib.postgres.search import SearchVector
from django.db.models import Q
from django.core.paginator import Paginator
from django.contrib.postgres.search import SearchQuery, SearchVector
from django.forms.models import model_to_dict
import copy
from django.db import IntegrityError
import logging
import calendar
from .excel_export import ExcelExport
from .biostar_tna import interval_tna
import urllib
from django.http import HttpResponse
from django.core.paginator import Paginator
import openpyxl
from pandas import read_excel
from model.models import ReleaseLog, ReleaseLogPermission
from urllib.parse import quote

# Create your views here.
"""
ERP 관련 API 
"""
logger = logging.getLogger(__name__)


def return_username(user):
    return Eng.objects.get(user=user)


def custom_paginator(req, queryset, order):
    page_size = 30
    page = req.GET.get("page", 1)

    try:
        page = int(page)
    except ValueError:
        page = 1

    if order:
        queryset = queryset.order_by(order)
    paginator = Paginator(queryset, page_size)

    try:
        page_result = paginator.page(page)
        if paginator.count < 1:
            return {"count": 0, "max_page": 0, "results": []}
        result = {"count": paginator.count, "max_page": len(paginator.page_range)}
        result["results"] = page_result.object_list

        return result

    except Exception as e:
        print(e)
        return {"count": 0, "max_page": 0, "results": []}


def make_trade(trade_list):
    result = 0
    receivalble = []
    total_count = []
    content_list = []
    tax_list = []
    price_list = []
    for trade in trade_list:
        flags = 1
        if trade.category_1 in [1, 4]:
            flags = -1
        if trade.cash != 0 or trade.bank != 0 or trade.credit != 0:
            sum = trade.cash + trade.credit + trade.bank
            if trade.is_active:
                result += abs(sum) * flags
            total_count.append(sum * flags)
            receivalble.append(result)
            content_list.append("")
            tax_list.append(0)
            price_list.append(0)
        else:
            history_list = His.objects.filter(trade_id=trade.id)
            total_price = 0
            total_tax = 0
            price = 0
            content = ""
            for history in history_list:
                if trade.category_1 in [5, 6]:
                    pass
                else:
                    tax = 0
                    if history.tax_category == 1:
                        tax = round(history.price * 0.1)
                    total_tax += tax * history.amount
                    price += history.price * history.amount
                    if trade.is_active:
                        result += (history.price + tax) * history.amount * flags
                    total_price += (history.price + tax) * history.amount * flags
                    content += "{name} \n".format(name=history.name)
            tax_list.append(int(total_tax))
            price_list.append(price)
            total_count.append(abs(total_price))
            receivalble.append(result)
            content_list.append(content)
    return {
        "data": receivalble,
        "data_1": total_count,
        "content": content_list,
        "tax": tax_list,
        "price": price_list,
    }


def make_price(trade):
    his_list = His.objects.filter(trade_id=trade.id).values()
    total_price = 0
    content = 0
    if his_list.count() == 0:
        return 0
    for history in his_list:
        tax = 0
        if history["tax_category"] == 1:
            tax = history["price"] * 0.1
        total_price = (history["price"] + tax) * history["amount"]
        content += "{name} \n".format(name=history["name"])
    return {"price": total_price, "content": content}


class Customer(APIView):
    """
        전체 고객 관련 API
        id = models.AutoField(primary_key=True)
        name = models.CharField(max_length=50)
        phone = models.CharField(max_length=50)
        tel = models.CharField(max_length=50)
        address_1 = models.CharField(max_length=255)
        address_2 = models.CharField(max_length=255)
        post_number = models.CharField(max_length=50)
        fax_number = models.CharField(max_length=50)
        email = models.CharField(max_length=50)
        created_date = models.DateTimeField(auto_now_add=True)
        updated_date = models.DateTimeField(auto_now=True)
        customer_grade = models.CharField(max_length=50)
        price_grade = models.CharField(max_length=50)
        memo = models.TextField()
        register_id = models.CharField(max_length=50)
    """

    def get(self, req):
        """
            GET METHOD로 호출 시 전체 고객 데이터 반환
           
        """
        search = req.GET.get("search", None)
        sort = req.GET.get("sort", None)
        receivable = req.GET.get("receivable", None)
        
        if search:
            try:
                search_dict = {}
                search = search.split(",")
                for item in search:
                    search_dict[item.split(":")[0]] = item.split(":")[1]
                search_query = Q()

                if "통합검색" in search_dict:
                    search_query |= Q(name__icontains=search_dict["통합검색"])
                    search_query |= Q(tel__icontains=search_dict["통합검색"])
                    search_query |= Q(phone__icontains=search_dict["통합검색"])
                    search_query |= Q(address_1__icontains=search_dict["통합검색"]) | Q(
                        address_2__icontains=search_dict["통합검색"]
                    )
                    search_query |= Q(fax_number__icontains=search_dict["통합검색"])
                    # search_query |= Q(created_date=search_dict["통합검색"])
                    search_query |= Q(customer_grade__icontains=search_dict["통합검색"])
                    search_query |= Q(price_grade__icontains=search_dict["통합검색"])
                    search_query |= Q(memo__icontains=search_dict["통합검색"])
                    search_query |= Q(register_id__icontains=search_dict["통합검색"])
                if "고객(거래처)명" in search_dict:
                    search_query &= Q(name__icontains=search_dict["고객(거래처)명"])
                if "Tel" in search_dict:
                    search_query &= Q(tel__icontains=search_dict["Tel"])
                if "Phone" in search_dict:
                    search_query &= Q(phone__icontains=search_dict["Phone"])
                if "주소" in search_dict:
                    search_query &= Q(address_1__icontains=search_dict["주소"]) | Q(
                        address_2__icontains=search_dict["주소"]
                    )
                if "Fax" in search_dict:
                    search_query &= Q(fax_number__icontains=search_dict["Fax"])
                if "등록일" in search_dict:
                    search_query &= Q(created_date=search_dict["등록일"])
                if "고객분류" in search_dict:
                    search_query &= Q(customer_grade__icontains=search_dict["고객분류"])
                if "가격분류" in search_dict:
                    search_query &= Q(price_grade__icontains=search_dict["가격분류"])
                if "메모" in search_dict:
                    search_query &= Q(memo__icontains=search_dict["메모"])
                if "등록자ID" in search_dict:
                    search_query &= Q(register_id__icontains=search_dict["등록자ID"])

                cus = Cus.objects.filter(search_query).order_by("-created_date")
                serializer = CustomerSerializer(cus, many=True)
                return ReturnData(data={"results": serializer.data})
            except:
                return CustomResponse(
                    message="데이터 형식이 이상합니다.", status=status.HTTP_400_BAD_REQUEST
                )
        elif receivable:
            cus = Cus.objects.all()
            serializer = CustomerSerializer(cus, many=True)
            data = []

            for i in serializer.data:
                if int(receivable) == 0:
                    if i["receivable"] < 0:
                        data.append(i)
                else:
                    if i["receivable"] > 0:
                        data.append(i)
            return ReturnData(data={"results": data})
        else:
            cus = Cus.objects.all()

        if sort:
            sort = sort.split(",")
            cus = cus.order_by(sort)

        # serializer = CustomerSerializer(cus, many=True)
        logger.info(f"{return_username(req.user).name} 이 전체고객을 검색하였습니다.")
        result = custom_paginator(req, cus, "-created_date")
        result["results"] = CustomerSerializer(result["results"], many=True).data
        return ReturnData(data=result)

    def post(self, req):
        """
            POST METHOD로 호출 시 새로운 고객 데이터를 생성
             ---
            # 내용
                - name : 고객 네임(Char)
                - phone : 핸드폰 번호(Char)
                - tel : 전화번호(Char)
                - address_1 : 주소(Char)
                - address_2 : 세부주소(Char)
                - post_number : 우편번호(Char)
                - fax_number : 팩스번호(Char)
                - email : 이메일(Char)
                - customer_grade : 고객 등급(Char)
                - price_grade : 가격 등급(Char)
                - memo : 메모(Text)
        """
        require_data = [
            "name",
            "customer_grade",
        ]
        data = req.data
        miss = FindMissingData(require_data, data)
        if miss["is_miss"]:
            return CustomResponse(miss["message"], status=status.HTTP_400_BAD_REQUEST)
        else:
            if miss["message"] != "":
                return CustomResponse(
                    miss["message"], status=status.HTTP_400_BAD_REQUEST
                )

        with transaction.atomic():
            cus = Cus.objects.create()
            for i in data:
                setattr(cus, i, data[i])
            user = User.objects.get(username=req.user)

            setattr(cus, "register_id", user.username)

            cus.save()
        logger.info(f"{req.user.username} 이 [{cus.name}] 고객을 생성하였습니다.")

        return Response(
            data={"message": "데이터를 성공적으로 생성하였습니다."}, status=status.HTTP_201_CREATED
        )


class CustomerDetail(APIView):
    """
        특정 고객에 관련된 API
        기본적으로 customer_id를 통해 DB에 Customer 모델을 조회
    """

    def get(self, req, customer_id):
        """
            GET METHOD로 호출시 customer_id 를 통해 조회 후 해당 레코드 반환
        """

        try:
            cus = Cus.objects.filter(id=customer_id)
        except:
            return Response(
                data={"message": "해당하는 데이터가 존재하지 않습니다."},
                status=status.HTTP_204_NO_CONTENT,
            )
        serializer = CustomerSerializer(cus, many=True)
        logger.info(
            f"{req.user.username} 이 [{cus[0].id}] : [{cus[0].name}] 고객을 조회하였습니다."
        )

        return Response(
            data={"data": serializer.data, "message": "성공적으로 데이터를 반환하였습니다."},
            status=status.HTTP_200_OK,
        )

    def put(self, req, customer_id):
        """
            PUT METHOD로 호출 시 customer_id를 통해 조회 후 해당 레코드를 req.data를 통해 수정
             ---
            # 내용
                - name : 고객 네임(Char)
                - phone : 핸드폰 번호(Char)
                - tel : 전화번호(Char)
                - address_1 : 주소(Char)
                - address_2 : 세부주소(Char)
                - post_number : 우편번호(Char)
                - fax_number : 팩스번호(Char)
                - email : 이메일(Char)
                - customer_grade : 고객 등급(Char)
                - price_grade : 가격 등급(Char)
                - memo : 메모(Text)
        """
        try:
            cus = Cus.objects.get(id=customer_id)
        except:
            return Response(
                data={"message": "해당하는 데이터가 존재하지 않습니다."},
                status=status.HTTP_204_NO_CONTENT,
            )
        with transaction.atomic():
            try:
                for i in req.data:
                    setattr(cus, i, req.data[i])
                cus.save()
            except:
                return Response(
                    data={"message": "데이터를 수정하는 도중에 에러가 발생하였습니다."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        logger.info(f"{req.user.username} 이 [{cus.id}] : [{cus.name}] 고객을 수정하였습니다.")

        return Response(
            data={"message": "데이터를 성공적으로 수정하였습니다."}, status=status.HTTP_202_ACCEPTED
        )

    def delete(self, req, customer_id):
        """
            DELETE METHOD로 호출 시 customer_id를 통해 조회 후 허가 권한이 있는지 확인 후 삭제
        """
        try:
            with transaction.atomic():
                cus = Cus.objects.get(id=customer_id)
                delete_cus_id = copy.deepcopy(cus.id)
                delete_cus_name = copy.deepcopy(cus.name)
                cus.delete()
        except:
            return Response(
                data={"message": "해당하는 데이터가 존재하지 않습니다."},
                status=status.HTTP_204_NO_CONTENT,
            )

        logger.info(
            f"{return_username(req.user).name} 이 [{delete_cus_id}] : [{delete_cus_name}] 고객을 삭제하였습니다."
        )

        return Response(
            data={"message": "해당하는 데이터를 성공적으로 삭제하였습니다."},
            status=status.HTTP_202_ACCEPTED,
        )


class Product(APIView):
    """
        제품 관련 전체적인 API
    """

    def get(self, req):
        """
            제품에 대한 리스트를 반환하는 API
        """
        search = req.GET.get("search", None)
        name = req.GET.get("name", None)
        code = req.GET.get("code", None)
        category = req.GET.get("category", None)

        if search:
            try:
                search_dict = {}
                search = search.split(",")
                for item in search:
                    search_dict[item.split(":")[0]] = item.split(":")[1]
                search_query = Q()

                if "통합검색" in search_dict:
                    search_query |= Q(name__icontains=search_dict["통합검색"])
                    search_query |= Q(category__icontains=search_dict["통합검색"])
                    search_query |= Q(supplier__icontains=search_dict["통합검색"])
                    search_query |= Q(container__icontains=search_dict["통합검색"])
                    search_query |= Q(purchase__icontains=search_dict["통합검색"])
                    search_query |= Q(code__icontains=search_dict["통합검색"])
                    search_query |= Q(memo__icontains=search_dict["통합검색"])
                    search_query |= Q(register_id__icontains=search_dict["통합검색"])
                if "제품명" in search_dict:
                    search_query &= Q(name__icontains=search_dict["제품명"])
                if "제품분류" in search_dict:
                    search_query &= Q(category__icontains=search_dict["제품분류"])
                if "제조사" in search_dict:
                    search_query &= Q(supplier__icontains=search_dict["제조사"])
                if "보관장소" in search_dict:
                    search_query &= Q(container__icontains=search_dict["보관장소"])
                if "주매입처" in search_dict:
                    search_query &= Q(purchase__icontains=search_dict["주매입처"])
                if "코드" in search_dict:
                    search_query &= Q(code__icontains=search_dict["코드"])
                if "메모" in search_dict:
                    search_query &= Q(memo__icontains=search_dict["메모"])
                if "등록자ID" in search_dict:
                    search_query &= Q(register_id__icontains=search_dict["등록자ID"])

                pro = Pro.objects.filter(search_query)

                if category:
                    pro = pro.filter(category__iexact=category)

                pro = pro.order_by("-stock")  # 재고 내림차순
                serializer = ProductSerializer(pro, many=True)
                return ReturnData(data={"results": serializer.data})
            except:
                return CustomResponse(
                    message="데이터 형식이 이상합니다.",
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif name and code:
            pro = Pro.objects.filter(
                Q(name__icontains=name) | Q(code__icontains=code)
            )
            if category:
                pro = pro.filter(category__iexact=category)
            pro = pro.order_by("-stock")
        elif name:
            pro = Pro.objects.filter(Q(name__icontains=name))
            if category:
                pro = pro.filter(category__iexact=category)
            pro = pro.order_by("-stock")
        elif code:
            pro = Pro.objects.filter(Q(code__icontains=code))
            if category:
                pro = pro.filter(category__iexact=category)
            pro = pro.order_by("-stock")
        else:
            pro = Pro.objects.all()
            if category:
                pro = pro.filter(category__iexact=category)

        logger.info(f"{return_username(req.user).name} 이 전체제품을 조회하였습니다.")

        result = custom_paginator(req, pro, "-stock")
        result["results"] = ProductSerializer(result["results"], many=True).data

        return ReturnData(data=result)

    def post(self, req):
        """
            제품을 생성하는 API
             ---
            # 내용
                - name : 제품명(Char)
                - category : 제품 분류(Char)
                - supplier : 공급자(Char)
                - container : 보관장소(Char)
                - purchase : 주매입처(Char)
                - code : 제품코드(Char)
                - stock : 재고량(Int)
                - memo : 제품메모(Char)
                - in_price : 매입금액(INT)
                - out_price : 매출금액(INT)
                - sale_price : 소비자금액(INT)
        """
        require_data = [
            "name",
            "category",
        ]

        miss = FindMissingData(require_data, req.data)

        if miss["is_miss"]:
            return CustomResponse(miss["message"], status=status.HTTP_400_BAD_REQUEST)
        else:
            if miss["message"] != "":
                return CustomResponse(
                    miss["message"], status=status.HTTP_400_BAD_REQUEST
                )

        try:
            with transaction.atomic():
                pro = Pro.objects.create()
                for i in req.data:
                    setattr(pro, i, req.data[i])
                setattr(pro, "register_id", req.user.username)
                pro.save()
        except IntegrityError as e:
            return CustomResponse(
                message="코드가 중복되었습니다.", status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(e)
            return Response(
                data={"message": "예기치 못한 오류가 발생하였습니다."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        logger.info(f"{req.user.username} 이 [{pro.id}] : [{pro.name}] 제품을 생성하였습니다.")

        return Response(
            data={"message": "성공적으로 데이터를 생성하였습니다."}, status=status.HTTP_201_CREATED
        )


class ProductDetail(APIView):
    """
        특정 제품에 대한 API
    """

    def get(self, req, product_id):
        """
            product_id를 통해 제품을 조회하고 그 데이터를 반환
        """
        try:
            pro = Pro.objects.get(id=product_id)
        except:
            return Response(
                data={"message": "해당하는 데이터를 찾을 수 없습니다."},
                status=status.HTTP_204_NO_CONTENT,
            )
        serializer = ProductSerializer(pro)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    def delete(self, req, product_id):
        """
            product_id를 통해 제품을 조회하고 그 데이터를 삭제
        """
        try:
            pro = Pro.objects.get(id=product_id)
            delete_pro_id = copy.deepcopy(pro.id)
            delete_pro_name = copy.deepcopy(pro.name)
        except Exception as e:
            return Response(
                data={"message": "해당하는 데이터를 찾을 수 없습니다."},
                status=status.HTTP_204_NO_CONTENT,
            )
        try:
            pro.delete()
        except:
            return Response(
                data={"message": "참조하는 거래내역이 존재함으로 삭제가 불가능합니다."},
                status=status.HTTP_406_NOT_ACCEPTABLE,
            )
        logger.info(
            f"{return_username(req.user).name} 이 [{delete_pro_id}] : [{delete_pro_name}] 을 삭제하였습니다."
        )

        return Response(
            data={"message": "데이터를 성공적으로 삭제하였습니다."}, status=status.HTTP_202_ACCEPTED
        )

    def put(self, req, product_id):
        """
            제품을 생성하는 API
            ---
            # 내용
                - name : 제품명(Char)
                - category : 제품 분류(Char)
                - supplier : 공급자(Char)
                - container : 보관장소(Char)
                - purchase : 주매입처(Char)
                - code : 제품코드(Char)
                - stock : 재고량(Int)
                - memo : 제품메모(Char)
                - in_price : 매입금액(INT)
                - out_price : 매출금액(INT)
                - sale_price : 소비자금액(INT)
        """
        try:
            pro = Pro.objects.get(id=product_id)
        except:
            return Response(
                data={"message": "해당하는 데이터를 찾을 수 없습니다."},
                status=status.HTTP_204_NO_CONTENT,
            )

        with transaction.atomic():
            for i in req.data:
                setattr(pro, i, req.data[i])
            pro.save()
        logger.info(f"{req.user.username} 이 [{pro.id}] : [{pro.name}]을 수정하였습니다.")

        return Response(
            data={"message": "데이터를 성공적으로 수정하였습니다."}, status=status.HTTP_202_ACCEPTED
        )


class AllTrade(APIView):
    """
        전체 항목에 대한 거래 미수금 및 지불금 GET만 있음, 만약에 수정을 원하면 Trade 부분을 호출
    """

    def get(self, req):
        """
            전체 항목에 대한 거래 미수금 및 지불금
        """

        tra = Tra.objects.all()
        result = custom_paginator(req, tra, "-created_date")
        result["results"] = AllTradeSerializer(result["results"], many=True).data
        return ReturnData(data=result)


class Trade(APIView):
    """
        AS/거래 관련 API
    """

    def get(self, req):
        """
            전체 Trade에 관한 데이터를 반환하는 API
        """
        try:
            engineer = req.GET.get("engineer", None)
            search = req.GET.get("search", None)
            customer_id = req.GET.get("id", None)
            history = req.GET.get("history", None)
            category = req.GET.get("category", None)
            category_1 = ["AS", "수금", "지불", "판매", "구매", "수입", "지출", "납품", "메모"]
            category_2 = ["접수", "완료", "진행", "취소"]
            category_3 = ["출장", "내방"]
            logger.info(f"{req.user.username} 이 전체거래내역을 조회하였습니다.")

            if search:
                try:
                    search_dict = {}
                    search = search.split(",")
                    for item in search:
                        search_dict[item.split(":")[0]] = item.split(":")[1]
                    search_query = Q()
                    his_search_query = Q()

                    if "제품내역" in search_dict:
                        his_search_query &= Q(name__icontains=search_dict["제품내역"])
                    if "통합검색" in search_dict:
                        his_search_query &= Q(name__icontains=search_dict["통합검색"])
                        search_query |= Q(register_date__icontains=search_dict["통합검색"])
                        try:
                            if datetime.datetime.strptime(
                                search_dict["통합검색"], "%Y-%m-%d"
                            ):
                                search_query |= Q(visit_date=search_dict["통합검색"])
                                search_query |= Q(complete_date=search_dict["통합검색"])
                        except Exception as e:
                            print(e)
                            pass

                        if search_dict["통합검색"] in category_1:
                            search_query |= Q(
                                category_1=category_1.index(search_dict["통합검색"])
                            )
                        if search_dict["통합검색"] in category_2:
                            search_query |= Q(
                                category_2=category_2.index(search_dict["통합검색"])
                            )
                        if search_dict["통합검색"] in category_3:
                            search_query |= Q(
                                category_3=category_3.index(search_dict["통합검색"])
                            )

                        search_query |= Q(content__icontains=search_dict["통합검색"])
                        search_query |= Q(symptom__icontains=search_dict["통합검색"])
                        search_query |= Q(
                            completed_content__icontains=search_dict["통합검색"]
                        )
                        search_query |= Q(memo__icontains=search_dict["통합검색"])
                        if Eng.objects.filter(Q(name__icontains=search_dict["통합검색"])):
                            search_query |= Q(
                                engineer_id=Eng.objects.get(
                                    name__icontains=search_dict["통합검색"]
                                ).id
                            )
                        search_query |= Q(register_id=search_dict["통합검색"])
                        search_query |= Q(customer_name__icontains=search_dict["통합검색"])
                    if "등록일" in search_dict:
                        search_query &= Q(register_date__icontains=search_dict["등록일"])
                    if "구분" in search_dict:
                        search_query &= Q(
                            category_1=category_1.index(search_dict["구분"])
                        )
                    if "AS(납품)상태" in search_dict:
                        search_query &= Q(
                            category_2=category_2.index(search_dict["AS(납품)상태"])
                        )
                    if "출장/내방" in search_dict:
                        search_query &= Q(
                            category_3=category_3.index(search_dict["출장/내방"])
                        )
                    if "거래내역" in search_dict:
                        search_query &= Q(content__icontains=search_dict["거래내역"])
                    if "고장증상" in search_dict:
                        search_query &= Q(symptom__icontains=search_dict["고장증상"])
                    if "완료내역" in search_dict:
                        search_query &= Q(
                            completed_content__icontains=search_dict["완료내역"]
                        )
                    if "메모" in search_dict:
                        search_query &= Q(memo__icontains=search_dict["메모"])
                    if "방문일" in search_dict:
                        search_query &= Q(visit_date=search_dict["방문일"])
                    if "완료일" in search_dict:
                        search_query &= Q(complete_date=search_dict["완료일"])
                    if "담당자" in search_dict:
                        search_query &= Q(
                            engineer_id=Eng.objects.get(name=search_dict["담당자"]).id
                        )
                    if "등록자ID" in search_dict:
                        search_query &= Q(register_id=search_dict["등록자ID"])
                    if "고객(거래처)명" in search_dict:
                        search_query &= Q(
                            customer_name__icontains=search_dict["고객(거래처)명"]
                        )

                    if his_search_query == Q():
                        tra = Tra.objects.filter(search_query).order_by(
                            "-register_date"
                        )
                        serializer = TradeSerializer(tra, many=True)
                    else:
                        first_search = His.objects.filter(his_search_query).order_by(
                            "-id"
                        )
                        his_tra_id = []

                        for i in first_search:
                            # history가 출고일 경우 trade_id가 None이기 때문에 제외
                            if i.trade_id is not None:
                                if i.trade_id not in his_tra_id:
                                    his_tra_id.append(i.trade_id)
                        if "통합검색" in search_dict:
                            second_search = Tra.objects.filter(
                                Q(id__in=his_tra_id) | search_query
                            ).order_by("-register_date")
                        else:
                            second_search = (
                                Tra.objects.filter(Q(id__in=his_tra_id))
                                .filter(search_query)
                                .order_by("-register_date")
                            )
                        serializer = TradeSerializer(second_search, many=True)

                    return ReturnData({"results": serializer.data})
                except Exception as e:
                    print(e)
                    return CustomResponse(
                        message="데이터 형식이 올바르지않습니다.", status=status.HTTP_400_BAD_REQUEST
                    )

            elif history != None:
                tra_1 = (
                    Tra.objects.filter(customer_id=customer_id)
                    .filter(Q(name__icontains=history))
                    .order_by("id")
                )
            elif engineer is not None:
                tra = (
                    Tra.objects.filter(engineer=engineer)
                    .filter(category_1=0)
                    .filter(customer_id=customer_id)
                )
            elif customer_id is not None:
                tra = Tra.objects.filter(customer_id=customer_id).order_by(
                    "register_date"
                )
            # AS현황, 납품현황, page
            elif category is not None:
                tra = (
                    Tra.objects.filter(category_1=category)
                    .prefetch_related("customer")
                    .order_by("-register_date","-category_2")
                )
                result = custom_paginator(req, tra, None)
                result["results"] = TradeSerializer(result["results"], many=True).data
                return ReturnData(data=result)
            else:
                division = req.GET.get("division")
                tra = Tra.objects.all()
                if division == "accounting":
                    tra = tra.exclude(category_1=8)
                elif division == "trade":
                    tra = tra.exclude(category_1=5).exclude(category_1=6)
                result = custom_paginator(req, tra, "-register_date")
                result["results"] = result["results"].values()
                # tra = tra[0:500]
                # category_1 = ["AS", "수금", "지불", "판매", "구매", "수입", "지출", "납품", "메모"]
                for i in result["results"]:
                    try:
                        trade = Tra.objects.get(id=i["id"])
                        price = trade.total_price()
                        i["supply_price"] = price["price"]
                        i["tax_price"] = price["tax"]
                        i["in_price"] = trade.in_price()
                        i["out_price"] = trade.out_price()
                        i["category_name1"] = get_category_name1(i)
                        i["category_name2"] = get_category_name2(i)
                        i["category_name3"] = get_category_name3(i)
                        i["engineer_name"] = trade.get_engineer_name()

                    except Exception as e:
                        print(e)
                        i["category_name1"] = "미정"

                return ReturnData(data=result)

            data = make_trade(tra)
            tra_value = tra.values()
            for i in range(len(tra_value)):
                tra_value[i]["total_price"] = data["data_1"][i]
                tra_value[i]["total_receivable"] = data["data"][i]
                tra_value[i]["supply_price"] = data["price"][i]
                tra_value[i]["tax_price"] = data["tax"][i]
                tra_value[i]["category_name1"] = get_category_name1(tra_value[i])
                tra_value[i]["category_name2"] = get_category_name2(tra_value[i])
                tra_value[i]["category_name3"] = get_category_name3(tra_value[i])
                tra_value[i]["engineer_name"] = (
                    tra[i].engineer.name if tra[i].engineer != None else ""
                )
                if tra_value[i]["completed_content"] != None:
                    tra_value[i]["completed_content"] += data["content"][i]
            result = {"results": tra_value[::-1]}
            return ReturnData(data=result)
            # result = custom_paginator(req, tra, None)
            # if not result:
            #     return ReturnNoContent()
            # data = make_trade(result["results"])
            # tra_value = result["results"].values()

            # for i in range(len(tra_value)):
            #     tra_value[i]["total_price"] = data["data_1"][i]
            #     tra_value[i]["total_receivable"] = data["data"][i]
            #     tra_value[i]["supply_price"] = data["price"][i]
            #     tra_value[i]["tax_price"] = data["tax"][i]
            #     tra_value[i]["category_name1"] = get_category_name1(tra_value[i])
            #     tra_value[i]["category_name2"] = get_category_name2(tra_value[i])
            #     tra_value[i]["category_name3"] = get_category_name3(tra_value[i])
            #     tra_value[i]["engineer_name"] = (
            #         result["results"][i].engineer.name
            #         if result["results"][i].engineer != None
            #         else ""
            #     )
            #     if tra_value[i]["completed_content"] != None:
            #         tra_value[i]["completed_content"] += data["content"][i]
            # result["results"] = tra_value

            # return ReturnData(data=result)

        except Exception as e:
            print(e)
            return ReturnError()

    def post(self, req):
        """
            새로운 Trade에 관한 데이터를 생성하는데 API
            ---
            # 내용
                - category_1 : 구분1(INT)
                - category_2 : 구분2(INT)
                - category_3 : 구분3(INT)
                - content : 접수내용(TEXT)
                - memo : 메모(TEXT)
                - symptom : 고장증상(TEXT)
                - completed_content : 완료내역(TEXT)
                - engineer : 담당기사(TEXT)
                - visit_date : 방문일(DATE)
                - complete_date : 완료일(DATE)
                - price : 금액(INT)
                - tax : 부가세(BOOLEAN)
                - cash : 현금(INT)
                - credit : 카드(INT)
                - bank : 은행(INT)
                - customer_id : 고객아이디(TEXT)
                - customer_name : 고객이름(TEXT)
        """
        require_data = [
            "category_1",
        ]
        try:
            miss = FindMissingData(require_data, req.data)

            if miss["is_miss"]:
                return CustomResponse(
                    miss["message"], status=status.HTTP_400_BAD_REQUEST
                )
            else:
                if miss["message"] != "":
                    return CustomResponse(
                        miss["message"], status=status.HTTP_400_BAD_REQUEST
                    )

            with transaction.atomic():
                tra = Tra.objects.create()
                for i in req.data:
                    setattr(tra, i, req.data[i])
                setattr(tra, "register_id", req.user.username)
                if req.data["category_1"] in [1, 2]:
                    if req.data.get("content"):
                        if len(req.data["content"]) == 0:
                            pass
                        elif "content" in req.data:
                            if (
                                req.data["content"][len(req.data["content"]) - 1]
                                != "\n"
                            ):
                                tra.content += "\n"
                    tra.content = ""
                    if req.data["cash"] > 0:
                        tra.content += "현금결제/"
                    if req.data["bank"] > 0:
                        tra.content += "은행입금/"
                    if req.data["credit"] > 0:
                        tra.content += "카드결제/"
                tra.save()
            logger.info(
                f"{req.user.username}이 {tra.id} : [{tra.customer_name}]의 [{tra.get_category()}] 내역을 생성하였습니다."
            )

            return CustomResponse(
                data=tra.id,
                message="데이터를 성공적으로 생성하였습니다.",
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            print(e)
            return ReturnError()


class TradeDetail(APIView):
    """
        AS/거래 관련 상세 API
    """

    def get(self, req, trade_id):
        """
            특정 Trade에 관한 정보를 반환하는 API
        """
        try:
            tra = Tra.objects.get(id=trade_id)
            his = His.objects.filter(trade_id=trade_id)
        except:
            return ReturnNoContent()

        tra_serializer = TradeSerializer(tra)
        his_serializer = HistorySerializer(his, many=True)

        return ReturnData(data={"tra": tra_serializer.data, "his": his_serializer.data})

    def put(self, req, trade_id):
        """
            특정 Trade에 관한 정보를 수정하는 API
            ---
            # 내용
                - category_1 : 구분1(INT)
                - category_2 : 구분2(INT)
                - category_3 : 구분3(INT)
                - content : 접수내용(TEXT)
                - memo : 메모(TEXT)
                - symptom : 고장증상(TEXT)
                - completed_content : 완료내역(TEXT)
                - engineer : 담당기사(TEXT)
                - visit_date : 방문일(DATE)
                - complete_date : 완료일(DATE)
                - price : 금액(INT)
                - tax : 부가세(BOOLEAN)
                - cash : 현금(INT)
                - credit : 카드(INT)
                - bank : 은행(INT)
                - customer_id : 고객아이디(TEXT)
                - customer_name : 고객이름(TEXT)
        """
        data = req.data

        try:
            tra = Tra.objects.get(id=trade_id)
        except:
            return ReturnNoContent
        try:
            with transaction.atomic():
                memo = ""
                try:
                    if data["trade"]["engineer_id"] != tra.engineer_id:
                        memo = f"{date} : {prev_eng} 에서 {pres_eng} 로 이관되었습니다.\n".format(
                            date=datetime.datetime.now(),
                            prev_eng=tra.engineer.name,
                            pres_eng=Eng.objects.get(
                                id=data["trade"]["engineer_id"]
                            ).name,
                        )
                except:
                    pass

                for i in data["trade"]:
                    if i == "id" or i == "customer" or i == "engineer":
                        pass
                    else:
                        setattr(tra, i, data["trade"][i])
                # tra.customer_id = data["trade"]["customer_id"]
                if memo != "":
                    setattr(tra, "memo", tra.memo + "\n" + memo)

                if req.data["trade"]["category_1"] in [1, 2]:
                    if len(req.data["trade"]["content"]) == 0:
                        pass
                    elif (
                        req.data["trade"]["content"][
                            len(req.data["trade"]["content"]) - 1
                        ]
                        != "\n"
                    ):
                        tra.content += "\n"
                    if req.data["trade"]["cash"] > 0:
                        tra.content += "현금결제/"
                    if req.data["trade"]["bank"] > 0:
                        tra.content += "은행입금/"
                    if req.data["trade"]["credit"] > 0:
                        tra.content += "카드결제/"
                tra.save()
                try:
                    for history in data["history"]:
                        try:
                            his = His.objects.get(id=history["id"])
                            if history.get("product_id"):
                                his.product_id = history["product_id"]
                                pro = Pro.objects.get(id=history["product_id"])
                                if tra.category_1 in [0, 3, 7]:
                                    # AS, SELL, DELIVER 수정 시
                                    pro.add_stock(his.amount)
                                    pro.minus_stock(amount=history["amount"])
                                elif tra.category_1 == 4:
                                    # ✅ PURCHASE 수정 시 - 입고대기 사용으로 재고 변동 없음
                                    pass
                                else:
                                    pro.minus_stock(his.amount)
                                    pro.add_stock(amount=history["amount"])
                            for key in history:
                                setattr(his, key, history[key])

                            his.save()
                        except Exception as e:
                            his = His.objects.create(
                                name=history["name"],
                                amount=history["amount"],
                                price=history["price"],
                                tax_category=history["tax_category"],
                            )
                            # for key in history:
                            #     setattr(his, key, history[key])
                            if history.get("product_id"):
                                his.product_id = history["product_id"]
                                pro = Pro.objects.get(id=history["product_id"])
                                if tra.category_1 in [0, 3, 7]:
                                    pro.minus_stock(amount=history["amount"])
                                else:
                                    pro.add_stock(amount=history["amount"])
                            if history.get("trade_id"):
                                his.trade_id = history["trade_id"]
                            his.save()
                except Exception as e:
                    print(e)
                    return ReturnError()
            logger.info(
                f"{req.user.username}이 [{tra.id}] : [{tra.customer.name}]의 [{tra.get_category()}] 내역을 수정하였습니다."
            )

            return ReturnAccept()
        except Exception as e:
            print(e)
            return ReturnError()

    def delete(self, req, trade_id):
        """
            특정 Trade에 관한 데이터를 삭제하는 API
        """
        try:
            with transaction.atomic():
                histories = Tra.objects.get(id=trade_id).histories.all()
                for his in histories:
                    if his.product_id:
                        pro = Pro.objects.get(id=his.product_id)
                        tra = Tra.objects.get(id=his.trade_id)
                        if tra.category_1 in [0, 3, 7]:
                            # AS, SELL, DELIVER 삭제 시 - 재고 복구 (증가)
                            pro.add_stock(his.amount)
                        elif tra.category_1 == 4:
                            # ✅ PURCHASE 삭제 시 - 입고대기 사용으로 재고 변동 없음
                            pass
                        else:
                            pro.minus_stock(his.amount)
        except:
            ReturnError()

        try:
            trade = Tra.objects.get(id=trade_id)
            delete_tra_id = copy.deepcopy(trade.id)
            if trade.category_1 not in [5, 6]:
                delete_tra_customer_name = copy.deepcopy(trade.customer.name)
            else:
                delete_tra_customer_name = "(수입, 지출일 경우 고객명 없음)"
            delete_tra_get_category = copy.deepcopy(trade.get_category())
            trade.delete()
            logger.info(
                f"{return_username(req.user).name} 이 [{delete_tra_id}] : [{delete_tra_customer_name}]의 [{delete_tra_get_category}] 거래내역을 삭제하였습니다."
            )

            # his = His.objects.filter(trade_id=trade_id)
            # for i in his:
            #     i.delete()
        except:
            return ReturnNoContent()

        return ReturnAccept()


class History(APIView):
    """
        거래안에 종속되어 있는 거래 내역을 관리하는 API
    """

    def get(self, req):
        """
            전체 거래내역을 반환하여 실시간으로 만들어진 내역을 반환
        """
        try:
            search = req.GET.get("search", None)
            sort = req.GET.get("sort", None)
            trade_id = req.GET.get("no", None)
            if search is not None:
                vector = (
                    SearchVector("name")
                    + SearchVector("product_category")
                    + SearchVector("trade_category")
                )
                query = SearchQuery(search)
                his = (
                    His.objects.annotate(search=vector)
                    .filter(search=query)
                    .filter(trade_id=trade_id)
                )
            else:

                if trade_id is None:
                    his = His.objects.all()
                else:
                    if Tra.objects.filter({id: trade_id}).count() == 0:
                        return CustomResponse(
                            message="해당하는 데이터가 존재하지않습니다.",
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    his = His.objects.all().filter(trade_id=trade_id)

            if sort is not None:
                his = his.order_by(sort)
            logger.info(f"{req.user.username} 이 전체상세거래내역을 조회하였습니다.")

            result = custom_paginator(req, his, "-created_date")
            result["results"] = HistorySerializer(result["results"], many=True).data
            return ReturnData(data=result)
        except:
            return ReturnError()

    def post(self, req):
        """
            거래에 대한 키를 받아서 거래내역을 생성
            ---
            # 내용
                - name : 이름(TEXT)
                - product_category : 제품분류(TEXT)
                - amount : 수량(INT)
                - price : 금액(INT)
                - tax_category : 부가세(INT)
                - trade_category : 거래분류(INT)
                - product_id : 제품번호(INT)
                - trade_id : 거래번호(INT)
        """
        require_data = [
            "name",
            "amount",
            "price",
            "tax_category",
            "trade_category",
            "trade_id",
        ]
        try:
            with transaction.atomic():
                for j in req.data:
                    miss = FindMissingData(require_data, j)

                    if miss["is_miss"]:
                        return CustomResponse(
                            miss["message"], status=status.HTTP_400_BAD_REQUEST
                        )
                    else:
                        if miss["message"] != "":
                            return CustomResponse(
                                miss["message"], status=status.HTTP_400_BAD_REQUEST
                            )
                    his = His.objects.create()
                    for i in j:
                        setattr(his, i, j[i])
                    if j.get("product_id"):
                        pro = Pro.objects.get(id=j["product_id"])
                        tra = Tra.objects.get(id=j["trade_id"])

                        if tra.category_1 in [0, 3, 7]:
                            # AS(0), SELL(3), DELIVER(7) - 재고 감소
                            pro.minus_stock(his.amount)
                        elif tra.category_1 == 4:
                            # ✅ PURCHASE(4) - 입고대기 사용으로 재고 변동 없음
                            # 프론트엔드에서 PendingStock으로 처리
                            pass
                        else:
                            # 기타 - 기존 로직 유지
                            pro.add_stock(amount=j["amount"])
                        # pro.stock += j["amount"] * flags
                        # pro.save()
                    his.save()
            logger.info(
                f"{req.user.username} 이 [{his.id}] : [{his.name}] 상세내역을 생성하였습니다."
            )

            return ReturnCreate()
        except Exception as e:
            print(e)
            return ReturnError()


class HistoryDetail(APIView):
    """
        특정 거래내역을 반환 및 수정, 삭제
    """

    def get(self, req, history_id):
        """
            특정 거래 번호에 따른 거래내역을 반환 
        """
        try:
            his = His.objects.get(id=history_id)
        except:
            return ReturnNoContent()

        serializer = HistorySerializer(his)

        return ReturnData(data=serializer.data)

    def put(self, req, history_id):
        """
            특정 거래내역을 수정
        """
        try:
            his = His.objects.get(id=history_id)
        except:
            return ReturnNoContent()
        try:
            with transaction.atomic():
                for j in req.data:
                    if j.get("product_id"):
                        his = His.objects.get(id=history_id)
                        pro = Pro.objects.get(id=j["product_id"])
                        tra = Tra.objects.get(id=j["trade_id"])
                        if tra.category_1 in [0, 3, 7]:
                            pro.add_stock(his.amount)
                            pro.minus_stock(j["amount"])
                        else:
                            pro.minus_stock(his.amount)
                            pro.add_stock(j["amount"])

                    for i in j:
                        setattr(his, i, j[i])
                    his.save()
            logger.info(
                f"{req.user.username} 이 [{his.id}] : [{his.name}] 상세내역을 수정하였습니다."
            )

            return ReturnAccept()
        except Exception as e:
            print(e)
            return ReturnError()

    def delete(self, req, history_id):
        """
            특정 거래내역을 삭제
            
        """
        try:
            his = His.objects.get(id=history_id)
        except:
            return ReturnNoContent()
        try:
            with transaction.atomic():
                if his.product_id:
                    pro = Pro.objects.get(id=his.product_id)
                    tra = Tra.objects.get(id=his.trade_id)
                    if tra.category_1 in [0, 3, 7]:
                        pro.add_stock(his.amount)
                    else:
                        pro.minus_stock(his.amount)
        except:
            ReturnError()

        try:
            his = His.objects.get(id=history_id)
            delete_his_id = copy.deepcopy(his.id)
            delete_his_name = copy.deepcopy(his.name)
            his.delete()
            logger.info(
                f"{return_username(req.user).name} 이 [{delete_his_id}] : [{delete_his_name}] 상세거래내역을 삭제하였습니다."
            )

        except:
            return ReturnNoContent()
        return ReturnAccept("해당 데이터 삭제를 완료했습니다.")


class Calendar(APIView):
    """
        일정 관리에 관련된 API
    """

    def get(self, req):
        """
            전체 일정을 조회
        """
        try:
            cal = Cal.objects.all().order_by("-id")

            serializer = CalendarSerializer(cal, many=True)
            if len(serializer.data) == 0:
                return ReturnNoContent()
            return ReturnData(data=serializer.data)
        except Exception as e:
            print(e)
            return ReturnError()

    def post(self, req):
        """
            새로운 일정을 생성
        """
        try:
            with transaction.atomic():
                cal = Cal.objects.create()
                for i in req.data:
                    setattr(cal, i, req.data[i])
                cal.save()
            logger.info(f"{return_username(req.user).name} 이 {cal.id} 일정을 생성하였습니다.")
            return ReturnData(data=cal.id)
        except Exception as e:
            print(e)
            return ReturnError()


class CalendarDetail(APIView):
    """
        특정일정에 대한 자세한 정보를 표시
    """

    def get(self, req, calendar_id):
        """
            특정 일정에 대해 표시
        """
        try:
            try:
                cal = Cal.objects.get(id=calendar_id)
            except:
                return ReturnNoContent()

            serializer = CalendarSerializer(cal)

            return ReturnData(data=serializer.data)
        except:
            return ReturnError()

    def put(self, req, calendar_id):
        """
            특정 일정을 수정
        """
        try:
            cal = Cal.objects.get(id=calendar_id)
        except:
            return ReturnNoContent()
        try:
            with transaction.atomic():
                for i in req.data:
                    setattr(cal, i, req.data[i])
                cal.save()
            logger.info(f"{req.user.username} 이 {cal.id} 일정을 수정하였습니다.")

            return ReturnAccept()
        except Exception as e:
            print(e)
            return ReturnError()

    def delete(self, req, calendar_id):
        """
            특정 일정을 삭제
        """
        try:
            cal = Cal.objects.get(id=calendar_id)
            delete_cal_id = copy.deepcopy(cal.id)
        except Exception as e:
            print(e)
            return ReturnNoContent()
        try:
            cal.delete()
        except:
            return ReturnError()
        logger.info(f"{return_username(req.user).name} 이 {delete_cal_id} 일정을 삭제하였습니다.")

        return ReturnAccept()


class Category(APIView):
    """
        카테고리 관련 API 현재 GET, POST 만 사용가능
        (Delete, Put의 경우 만들면 에러의 소지가 크기에 만들지 않음)
    """

    def get(self, req):
        """
            카테고리 데이터를 반환 Category Parameter 가 없는 경우 None 으로 전체 데이터 반환
            Category의 경우 0은 고객 , 1은 상품
        """
        try:
            category = req.GET.get("category", None)
            if category is not None:
                cat = Cat.objects.filter(category=int(category)).order_by("name")
            else:
                try:
                    cat = Cat.objects.all()
                except:
                    return ReturnError()
            serialzer = CategorySerializer(cat, many=True)

            return ReturnData(data=serialzer.data)
        except:
            return ReturnError()

    def post(self, req):
        """
            제품등급과 고객등급에 대한 카테고리를 생성
            ---
            # 내용
                - name : 이름(STR)
                - category : 구분(0: 사람,1 : 제품)(INT)
        """
        require_data = [
            "name",
            "category",
        ]

        miss = FindMissingData(require_data, req.data)
        if miss["is_miss"]:
            return CustomResponse(miss["message"], status=status.HTTP_400_BAD_REQUEST)
        else:
            if miss["message"] != "":
                return CustomResponse(
                    miss["message"], status=status.HTTP_400_BAD_REQUEST
                )
        try:
            with transaction.atomic():
                cat = Cat.objects.create()
                # cat.category = req.data["category"]
                # cat.name = req.data["name"]
                for i in req.data:
                    setattr(cat, i, req.data[i])

                cat.save()

            return ReturnCreate()
        except IntegrityError:
            CustomResponse(
                message="해당하는 데이터가 이미 존재합니다", status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(e)
            return ReturnError()


class CategoryDetail(APIView):
    """
        개별적 카테고리 데이터 반환 및 수정, 삭제
    """

    def get(self, req, category_id):
        """
            category_id 에 따른 데이터 값 반환
        """
        try:
            cat = Cat.objects.get(id=category_id)
        except:
            return ReturnNoContent()
        try:
            serializer = CategorySerializer(cat)

            return ReturnData(data=serializer.data)
        except:
            return ReturnError()

    def put(self, req, category_id):
        """
            category_id 에 따른 데이터 값 수정
        """
        try:
            cat = Cat.objects.get(id=category_id)
        except:
            return ReturnNoContent()

        try:
            with transaction.atomic():
                for i in req.data:
                    setattr(cat, i, req.data[i])
                cat.save()
        except IntegrityError:
            CustomResponse(
                message="해당하는 데이터가 이미 존재합니다", status=status.HTTP_400_BAD_REQUEST
            )
        except:
            return ReturnError()

        return ReturnAccept()

    def delete(self, req, category_id):
        """
            category_id 에 따른 데이터 값 삭제
        """
        try:
            Cat.objects.get(id=int(category_id)).delete()
        except Exception as e:
            print(e)
            return ReturnError()

        return ReturnAccept("데이터를 성공적으로 삭제하였습니다.")


class UserIdCheck(APIView):
    def get(self, req):
        """
            직원 생성 시 아이디 확인
        """
        check_id = req.GET.get("id", None)
        try:
            user = User.objects.filter(username=check_id)
            if len(user) == 0:
                return ReturnData(data=True)
            else:
                return ReturnData(data=False)

        except Exception as e:
            print(e)
            return ReturnError()

        return ReturnAccept()


class Engineer(APIView):
    def get(self, req):
        """
            직원 전체 조회
            ---
            # 내용
                - is_visible : 계정 활성화/비활성화 감추기 여부 는 비활성화 감추기 
        """
        is_visible = req.GET.get("isVisible", None)

        if is_visible == "true":
            engineer = Eng.objects.filter(is_active=True)
        else:
            engineer = Eng.objects.all()

        logger.info(f"{return_username(req.user).name} 이 전체 직원을 조회하였습니다.")
        result = custom_paginator(req, engineer, "-created_date")
        result["results"] = EngineerSerializer(result["results"], many=True).data
        return ReturnData(data=result)

    def post(self, req):
        """
            직원 생성
            유저 생성 후에 직원 생성
            ---
            # 내용
                - user_id : 유저 아이디
                - password : 비밀번호
                - password_check : 비밀번호 확인
                - name : 이름
                - join_date : 입사일
                - category : 부서구분
                - is_active : 활성여부
                - is_staff : 관리사이트 로그인 가능 여부
                
        """
        require_data = ["user_id", "password", "name", "category"]

        miss = FindMissingData(require_data, req.data)
        if miss["is_miss"]:
            return CustomResponse(miss["message"], status=status.HTTP_400_BAD_REQUEST)
        else:
            if miss["message"] != "":
                return CustomResponse(
                    miss["message"], status=status.HTTP_400_BAD_REQUEST
                )

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    req.data["user_id"], "", req.data["password"]
                )
                user.is_active = req.data["is_active"]
                user.is_staff = req.data["is_staff"]
                user.save()

                eng = Eng.objects.create(category=req.data["category"], user=user)
                for i in req.data:
                    if i not in ["user_id", "password", "password_check", "category"]:
                        setattr(eng, i, req.data[i])
                eng.save()

                logger.info(
                    f"{return_username(req.user).name} 이 {eng.id}:{eng.name}을 생성하였습니다."
                )

        except Exception as e:
            print(e)
            return ReturnError()

        return ReturnAccept()


class EngineerDetail(APIView):
    def get(self, req, engineer_id):
        """
            특정 직원에 대해 표시
        """
        try:
            try:
                eng = Eng.objects.filter(id=engineer_id)
            except:
                return ReturnNoContent()
            serializer = EngineerSerializer(eng[0])

            logger.info(
                f"{return_username(req.user).name} 이 {eng[0].id}:{eng[0].name}을 조회하였습니다."
            )
            return ReturnData(serializer.data)
        except Exception as e:
            print(e)
            return ReturnError()

    def put(self, req, engineer_id):
        """
            특정 직원을 수정
        """
        try:
            eng = Eng.objects.get(id=engineer_id)
        except:
            return ReturnNoContent()
        try:
            user = User.objects.get(id=req.data["user"])
        except:
            ReturnNoContent()

        try:
            with transaction.atomic():
                for i in req.data:
                    if i in ["name", "category", "join_date", "is_active", "is_staff"]:
                        setattr(eng, i, req.data[i])
                eng.save()

                if len(req.data["password"]) > 0:
                    user.set_password(req.data["password"])
                    logger.info(
                        f"{return_username(req.user).name} 이 {eng.id}:{eng.name} 직원 비밀번호를 수정하였습니다."
                    )
                if user.is_active != req.data["is_active"]:
                    user.is_active = req.data["is_active"]
                if user.is_staff != req.data["is_staff"]:
                    user.is_staff = req.data["is_staff"]
                user.save()

            logger.info(
                f"{return_username(req.user).name} 이 {eng.id}:{eng.name} 직원을 수정하였습니다."
            )
            return ReturnAccept()
        except Exception as e:
            print(e)
            return ReturnError()

    def delete(self, req, engineer_id):
        """
        직원 삭제 (비활성 직원만 삭제 가능)
        """
        try:
            eng = Eng.objects.get(id=engineer_id)
        except:
            return ReturnNoContent()

        if eng.is_active:
            return CustomResponse(
                message="활성 직원은 삭제할 수 없습니다. 먼저 비활성화 해주세요.",
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                user = eng.user
                delete_eng_id = copy.deepcopy(eng.id)
                delete_eng_name = copy.deepcopy(eng.name)

                eng.delete()
                user.delete()

                logger.info(
                    f"{return_username(req.user).name} 이 {delete_eng_id}:{delete_eng_name} 직원을 삭제하였습니다."
                )
            return ReturnDelete()
        except Exception as e:
            print(e)
            return ReturnError()


class HistoryAllDelete(APIView):
    def delete(self, req, trade_id):
        try:
            with transaction.atomic():
                histories = Tra.objects.get(id=trade_id).histories.all()
                for his in histories:
                    if his.product_id:
                        pro = Pro.objects.get(id=his.product_id)
                        tra = Tra.objects.get(id=his.trade_id)
                        if tra.category_1 in [0, 3, 7]:
                            pro.add_stock(his.amount)
                        else:
                            pro.minus_stock(his.amount)
        except:
            ReturnError()
        try:
            his = His.objects.filter(trade_id=trade_id)
            for i in his:
                delete_his_id = copy.deepcopy(i.id)
                delete_his_name = copy.deepcopy(i.name)
                i.delete()
                logger.info(
                    f"{return_username(req.user).name} 이 [{delete_his_id}] : [{delete_his_name}] 상세내역을 삭제하였습니다."
                )

            return ReturnAccept()
        except Exception as e:
            print(e)
            return ReturnError()


class Test(APIView):
    def get(self, req):
        datas = read_excel(
            "C:/Users/user/Documents/git/erp/erp/등록코드.xlsx",
            engine="openpyxl",
            index_col=[6],
        )
        for i in range(len(datas)):
            cat = Cat.objects.filter(Q(name=datas.iloc[i]["제품분류"]) & Q(category=1))
            if not cat:
                cat = Cat.objects.create(name=datas.iloc[i]["제품분류"], category=1)

            if datas.iloc[i]["중고/신품"] == "중고":
                name = datas.iloc[i]["제품명"] + "(중고)"

            Pro.objects.create(
                name=name,
                category=datas.iloc[i]["제품분류"],
                supplier=datas.iloc[i]["제조사"],
                stock=datas.iloc[i]["개수"],
                code=datas.iloc[i]["코드"],
            )

        return ReturnData("good")


class ReceivableView(APIView):
    def get(self, req):
        trade_list = Tra.objects.all()
        result = 0
        receivalble = []
        total_count = []
        for trade in trade_list:
            flags = 1
            if trade.category_1 in [1, 4]:
                flags = -1
            if trade.cash != 0 or trade.bank != 0 or trade.credit != 0:
                sum = trade.cash + trade.credit + trade.bank
                result += sum * flags
                total_count.append(sum * flags)
                receivalble.append(result)
            else:
                history_list = His.objects.filter(trade_id=trade.id)
                total_price = 0
                for history in history_list:
                    if trade.category_1 in [5, 6]:
                        pass
                    else:
                        tax = 0
                        if history.tax_category == 1:
                            tax = history.price * 0.1
                        result += (history.price + tax) * history.amount * flags
                        total_price = (history.price + tax) * history.amount * flags
                total_count.append(total_price)
                receivalble.append(result)
        return ReturnAccept()


class MyasView(APIView):
    def get(self, req):
        try:
            if req.user.is_superuser:
                my_as = Tra.objects.filter(category_1=0).filter(category_2__in=[0, 2])
            else:
                eng = Eng.objects.prefetch_related("trades").get(user=req.user.id)
                my_as = eng.trades.filter(category_2__in=[0, 2])
        except Exception as e:
            print(e)
            return CustomResponse
        result = custom_paginator(req, my_as, None)
        result["results"] = TradeSerializer(result["results"], many=True).data
        return ReturnData(data=result)


class DashBoardView(APIView):
    def get(self, req):

        now = datetime.datetime.now().strftime("%Y-%m-%d")
        now_process_amount = Tra.objects.filter(
            Q(register_date__gte=now + " 00:00") & Q(register_date__lte=now + " 23:59")
        )

        now_process_amount_1 = now_process_amount.filter(category_1__in=[1, 2, 5, 6])
        now_amount = 0
        for i in now_process_amount_1:
            now_amount += i.calculate_money()
        month = datetime.datetime.now().strftime("%Y-%m")
        month_split = list(map(int, month.split("-")))
        month_range = calendar.monthrange(month_split[0], month_split[1])
        month_process_amount = Tra.objects.filter(
            Q(register_date__gte=month + "-01 00:00")
            & Q(register_date__lte=month + f"-{month_range[1]} 23:59")
        )
        month_process_amount_1 = month_process_amount.filter(
            category_1__in=[1, 2, 5, 6]
        ).order_by("register_date")

        month_amount = 0
        for i in month_process_amount_1:
            month_amount += i.calculate_money()
        month_as = month_process_amount.filter(category_1__in=[0])

        completed_as = month_as.filter(category_2=1).count()
        ongoing_as = month_as.filter(category_2=2).count()
        canceled_as = month_as.filter(category_2=3).count()
        accepted_as = month_as.filter(category_2=0).count()

        year = datetime.datetime.now().strftime("%Y")
        year_process_amount = Tra.objects.filter(
            Q(register_date__gte=year + "-01-01 00:00")
            & Q(register_date__lte=year + "-12-31 23:59")
        )

        year_process_amount_1 = year_process_amount.filter(
            category_1__in=[1, 2, 5, 6]
        ).order_by("register_date")

        year_amount = 0
        for i in year_process_amount_1:
            year_amount += i.calculate_money()

        new_as = (
            Tra.objects.filter(category_1=0)
            .filter(category_2__in=[0, 2])
            .order_by("-register_date")[:10]
        )

        new_as = TradeSerializer(new_as, many=True)
        eng = Eng.objects.get(user=req.user)
        return ReturnData(
            data={
                "username": eng.name,
                "total_as": new_as.data,
                "completed_as": completed_as,
                "accepted_as": accepted_as,
                "canceled_as": canceled_as,
                "ongoing_as": ongoing_as,
                "now_amount": now_amount,
                "month_amount": month_amount,
                "year_amount": year_amount,
                "permission": eng.category,
            }
        )


class ReleaseView(APIView):
    def get(self, req):
        his = His.objects.filter(Q(trade=None) & Q(is_released=True)).order_by(
            "-created_date"
        )
        # for i in his:
        #     setattr(i, "is_released", True)
        #     i.save()
        history_data = HistorySerializer(his, many=True).data

        return ReturnData(data=history_data)

    def post(self, req):
        data = req.data
        if not (data.get("name") and data.get("product_id") and data.get("amount")):
            return CustomResponse(
                message="데이터 형식이 올바르지 않습니다.", status=status.HTTP_400_BAD_REQUEST
            )
        with transaction.atomic():
            his = His.objects.create(
                name=data["name"],
                product_id=data["product_id"],
                amount=data["amount"],
                tax_category=0,
                register_name=return_username(req.user).name,
                is_released=True,
            )
            pro = get_object_or_404(Pro, id=data["product_id"])
            pro.minus_stock(data["amount"])

            ReleaseLog.objects.create(
                release_log_category=0,
                name=his.name,
                product_category=pro.category,
                amount=his.amount,
                memo=data.get("memo", ""),
                register_name=return_username(req.user).name,
                release_register_name=return_username(req.user).name,
                release_created_date=his.created_date,
            )

        logger.info(
            f"{[return_username(req.user).name]}님이 [{his.name}] - [{his.amount}]개를 출고품으로 등록하였습니다."
        )

        return CustomResponse(
            data={
                "id": his.id,
                "created_date": his.created_date,
                "register_name": his.register_name,
                "stock": pro.stock,
            },
            message="생성에 성공하였습니다.",
            status=status.HTTP_201_CREATED,
        )

    def put(self, req):
        historys = req.data["history"]
        trade = req.data["trade"]

        with transaction.atomic():
            for history in historys:
                release = get_object_or_404(His, id=history["id"])
                if history.get("amount"):
                    if history["amount"] != release.amount and trade:
                        his = His.objects.create(
                            name=release.name,
                            amount=history["amount"],
                            tax_category=history["tax_category"],
                            product_id=release.product_id,
                            trade_id=trade,
                            is_released=True,
                            price=history["price"],
                        )
                        release.amount -= history["amount"]
                        release.save()

                        logger.info(
                            f"{[return_username(req.user).name]}님이  [{release.name}] [{release.amount+his.amount}] 중 [{his.amount}]개를 [{trade}] 출고품으로 등록하였습니다."
                        )
                    else:
                        pro = get_object_or_404(Pro, id=release.product_id)
                        pro.add_stock(release.amount - history["amount"])
                        if trade:
                            logger.info(
                                f"{[return_username(req.user).name]}님이 출고품 [{release.name}]을 [{trade}]로 출고하였습니다."
                            )
                        else:
                            logger.info(
                                f"{[return_username(req.user).name]}님이 출고품 [{release.name}]을 [{release.amount}]에서 [{history['amount']}]로 수정하였습니다."
                            )
                        for key in history:
                            setattr(release, key, history[key])
                        release.save()
                    # Release DB Log
                    release_log = ReleaseLog.objects.create(
                        release_log_category=1,
                        name=release.name,
                        product_category=release.product.category,
                        amount=history["amount"],
                        memo=release.memo,
                        register_name=return_username(req.user).name,
                        release_register_name=release.register_name,
                        release_created_date=release.created_date,
                    )
                    release_log.save()

        return ReturnAccept()


class ReleaseDetailView(APIView):
    def get(self, req, release_id):
        release = get_object_or_404(His, id=release_id)
        release_data = HistorySerializer(release).data

        return ReturnData(data=release_data)

    def put(self, req, release_id):
        data = req.data
        release = get_object_or_404(His, id=release_id)
        with transaction.atomic():
            if data["amount"] != release.amount:
                pro = get_object_or_404(Pro, id=release.product_id)
                pro.add_stock(release.amount - data["amount"])
                logger.info(
                    f"{[return_username(req.user).name]}님이 출고품 [{release.name}]의 수량을 [{release.amount}]에서 [{data['amount']}]로 수정하였습니다."
                )
                setattr(release, "amount", data["amount"])
            if data["memo"] != release.memo:
                logger.info(
                    f"{[return_username(req.user).name]}님이 출고품 [{release.name}]의 메모를 [{release.memo}]에서 [{data['memo']}]로 수정하였습니다."
                )
                setattr(release, "memo", data["memo"])

            release.save()

        return ReturnAccept()

    def delete(self, req, release_id):
        release = get_object_or_404(His, id=release_id)
        release.product.add_stock(release.amount)

        # ⭐ 삭제 전에 로그 저장
        ReleaseLog.objects.create(
            release_log_category=4,  # 삭제
            name=release.name,
            product_category=release.product.category,
            amount=release.amount,
            memo=release.memo,
            register_name=return_username(req.user).name,
            release_register_name=release.register_name,
            release_created_date=release.created_date,
        )

        delete_release_name = copy.deepcopy(release.name)
        release.delete()

        logger.info(
            f"{[return_username(req.user).name]}님이 출고품 [{delete_release_name}]을 삭제하였습니다."
        )
        return ReturnDelete()


class ReleaseLogView(APIView):
    """
    출고기록 조회 API (권한 체크 포함)
    """

    def get(self, req):
        try:
            # 현재 사용자의 부서 가져오기
            engineer = Eng.objects.get(user=req.user)
            department = engineer.category

            # 해당 부서의 권한 확인
            try:
                permission = ReleaseLogPermission.objects.get(department=department)
            except ReleaseLogPermission.DoesNotExist:
                # 권한 설정이 없으면 권한 없음
                return CustomResponse(
                    message="열람 권한이 없습니다.",
                    status=status.HTTP_403_FORBIDDEN
                )

            # 권한에 따라 조회할 카테고리 필터링
            allowed_categories = []
            if permission.can_view_register:
                allowed_categories.append(0)  # 등록
            if permission.can_view_sale:
                allowed_categories.append(1)  # 판매
            if permission.can_view_delete:
                allowed_categories.append(4)  # 삭제

            # 권한이 하나도 없으면
            if not allowed_categories:
                return CustomResponse(
                    message="열람 권한이 없습니다.",
                    status=status.HTTP_403_FORBIDDEN
                )

            # 권한에 맞는 로그만 조회 (100개)
            release_log = ReleaseLog.objects.filter(
                release_log_category__in=allowed_categories
            ).order_by("-created_date")[:100]

            release_log_data = ReleaseLogSerializer(release_log, many=True).data

        except Exception as e:
            print(e)
            return ReturnError()

        return ReturnData(data=release_log_data)

class ReleaseLogPermissionView(APIView):

    def get(self, req):
        """
        전체 부서별 권한 조회 (관리자만)
        """
        engineer = Eng.objects.get(user=req.user)
        if engineer.category not in [2, 3]:  # 대표이사, 관리자만
            return CustomResponse(
                message="권한이 없습니다.",
                status=status.HTTP_403_FORBIDDEN
            )

        departments = [
            {"department": 0, "name": "관리"},
            {"department": 1, "name": "지원"},
            {"department": 2, "name": "대표이사"},
            {"department": 3, "name": "관리자"},
            {"department": 4, "name": "연구개발"},
            {"department": 5, "name": "전략기획"},
            {"department": 6, "name": "생산"},
            {"department": 7, "name": "영업"},
        ]

        result = []
        for dept in departments:
            try:
                perm = ReleaseLogPermission.objects.get(department=dept["department"])
                result.append({
                    "id": perm.id,
                    "department": dept["department"],
                    "department_name": dept["name"],
                    "can_view_register": perm.can_view_register,
                    "can_view_sale": perm.can_view_sale,
                    "can_view_delete": perm.can_view_delete,
                    "can_export_customer": perm.can_export_customer,
                    "can_export_trade": perm.can_export_trade,
                    "can_export_product": perm.can_export_product,
                    "can_export_release": perm.can_export_release,
                    "can_export_release_log": perm.can_export_release_log,
                    "can_export_accounting": perm.can_export_accounting,
                    "can_export_receivable": perm.can_export_receivable,

                })
            except ReleaseLogPermission.DoesNotExist:
                result.append({
                    "id": None,
                    "department": dept["department"],
                    "department_name": dept["name"],
                    "can_view_register": False,
                    "can_view_sale": False,
                    "can_view_delete": False,
                    "can_export_customer": False,
                    "can_export_trade": False,
                    "can_export_product": False,
                    "can_export_release": False,
                    "can_export_release_log": False,
                    "can_export_accounting": False,
                    "can_export_receivable": False,
                })

        return ReturnData(data=result)

    def put(self, req):
        """
        부서별 권한 수정 (관리자만)
        """
        engineer = Eng.objects.get(user=req.user)
        if engineer.category not in [2, 3]:
            return CustomResponse(
                message="권한이 없습니다.",
                status=status.HTTP_403_FORBIDDEN
            )

        data = req.data
        department = data.get("department")

        try:
            with transaction.atomic():
                perm, created = ReleaseLogPermission.objects.get_or_create(
                    department=department
                )
                perm.can_view_register = data.get("can_view_register", False)
                perm.can_view_sale = data.get("can_view_sale", False)
                perm.can_view_delete = data.get("can_view_delete", False)
                perm.can_export_customer = data.get("can_export_customer", False)
                perm.can_export_trade = data.get("can_export_trade", False)
                perm.can_export_product = data.get("can_export_product", False)
                perm.can_export_release = data.get("can_export_release", False)
                perm.can_export_release_log = data.get("can_export_release_log", False)
                perm.can_export_accounting = data.get("can_export_accounting", False)
                perm.can_export_receivable = data.get("can_export_receivable", False)
                perm.save()

                logger.info(
                    f"{return_username(req.user).name}님이 부서 [{department}]의 출고로그 권한을 수정하였습니다."
                )
        except Exception as e:
            print(e)
            return ReturnError()

        return ReturnAccept()

class ProductPackageView(APIView):
    """
    제품 패키지 API
    """

    def get(self, req):
        """
        패키지 목록 조회
        """
        packages = ProductPackage.objects.all().order_by("-created_date")
        packages_data = ProductPackageSerializer(packages, many=True).data

        return ReturnData(data=packages_data)

    def post(self, req):
        """
        패키지 생성
        """
        data = req.data
        name = data.get("name")
        memo = data.get("memo", "")
        items = data.get("items", [])

        if not name:
            return CustomResponse(
                message="패키지명을 입력해주세요.", status=status.HTTP_400_BAD_REQUEST
            )

        if len(items) == 0:
            return CustomResponse(
                message="구성품을 1개 이상 추가해주세요.", status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                # 패키지 생성
                package = ProductPackage.objects.create(
                    name=name,
                    memo=memo,
                    register_name=return_username(req.user).name,
                )

                # 구성품 추가
                for item in items:
                    ProductPackageItem.objects.create(
                        package=package,
                        product_id=item["product_id"],
                        amount=item.get("amount", 1),
                    )

                logger.info(
                    f"{return_username(req.user).name}님이 패키지 [{package.name}]을 생성하였습니다."
                )

        except Exception as e:
            print(e)
            return ReturnError()

        return CustomResponse(
            data={"id": package.id},
            message="패키지가 생성되었습니다.",
            status=status.HTTP_201_CREATED,
        )


class ProductPackageDetailView(APIView):
    """
    패키지 상세 API
    """

    def get(self, req, package_id):
        """
        패키지 상세 조회
        """
        package = get_object_or_404(ProductPackage, id=package_id)
        package_data = ProductPackageSerializer(package).data

        return ReturnData(data=package_data)

    def put(self, req, package_id):
        """
        패키지 수정
        """
        data = req.data
        package = get_object_or_404(ProductPackage, id=package_id)

        try:
            with transaction.atomic():
                # 패키지 정보 수정
                package.name = data.get("name", package.name)
                package.memo = data.get("memo", package.memo)
                package.save()

                # 기존 구성품 삭제 후 새로 추가
                items = data.get("items", None)
                if items is not None:
                    package.items.all().delete()
                    for item in items:
                        ProductPackageItem.objects.create(
                            package=package,
                            product_id=item["product_id"],
                            amount=item.get("amount", 1),
                        )

                logger.info(
                    f"{return_username(req.user).name}님이 패키지 [{package.name}]을 수정하였습니다."
                )

        except Exception as e:
            print(e)
            return ReturnError()

        return ReturnAccept()

    def delete(self, req, package_id):
        """
        패키지 삭제
        """
        package = get_object_or_404(ProductPackage, id=package_id)
        delete_package_name = copy.deepcopy(package.name)
        package.delete()

        logger.info(
            f"{return_username(req.user).name}님이 패키지 [{delete_package_name}]을 삭제하였습니다."
        )

        return ReturnDelete()


class ReleasePackageView(APIView):
    """
    패키지로 출고 등록 API
    """

    def post(self, req):
        """
        패키지 구성품 한번에 출고 등록
        """
        data = req.data
        package_id = data.get("package_id")

        if not package_id:
            return CustomResponse(
                message="패키지를 선택해주세요.", status=status.HTTP_400_BAD_REQUEST
            )

        package = get_object_or_404(ProductPackage, id=package_id)
        items = package.items.all()

        if items.count() == 0:
            return CustomResponse(
                message="패키지에 구성품이 없습니다.", status=status.HTTP_400_BAD_REQUEST
            )

        created_releases = []

        try:
            with transaction.atomic():
                for item in items:
                    pro = item.product
                    amount = item.amount

                    # 출고 등록
                    his = His.objects.create(
                        name=pro.name,
                        product_id=pro.id,
                        amount=amount,
                        tax_category=0,
                        register_name=return_username(req.user).name,
                        is_released=True,
                        memo=f"[{package.name}] 패키지",
                    )
                    pro.minus_stock(amount)

                    # 출고 로그
                    ReleaseLog.objects.create(
                        release_log_category=0,
                        name=his.name,
                        product_category=pro.category,
                        amount=his.amount,
                        memo=his.memo,
                        register_name=return_username(req.user).name,
                        release_register_name=return_username(req.user).name,
                        release_created_date=his.created_date,
                    )

                    created_releases.append({
                        "id": his.id,
                        "name": his.name,
                        "amount": his.amount,
                        "created_date": his.created_date,
                        "register_name": his.register_name,
                        "stock": pro.stock,
                        "product_category": pro.category,
                    })

                logger.info(
                    f"{return_username(req.user).name}님이 패키지 [{package.name}]을 출고 등록하였습니다. ({items.count()}개 제품)"
                )

        except Exception as e:
            print(e)
            return ReturnError()

        return CustomResponse(
            data={"releases": created_releases, "package_name": package.name},
            message=f"[{package.name}] 패키지가 출고 등록되었습니다. ({len(created_releases)}개 제품)",
            status=status.HTTP_201_CREATED,
        )


class RecordView(APIView):
    """
        전자문서 설명
    """

    def get(self, req):
        """
            전자문서 조회하는 API
            임시저장인 경우 본인만 확인 가능
            제출완료를 했을 경우 본인과 관리자만 확인 가능
        """
        category = (
            int(req.GET.get("category", None))
            if req.GET.get("category", None)
            else None
        )
        engineer = Eng.objects.get(user=req.user)
        is_accept = req.GET.get("accept", None)
        is_all = req.GET.get("all", None)
        if req.user.is_superuser:
            record = Record.objects.filter(Q(is_submit=True) | Q(user=req.user))
        elif engineer.is_staff:
            engineers = Eng.objects.filter(category=engineer.category)
            cnt = 0
            for i in engineers:
                if cnt:
                    record |= Record.objects.filter(Q(user=i.user))
                else:
                    record = Record.objects.filter(Q(user=i.user))
                    cnt = 1
            record = record.filter(Q(is_submit=True) | Q(user=req.user))
        else:
            record = Record.objects.filter(user=req.user)

        record = record.order_by("-created_date")

        if category is not None:
            category_index = ["업무일지", "휴가신청"]
            record = record.filter(category=category_index[category])
        if is_all is None:
            if is_accept:
                record = record.filter(Q(is_approved=True) | Q(is_reject=True))
                result = custom_paginator(req, record, "-created_date")
                result["results"] = RecordSerializer(result["results"], many=True).data
                return ReturnData(data=result)
            else:
                record = record.filter(Q(is_approved=False) & Q(is_reject=False))

        record_data = RecordSerializer(record, many=True).data

        # logger.info(f"{return_username(req.user).name} 이 전자문서 전체를 조회하였습니다.")

        return ReturnGood(data=record_data)

    def post(self, req):
        """
            전자문서 생성 API
            ---
                # 내용
                - category - CharField ((0, 업무일지), (1, 휴가신청))
                - content - TextField 내용
                - is_submit - BooleanField 제출상태 확인
                - is_approved - BooleandField 승인여부 확인
                - is_reject - BooleanField 반려여부 확인
                - reject_contnet - Text 반려사유 확인
                - date - DateField 제출 날짜
                - start_date - DateTimeField 휴가신청 시 사용
                - end_date - DateTimeField 휴가신청 시 사용
        """
        data = req.data
        category_index = ["업무일지", "휴가신청"]

        with transaction.atomic():
            record = Record.objects.create(
                user=req.user, category=category_index[int(req.data["category"])]
            )
            for key in data:
                if key not in [
                    "is_submit",
                    "is_approved",
                    "is_reject",
                    "reject_content",
                    "category",
                ]:
                    setattr(record, key, data[key])
            if data.get("is_submit"):
                record.is_submit = True if data["is_submit"] else False
            record.save()
            logger.info(
                f"{return_username(req.user).name} 이 [{record.id}] : [{record.category}] 전자문서를 생성하였습니다."
            )

        return ReturnCreate()


class RecordDetailView(APIView):
    """
        전자문서 상세 페이지
    """

    def get(self, req, record_id):
        """
            GET
            ---
                #설명
                url 형식 record/{record_id}
                제출완료시에만 관리자급에게 보임
        """
        record = get_object_or_404(Record, id=record_id)
        engineer = Eng.objects.get(user=req.user)
        if record.is_submit:
            if not req.user.is_superuser:
                if record.user != req.user and not engineer.is_staff:
                    return CustomResponse(
                        message="권한이 없습니다.", status=status.HTTP_403_FORBIDDEN
                    )
            # if record.user != req.user and not req.user.is_superuser:
            #     return CustomResponse(
            #         message="권한이 없습니다.", status=status.HTTP_403_FORBIDDEN
            #     )
        else:
            if record.user != req.user:
                return CustomResponse(
                    message="권한이 없습니다.", status=status.HTTP_403_FORBIDDEN
                )
        record_data = RecordSerializer(record).data
        logger.info(
            f"{return_username(req.user).name} 이 [{record.id}] : [{record.category}] 전자문서를 조회하였습니다."
        )
        return ReturnData(data=record_data)

    def put(self, req, record_id):
        """
            url 형식 record/{record_id}?submit=(0,1)&reject=(0,1)&approve=(0,1)
            0일 경우 False, 1일 경우 True
            임시 저장의 경우 approve와 reject가 적용되어지지 않음
            휴가신청의 경우 Vacation 을 자동으로 생성
        """
        submit = req.GET.get("submit", None)
        reject = req.GET.get("reject", None)
        approve = req.GET.get("approve", None)
        data = req.data
        with transaction.atomic():
            record = get_object_or_404(Record, id=record_id)
            if record.user == req.user:
                for key in data:
                    if key not in [
                        "is_submit",
                        "is_approved",
                        "is_reject",
                        "reject_content",
                        "user",
                    ]:
                        setattr(record, key, data[key])

            record.is_submit = True if submit or record.is_submit else False

            if req.user.is_superuser and record.is_submit:
                record.is_approved = True if approve or record.is_approved else False
                record.is_reject = True if reject or record.is_reject else False

            record.reject_content = (
                data["reject_content"] if data.get("reject_content") else ""
            )

            record.save()

            # if record.is_approved and record.category == "휴가신청":
            #     Vacation.objects.create(
            #         start_date=record.start_date,
            #         end_date=record.end_date,
            #         record=record,
            #     )
            if record.is_approved:
                logger.info(
                    f"{return_username(req.user).name} 이 [{record.id}] : [{record.category}] 전자문서를 승인하였습니다."
                )
            elif record.is_reject:
                logger.info(
                    f"{return_username(req.user).name} 이 [{record.id}] : [{record.category}] 전자문서를 반려하였습니다."
                )
            else:
                logger.info(
                    f"{return_username(req.user).name} 이 [{record.id}] : [{record.category}] 전자문서를 수정하였습니다."
                )
        return ReturnAccept()

    def delete(self, req, record_id):
        with transaction.atomic():
            record = get_object_or_404(Record, id=record_id)
            if record.user == req.user:
                # if record.category == "휴가신청":
                #     vacation = get_object_or_404(Vacation, record=record)
                #     vacation.delete()
                delete_record_id = copy.deepcopy(record.id)
                delete_record_category = copy.deepcopy(record.category)
                record.delete()
                logger.info(
                    f"{return_username(req.user).name} 이 [{delete_record_id}] : [{delete_record_category}] 전자문서를 삭제하였습니다."
                )
                return CustomResponse(
                    message="삭제에 성공하였습니다.", status=status.HTTP_202_ACCEPTED
                )
            else:
                return CustomResponse(
                    message="권한이 없습니다.", status=status.HTTP_403_FORBIDDEN
                )
        return ReturnError()


class AttendanceView(APIView):
    """
        출근기록 관련 API
    """

    def get(self, req):
        """
            전체 출근부 조회
            관리자의 경우 전체 직원 조회 가능
            아닐시 본인 것만 조회 가능
        """
        if req.user.is_superuser:
            attendance = Attendance.objects.all()
        else:
            attendance = Attendance.objects.filter(user=req.user)
        attendance_data = AttendanceSerializer(attendance, many=True).data
        logger.info(f"{return_username(req.user).name} 이 출근부를 조회하였습니다.")
        return ReturnData(data=attendance_data)

    def post(self, req):
        """
            출퇴근 조회 API
            매일 9시부터 18시까지 1시간마다 biostar_tna DB에서 조회 후 Attendance Table에 생성
            강제 조회
        """
        tna = interval_tna()
        # """
        #     url로 post만 보내면
        #     자동으로 생성
        #     당일에 2개 이상의 출근은 막혀있음
        # """
        # try:
        #     now = datetime.datetime.now().strftime("%Y-%m-%d")
        #     if (
        #         Attendance.objects.filter(user=req.user)
        #         .filter(date__icontains=now)
        #         .count()
        #         > 0
        #     ):
        #         return CustomResponse(
        #             message="이미 해당하는 데이터가 존재합니다.", status=status.HTTP_400_BAD_REQUEST
        #         )
        #     else:
        #         print(req.user)
        #         attendance = Attendance.objects.create(user=req.user, date=now)
        #         logger.info(
        #             f"{return_username(req.user).name} 이 [{attendance.id}] [{attendance.date}]  출근부를 생성하였습니다."
        #         )

        #     return ReturnAccept()
        # except Exception as e:
        #     print(e)
        #     return ReturnError()
        return tna


class VacationView(APIView):
    # 휴가 신청의 경우 Record View 에서 Record 카테고리가 휴가신청으로 제출 및 승인이 완료시 자동으로 생성
    """
        관리자는 전체 직원의 휴가 조회가능
        직원의 경우 본인 것만 조회
    """

    def get(self, req):
        approve = req.GET.get("approve", None)
        if req.user.is_superuser:
            vacation = Vacation.objects.all()
        else:
            vacation = Vacation.objects.filter(record__user=req.user)

        if approve:
            vacation = vacation.filter(is_approved=True)

        vacation_data = VacationSerializer(vacation, many=True).data

        return ReturnData(data=vacation_data)


class VacationDetailView(APIView):
    """
        상세 휴가 관련 API
    """

    def get(self, req, vacation_id):
        """
            url 형식 vacation/{vacation_id}
            상세 조회
        """
        try:
            vacation = Vacation.objects.get(id=vacation_id)
        except:
            return ReturnNoContent()

        if vacation.record.user == req.user or req.user.is_superuser:
            vacation_data = VacationSerializer(vacation).data
            return ReturnData(data=vacation_data)

        return CustomResponse(message="권한이 없습니다.", status=status.HTTP_403_FORBIDDEN)

    def delete(self, req, vacation_id):
        """
            삭제는 본인만 삭제가 가능함
            삭제시 레코드의 is_reject가 True 로 변경 및 삭제 사유에 시간과 휴가신청을 취소했다로 수정이 되어짐
        """
        now = datetime.datetime.now().strftime("%Y-%m-%d")
        vacation = get_object_or_404(Vacation, id=vacation_id)
        with transaction.atomic():
            if req.user == vacation.record.user:
                vacation.record.is_reject = True
                vacation.record.reject_content += f"{now} 해당 직원이 휴가신청을 취소하였습니다."
                vacation.record.save()
                delete_vacation_id = copy.deepcopy(vacation.id)
                delete_vacation_start_date = copy.deepcopy(vacation.start_date)
                delete_vacation_end_date = copy.deepcopy(vacation.end_date)
                vacation.delete()
                return ReturnDelete()
        logger.info(
            f"{return_username(req.user).name} 이 [{delete_vacation_id}] : [{delete_vacation_start_date} - {delete_vacation_end_date}] 휴가를 취소하였습니다."
        )

        return CustomResponse(message="권한이 없습니다.", status=status.HTTP_403_FORBIDDEN)


class ExcelView(APIView):
    """
        거래명서세 출력 API
    """

    def post(self, req):
        """
            거래명세서 생성 API
        """
        data = req.data
        try:
            tra = Tra.objects.get(id=data["trade_id"])
            his = His.objects.filter(trade_id=data["trade_id"])
        except:
            return ReturnNoContent()

        tra_serializer = TradeSerializer(tra)
        his_serializer = HistorySerializer(his, many=True)
        return_Excel = ExcelExport().get(
            {"tra": tra_serializer.data, "his": his_serializer.data}, req
        )

        return return_Excel


class AccountingCalcView(APIView):
    """
        손익계산 API
        YYYY-MM 형식으로 날짜를 받아서 손익 계산
        2020-10월 부터 계산이 가능함.
    """

    def get(self, req):
        try:
            start_date = req.query_params["start_date"]
            end_date = req.query_params["end_date"]
            limit_date = datetime.date(2020, 10, 1)
            check_date = datetime.date(int(start_date[0:4]), int(start_date[5:7]), 1)

            if limit_date > check_date:
                return Response(
                    data={"message": "해당하는 데이터가 존재하지 않습니다."},
                    status=status.HTTP_204_NO_CONTENT,
                )

            search_tes = Tra.objects.filter(
                Q(register_date__gte=start_date) & Q(register_date__lte=end_date)
            ).filter(Q(category_1__in=[1, 2, 5, 6]))

            month_income = 0
            month_outcome = 0
            month_amount = 0

            if limit_date == check_date:
                for i in search_tes:
                    if i.content != "10월 1일 이전 미수금 데이터":
                        if i.category_1 in [1, 5]:
                            month_income += i.calculate_money()
                        else:
                            month_outcome += i.calculate_money()
            else:
                for i in search_tes:
                    if i.category_1 in [1, 5]:
                        month_income += i.calculate_money()
                    else:
                        month_outcome += i.calculate_money()

            month_amount = month_income + month_outcome

            return ReturnData(
                data={
                    "month_income": month_income,
                    "month_outcome": month_outcome,
                    "month_amount": month_amount,
                }
            )
        except:
            return Response(
                data={"message": "해당하는 데이터가 존재하지 않습니다."},
                status=status.HTTP_204_NO_CONTENT,
            )


class ExportDataToExcelView(APIView):
    """
    데이터를 Excel로 내보내기 (권한 체크 + 기간 필터)
    """

    def post(self, req):
        data = req.data

        if not data.get("type"):
            return ReturnNoContent()

        export_type = data["type"]

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # 권한 체크
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        try:
            engineer = Eng.objects.get(user=req.user)
            department = engineer.category

            if department not in [2, 3]:  # 대표이사, 관리자 제외
                try:
                    perm = ReleaseLogPermission.objects.get(department=department)

                    permission_map = {
                        "customer": perm.can_export_customer,
                        "trade": perm.can_export_trade,
                        "product": perm.can_export_product,
                        "release": perm.can_export_release,
                        "release_log": perm.can_export_release_log,
                        "accounting": perm.can_export_accounting,
                        "receivable": perm.can_export_receivable,
                        "receivable_minus": perm.can_export_receivable,
                    }

                    if not permission_map.get(export_type, False):
                        return CustomResponse(
                            message="엑셀 다운로드 권한이 없습니다.",
                            status=status.HTTP_403_FORBIDDEN
                        )
                except ReleaseLogPermission.DoesNotExist:
                    return CustomResponse(
                        message="엑셀 다운로드 권한이 없습니다.",
                        status=status.HTTP_403_FORBIDDEN
                    )
        except Eng.DoesNotExist:
            return CustomResponse(
                message="사용자 정보를 찾을 수 없습니다.",
                status=status.HTTP_403_FORBIDDEN
            )

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # 날짜 필터
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        start_date = None
        end_date = None
        if data.get("date"):
            start_date = data["date"].get("start_date")
            end_date = data["date"].get("end_date")

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # 타입별 데이터 조회
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        col_headers, col_names = [], []
        type_datas = None
        sheet_name, file_name = "", ""

        # ━━━ 고객 ━━━
        if export_type == "customer":
            try:
                queryset = Cus.objects.all()
                if start_date:
                    queryset = queryset.filter(created_date__gte=start_date)
                if end_date:
                    queryset = queryset.filter(created_date__lte=end_date + " 23:59:59")
                queryset = queryset.order_by("name")
            except Exception as e:
                print(e)
                return ReturnNoContent()

            type_datas = CustomerSerializer(queryset, many=True).data
            file_name = f"customers_{start_date or 'all'}_{end_date or 'all'}.xlsx" if start_date or end_date else "customers.xlsx"
            sheet_name = "customers"
            col_headers = ["고객명", "등록일", "Phone", "Tel", "주소", "우편번호", "Fax", "Email", "고객분류", "가격분류", "메모", "등록자ID", "총미수금"]
            col_names = ["name", "created_date", "phone", "tel", "address", "post_number", "fax_number", "email", "customer_grade", "price_grade", "memo", "register_id", "receivable"]

        # ━━━ 제품 ━━━
        elif export_type == "product":
            try:
                queryset = Pro.objects.all()
                if start_date:
                    queryset = queryset.filter(created_date__gte=start_date)
                if end_date:
                    queryset = queryset.filter(created_date__lte=end_date + " 23:59:59")
                queryset = queryset.order_by("name")
            except Exception as e:
                print(e)
                return ReturnNoContent()

            type_datas = ProductSerializer(queryset, many=True).data
            file_name = f"products_{start_date or 'all'}_{end_date or 'all'}.xlsx" if start_date or end_date else "products.xlsx"
            sheet_name = "products"
            col_headers = ["제품명", "제품분류", "제조사", "보관장소", "주매입처", "코드", "재고", "매입금액", "매출금액", "소비자금액", "메모"]
            col_names = ["name", "category", "supplier", "container", "purchase", "code", "stock", "in_price", "out_price", "sale_price", "memo"]

        # ━━━ 거래내역 ━━━
        elif export_type == "trade":
            try:
                if data.get("customer_id"):
                    queryset = Tra.objects.filter(customer_id=data["customer_id"])
                else:
                    queryset = Tra.objects.all()
                if start_date:
                    queryset = queryset.filter(register_date__gte=start_date)
                if end_date:
                    queryset = queryset.filter(register_date__lte=end_date + " 23:59:59")
                queryset = queryset.order_by("-register_date")
            except Exception as e:
                print(e)
                return ReturnNoContent()

            type_datas = TradeSerializer(queryset, many=True).data
            file_name = f"trades_{start_date or 'all'}_{end_date or 'all'}.xlsx" if start_date or end_date else "trades.xlsx"
            sheet_name = "trades"
            col_headers = ["등록일", "고객명", "구분1", "AS상태", "출장/내방", "내용", "고장증상", "완료내역", "메모", "방문일", "완료일", "담당자", "공급가액", "부가세", "현금", "카드", "은행"]
            col_names = ["register_date", "customer_name", "category_name1", "category_name2", "category_name3", "content", "symptom", "completed_content", "memo", "visit_date", "complete_date", "engineer_name", "supply_price", "tax_price", "cash", "credit", "bank"]

        # ━━━ 출고내역 ━━━
        elif export_type == "release":
            try:
                from django.db.models import Q
                queryset = His.objects.filter(Q(trade=None) & Q(is_released=True))
                if start_date:
                    queryset = queryset.filter(created_date__gte=start_date)
                if end_date:
                    queryset = queryset.filter(created_date__lte=end_date + " 23:59:59")
                queryset = queryset.order_by("-created_date")
            except Exception as e:
                print(e)
                return ReturnNoContent()

            type_datas = HistorySerializer(queryset, many=True).data
            file_name = f"release_{start_date or 'all'}_{end_date or 'all'}.xlsx" if start_date or end_date else "release.xlsx"
            sheet_name = "release"
            col_headers = ["제품명", "제품분류", "수량", "메모", "등록자", "등록일"]
            col_names = ["name", "product_category", "amount", "memo", "register_name", "created_date"]

        # ━━━ 출고로그 ━━━
        elif export_type == "release_log":
            try:
                queryset = ReleaseLog.objects.all()
                if start_date:
                    queryset = queryset.filter(created_date__gte=start_date)
                if end_date:
                    queryset = queryset.filter(created_date__lte=end_date + " 23:59:59")
                queryset = queryset.order_by("-created_date")
            except Exception as e:
                print(e)
                return ReturnNoContent()

            type_datas = ReleaseLogSerializer(queryset, many=True).data
            file_name = f"release_log_{start_date or 'all'}_{end_date or 'all'}.xlsx" if start_date or end_date else "release_log.xlsx"
            sheet_name = "release_log"
            col_headers = ["구분", "제품명", "제품분류", "수량", "메모", "등록자", "원등록자", "원등록일", "로그생성일"]
            col_names = ["release_log_category_name", "name", "product_category", "amount", "memo", "register_name", "release_register_name", "release_created_date", "created_date"]

        # ━━━ 회계 ━━━
        elif export_type == "accounting":
            try:
                queryset = Tra.objects.filter(category_1__in=[5, 6])  # 수입, 지출
                if start_date:
                    queryset = queryset.filter(register_date__gte=start_date)
                if end_date:
                    queryset = queryset.filter(register_date__lte=end_date + " 23:59:59")
                queryset = queryset.order_by("-register_date")
            except Exception as e:
                print(e)
                return ReturnNoContent()

            type_datas = TradeSerializer(queryset, many=True).data
            file_name = f"accounting_{start_date or 'all'}_{end_date or 'all'}.xlsx" if start_date or end_date else "accounting.xlsx"
            sheet_name = "accounting"
            col_headers = ["등록일", "구분", "내용", "공급가액", "부가세", "현금", "카드", "은행", "메모", "등록자"]
            col_names = ["register_date", "category_name1", "content", "supply_price", "tax_price", "cash", "credit", "bank", "memo", "register_id"]

        # ━━━ 미수금현황 ━━━
        elif export_type == "receivable":
            try:
                queryset = Cus.objects.filter(receivable__gt=0).order_by("-receivable")
            except Exception as e:
                print(e)
                return ReturnNoContent()

            type_datas = CustomerSerializer(queryset, many=True).data
            file_name = "receivable_plus.xlsx"
            sheet_name = "receivable"
            col_headers = ["고객명", "Phone", "Tel", "주소", "미수금"]
            col_names = ["name", "phone", "tel", "address", "receivable"]

        # ━━━ 지불금현황 ━━━
        elif export_type == "receivable_minus":
            try:
                queryset = Cus.objects.filter(receivable__lt=0).order_by("receivable")
            except Exception as e:
                print(e)
                return ReturnNoContent()

            type_datas = CustomerSerializer(queryset, many=True).data
            file_name = "receivable_minus.xlsx"
            sheet_name = "receivable"
            col_headers = ["고객명", "Phone", "Tel", "주소", "지불금"]
            col_names = ["name", "phone", "tel", "address", "receivable"]

        else:
            return ReturnNoContent()

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # 엑셀 파일 생성
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if type_datas is None:
            return ReturnNoContent()

        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet(sheet_name)

        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#D9E1F2',
            'border': 1,
            'align': 'center',
            'valign': 'vcenter',
        })
        cell_format = workbook.add_format({
            'border': 1,
            'align': 'left',
            'valign': 'vcenter',
        })

        for col, header in enumerate(col_headers):
            worksheet.write(0, col, header, header_format)
            worksheet.set_column(col, col, 15)

        for row, item in enumerate(type_datas, start=1):
            for col, col_name in enumerate(col_names):
                value = item.get(col_name, "")
                if value is None:
                    value = ""
                if "date" in col_name and value:
                    value = str(value)[:10] if len(str(value)) >= 10 else str(value)
                worksheet.write(row, col, value, cell_format)

        workbook.close()
        output.seek(0)

        response = HttpResponse(
            output,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = f"attachment; filename*=UTF-8''{quote(file_name)}"
        response["Access-Control-Expose-Headers"] = "Content-Disposition"

        logger.info(
            f"{return_username(req.user).name}님이 {export_type} 엑셀 다운로드 "
            f"(기간: {start_date or '전체'} ~ {end_date or '전체'}, 건수: {len(type_datas)})"
        )

        return response

class PendingStockView(APIView):
    """입고대기 목록 조회 및 생성"""

    def get(self, req):
        """입고대기 목록 조회 (기본: 대기 상태만)"""
        status_filter = req.GET.get("status", "0")  # 기본값: 입고대기(0)

        if status_filter == "all":
            pending = PendingStock.objects.all().order_by("-created_date")
        else:
            pending = PendingStock.objects.filter(
                status=int(status_filter)
            ).order_by("-created_date")

        result = custom_paginator(req, pending, "-created_date")
        result["results"] = PendingStockSerializer(result["results"], many=True).data

        return ReturnData(data=result)

    def post(self, req):
        """입고대기 생성 (제품구매 시 호출)"""
        data = req.data

        require_data = ["product_id", "amount"]
        miss = FindMissingData(require_data, data)

        if miss["is_miss"]:
            return CustomResponse(miss["message"], status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                pro = get_object_or_404(Pro, id=data["product_id"])

                pending = PendingStock.objects.create(
                    product=pro,
                    product_name=pro.name,
                    product_category=pro.category,
                    amount=data["amount"],
                    price=data.get("price", pro.in_price),
                    supplier_name=data.get("supplier_name", ""),
                    register_name=return_username(req.user).name,
                    memo=data.get("memo", ""),
                )

                # trade_id가 있으면 연결
                if data.get("trade_id"):
                    pending.trade_id = data["trade_id"]
                    pending.save()

                # history_id가 있으면 연결
                if data.get("history_id"):
                    pending.history_id = data["history_id"]
                    pending.save()

                logger.info(
                    f"{return_username(req.user).name}님이 [{pro.name}] {data['amount']}개를 입고대기로 등록하였습니다."
                )

                return CustomResponse(
                    data=PendingStockSerializer(pending).data,
                    message="입고대기 등록 성공",
                    status=status.HTTP_201_CREATED,
                )
        except Exception as e:
            print(e)
            return ReturnError()


class PendingStockDetailView(APIView):
    """입고대기 상세 조회, 수정, 삭제"""

    def get(self, req, pending_id):
        """입고대기 상세 조회"""
        pending = get_object_or_404(PendingStock, id=pending_id)
        return ReturnData(data=PendingStockSerializer(pending).data)

    def put(self, req, pending_id):
        """입고대기 수정 (수량, 메모 등)"""
        pending = get_object_or_404(PendingStock, id=pending_id)
        data = req.data

        if pending.status != 0:  # 대기 상태가 아니면 수정 불가
            return CustomResponse(
                message="입고대기 상태에서만 수정 가능합니다.",
                status=status.HTTP_400_BAD_REQUEST
            )

        for key in data:
            if hasattr(pending, key) and key not in ["id", "status", "created_date"]:
                setattr(pending, key, data[key])
        pending.save()

        return CustomResponse(
            data=PendingStockSerializer(pending).data,
            message="수정 성공",
            status=status.HTTP_200_OK,
        )

    def delete(self, req, pending_id):
        """입고대기 삭제 (취소 처리)"""
        pending = get_object_or_404(PendingStock, id=pending_id)

        if pending.status != 0:
            return CustomResponse(
                message="입고대기 상태에서만 삭제 가능합니다.",
                status=status.HTTP_400_BAD_REQUEST
            )

        pending.cancel()

        logger.info(
            f"{return_username(req.user).name}님이 입고대기 [{pending.product_name}] {pending.amount}개를 취소하였습니다."
        )

        return ReturnDelete()


class PendingStockConfirmView(APIView):
    """입고 확정 처리"""

    def post(self, req, pending_id):
        """입고 확정 - 재고 증가"""
        pending = get_object_or_404(PendingStock, id=pending_id)

        if pending.status != 0:
            return CustomResponse(
                message="입고대기 상태에서만 입고 확정이 가능합니다.",
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            pending.confirm_stock()

            logger.info(
                f"{return_username(req.user).name}님이 [{pending.product_name}] {pending.amount}개를 입고 확정하였습니다. (재고: {pending.product.stock})"
            )

        return CustomResponse(
            data={
                "id": pending.id,
                "product_name": pending.product_name,
                "amount": pending.amount,
                "new_stock": pending.product.stock,
            },
            message="입고 확정 완료",
            status=status.HTTP_200_OK,
        )


class PendingStockSellView(APIView):
    """바로 판매 처리 (입고 후 즉시 출고)"""

    def post(self, req, pending_id):
        """바로 판매 - 입고 + 즉시 출고"""
        pending = get_object_or_404(PendingStock, id=pending_id)
        data = req.data

        if pending.status != 0:
            return CustomResponse(
                message="입고대기 상태에서만 바로판매가 가능합니다.",
                status=status.HTTP_400_BAD_REQUEST
            )

        if not data.get("trade_id"):
            return CustomResponse(
                message="판매 거래 정보가 필요합니다.",
                status=status.HTTP_400_BAD_REQUEST
            )

        # ★ 판매 수량 (없으면 전체)
        sell_amount = data.get("sell_amount", pending.amount)

        # 수량 체크
        if sell_amount > pending.amount:
            return CustomResponse(
                message=f"입고대기 수량({pending.amount})보다 많이 판매할 수 없습니다.",
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            tra = get_object_or_404(Tra, id=data["trade_id"])

            # History 생성 (판매 기록)
            his = His.objects.create(
                name=pending.product_name,
                amount=sell_amount,  # ★ 판매 수량
                price=data.get("price", pending.price),
                tax_category=data.get("tax_category", 0),
                product_id=pending.product_id,
                trade_id=data["trade_id"],
            )

            # ★ 부분 판매 vs 전체 판매
            if sell_amount < pending.amount:
                # 부분 판매: 남은 수량은 입고대기 유지
                pending.amount = pending.amount - sell_amount
                pending.save()

                logger.info(
                    f"{return_username(req.user).name}님이 [{pending.product_name}] {sell_amount}개를 바로판매 처리하였습니다. (남은 입고대기: {pending.amount}개)"
                )
            else:
                # 전체 판매
                pending.sell_directly()
                pending.history = his
                pending.trade = tra
                pending.save()

                logger.info(
                    f"{return_username(req.user).name}님이 [{pending.product_name}] {sell_amount}개를 바로판매 처리하였습니다. (전체 판매 완료)"
                )

        return CustomResponse(
            data={
                "id": pending.id,
                "product_name": pending.product_name,
                "sold_amount": sell_amount,
                "remaining_amount": pending.amount if pending.status == 0 else 0,
                "trade_id": data["trade_id"],
                "history_id": his.id,
            },
            message="바로판매 완료",
            status=status.HTTP_200_OK,
        )