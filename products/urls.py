from django.urls import path
from . import views

app_name = 'products'

urlpatterns = [
    path('products/', views.products, name='shop'),
    path('warranty/', views.warranty, name='warranty'),
    path('returns/', views.returns, name='returns'),
    path('delivery/', views.delivery, name='delivery'),
    path('contact/', views.contacts, name='contact'),
    path('category/<slug:slug>/', views.category_detail, name='category_detail'),
    path('product/<slug:slug>/', views.product_detail, name='product_detail')
]