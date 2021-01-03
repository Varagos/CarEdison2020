import click

def user_format(ctx, param, value):
    if not(value.isalnum()):
        raise click.BadParameter('needs to be in alphanumeric format')


if __name__=='__main__':
    print(user_format('hel113'))
