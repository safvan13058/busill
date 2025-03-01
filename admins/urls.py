from django.urls import path
from .import views 
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Define your URL patterns here
    # Example: path('', views.home, name='home'), 
    path("index/",views.index,name="adminpage"),
    path('signup/', views.signup, name='signup'),
    path("", views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('adv-clients/', views.get_all_adv_clients, name='get-all-adv-clients'),
    path('adv-clients/add/', views.add_adv_client, name='get-all-adv-clients'),
    path('adv-clients/<int:client_id>/',  views.get_adv_client_by_id, name='get_adv_client_by_id'),
    path('adv-client/update/<int:client_id>/', views.update_adv_client, name='update-adv-client'),
    path('adv-client/delete/<int:client_id>/', views.delete_adv_client, name='delete-adv-client'),
    path('advertisements/client/<int:client_id>/', views.get_advertisements_by_client, name='get-client-advertisements'),
    path('advertisements/add/', views.add_advertisement, name='add-advertisement'),
    path('advertisements/update/<int:ad_id>/',  views.update_advertisement, name='update-advertisement'),
    path('advertisements/delete/<int:ad_id>/',  views.delete_advertisement, name='delete-advertisement'),
    path('api/buses/add/',  views.add_bus, name='add-bus'),
    path('bus/update/<int:bus_id>/',  views.update_bus, name='update-bus'),
    path('bus/delete/<int:bus_id>/', views.delete_bus, name='delete-bus'),
    path('bus/<int:bus_id>/add-stop/', views.add_multiple_bus_stops, name='add-singbus-stop'),
    path('bus-stop/update/<int:stop_id>/',views.update_bus_stop, name='update-bus-stop'),
    path('bus-stop/delete/<int:stop_id>/', views.delete_bus_stop, name='delete-bus-stop'),
    path('bus-stops/add/', views.add_bus_stop, name='add-bus-stop'),
    path('api/bus-owners/add/', views.add_bus_owner, name="add-bus-owner"),
    path('api/bus-owners/update/<int:owner_id>/', views.update_bus_owner, name="update-bus-owner"),
    path('api/bus-owners/delete/<int:owner_id>/', views.delete_bus_owner, name="delete-bus-owner"),
    path('api/bus-owners/', views.list_bus_owners, name="list-bus-owners"),
    path('api/buses/<int:owner_id>/', views.get_buses_by_owner, name='buses_by_owner'),
    path('api/bus-owner/<int:owner_id>/buses/', views.get_buses_by_owner, name="get-buses-by-owner"),
    path('api/buses/', views.get_buses_with_owner, name="get-buses-with-owner"),
    path('api/buses/single/<int:bus_id>/', views.get_single_bus, name="get-single-bus"),
    path('api/buses/update/<int:bus_id>/', views.update_bus, name="update-bus"),
    path('api/buses/<int:bus_id>/stops/', views.get_bus_stops, name="get-bus-stops"),
    path('api/bus-stops/', views.get_all_bus_stops, name='get-all-bus-stops'),        # GET all stops
    path('api/bus-stops/<int:stop_id>/', views.get_single_bus_stop, name='get-bus-stop'),  # GET, PUT, DELETE by ID
     path('api/bus_stops/',views. get_singlebus_stops, name='bus_stops_api'),
    path('api/bus_stop/<int:stop_id>/delete/', views.delete_bus_stop, name='delete_bus_stop'),
     path('analysis/buses-per-owner/', views.buses_per_owner, name='buses_per_owner'),
    path('analysis/ads-per-client/', views.ads_per_client, name='ads_per_client'),
    path('analysis/bus-stops-distribution/', views.bus_stops_distribution, name='bus_stops_distribution'),
    path('analysis/bus-positions-over-time/', views.bus_positions_over_time, name='bus_positions_over_time'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)