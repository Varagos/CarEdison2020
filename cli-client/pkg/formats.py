import click

class User:
    """
        Makes calls to subprocesses with arguments
        and commands received from the CLI.
    """
    def user_format(self, ctx, param, value):
        if not value.isalnum():
            raise click.BadParameter('needs to be in alphanumeric format')


if __name__=='__main__':
    print(user_format('hel113'))
