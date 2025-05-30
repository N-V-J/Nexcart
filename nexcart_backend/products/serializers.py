from rest_framework import serializers
from .models import Category, Product

# ProductImageSerializer has been removed as ProductImage model no longer exists

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for the Category model
    """
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'parent']

class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for the Product model
    """
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'price', 'discount_price',
                  'category', 'category_id', 'inventory', 'is_active',
                  'created_at', 'updated_at', 'image', 'image_url']
        read_only_fields = ['created_at', 'updated_at']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class ProductListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing products
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'price', 'discount_price',
                  'category_name', 'image_url', 'inventory', 'is_active']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
