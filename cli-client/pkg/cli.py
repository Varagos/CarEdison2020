import click
from pkg import formats
from os.path import pardir, abspath, join
#from pathlib import Path


user_instance = formats.User(abspath(join(__file__, pardir, pardir, pardir)))
#user_instance = formats.User(Path.home())

@click.group()
def main():
    pass


@main.command()
@click.option('--format','form',
              type=click.Choice(['json', 'csv'], case_sensitive=False),#will be lowercase regardless 
              required=True,
              help='Select between csv or json.')
@click.option('--apikey', required=True,
              help='Enter your api key')
def healthcheck(form, apikey):
    """Confirm user and database connectivity."""
    click.echo(form)
    pass


@main.command()
@click.option('--format','form',
              type=click.Choice(['json', 'csv'], case_sensitive=False), required=True,
              help='Select between csv and json.')
@click.option('--apikey', required=True,
              help='Enter your api key')
def resetsessions(form, apikey):
    """
    Delete all data charging events.
    Initialize default admin account.
    """
    pass


@main.command()
@click.option('--username', required=True, prompt=True,
              callback=user_instance.user_format,
              help='Enter username')
@click.option('--passw', required=True, prompt=True, hide_input=True,
              help='Enter password')
@click.option('--format','form',
              type=click.Choice(['json', 'csv'], case_sensitive=False), required=True,
              help='Select between csv and json.')
@click.option('--apikey', required=True,
              help='Enter your api key')
def login(username, passw, form, apikey):
    """
    Allows user to log in to the database.
    """
    click.echo('Login has run')
    user_instance.login_post()



@main.command(name='SessionsPerPoint')
@click.option('--point', required=True,
              help='Unique ID of intended point')
@click.option('--datefrom', required=True,
              help='Starting date, DATE_FORMAT=YYYYMMDD')
@click.option('--dateto', required=True,
              help='Ending date, DATE_FORMAT=YYYYMMDD')
@click.option('--format','form',
              type=click.Choice(['json', 'csv'], case_sensitive=False), required=True,
              help='Select between csv and json')
@click.option('--apikey', required=True, help='Enter your api key')
def SessionsPerPoint(point, datefrom, dateto, form, apikey):
    """
    Shows a list describing charging events data
    for a specific Point during a time period.
    """
    pass
