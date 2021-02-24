import click
import os
import requests
from urllib3 import disable_warnings, exceptions
import json
from pygments import highlight, lexers, formatters
from io import StringIO
from csv import reader
import pandas


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
        self.base_url = 'https://localhost:8765/evcharge/api'


    def user_format(self, ctx, param, value):
        if value is None:
            return
        if not value.isalnum():
            raise click.BadParameter('needs to be in alphanumeric format')
        return value


    def password_format(self, ctx, param, value):
        if value is None:
            return
        elif ' ' in value:
            raise click.BadParameter('cannot contain spaces')
        return value


    def healthcheck(self):
        url = f"{self.base_url}/admin/healthcheck"
        #print(url)
        self.useCase_get(url)


    def login_post(self, usern, passw):
        url = 'https://localhost:8765/evcharge/api/login'
        payload = {
            'username': usern,
            'password': passw
        }
        r = requests.post(url, data = payload, verify=False)
        st_code = r.status_code
        if st_code in error_keys:
            raise click.ClickException(errors[st_code])
        #r.raise_for_status()
        res = r.json()
        try:
            with open(self.home + '/softeng20bAPI.token', 'w+') as file:
                file.write(res['token'])
        except IOError as e:
            click.echo(f"I/O error({e.errno}): {e.strerror}")
            raise click.Abort


    def logout_post(self):
        url = 'https://localhost:8765/evcharge/api/logout'
        token = self.get_token()
        headers = {
            'X-OBSERVATORY-AUTH': token
        }
        r = requests.post(url, headers = headers, verify=False)
        st_code = r.status_code
        if st_code in error_keys:
            raise click.ClickException(errors[st_code])
        os.remove(self.home + '/softeng20bAPI.token')


    def sessions_point_get(self,pointId,dateFrom, dateTo,form):
        url =f'{self.base_url}/SessionsPerPoint/{pointId}/{dateFrom}/{dateTo}?format={form}'
        self.useCase_get(url, True, form)


    def sessions_station_get(self,stationId, dateFrom, dateTo, form):
        url = f'{self.base_url}/SessionsPerStation/{stationId}/{dateFrom}/{dateTo}?format={form}'
        self.useCase_get(url, True, form)


    def sessions_ev_get(self, evId, dateFrom, dateTo, form):
        url = f'{self.base_url}/SessionsPerEV/{evId}/{dateFrom}/{dateTo}?format={form}'
        self.useCase_get(url, True, form)


    def sessions_provider_get(self, providerId, dateFrom, dateTo, form):
        url = f'{self.base_url}/SessionsPerProvider/{providerId}/{dateFrom}/{dateTo}?format={form}'
        self.useCase_get(url, True, form)


    def useCase_get(self, url, reqAuthorization=False, form='json'):
        #print(url)
        headers = None
        if reqAuthorization:
            #token = self.get_token()
            token = self.apikey
            headers = {
                'X-OBSERVATORY-AUTH': token
            }
        r = requests.get(url, headers = headers, verify=False)
        st_code = r.status_code
        if st_code in error_keys:
            raise click.ClickException(errors[st_code])
        if form == 'json':
            formatted_json = json.dumps(r.json(), indent=4)
            colorful_json = highlight(formatted_json,lexers.JsonLexer(), formatters.TerminalFormatter())
            click.echo(colorful_json)
        elif form == 'csv':
            pandas.options.display.width = 0
            str_buffer = StringIO(r.text)
            df = pandas.read_csv(str_buffer)
            print(df)
            """
            str_buffer.seek(0)
            csv_reader = reader(str_buffer, delimiter=',')
            for row in csv_reader:
                #print('\t'.join(row).expandtabs(2))
                print('\t'.join(row))
            """
        else:
            click.echo('Unsupported format')
            raise click.Abort


    def get_token(self):
        try:
            with open(self.home + '/softeng20bAPI.token', 'r') as file:
                token = file.readline()
        except IOError as e:
            click.echo('Not currently logged in')
            raise click.Abort
        return token



class Admin(User):
    def __init__(self, params, home=None):
        super().__init__(home)
        self.params = params
        self._token = super().get_token()


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
            super().healthcheck()
        else:
            click.echo('--resetsessions inserted')


    def usermod_post(self):
        username = self.params['username']
        password = self.params['passw']
        url = f'{self.base_url}/admin/usermod/{username}/{password}'
        headers = {
            'X-OBSERVATORY-AUTH': self._token
        }
        r = requests.post(url, headers = headers, verify=False)
        st_code = r.status_code
        if st_code in error_keys:
            raise click.ClickException(errors[st_code])
        else:
            click.echo(r.text)


    def users_get(self):
        username = self.params['users']
        url = f'{self.base_url}/admin/users/{username}'
        headers = {
            'X-OBSERVATORY-AUTH': self._token
        }
        r = requests.get(url, headers = headers, verify=False)
        st_code = r.status_code
        if st_code in error_keys:
            raise click.ClickException(errors[st_code])
        else:
            res = r.json()
            res.pop('password')
            formatted_json = json.dumps(res, indent=4)
            colorful_json = highlight(formatted_json,lexers.JsonLexer(), formatters.TerminalFormatter())
            click.echo(colorful_json)


    def sessionsupd_post(self):
        input_file = self.params['source']
        click.echo(input_file)
        click.echo(self.is_csv(input_file))
        url = f'{self.base_url}/admin/system/sessionsupd'



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



if __name__=='__main__':
    pass
