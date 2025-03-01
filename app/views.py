from django.shortcuts import render
from django.http import JsonResponse,HttpResponse
from .models import BusStop,Buses,BusStopsig,BusPosition,Advertisement,GPSData
from django.db.models import Q
# from django.contrib.gis.geos import Point
# from django.contrib.gis.db.models.functions import Distance
from django.db import connection
import math

# Create your views here.
def index(request):
    return render(request,'index.html')

def map(request):
    return render(request,'map.html')

def bus(request):
    return render(request,'buslist.html')

def bustrack(request):
    return render(request,'bustrack.html')

def busmap(request):
    return render(request,'sigmap.html')

def profile(request):
    return render(request,'profile.html')


def busstops(request):
      bus_stops = BusStop.objects.all()
      data = [
            {
            "title": stop.title,
            # "description": stop.description,
            "type": stop.type,
            "lat": stop.latitude,
            "lng": stop.longitude,
            # "icon_url": stop.icon_url or "https://example.com/default-bus-stop-icon.png"
            }
            for stop in bus_stops
            ]
      return JsonResponse(data, safe=False)



def get_bus_stops(request,bus_id):
    try:
        bus = Buses.objects.get(id=bus_id)
        stops = bus.stops.all().values('lat', 'lng', 'title')
        
        return JsonResponse(list(stops), safe=False)
        
    except Buses.DoesNotExist:
        return JsonResponse({"error": "Bus not found"}, status=404) 

# def get_real_time_position(request, bus_id):
#     try:
#         bus = Buses.objects.get(id=bus_id)
#         position = bus.positions.latest('timestamp')
#         data = {
#             "lat": position.current_lat,
#             "lng": position.current_lng,
#             "timestamp": position.timestamp
#         }
#         return JsonResponse(data)
#     except Buses.DoesNotExist:
#         return JsonResponse({"error": "Bus not found"}, status=404)
#     except BusPosition.DoesNotExist:
#         return JsonResponse({"error": "No position data available for this bus"}, status=404)
    
def get_real_time_position(request, bus_id):
    try:
        bus = Buses.objects.get(id=bus_id)
        position = GPSData.objects.filter(bus=bus).latest('timestamp')  # Get latest GPS data
        
        data = {
            "lat": position.latitude,
            "lng": position.longitude,
            "timestamp": position.timestamp,
            "device_id": position.device_id if position.device_id else "N/A"
        }
        return JsonResponse(data)
    except Buses.DoesNotExist:
        return JsonResponse({"error": "Bus not found"}, status=404)
    except GPSData.DoesNotExist:
        return JsonResponse({"error": "No GPS data available for this bus"}, status=404)

from django.db.models import Max

def get_real_time_bus_locations(request):
    # Get the latest position for each bus
    latest_positions = (
        GPSData.objects.values('bus_id')
        .annotate(last_updated=Max('timestamp'))
    )

    bus_locations = []
    for position in latest_positions:
        try:
            bus = Buses.objects.get(id=position['bus_id'])
            latest_gps = GPSData.objects.get(bus=bus, timestamp=position['last_updated'])

            bus_locations.append({
                "bus_id": bus.id,
                "bus_name": bus.Busname,
                "bus_no": bus.Bus_NO,
                "latitude": latest_gps.latitude,
                "longitude": latest_gps.longitude,
                "last_updated": latest_gps.timestamp,
                "device_id": latest_gps.device_id if latest_gps.device_id else "N/A"
            })
        except Buses.DoesNotExist:
            continue

    return JsonResponse(bus_locations, safe=False)

from django.http import JsonResponse
from .models import Advertisement

# def get_ads(request):
#     try:
#         # Retrieve all advertisements
#         ads = Advertisement.objects.all()

#         # Serialize the queryset into a list of dictionaries
#         data = [
#             {
#                 "lat": ad.lat,
#                 "lng": ad.lng,
#                 "title": ad.title,
#                 "image": ad.image.url if ad.image else None  # Ensure image URL is returned if exists
#             }
#             for ad in ads
#         ]

