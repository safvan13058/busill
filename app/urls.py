from django.urls import path
from .import views 
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Define your URL patterns here
    # Example: path('', views.home, name='home'), 
    path("",views.index,name="indexpage"),
    path("/map",views.map,name="mappage"),
    path("bus",views.bus,name="buspage"),
    path("bustracking",views.bustrack,name="trackingpage"),
    path("bussingle",views.busmap,name="bussinglepage"),
    path("/profile",views.profile,name="profilepage"),
    path("api/bus-stops/", views.busstops, name="bus_stops_api"),
    path("bus/<int:bus_id>/stops/", views.get_bus_stops, name="bus_stop_single"),
    path('bus/<int:bus_id>/position/',views.get_real_time_position, name='get_real_time_position'),
    path('api/real-time-bus-locations/',views.get_real_time_bus_locations, name='real_time_bus_locations'),
    path('api/Advertisement/',views.get_ads, name='get_Advertisement'),
    path('upload/Advertisement/',views.upload_ads, name='upload_Advertisement'),
    path('api/busstopsname/',views.get_locations, name='get_busstopname'),
    path('api/buslist/<str:froms>/<str:to>/',views. buslist, name=' get_buslist'),
    path('bus/<int:bus_id>/buses/',views.get_bus, name=' get_bus'),
    path('api/get/gps/<int:busid>',views.gps_data, name=' get_gps'),

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)