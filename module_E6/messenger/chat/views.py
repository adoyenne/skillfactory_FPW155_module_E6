from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import User, Chat, Message
from .serializers import UserSerializer, UserRegistrationSerializer, ChatSerializer, MessageSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.http import JsonResponse
from django.views import View
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics

from rest_framework.test import APIClient
from django.test import TestCase


import logging
logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_me(self, request):
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=False, methods=['options'])
    def options(self, request):
        return Response({
            'methods': ['PATCH', 'GET', 'OPTIONS']
        })

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]


    def perform_create(self, serializer):
        serializer.save()


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]


def home(request):
    return render(request, 'index.html')

class ChatMessagesView(View):
    def get(self, request, chat_id):
        chat = get_object_or_404(Chat, id=chat_id)  # Проверка существования чата
        messages = Message.objects.filter(chat=chat)
        serializer = MessageSerializer(messages, many=True)
        return JsonResponse(serializer.data, safe=False)

#from rest_framework import status
#from rest_framework.response import Response
#from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

#class CurrentUserView(APIView):
#    permission_classes = [IsAuthenticated]
#    parser_classes = [MultiPartParser, FormParser]  # Для обработки файлов

#    def get(self, request, *args, **kwargs):
#        user = request.user
#        data = {
#            'username': user.username,
#            'first_name': user.first_name,
#            'last_name': user.last_name,
#            'avatar': user.profile.avatar.url if hasattr(user, 'profile') and user.profile.avatar else '/media/avatars/default-avatar.jpeg'
#        }
#        return Response(data)

#    def patch(self, request, *args, **kwargs):
#        user = request.user
#       serializer = UserSerializer(user, data=request.data, partial=True)
#       if serializer.is_valid():
#            serializer.save()
#            return Response(serializer.data)
#        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



#class UserUpdateView(generics.UpdateAPIView):
#    serializer_class = UserSerializer
#    permission_classes = [IsAuthenticated]

#    def get_object(self):
#        user = self.request.user
#        logger.info(f'User: {user}')
#        return user




class APITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client.force_authenticate(user=self.user)

    def test_patch_method_allowed(self):
        response = self.client.options('/api/users/me/')
        print(response.data)
