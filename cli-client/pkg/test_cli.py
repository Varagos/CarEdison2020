from click.testing import CliRunner
#from pkg import cli
from pkg.cli import main
import os
from pathlib import Path

def test_cli():
    runner = CliRunner()
    #--------------------------------------------------------------------------------------------------

    #Login unit testing
    #Login username-only alphanumeric values allowed --> Fail
    result = runner.invoke(main, 'login --username $##admin$-/ --passw petrol4ever')
    assert result.exit_code != 0
    print(result.output)

    #Login passwrd-space not allowed --> Fail
    result = runner.invoke(main, 'login --username admin --passw petrol 4ever')
    assert result.exit_code != 0
    print(result.output)

    #Valid login credentials
    result = runner.invoke(main, 'login --username admin --passw petrol4ever')
    assert result.exit_code == 0
    print(result.output)

    #-------------------------------------------------------------------------------------------------------

    #Healthcheck
    result = runner.invoke(main, 'healthcheck')
    assert result.exit_code == 0
    print(result.output)

    with open(os.path.abspath(Path.home()) + '/softeng20bAPI.token', 'r') as file:
        token = file.readline()
    print(type(token), token)
    #PerPoint-json
    result = runner.invoke(main, 'SessionsPerPoint --point 314 --datefrom 20191010 --dateto 20191212 --format json --apikey ' + token)
    print(result.output)
    assert result.exit_code == 0
    #CSV
    result = runner.invoke(main, 'SessionsPerPoint --point 314 --datefrom 20191010 --dateto 20191212 --format csv --apikey ' + token)
    print(result.output)
    assert result.exit_code == 0

    #PerStation-json
    result = runner.invoke(main, 'SessionsPerStation --station 2388 --datefrom 20191010 --dateto 20191212 --format json --apikey ' + token)
    print(result.output)
    assert result.exit_code == 0
    #csv
    result = runner.invoke(main, 'SessionsPerStation --station 2388 --datefrom 20191010 --dateto 20191212 --format csv --apikey ' + token)
    print(result.output)
    assert result.exit_code == 0

    #PerEV-json
    result = runner.invoke(main, 'SessionsPerEV --ev 67 --datefrom 20191010 --dateto 20191212 --format json --apikey ' + token)
    print(result.output)
    assert result.exit_code == 0
    #csv
    result = runner.invoke(main, 'SessionsPerEV --ev 67 --datefrom 20191010 --dateto 20191212 --format csv --apikey ' + token)
    print(result.output)
    assert result.exit_code == 0

    #PerProvider
    result = runner.invoke(main, 'SessionsPerProvider --provider 1 --datefrom 20191212 --dateto 20191212 --format json --apikey ' + token)
    print(result.output)
    assert result.exit_code == 0
    #csv
    result = runner.invoke(main, 'SessionsPerProvider --provider 1 --datefrom 20191212 --dateto 20191212 --format csv --apikey ' + token)
    print(result.output)
    assert result.exit_code == 0


    #Logout
    result = runner.invoke(main, 'logout --apikey ' + token)
    assert result.exit_code == 0
    assert 'Successful logout' in result.output
    print(result.output)

