from django.db.models import Count, Q
from django.shortcuts import render

from products.models import Category, Product

FEATURED_LIMIT = 8

def home(request):
    categories = Category.objects.filter(is_active=True).annotate(
        product_count=Count("products", filter=Q(products__is_active=True))
    )

    featured_products = (
        Product.objects.filter(is_active=True, is_featured=True)
        .select_related("category")
        .prefetch_related("images")[:FEATURED_LIMIT]
    )

    return render(
        request,
        "pages/home.html",
        {
            "categories": categories,
            "featured_products": featured_products,
        },
    )
    
def cart(request):
    return render(request, "pages/cart.html")
