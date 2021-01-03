import click
import os
import requests
from urllib3 import disable_warnings, exceptions


disable_warnings(exceptions.InsecureRequestWarning)


errors = {
    400: 'Bad request',
    401: 'Not authorized',
    402: 'No data'
}
error_keys = {400, 401, 402}


class User:
    """
        Makes calls to subprocesses with arguments
        and commands received from the CLI.
    """
    def __init__(self, home=None):
        self.home = os.path.abspath(home or '.')

    def user_format(self, ctx, param, value):
        if not value.isalnum():
            raise click.BadParameter('needs to be in alphanumeric format')

    def login_post(self):
        payload = {'username': 'admin', 'password': 'admin'}
        r = requests.post('https://localhost:8765/evcharge/api/login', data = payload, verify=False)
        res = r.json()
        st_code = r.status_code
        if st_code in error_keys:
            raise click.ClickException(errors[st_code])
        #r.raise_for_status()
        with open(self.home + '/softeng20bAPI.token', 'w+') as file:
            file.write(res['token'])


if __name__=='__main__':
    pass
