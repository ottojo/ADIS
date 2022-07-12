from django.urls import path

from . import views

app_name = 'roars'
urlpatterns = [
    path('', views.index, name='index'),
    path('action/post', views.post, name='post'),
    path('action/like/<int:roar_id>', views.like, name='like'),
    path('action/unlike/<int:roar_id>', views.unlike, name='unlike'),
    path('user/<int:user_id>/likes', views.user_likes_view, name='user_likes'),
]
