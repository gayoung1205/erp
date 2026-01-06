from django.conf.urls import url
from .views import (
    CHistoryView,
    CProductView,
    CTradeView,
    CCategoryView,
    CCustomerView,
    TestView,
    CustomerDetailView,
    ProductDetailView,
    CategoryDetailView,
    TradeDetailView,
    HistoryDetailView,
)


urlpatterns = [
    url(r"^history/(?P<history_id>\d+)/$", HistoryDetailView.as_view()),
    url(r"^trade/(?P<trade_id>\d+)/$", TradeDetailView.as_view()),
    url(r"^category/(?P<category_id>\d+)/$", CategoryDetailView.as_view()),
    url(r"^product/(?P<product_id>\d+)/$", ProductDetailView.as_view()),
    url(r"^customer/(?P<customer_id>\d+)/$", CustomerDetailView.as_view()),
    url(r"^histories", CHistoryView.as_view()),
    url(r"^products", CProductView.as_view()),
    url(r"^trades", CTradeView.as_view()),
    url(r"^categories", CCategoryView.as_view()),
    url(r"^customers", CCustomerView.as_view()),
]
