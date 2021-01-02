import click

@click.group()
def main():
    pass


@main.command()
@click.option('--form',
              help='Select between csv or json.')
@click.option('--apikey',
              help='Enter your api key')
def healthcheck(form, apikey):
    """Confirms user and db connectivity."""
    pass
