from rest_framework import serializers
from app.models import AdvClient,Advertisement,Buses, BusStopsig, BusStop,BusOwner

class BusSerializers(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.name', read_only=True)  # ✅ Include owner name

    class Meta:
        model = Buses
        fields = ['id', 'Busname', 'Bus_NO', 'owner_id', 'owner_name', 'route_start', 'route_end', 'url']
class BusOwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusOwner
        fields = ['id', 'name', 'email', 'phone', 'address', 'created_at']  # Added 'address' & 'created_at'
        read_only_fields = ['id', 'created_at']  # 'id' & 'created_at' should not be modified

class AdvClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvClient
        fields = ['id', 'name', 'email', 'phone']  # Fields to expose in API
class AdvertisementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Advertisement
        fields = ['id','title', 'description', 'lat', 'lng', 'image', 'client']

class BusSerializer(serializers.ModelSerializer):
    owner_id = serializers.PrimaryKeyRelatedField(
        source='owner',
        queryset=BusOwner.objects.all()
    )
    class Meta:
        model = Buses
        fields = ['id', 'Busname', 'Bus_NO', 'owner_id', 'route_start', 'route_end', 'url']

class BusStopSerializersingle(serializers.ModelSerializer):
    class Meta:
        model = BusStopsig
        fields = ['id', 'bus_id', 'title', 'lat', 'lng', 'index']

class BusStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusStop
        fields = ['id', 'title', 'type', 'description', 'latitude', 'longitude', 'icon_url']