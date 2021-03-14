from setuptools import setup, find_packages

setup(
    name='cli-tool',
    version='0.1',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'Click',
        'requests',
    ],
    entry_points='''
        [console_scripts]
        ev_group42=pkg.cli:main
        ''',
)
