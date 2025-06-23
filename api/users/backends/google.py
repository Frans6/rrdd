import requests
from users.models import User
from django.db import transaction, IntegrityError


class GoogleOAuth2:
    GOOGLE_OAUTH2_PROVIDER = 'https://www.googleapis.com/oauth2/v3'

    @classmethod
    def get_user_data(cls, access_token: str) -> dict | None:
        if not access_token:
            return None

        user_info_url = cls.GOOGLE_OAUTH2_PROVIDER + '/userinfo'
        params = {'access_token': access_token}

        try:
            response = requests.get(user_info_url, params=params)

            if response.status_code == 200:
                user_data = response.json()
                return user_data
            else:
                return None
        except requests.exceptions.RequestException as e:  # pragma: no cover
            return None

    @staticmethod
    def do_auth(user_data: dict) -> User | None:
        try:
            with transaction.atomic():
                user, _ = User.objects.get_or_create(
                    email=user_data['email'],
                    username=user_data['email']
                )

                if user_data.get('given_name'):
                    user.first_name = user_data['given_name']

                if user_data.get('family_name'):
                    user.last_name = user_data['family_name']

                if user_data.get('picture'):
                    user.picture_url = user_data['picture']

                user.save()

                return user
        except IntegrityError:
            # Handle the case where the user was created by another process
            return User.objects.get(email=user_data['email'])
