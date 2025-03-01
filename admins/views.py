from django.shortcuts import render,redirect
from django.urls import reverse
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db.models import Count
from django.utils.timezone import now, timedelta
from django.contrib.auth.decorators import login_required
# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from app.models import AdvClient,Buses,Advertisement,BusStopsig,BusOwner,BusStop,GPSData
from .serializers import AdvClientSerializer,AdvertisementSerializer,BusSerializer,BusStopSerializer,BusOwnerSerializer,BusSerializers, BusStopSerializersingle
# **API to Add a New Bus Owner**
from django.db.models import Q

@login_required
def index(request):
    return render(request,'dashboard.html')

# def login(request):
#     return render(request,'login.html')




@api_view(['POST'])
def add_bus_owner(request):
    serializer = BusOwnerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Bus Owner added successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# **API to Update an Existing Bus Owner**
@api_view(['GET', 'PUT'])
def update_bus_owner(request, owner_id):
    try:
        owner = BusOwner.objects.get(id=owner_id)
    except BusOwner.DoesNotExist:
        return Response({"error": "Bus Owner not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = BusOwnerSerializer(owner)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        serializer = BusOwnerSerializer(owner, data=request.data, partial=True)  # Partial updates
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Bus Owner updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# **API to Delete a Bus Owner**
@api_view(['DELETE'])
def delete_bus_owner(request, owner_id):
    try:
        owner = BusOwner.objects.get(id=owner_id)
    except BusOwner.DoesNotExist:
        return Response({"error": "Bus Owner not found"}, status=status.HTTP_404_NOT_FOUND)

    owner.delete()
    return Response({"message": "Bus Owner deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


# **API to Get All Bus Owners**
@api_view(['GET'])
def list_bus_owners(request):
    search_query = request.GET.get('search', '')  # Get search query from request

    # If there's a search query, filter by name, email, or phone
    owners = BusOwner.objects.filter(
        Q(name__icontains=search_query) |  
        Q(email__icontains=search_query) |  
        Q(phone__icontains=search_query)
    ) if search_query else BusOwner.objects.all()  # If no search query, fetch all owners

    serializer = BusOwnerSerializer(owners, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(['GET'])
def get_buses_by_owner(request, owner_id):
    try:
        # ✅ Corrected filter using direct foreign key field
        buses = Buses.objects.filter(owner_id=owner_id)
        serializer = BusSerializer(buses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def add_adv_client(request):
    """
    API to create a new advertisement client.
    """
    serializer = AdvClientSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()  # Save new client to DB
        return Response({"message": "Client added successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_all_adv_clients(request):
    adv_clients = AdvClient.objects.all()
    serializer = AdvClientSerializer(adv_clients, many=True)
    return Response({"clients": serializer.data})
@api_view(['GET'])
def get_adv_client_by_id(request, client_id):
    try:
        client = AdvClient.objects.get(id=client_id)
    except AdvClient.DoesNotExist:
        return Response({"error": "Client not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = AdvClientSerializer(client)
    return Response({"client": serializer.data}, status=status.HTTP_200_OK)
@api_view(['PUT'])
def update_adv_client(request, client_id):
    """
    API to update an advertisement client by ID.
    """
    try:
        client = AdvClient.objects.get(id=client_id)  # Get client by ID
    except AdvClient.DoesNotExist:
        return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = AdvClientSerializer(client, data=request.data, partial=True)  # Allow partial updates
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Client updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_adv_client(request, client_id):
    """
    API to delete an advertisement client by ID.
    """
    try:
        client = AdvClient.objects.get(id=client_id)
        client.delete()  # Delete the client
        return Response({"message": "Client deleted successfully"}, status=status.HTTP_200_OK)
    except AdvClient.DoesNotExist:
        return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
@api_view(['POST'])
def add_advertisement(request):
    client_id = request.data.get('client')  # Get client ID from request

    try:
        client = AdvClient.objects.get(id=client_id)  # Fetch the client instance
    except AdvClient.DoesNotExist:
        return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = AdvertisementSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(client=client)  # Save advertisement with client instance
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
def get_advertisements_by_client(request, client_id):
    """
    API to fetch all advertisements for a specific client.
    """
    try:
        client = AdvClient.objects.get(id=client_id)
    except AdvClient.DoesNotExist:
        return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)

    ads = client.advertisements.all()  # Get all related advertisements
    serializer = AdvertisementSerializer(ads, many=True)
    return Response({"advertisements": serializer.data}, status=status.HTTP_200_OK)

@api_view(['GET', 'PUT'])
def  update_advertisement(request, ad_id):
    """
    API to retrieve or update an advertisement by ID.
    - GET: Retrieve advertisement details.
    - PUT: Update advertisement details.
    """
    try:
        ad = Advertisement.objects.get(id=ad_id)
    except Advertisement.DoesNotExist:
        return Response({"error": "Advertisement not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AdvertisementSerializer(ad)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        serializer = AdvertisementSerializer(ad, data=request.data, partial=True)  # Allow partial updates
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Advertisement updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['PUT'])
# def update_advertisement(request, ad_id):
#     """
#     API to update an advertisement by ID.
#     """
#     try:
#         ad = Advertisement.objects.get(id=ad_id)  # Get advertisement
#     except Advertisement.DoesNotExist:
#         return Response({"error": "Advertisement not found"}, status=status.HTTP_404_NOT_FOUND)

#     serializer = AdvertisementSerializer(ad, data=request.data, partial=True)  # Allow partial updates
#     if serializer.is_valid():
#         serializer.save()
#         return Response({"message": "Advertisement updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
    
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_advertisement(request, ad_id):
    """
    API to delete an advertisement by ID.
    """
    try:
        ad = Advertisement.objects.get(id=ad_id)
        ad.delete()  # Delete advertisement
        return Response({"message": "Advertisement deleted successfully"}, status=status.HTTP_200_OK)
    except Advertisement.DoesNotExist:
        return Response({"error": "Advertisement not found"}, status=status.HTTP_404_NOT_FOUND)



@api_view(['POST'])
def add_bus(request):
    serializer = BusSerializer(data=request.data)
    if serializer.is_valid():
        bus = serializer.save()
        bus.url = f"http://127.0.0.1:8000/api/get/gps/{bus.id}"  # Generate bus tracking URL
        bus.save()
        return Response({"message": "Bus added successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_single_bus(request, bus_id):
    try:
        bus = Buses.objects.get(id=bus_id)
        serializer = BusSerializer(bus)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Buses.DoesNotExist:
        return Response({"error": "Bus not found"}, status=status.HTTP_404_NOT_FOUND)
@api_view(['PUT'])
def update_bus(request, bus_id):
    """
    API to update bus details by ID.
    """
    try:
        bus = Buses.objects.get(id=bus_id)  # Get the bus by ID
    except Buses.DoesNotExist:
        return Response({"error": "Bus not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = BusSerializer(bus, data=request.data, partial=True)  # Allow partial updates
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Bus updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
def get_bus_stops(request, bus_id):
    try:
        bus = Buses.objects.get(id=bus_id)
        stops = bus.stops.all().values('id', 'title', 'lat', 'lng', 'index')  # ✅ Use 'title' instead of 'name'
        return Response(list(stops), status=status.HTTP_200_OK)
    except Buses.DoesNotExist:
        return Response({"error": "Bus not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def delete_bus(request, bus_id):
    """
    API to delete a bus by ID.
    """
    try:
        bus = Buses.objects.get(id=bus_id)
        bus.delete()  # Delete the bus
        return Response({"message": "Bus deleted successfully"}, status=status.HTTP_200_OK)
    except Buses.DoesNotExist:
        return Response({"error": "Bus not found"}, status=status.HTTP_404_NOT_FOUND)
# def get_buses_by_owner(request, owner_id):
#     try:
#         owner = BusOwner.objects.get(id=owner_id)
#     except BusOwner.DoesNotExist:
#         return Response({"error": "Owner not found"}, status=status.HTTP_404_NOT_FOUND)

#     buses = Buses.objects.filter(Owner=owner)
#     serializer = BusSerializer(buses, many=True)
#     return Response(serializer.data, status=status.HTTP_200_OK)

# @api_view(['POST'])  # ✅ Correct placement
# def add_singbus_stop(request, bus_id):
#     try:
#         bus = Buses.objects.get(id=bus_id)
#     except Buses.DoesNotExist:
#         return Response({"error": "Bus not found"}, status=status.HTTP_404_NOT_FOUND)

#     data = request.data
#     data['bus_id'] = bus.id  # ✅ Assign bus_id from URL

#     serializer =  BusStopSerializersingle(data=data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_201_CREATED)

#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def add_multiple_bus_stops(request, bus_id):
    try:
        bus = Buses.objects.get(id=bus_id)
    except Buses.DoesNotExist:
        return Response({"error": "Bus not found"}, status=status.HTTP_404_NOT_FOUND)

    # Log raw request data
    print("📥 Raw request data:", request.data)

    stops = request.data.get("stops", [])  # Expecting an array of stops

    if not stops:
        print("❌ No stops provided!")  # Log missing stops
        return Response({"error": "No stops provided"}, status=status.HTTP_400_BAD_REQUEST)

    created_stops = []
    errors = []

    for stop_data in stops:
        stop_data['bus_id'] = bus.id  # Assign bus_id from URL

        # Log each stop being processed
        print("🔹 Processing stop:", stop_data)

        serializer = BusStopSerializersingle(data=stop_data)
        
        if serializer.is_valid():
            serializer.save()
            created_stops.append(serializer.data)
            print("✅ Stop saved:", serializer.data)  # Log successful saves
        else:
            errors.append(serializer.errors)  # Collect errors
            print("❌ Validation error:", serializer.errors)  # Log errors

    if errors:
        return Response({"success": False, "errors": errors}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"success": True, "stops": created_stops}, status=status.HTTP_201_CREATED)
@api_view(['PUT'])
def update_bus_stop(request, stop_id):
    """
    API to update bus stop details by ID.
    """
    try:
        stop = BusStopsig.objects.get(id=stop_id)  # Get the bus stop by ID
    except BusStopsig.DoesNotExist:
        return Response({"error": "Bus stop not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = BusStopSerializer(stop, data=request.data, partial=True)  # Allow partial updates
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Bus stop updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_bus_stop(request, stop_id):
    """
    API to delete a bus stop by ID.
    """
    try:
        stop = BusStopsig.objects.get(id=stop_id)
        stop.delete()  # Delete the stop
        return Response({"message": "Bus stop deleted successfully"}, status=status.HTTP_200_OK)
    except BusStopsig.DoesNotExist:
        return Response({"error": "Bus stop not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def add_bus_stop(request):
    serializer = BusStopSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # 🛑 Print detailed errors to console
    print("Serializer Errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_buses_with_owner(request):
    search_query = request.GET.get('search', '').strip()  # Get 'search' param from query params

    # Filter buses based on search query (if provided)
    if search_query:
        buses = Buses.objects.filter(
            Q(Busname__icontains=search_query) |
            Q(Bus_NO__icontains=search_query) |
            Q(route_start__icontains=search_query) |
            Q(route_end__icontains=search_query) |
            Q(owner__name__icontains=search_query)
        ).select_related('owner')
    else:
        buses = Buses.objects.select_related('owner').all()

    serializer = BusSerializers(buses, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# 🚀 GET all bus stops
@api_view(['GET'])
def get_all_bus_stops(request):
    bus_stops = BusStop.objects.all()
    serializer = BusStopSerializer(bus_stops, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# 🚀 GET, PUT, DELETE single bus stop
@api_view(['GET', 'PUT', 'DELETE'])
def get_single_bus_stop(request, stop_id):
    try:
        bus_stop = BusStop.objects.get(id=stop_id)
    except BusStop.DoesNotExist:
        return Response({"error": "Bus stop not found"}, status=status.HTTP_404_NOT_FOUND)

    # ✅ GET: Retrieve a bus stop
    if request.method == 'GET':
        serializer = BusStopSerializer(bus_stop)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # 📝 PUT: Update a bus stop
    elif request.method == 'PUT':
        serializer = BusStopSerializer(bus_stop, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 🗑️ DELETE: Remove a bus stop
    elif request.method == 'DELETE':
        bus_stop.delete()
        return Response({"message": "Bus stop deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def buses_per_owner(request):
    data = []
    for owner in BusOwner.objects.all():
        data.append({
            "owner": owner.name,
            "bus_count": owner.buses.count()
        })
    return Response(data)


@api_view(['GET'])
def ads_per_client(request):
    data = [
        {"client": client.name, "ads_count": client.advertisements.count()}
        for client in AdvClient.objects.all()
    ]
    return Response(data)

@api_view(['GET'])
def bus_stops_distribution(request):
    data = [
        {"bus": bus.Busname, "stops": bus.stops.count()}
        for bus in Buses.objects.all()
    ]
    return Response(data)

@api_view(['GET'])
def bus_positions_over_time(request):
    past_week = now() - timedelta(days=7)
    positions = (
        GPSData.objects
        .filter(timestamp__gte=past_week)
        .extra({'day': "date(timestamp)"})
        .values('day')
        .annotate(count=Count('id'))
        .order_by('day')
    )
    return Response(list(positions))
def get_singlebus_stops(request):
    bus_stops = list(BusStop.objects.values('id', 'title', 'latitude', 'longitude'))
    return JsonResponse({'bus_stops': bus_stops})
@api_view(['DELETE'])
def delete_bus_stop(request, stop_id):
    try:
        bus_stop = BusStopsig.objects.get(id=stop_id)
        bus_stop.delete()
        return Response({"success": True, "message": "Bus stop deleted"}, status=status.HTTP_200_OK)
    except BusStopsig.DoesNotExist:
        return Response({"error": "Bus stop not found"}, status=status.HTTP_404_NOT_FOUND)


def signup(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        confirm_password = request.POST['confirm_password']

        if password == confirm_password:
            if User.objects.filter(username=username).exists():
                messages.error(request, "Username already exists")
            else:
                user = User.objects.create_user(username=username, password=password)
                user.save()
                messages.success(request, "Account created successfully")
                return redirect('login')
        else:
            messages.error(request, "Passwords do not match")
    return render(request, 'signup.html')

def user_login(request):
    if request.user.is_authenticated:  # Check if user is already logged in
        return redirect('adminpage')  

    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            request.session.set_expiry(0)  # Session expires only on logout
            return redirect('adminpage')
        else:
            messages.error(request, "Invalid credentials")

    return render(request, 'login.html')

@login_required
def user_logout(request):
    logout(request)
    messages.success(request, "You have been logged out successfully.")
    return redirect('login')
