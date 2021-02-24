import click
import os
import requests
from urllib3 import disable_warnings, exceptions
import csv

disable_warnings(exceptions.InsecureRequestWarning)


errors = {
    400: 'Bad request',
    401: 'Not authorized',
    402: 'No data'
}
error_keys = {400, 401, 402}

class Admin:
    def __init__(self, params, home=None):
        self.home = os.path.abspath(home or '.')
        self.params = params
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
            self.sessionsupd_post()
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


    def sessionsupd_post(self):
        input_file = self.params['source']
        click.echo(input_file)
        click.echo(self.is_csv(input_file))



    def is_csv(self,infile):
        csv_fileh = open(infile, 'rb')
        try:
            dialect = csv.Sniffer().sniff(csv_fileh.read(1024))
            # Perform various checks on the dialect (e.g., lineseparator,
            # delimiter) to make sure it's sane

            # Don't forget to reset the read position back to the start of
            # the file before reading any entries.
        except csv.Error:
            # File appears not to be in CSV format; move along
            return False
        return True








