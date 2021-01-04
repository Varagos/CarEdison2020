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

class Admin:
    def __init__(self, param, home=None):
        self.home = os.path.abspath(home or '.')
        self.params = param
        self.base_url = 'https://localhost:8765/evcharge/api/admin'
        try:
            with open(self.home + '/softeng20bAPI.token', 'r') as file:
                token = file.readline()
        except IOError as e:
            click.echo('Not currently logged in')
            raise click.Abort
        self.token = token


    def resolve_state(self):
        if self.params['usermod']:
            click.echo('--Usermod inserted')
            self.usermod_post()
        elif self.params['users'] is not None:
            click.echo('--Users inserted')
            self.users_get()
        elif self.params['sessionsupd']:
            click.echo('--sessionsupd inserted')
        elif self.params['healthcheck']:
            click.echo('--healthcheck inserted')
        else:
            click.echo('--resetsessions inserted')


    def usermod_post(self):
        username = self.params['username']
        password = self.params['passw']
        url = f'{self.base_url}/usermod/{username}/{password}'
        headers = {
            'X-OBSERVATORY-AUTH': self.token
        }
        r = requests.post(url, headers = headers, verify=False)
        st_code = r.status_code
        if st_code in error_keys:
            raise click.ClickException(errors[st_code])
        else:
            click.echo(r.text)


    def users_get(self):
        username = self.params['users']
        url = f'{self.base_url}/users/{username}'
        headers = {
            'X-OBSERVATORY-AUTH': self.token
        }
        r = requests.get(url, headers = headers, verify=False)
        st_code = r.status_code
        if st_code in error_keys:
            raise click.ClickException(errors[st_code])
        else:
            res = r.json()
            click.echo(res['username'])
            #click echo apikey













