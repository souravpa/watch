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
        
        try:
            session = models.ServerID.objects.get(id=self.room_name)
        except:
            return
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
                'message': message
            }
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        try: 
            session = models.ServerID.objects.get(id=self.room_name)
            if (session.num_connected == 1):
                print("removed")
                session.delete()
            else: 
                session.num_connected-=1 
                session.save()
        except:
            pass
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # Receive message from room group
    def chat_message(self, event):
        message = event['message']
        print(message)
        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'message': message
        }))