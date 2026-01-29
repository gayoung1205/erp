from django.contrib import admin
from .models import (
    Customer,
    Product,
    Trade,
    Category,
    History,
    Calendar,
    Engineer,
    CTrade,
    CCustomer,
    CHistory,
    CProduct,
    CCategory,
    Record,
    Vacation,
    Attendance,
    ReleaseLog,
    ReleaseLogPermission,
    ProductPackage,
    ProductPackageItem,
    PendingStock,
    AsInternalProcess,
)


def make_tax(modeladmin, request, queryset):
    queryset.update(tax_category=1)


make_tax.short_description = "make tax"


class CustomerAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "created_date"]
    search_fields = ["name"]


class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "name",
        "category",
        "stock",
        "in_price",
        "code",
    ]
    search_fields = ["name"]


class TradeAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "category_1",
        "category_2",
        "category_3",
        "engineer",
        "customer_name",
        "customer",
        "bank",
        "credit",
        "cash",
    ]
    search_fields = ["customer_name"]


class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "category"]


class HistoryAdmin(admin.ModelAdmin):
    list_display = [
        "created_date",
        "id",
        "name",
        "amount",
        "price",
        "trade",
        "is_released",
        "register_name",
        "memo",
    ]
    search_fields = ["name"]
    actions = [make_tax]


class CalendarAdmin(admin.ModelAdmin):
    list_display = [
        "calendarId",
        "id",
        "engineer",
        "start",
        "end",
        "title",
    ]
    search_fields = ["calendar_name"]


class AttendanceAdmin(admin.ModelAdmin):
    list_display = ["id", "date", "user"]


class EngineerAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "join_date", "category"]


class RecordAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "category",
        "content",
        "remark",
        "plan",
        "start_date",
        "end_date",
        "date",
    ]


class ReleaseLogAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "release_log_category",
        "name",
        "product_category",
        "amount",
        "register_name",
        "memo",
        "created_date",
    ]
    search_fields = ["name"]

class ReleaseLogPermissionAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "department",
        "can_view_register",
        "can_view_sale",
        "can_view_delete",
    ]

class ProductPackageItemInline(admin.TabularInline):
    model = ProductPackageItem
    extra = 1


class ProductPackageAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "memo", "register_name", "created_date"]
    search_fields = ["name"]
    inlines = [ProductPackageItemInline]

class PendingStockAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "product_name",
        "product_category",
        "amount",
        "price",
        "status",
        "supplier_name",
        "register_name",
        "created_date",
        "confirmed_date",
    ]
    search_fields = ["product_name", "supplier_name"]
    list_filter = ["status"]

class AsInternalProcessAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "trade",
        "engineer",
        "process_date",
        "content",
        "register_name",
        "created_date",
    ]
    search_fields = ["content", "register_name"]
    list_filter = ["engineer"]


# Register your models here.
admin.site.register(Customer, CustomerAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Trade, TradeAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(History, HistoryAdmin)
admin.site.register(Engineer, EngineerAdmin)
admin.site.register(Record, RecordAdmin)
admin.site.register(Vacation)
admin.site.register(Calendar, CalendarAdmin)
admin.site.register(Attendance, AttendanceAdmin)
admin.site.register(ReleaseLog, ReleaseLogAdmin)
admin.site.register(ReleaseLogPermission, ReleaseLogPermissionAdmin)
admin.site.register(ProductPackage, ProductPackageAdmin)
admin.site.register(ProductPackageItem)
admin.site.register(PendingStock, PendingStockAdmin)
admin.site.register(AsInternalProcess, AsInternalProcessAdmin)

admin.site.register(CCustomer)
admin.site.register(CProduct)
admin.site.register(CTrade)
admin.site.register(CCategory)
admin.site.register(CHistory)
