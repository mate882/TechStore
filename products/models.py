from django.db import models
from django.utils.text import slugify


def generate_unique_slug(instance, source, max_length):
    """Build a slug from `source` that no other row of the same model uses."""
    base = slugify(source, allow_unicode=True)[: max_length - 10] or "item"
    slug = base
    number = 2
    model = instance.__class__
    while model.objects.filter(slug=slug).exclude(pk=instance.pk).exists():
        slug = f"{base}-{number}"
        number += 1
    return slug


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True, allow_unicode=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "category"
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.name, 140)
        super().save(*args, **kwargs)


class Product(models.Model):
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="products"
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True, allow_unicode=True)
    sku = models.CharField("SKU", max_length=64, unique=True)
    brand = models.CharField(max_length=100, blank=True)
    short_description = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    old_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Previous price. Fill in to show a discount.",
    )
    specifications = models.JSONField(
        default=dict,
        blank=True,
        help_text='Technical specs as JSON, e.g. {"Resolution": "4 MP", "Lens": "2.8 mm"}',
    )
    stock = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    is_active = models.BooleanField(
        default=True, help_text="Untick to hide the product from the store."
    )
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "product"
        verbose_name_plural = "products"

    def __str__(self):
        return f"{self.name} ({self.sku})"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.name, 220)
        super().save(*args, **kwargs)

    @property
    def is_on_sale(self):
        return self.old_price is not None and self.old_price > self.price


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="products/%Y/%m/")
    alt_text = models.CharField(max_length=200, blank=True)
    is_main = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_main", "created_at"]
        verbose_name = "product image"
        verbose_name_plural = "product images"

    def __str__(self):
        return f"Image of {self.product.name}"

    def save(self, *args, **kwargs):
        if not self.alt_text:
            self.alt_text = self.product.name
        super().save(*args, **kwargs)
        if self.is_main:
            ProductImage.objects.filter(product=self.product, is_main=True).exclude(
                pk=self.pk
            ).update(is_main=False)