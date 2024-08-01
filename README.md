#Homework Module E6

#Домашнее задание по модулю E6: Мессенджер

Это домашнее задание по модулю E6 представляет собой простой мессенджер. В этом проекте используется Django, Channels и Redis для создания веб-приложения чата.

#Установка
Следуйте этим шагам, чтобы настроить и запустить проект на вашем локальном компьютере.

1. Клонируйте репозиторий

Сначала клонируйте репозиторий с GitHub:

bash
Copy code
git clone https://github.com/adoyenne/skillfactory_FPW155_module_E6.git
cd skillfactory_FPW155_module_E6
2. Создайте и активируйте виртуальное окружение

Рекомендуется использовать виртуальное окружение для управления зависимостями:

python -m venv venv
source venv/bin/activate  # Для Windows: venv\Scripts\activate
3. Установите зависимости

Установите все необходимые зависимости из файла requirements.txt:

pip install -r requirements.txt

4. Настройте базу данных

Примените миграции, чтобы создать необходимые таблицы в базе данных:

python manage.py makemigrations
python manage.py migrate

5. Запустите сервер Redis

Этот проект использует Redis в качестве канала для сообщений в реальном времени. Убедитесь, что Redis сервер запущен. Вы можете запустить его с помощью следующей команды:

redis-server

6. Запустите сервер Daphne

Daphne является ASGI-сервером для обработки асинхронных запросов, таких как WebSocket. Запустите Daphne с командой:


daphne -u /tmp/daphne.sock messenger.asgi:application --port 8001

7. Запустите сервер Django

Запустите сервер разработки Django:

python manage.py runserver

Теперь ваш сервер Django должен быть доступен по адресу http://localhost:8000.

8. Откройте приложение в браузере

Перейдите по адресу http://localhost:8000 в вашем веб-браузере, чтобы использовать мессенджер.

Описание

API для взаимодействия:
/api/users/ — список пользователей.
/api/users/me/ — информация о текущем пользователе.
/api/chats/ — список чатов.
/api/chats/<int:chat_id>/messages/ — сообщения в чате.
/api/login/ — аутентификация пользователя.

Тесторые пользователи и чат:
Тестовые пользователи в БД:
username: test1
password: QWERTYU12345

username: test2
password: QWERTYU12345

Тестовый чат (прежде чем отправлять сообщения, нужно выбрать чат иначе будет ошибка!):
Test_chat1

После нажатия на Test_chat1, можно писать в чате. Также, можно создавать новые чаты, в графе Chat Name: написать имя чата и нажать на кнопку create chat, он появится в списке

Примечания
Убедитесь, что порты 8001 и 8000 доступны на вашем компьютере.
Вы можете изменить настройки порта и других параметров в файлах конфигурации, если это необходимо.
