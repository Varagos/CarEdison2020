import click
from pkg import formats
#from os.path import pardir, abspath, join
from pathlib import Path
from click_option_group import optgroup, RequiredMutuallyExclusiveOptionGroup, RequiredAllOptionGroup,AllOptionGroup
from pkg import adminMod


#user_instance = formats.User(abspath(join(__file__, pardir, pardir, pardir)))
user_instance = formats.User(Path.home())
format_help = 'Select between csv or json'
apikey_help = 'Enter your api key'


@click.group()
def main():
    pass


@main.command()
@click.option('--format','form',
              type=click.Choice(['json', 'csv'], case_sensitive=False),#will be lowercase regardless 
              required=True,
              help='Select between csv or json')
@click.option('--apikey', required=True,
              help='Enter your api key')
def healthcheck(form, apikey):
    """Confirm user and database connectivity."""
    click.echo(form)
    pass


@main.command()
@click.option('--format','form',
              type=click.Choice(['json', 'csv'], case_sensitive=False), required=True,
              help='Select between csv and json')
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
@click.option('--passw', required=True, prompt='Enter password', hide_input=True,
              callback=user_instance.password_format,
              help='Enter password')
@click.option('--format','form',
              type=click.Choice(['json', 'csv'], case_sensitive=False), required=True,
              help='Select between csv and json')
@click.option('--apikey', required=True,
              help='Enter your api key')
def login(username, passw, form, apikey):
    """
    Allows user to log in to the database.
    """
    user_instance.login_post(username, passw)
    click.echo('Your are successfully logged in')


@main.command()
@click.option('--format', 'form',
              type=click.Choice(['json','csv'], case_sensitive=False), required=True,
              help=format_help)
@click.option('--apikey', required=True, help=apikey_help)
def logout(form, apikey):
    """
        Logs user out of the database.

    """
    user_instance.logout_post()
    click.echo('Successful logout')


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
    user_instance.sessions_point_get(point,datefrom,dateto,form)



@main.command('Admin')
@optgroup.group('Main parameter',cls=RequiredMutuallyExclusiveOptionGroup,
                help='Only one option from this group can be set\n')
@optgroup.option('--usermod', is_flag=True,
                 help='Create new user/change password')
@optgroup.option('--users',
                 callback=user_instance.user_format,
                 help='Display user state')
@optgroup.option('--sessionsupd', is_flag=True,
                 help='Upload charging data events')
@optgroup.option('--healthcheck', is_flag=True,
                 help='Confirm user and database connectivity')
@optgroup.option('--resetsessions', is_flag=True,
                 help='Delete charging data events')
@optgroup.group('usermod',cls=AllOptionGroup,           #usermod
           help='Returns new API key on success')
@optgroup.option('--usermod', is_flag=True)
@optgroup.option('--username',
                 callback=user_instance.user_format)
@optgroup.option('--passw',
                 callback=user_instance.password_format)
@optgroup.group('users',cls=AllOptionGroup,             #users
                help='Display user state')
@optgroup.option('--users',
                callback=user_instance.user_format)
@optgroup.group('sessionsUpd',cls=AllOptionGroup,       #sessionsUpd
                help='Upload data charging events from a csv file')
@optgroup.option('--sessionsupd',is_flag=True)
@optgroup.option('--source', type=click.Path(exists=True, file_okay=True,
                                             readable=True,resolve_path=True),
                 help='Input file')
@click.option('--healthcheck', is_flag=True)
@click.option('--resetsessions', is_flag=True)
def admin(**params):
    admin_instance = adminMod.Admin(params, Path.home())
    admin_instance.resolve_state()

