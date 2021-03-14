## Directory cli-client   

---   

Use of virtual_env is recommended.

- Install dependecies from requirements.txt   
`python3 -m pip3 download -r requirements.txt`   
 This will only download the packages to the current folder, not install them.   
 For each new install   
 `python3 -m pip3 install -r requirements.txt`   
- Execute install.sh  

For some basic unit-testing   
- Result and output of failed tests  
`pytest -rx pkg/test_cli.py`  
- Show captured output of passed tests  
`pytest -rP pkg/test_cli.py`  
