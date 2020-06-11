import json
from channels.generic.websocket import WebsocketConsumer

# chat/consumers.py

import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from . import models
class ChatConsumer(WebsocketConsumer):
    def connect(self):
        print(self.scope['url_route']['kwargs'])
        self.room_name = self.scope['url_route']['kwargs']['sessionid']
        self.room_group_name = 'chat_%s' % self.room_name    
        session = models.ServerID.objects.get(id=self.room_name)
        session.num_connected+=1
        session.save()
        # Join room group
        print("added")
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        message = "sir %s" % session.num_connected
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'event': 'sir'
            }
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        message = "hihi"
        session = models.ServerID.objects.get(id=self.room_name)
        if (session.num_connected == 1):
            print("removed")
            message = 'sir %s' % session.num_connected
            session.delete()
        else:
            session.num_connected-=1 
            message = 'sir %s' % session.num_connected
            session.save()
        print(message)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
               'type':'chat_message',
               'message':message, 
               'event': 'sir'
            }
        )

        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        message = text_data
        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'event': "control", 
                'client': self.channel_name
            }
        )

    # Receive message from room group
    def chat_message(self, event):
        if (event['event'] == 'sir'):
            message=event['message']
            self.send(text_data=message)
        else:
            message = event['message']
        # Send message to WebSocket
            if (event["client"] != self.channel_name):
                self.send(text_data=message)
