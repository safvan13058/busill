from django.db import models
from django.core.validators import RegexValidator

class BusOwner(models.Model):
    name = models.CharField(max_length=255)  # Owner's Name
    email = models.EmailField(unique=True)  # Email (Unique)
    phone = models.CharField(
        max_length=15, 
        unique=True,
        validators=[RegexValidator(r'^\+?\d{10,15}$', message="Enter a valid phone number")]
    )  # Contact Number (With Validation)
    address = models.TextField(blank=True, null=True)  # Optional Address
    created_at = models.DateTimeField(auto_now_add=True)  # Auto Timestamp

    def save(self, *args, **kwargs):
        self.email = self.email.lower()  # Store email in lowercase
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.email})"
# Create your models here.
class Buses(models.Model):
    Busname = models.CharField(max_length=255)
    Bus_NO = models.CharField(max_length=225, unique=True)
    owner = models.ForeignKey(BusOwner, on_delete=models.CASCADE, related_name="buses",null=True)  # ForeignKey to BusOwner
    route_start = models.CharField(max_length=225)
    route_end = models.CharField(max_length=255)
    url = models.URLField(blank=True, null=True)  # URL for GPS API
    
    def toggle_stops(self):
        """
        Reverse the stop order for this bus by swapping the index values.
        """
        stops = list(self.stops.all().order_by("index"))  # Get all stops sorted by index
        if not stops:
            return  # No stops to toggle

        max_index = stops[-1].index  # Get highest index value

        for stop in stops:
            stop.index = max_index - stop.index  # Reverse index
            stop.save()

    def __str__(self):
        return self.Busname

class BusStop(models.Model):
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    icon_url = models.URLField(blank=True, null=True)  # Optional custom icon URL

    def __str__(self):
        return self.title

class BusStopsig(models.Model):
    bus_id=models.ForeignKey(Buses, on_delete=models.CASCADE, related_name="stops")  # Link to Buses
    title = models.CharField(max_length=255)  # Name of the bus stop
    lat = models.FloatField()  # Latitude
    lng = models.FloatField()  # Longitude
    index=models.IntegerField()

    def __str__(self):
        return self.title
    
class BusPosition(models.Model):
    bus_id=models.ForeignKey(Buses, on_delete=models.CASCADE, related_name="positions")  
    current_lat = models.FloatField()  # Current latitude of the bus
    current_lng = models.FloatField()  # Current longitude of the bus
    timestamp = models.DateTimeField(auto_now=True)  # Time of the position update



class AdvClient(models.Model):
    id = models.AutoField(primary_key=True)  # Auto-increment ID
    name = models.CharField(max_length=255)  # Client Name
    email = models.EmailField(unique=True)  # Email (unique)
    phone = models.CharField(max_length=15, unique=True)  # Phone Number (unique)

    def __str__(self):
        return self.name  # Display name in Django Admin
    

class Advertisement(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    lat = models.FloatField()
    lng = models.FloatField()
    image = models.ImageField(upload_to="Advertisement/")
    client = models.ForeignKey(AdvClient, on_delete=models.CASCADE, related_name="advertisements",null=True)  # Foreign Key to AdvClient

    def __str__(self):
        return self.title

class GPSData(models.Model):
    bus = models.ForeignKey(Buses, on_delete=models.CASCADE, related_name='gps_data')
    device_id = models.CharField(max_length=100, null=True, blank=True)  # Optional device identifier
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)