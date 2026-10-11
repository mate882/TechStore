from django.shortcuts import render

# Create your views here.

def products(request):
    return render(request, "products/products.html")

def warranty(request):
    return render(request, "products/warranty.html")

def returns(request):
    return render(request, "products/returns.html")

def delivery(request):
    return render(request, "products/delivery.html")

def contacts(request):
    return render(request, "pages/contact.html")

def category_detail(request, slug):
    from products.models import Category

    category = Category.objects.filter(slug=slug).first()
    if not category:
        return render(request, "404.html", status=404)

    return render(
        request,
        "products/category_detail.html",
        {
            "category": category,
        },
    )
    
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