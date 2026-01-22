from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status

# Create your views here.

# Return Method
def ReturnGood(data):
    return Response(data=data, status=status.HTTP_200_OK)


def ReturnData(data=None, message=None):
    if message is None:
        message = "해당하는 데이터를 성공적으로 반환하였습니다."
    return CustomResponse(data=data, message=message, status=status.HTTP_200_OK)


def ReturnNoContent(message=None):
    if message is None:
        message = "해당하는 데이터가 존재하지 않습니다."
    return CustomResponse(message=message, status=status.HTTP_204_NO_CONTENT)


def ReturnCreate(message=None):
    if message is None:
        message = "데이터를 성공적으로 생성하였습니다."
    return CustomResponse(message=message, status=status.HTTP_201_CREATED)


def ReturnAccept(message=None):
    if message is None:
        message = "데이터를 성공적으로 수정하였습니다."
    return CustomResponse(message=message, status=status.HTTP_202_ACCEPTED)


def ReturnError(message=None):
    if message is None:
        message = "예기치 못한 상황으로 인하여 오류가 발생하였습니다."
    return CustomResponse(message=message, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def ReturnDelete(message=None):
    if message is None:
        message = "데이터를 성공적으로 삭제하였습니다."
    return CustomResponse(message=message, status=status.HTTP_202_ACCEPTED)
    
def CustomResponse(message, data=None, status=status.HTTP_200_OK):
    return Response(data={"message": message, "data": data}, status=status)


def FindMissingData(require_data, compare_data):
    missing_data = ""
    if type(require_data) != list or type(compare_data) != dict:
        return {"is_miss": False, "message": f"{compare_data} 데이터 형식이 올바르지 않습니다."}

    for i in require_data:
        if i in compare_data.keys():
            pass
        else:
            missing_data += i + ", "

    if missing_data != "":
        missing_data = missing_data[:-2] + "가 없습니다."
        return {"is_miss": True, "message": missing_data}

    return {"is_miss": False, "message": ""}


# Model Method
def get_category_name1(obj):
    category = ["AS", "수금", "지불", "판매", "구매", "수입", "지출", "납품", "메모"]
    return category[obj["category_1"]]


def get_category_name2(obj):
    if obj["category_2"] == None:
        return " "
    category = ["접수", "완료", "진행", "취소"]
    return category[obj["category_2"]]


def get_category_name3(obj):
    if obj["category_3"] == None:
        return " "
    category = ["출장", "내방"]
    return category[obj["category_3"]]


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


def ccreate_receivable(tra, array):
    result = 0
    result_a = []
    j = 0
    for i in tra:
        flags = 1
        if i.category_1 == 4 or i.category_1 == 1:
            flags *= -1
        if i.category_1 in [5, 6]:
            pass
        else:
            result += array[j] * flags
            result_a.append(result)
        j += 1
    return result_a
