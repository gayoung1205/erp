from django.shortcuts import render
from util.views import (
    ReturnNoContent,
    ReturnGood,
    ReturnCreate,
    ReturnAccept,
    ReturnError,
    ReturnData,
    FindMissingData,
    CustomResponse,
    ccreate_receivable,
    ctotal_price,
    get_category_name1,
    get_category_name2,
    get_category_name3,
)
from model.models import CCustomer, CHistory, CTrade, CCategory, CProduct
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import authentication, permissions
import datetime
from django.db import transaction
from django.forms.models import model_to_dict

# Create your views here.
class TestView(APIView):
    def get(self, req, history_id):
        tra = CHistory.objects.filter(no=history_id)
        data = tra.values()[0]
        return ReturnData(data)

    def put(self, req, history_id):
        data = req.data
        tra = CHistory.objects.get(no=history_id)
        for i in data:
            setattr(tra, i, data[i])
        tra.save()
        return ReturnAccept()

    def delete(self, req, history_id):
        CHistory.objects.get(no=history_id).delete()
        return ReturnAccept()


class HistoryDetailView(APIView):
    def get(self, req, history_id):
        tra = CHistory.objects.filter(no=history_id)
        data = tra.values()[0]
        return ReturnData(data)

    def put(self, req, history_id):
        data = req.data
        tra = CHistory.objects.get(no=history_id)
        for i in data:
            setattr(tra, i, data[i])
        tra.save()
        return ReturnAccept()

    def delete(self, req, history_id):
        CHistory.objects.get(no=history_id).delete()
        return ReturnAccept()


class TradeDetailView(APIView):
    def get(self, req, trade_id):
        tra = CTrade.objects.prefetch_related("histories").filter(no=trade_id)
        result = 0
        for i in tra[0].histories.all():
            result += i.price * i.amount
        data = tra.values()[0]

        data["total_price"] = result
        print(data)
        return ReturnData(data)

    def put(self, req, trade_id):
        data = req.data
        tra = CTrade.objects.get(no=trade_id)
        for i in data:
            setattr(tra, i, data[i])
        tra.save()
        return ReturnAccept()

    def delete(self, req, trade_id):
        CTrade.objects.get(no=trade_id).delete()
        return ReturnAccept()


class CategoryDetailView(APIView):
    def get(self, req, category_id):
        cate = CCategory.objects.filter(id=category_id).values()
        return ReturnData(cate)

    def put(self, req, category_id):
        data = req.data
        cate = CCategory.objects.get(id=category_id)
        for i in data:
            setattr(cate, i, data[i])
        cate.save()
        return ReturnAccept()

    def delete(self, req, category_id):
        CCategory.objects.get(no=category_id).delete()
        return ReturnAccept()


class ProductDetailView(APIView):
    def get(self, req, product_id):
        data = CProduct.objects.filter(no=product_id).values()
        return ReturnData(data)

    def put(self, req, product_id):
        data = req.data
        pro = CProduct.objects.get(no=product_id)
        for i in data:
            setattr(pro, i, data[i])
        pro.save()
        return ReturnAccept()

    def delete(self, req, product_id):
        CProduct.objects.get(no=product_id).delete()
        return ReturnAccept()


class CustomerDetailView(APIView):
    def get(self, req, customer_id):
        data = CCustomer.objects.filter(no=customer_id).values()
        return ReturnData(data)

    def put(self, req, customer_id):
        data = req.data
        cus = CCustomer.objects.get(no=customer_id)
        for i in data:
            setattr(cus, i, data[i])
        cus.save()
        return ReturnAccept()


class CHistoryView(APIView):
    def get(self, req):
        data = CHistory.objects.all().values()
        return ReturnData(data)

    def post(self, req):
        data = req.data
        with transaction.atomic():
            cus = CHistory.objects.create(
                trade_id=data["trade"], product_id=data["product"]
            )
            for i in data:
                if i == "trade" or i == "product":
                    pass
                else:
                    setattr(cus, i, data[i])
            cus.save()
        return ReturnAccept()


class CProductView(APIView):
    def get(self, req):
        CProduct.objects.all().values()
        return ReturnData(CProduct.objects.all().values())

    def post(self, req):
        data = req.data
        with transaction.atomic():
            pro = CProduct.objects.create(
                name=req.data["name"],
                category_id=req.data["category"],
                register=req.user,
            )
            for i in data:
                if i == "name" or i == "category":
                    pass
                else:
                    setattr(pro, i, data[i])
            pro.save()
        return ReturnAccept()


class CCategoryView(APIView):
    def get(self, req):
        CCategory.objects.all().values()
        return ReturnData(CCategory.objects.all().values())

    def post(self, req):
        data = req.data
        with transaction.atomic():
            cate = CCategory.objects.create(
                name=data["name"], category=data["category"]
            )
            cate.save()
        return ReturnAccept()


class CCustomerView(APIView):
    def get(self, req):
        cus = CCustomer.objects.all()
        cus.values()
        return ReturnData(cus.values())

    def post(self, req):
        data = req.data
        with transaction.atomic():
            cus = CCustomer.objects.create(register=req.user, name=req.data["name"])
            for i in req.data:
                if i == "name":
                    pass
                else:
                    setattr(cus, i, req.data[i])

            cus.save()
        return ReturnAccept()


class CTradeView(APIView):
    def get(self, req):
        customer_id = req.GET.get("customer", None)
        if customer_id == None:
            return ReturnNoContent()
        customer = CCustomer.objects.prefetch_related("trades").get(no=customer_id)

        data = []
        data_1 = []
        cus = (
            customer.trades.prefetch_related("histories").order_by("created_date").all()
        )
        value = cus.values()
        for i in cus:
            data.append(ctotal_price(i))
        data_1 = ccreate_receivable(cus, data)
        customer.receivable = data_1[-1]
        customer.save()
        for i in range(len(value)):
            value[i]["total_receivable"] = data_1[i]
            value[i]["total_price"] = data[i]
            value[i]["category_name1"] = get_category_name1(value[i])
            value[i]["category_name2"] = get_category_name2(value[i])
            value[i]["category_name3"] = get_category_name3(value[i])
            value[i]["customer_name"] = customer.name
            value[i]["register_id"] = cus[i].register.username

        return ReturnData(value)

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
        data = req.data

        ctrade = CTrade.objects.create(
            category_1=data["category_1"],
            customer_id=data["customer"],
            engineer_id=data["engineer"],
            register_id=req.user.id,
        )

        for i in data:
            if i == "category_1" or i == "customer" or i == "engineer":
                pass
            else:
                setattr(ctrade, i, req.data[i])
        ctrade.save()
        return ReturnAccept()
