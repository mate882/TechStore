from django.shortcuts import render, get_object_or_404
from .models import Product, Category


# Sorting choices offered on the page. The key is what appears in the URL (?sort=price_asc).
SORT_OPTIONS = {
    "newest": {"label": "Newest", "order_by": "-created_at"},
    "price_asc": {"label": "Price: low to high", "order_by": "price"},
    "price_desc": {"label": "Price: high to low", "order_by": "-price"},
}
DEFAULT_SORT = "newest"

# Create your views here.s

def warranty(request):
    return render(request, "products/warranty.html")

def returns(request):
    return render(request, "products/returns.html")

def delivery(request):
    return render(request, "products/delivery.html")

from django.conf import settings
from django.shortcuts import render


def contacts(request):
    context = {
        "whatsapp_number": getattr(settings, "WHATSAPP_NUMBER", ""),
        "contact_email": getattr(settings, "CONTACT_EMAIL", ""),
        "contact_phone": getattr(settings, "CONTACT_PHONE", ""),
    }

    return render(request, "products/contact.html", context)

def category_detail(request, slug):
    category = get_object_or_404(Category, slug=slug, is_active=True)

    sort = request.GET.get("sort")
    if sort not in SORT_OPTIONS:
        sort = DEFAULT_SORT

    products = (
        category.products.filter(is_active=True)
        .select_related("category")
        .prefetch_related("images")
        .order_by(SORT_OPTIONS[sort]["order_by"], "-pk")
    )

    context = {
        "category": category,
        "products": products,
        "product_count": len(products),  # runs the query once; the template reuses the result
        "current_sort": sort,
        "sort_options": [
            {"key": key, "label": option["label"]} for key, option in SORT_OPTIONS.items()
        ],
    }
    return render(request, "products/category_detail.html", context)
    
def product_detail(request, slug):
    from products.models import Product

    product = Product.objects.filter(slug=slug).first()
    if not product:
        return render(request, "404.html", status=404)

    return render(
        request,
        "products/product_detail.html",
        {
            "product": product,
        },
    )
    
def shop(request):
    products = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')
    categories = Category.objects.filter(is_active=True)

    # Optional: simple sorting
    sort = request.GET.get('sort', 'newest')
    if sort == 'price_asc':
        products = products.order_by('price')
    elif sort == 'price_desc':
        products = products.order_by('-price')
    else:
        products = products.order_by('-created_at')

    context = {
        'products': products,
        'categories': categories,
        'current_sort': sort,
    }
    return render(request, 'products/shop.html', context)