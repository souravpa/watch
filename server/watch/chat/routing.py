from . import consumers
from django.urls import re_path


websocket_urlpatterns = [
    #re_path(r'alarm',consumers.ChatConsumer)
    re_path(r"^chat/(?P<sessionid>\w+)/$", consumers.ChatConsumer),
]