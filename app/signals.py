from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import GPSData
from app.views import update_bus_location

@receiver(post_save, sender=GPSData)
def auto_update_bus_location(sender, instance, **kwargs):
    update_bus_location(None, instance.bus.id)  # Auto-update on GPS update