#         return JsonResponse(data, safe=False)  # Safe=False allows returning a list
#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)


# def get_ads(request):
#     try:
#         # Get user location from query parameters
#         user_lat = request.GET.get("lat")
#         user_lng = request.GET.get("lng")

#         if not user_lat or not user_lng:
#             return JsonResponse({"error": "Latitude and Longitude are required"}, status=400)

#         user_location = Point(float(user_lng), float(user_lat), srid=4326)  # Convert to GeoDjango Point

#         # Fetch ads within a 2km radius
#         ads = Advertisement.objects.annotate(distance=Distance("location", user_location))\
#                                    .filter(distance__lte=2000)  # Distance in meters

#         # Serialize response
#         data = [
#             {
#                 "lat": ad.lat,
#                 "lng": ad.lng,
#                 "title": ad.title,
#                 "image": ad.image.url if ad.image else None,
#                 "distance_meters": ad.distance.m
#             }
#             for ad in ads
#         ]

#         return JsonResponse(data, safe=False)  # Safe=False allows returning a list

#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)




def get_ads(request):
    try:
        # Get user location from query parameters
        user_lat = request.GET.get("lat")
        user_lng = request.GET.get("lng")

        if not user_lat or not user_lng:
            return JsonResponse({"error": "Latitude and Longitude are required"}, status=400)

        user_lat = float(user_lat)
        user_lng = float(user_lng)

        radius_km = 2  # 2 km radius
        earth_radius_km = 6371  # Radius of Earth in km

        # Haversine formula to calculate distance
        haversine_sql = f"""
            SELECT id, title, lat, lng, image,
                ({earth_radius_km} * ACOS(
                    COS(RADIANS(%s)) * COS(RADIANS(lat)) *
                    COS(RADIANS(lng) - RADIANS(%s)) +
                    SIN(RADIANS(%s)) * SIN(RADIANS(lat))
                )) AS distance
            FROM your_app_advertisement
            HAVING distance <= %s
            ORDER BY distance ASC;
        """

        # Execute raw SQL query
        with connection.cursor() as cursor:
            cursor.execute(haversine_sql, [user_lat, user_lng, user_lat, radius_km])
            ads = cursor.fetchall()

        # Serialize response
        data = [
            {
                "id": ad[0],
                "title": ad[1],
                "lat": ad[2],
                "lng": ad[3],
                "image": ad[4] if ad[4] else None,
                "distance_km": round(ad[5], 2),
            }
            for ad in ads
        ]

        return JsonResponse(data, safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def upload_ads(request):
    title=request.POST.get("title")
    description=request.POST.get("description")
    lat=request.POST.get("lat")
    lng=request.POST.get("lng")
    image=request.FILES.get("image")

    data=Advertisement.objects.create(title=title,description=description,
                                      lat=lat,
                                      lng=lng,
                                      image=image
                                      )
    return  HttpResponse(data)  
    



def get_locations(request):
    locations = list(BusStop.objects.order_by('title').values_list('title', flat=True))  # Fetch and order locations
    return JsonResponse({'locations': locations})


from django.db.models import Count
def buslist(request,froms,to):

    buses = Buses.objects.annotate(
            stop_count=Count('stops', filter=Q(stops__title__iexact=froms) | Q(stops__title__iexact=to))
           ).filter(stop_count=2).distinct()
    if buses.exists():
            bus_list = buses.values('id', 'Busname', 'Bus_NO','route_start','route_end')
            return JsonResponse(list(bus_list), safe=False)
    else:
            return JsonResponse({"message": "No buses found connecting these stops"}, status=404)



def get_bus(request, bus_id):
    
   try:
        data = Buses.objects.get(id=bus_id)
        serialized_data = {
            "Busname": data.Busname,
            "route_start": data.route_start,
            "route_end": data.route_end,
            "Bus_NO": data.Bus_NO,
        }
        return JsonResponse(serialized_data)
   except Buses.DoesNotExist:
        return JsonResponse({"error": "Bus not found"}, status=404)
   
import json


@csrf_exempt
def gps_data(request,busid):
        try:

            data = json.loads(request.body)
            # Extract data from the request
            device_id = data.get('device_id')
            bus_id = busid
            latitude = data.get('latitude')
            longitude = data.get('longitude')

            # Validate presence of required data
            if not (bus_id and latitude and longitude):
                return JsonResponse({"error": "Bus ID, Latitude, and Longitude are required"}, status=400)

            try:
                bus = Buses.objects.get(id=bus_id)
            except Buses.DoesNotExist:
                return JsonResponse({"error": "Bus with the given ID does not exist"}, status=404)

            # Save the GPS data to the database
            gps_data = GPSData.objects.create(
                bus=bus,
                device_id=device_id,
                latitude=latitude,
                longitude=longitude
            )

            return JsonResponse(
                {
                    "message": "GPS data received and saved successfully",
                    "data": {
                        "id": gps_data.id,
                        "bus_id": gps_data.bus.id,
                        "device_id": gps_data.device_id,
                        "latitude": gps_data.latitude,
                        "longitude": gps_data.longitude,
                        "timestamp": gps_data.timestamp
                    }
                },
                status=201
            )
        except Exception as e:
            return JsonResponse({"error": "An error occurred while processing GPS data", "details": str(e)}, status=500)
    


# def update_bus_location(request, bus_id):
#     try:
#         bus = Buses.objects.get(id=bus_id)
#         last_stop = BusStopsig.objects.filter(bus_id=bus).order_by('-index').first()
        
#         # Get the latest GPS location
#         gps_data = GPSData.objects.filter(bus=bus).order_by('-timestamp').first()

#         if not gps_data:
#             return JsonResponse({"error": "No GPS data available"}, status=404)

#         # Check if the bus has reached the last stop
#         if last_stop and gps_data.latitude == last_stop.lat and gps_data.longitude == last_stop.lng:
#             bus.toggle_stops()  # Auto-toggle when reaching last stop

#         return JsonResponse({
#             "bus": bus.Busname,
#             "current_lat": gps_data.latitude,
#             "current_lng": gps_data.longitude,
#             "timestamp": gps_data.timestamp,
#             "direction": "Reversed" if last_stop and gps_data.latitude == last_stop.lat and gps_data.longitude == last_stop.lng else "Normal",
#             "route": f"{bus.route_start} → {bus.route_end}"
#         })

#     except Buses.DoesNotExist:
#         return JsonResponse({"error": "Bus not found"}, status=404)


# Haversine formula to calculate distance (in meters) between two coordinates
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # Radius of Earth in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c  # Distance in meters

# Function to update bus location
def update_bus_location(request, bus_id):
    try:
        bus = Buses.objects.get(id=bus_id)
        gps_data = GPSData.objects.filter(bus=bus).order_by('-timestamp').first()

        if not gps_data:
            return JsonResponse({"error": "No GPS data available"}, status=404)

        # Get all stops for the bus, ordered by index
        bus_stops = BusStopsig.objects.filter(bus_id=bus).order_by('index')

        for stop in bus_stops:
            distance = haversine(gps_data.latitude, gps_data.longitude, stop.lat, stop.lng)
            
            if distance <= 500:  # If within 500m radius, update index
                stop.index += 1  # Increment the index
                stop.save()
                break  # Stop after updating the first matched stop
        
        return JsonResponse({
            "bus": bus.Busname,
            "current_lat": gps_data.latitude,
            "current_lng": gps_data.longitude,
            "timestamp": gps_data.timestamp,
            "nearest_stop": stop.title if distance <= 500 else "None",
            "distance_to_stop": f"{distance:.2f}m",
            "route": f"{bus.route_start} → {bus.route_end}"
        })

    except Buses.DoesNotExist:
        return JsonResponse({"error": "Bus not found"}, status=404)