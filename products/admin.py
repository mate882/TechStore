from django.contrib import admin
from django.db import models
from django.forms import Textarea
from django.utils.html import format_html

from .models import Category, Product, ProductImage


def image_thumbnail(obj):
    if obj.image:
        return format_html(
            '<img src="{}" alt="" style="height: 50px; width: auto; border-radius: 4px;">',
            obj.image.url,
        )
    return "—"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name",)
    readonly_fields = ("created_at", "updated_at")

    def get_readonly_fields(self, request, obj=None):
        # Slug is editable only while creating; locked afterwards so URLs never change.
        readonly = super().get_readonly_fields(request, obj)
        return readonly + ("slug",) if obj else readonly

    def get_prepopulated_fields(self, request, obj=None):
        # Auto-fill the slug while typing the name, only on the "add" page.
        return {} if obj else {"slug": ("name",)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image", "preview", "alt_text", "is_main")
    readonly_fields = ("preview",)

    @admin.display(description="Preview")
    def preview(self, obj):
        return image_thumbnail(obj)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "sku",
        "category",
        "price",
        "old_price",
        "stock",
        "is_active",
        "is_featured",
        "is_available",
    )
    list_filter = ("category", "is_active", "is_featured", "is_available")
    search_fields = ("name", "sku", "brand")
    date_hierarchy = "created_at"
    list_select_related = ("category",)
    inlines = [ProductImageInline]
    formfield_overrides = {
        models.JSONField: {"widget": Textarea(attrs={"rows": 10, "cols": 80})},
    }

    fieldsets = (
        ("Basic information", {"fields": ("category", "name", "slug", "sku", "brand")}),
        ("Descriptions", {"fields": ("short_description", "description")}),
        ("Pricing", {"fields": ("price", "old_price")}),
        ("Stock and visibility", {
            "fields": ("stock", "is_available", "is_active", "is_featured"),
        }),
        ("Technical specifications", {"fields": ("specifications",)}),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        readonly = ("created_at", "updated_at")
        return readonly + ("slug",) if obj else readonly

    def get_prepopulated_fields(self, request, obj=None):
        return {} if obj else {"slug": ("name",)}


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "thumbnail", "is_main", "created_at")
    list_filter = ("is_main",)
    search_fields = ("product__name", "product__sku", "alt_text")
    list_select_related = ("product",)
    autocomplete_fields = ("product",)

    @admin.display(description="Image")
    def thumbnail(self, obj):
        return image_thumbnail(obj)