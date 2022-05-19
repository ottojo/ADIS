from django.urls import path

from . import views

app_name = 'roars'
urlpatterns = [
    path('', views.index, name='index'),
    path('<int:roar_id>/', views.detail, name='detail'),
]
