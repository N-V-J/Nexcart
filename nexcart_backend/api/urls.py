from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet, AddressViewSet
from products.views import CategoryViewSet, ProductViewSet
from orders.views import CartViewSet, OrderViewSet
from payments.views import PaymentViewSet
from .admin_views import (
    check_admin_status,
    dashboard_stats,
    AdminProductViewSet,
    AdminCategoryViewSet,
    AdminOrderViewSet,
    AdminUserViewSet
)

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'payments', PaymentViewSet, basename='payment')

# Create a router for admin endpoints
admin_router = DefaultRouter()
admin_router.register(r'products', AdminProductViewSet)
admin_router.register(r'categories', AdminCategoryViewSet)
admin_router.register(r'orders', AdminOrderViewSet)
admin_router.register(r'users', AdminUserViewSet)

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('rest_framework.urls')),

    # Admin endpoints
    path('admin/', include(admin_router.urls)),
    path('users/check_admin/', check_admin_status),
    path('admin/dashboard_stats/', dashboard_stats),
]
