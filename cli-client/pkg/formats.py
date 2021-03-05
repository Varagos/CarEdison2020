# Standard Library
from csv import reader
import io
from io import StringIO
from itertools import islice
import json
import os
from urllib3 import disable_warnings, exceptions

# 3rd Party Libraries
import click
import pandas
from pygments import highlight, lexers, formatters
import requests




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
        #self.useCase_get(url)
        res = requests.get(url, verify = False)
        st_code = res.status_code
        if st_code in error_keys:
            raise click.ClickException(errors[st_code])
        if res.json()["status"] == 'OK':
            return True
        else:
            return False


    def resetsessions(self):
        url = f"{self.base_url}/admin/resetsessions"
        res = requests.post(url, verify = False)
        st_code = res.status_code
        if st_code in error_keys:
            raise click.ClickException(errors[st_code])
        if res.json()["status"] == 'OK':
            return True
        else:
            return False

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
            #pandas.options.display.width = 0
            str_buffer = StringIO(r.text)
            df = pandas.read_csv(str_buffer)
            print(df)
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

    def print_status(self, response):
        if response.status_code in error_keys:
            raise click.ClickException(errors[response.status_code])
        else:
            formatted_json = json.dumps(response.json(), indent=4)
            colorful_json = highlight(formatted_json,lexers.JsonLexer(), formatters.TerminalFormatter())
            click.echo(colorful_json)



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
        url = f'{self.base_url}/admin/system/sessionsupd'
        post_hdrs={
            'X-OBSERVATORY-AUTH': self._token
        }

        with open(input_file, 'rb') as f:
            response = requests.post(url, files={'file': f}, headers=post_hdrs, verify=False)
        self.print_status(response)


        with open(input_file, 'rb') as file_obj:
            csv_headers = next(file_obj)
            sessions_in_file = 0
            sessions_imported = 0
            click.echo("File uploading...")
            with click.progressbar(length = self.file_len(input_file)) as bar:
                for file_chunk, rows in self.file_chunks(file_obj, csv_headers):
                    b = io.BytesIO(file_chunk)
                    res = requests.post(url, files={'file': b}, headers=post_hdrs, verify=False)
                    if res.status_code in error_keys:
                        raise click.ClickException("Check csv file format-must include start,finish,energy,point_id,vehicle_id,payment_id,pricing_id")
                    else:
                        response = res.headers
                        print(response)

                    bar.update(rows)
        click.echo("File uploaded")



    def file_chunks(self, file_object, header, rows_chunk=100):
        while True:
            data = list(islice(file_object, rows_chunk))
            if not data:
                break
            final_list = [header] + data
            yield b"".join(final_list), len(data)


    def file_len(self, file_name):
        with open(file_name, 'r') as f:
            for i, l in enumerate(f):
                pass
            return i            #headers excluded


if __name__=='__main__':
    pass
