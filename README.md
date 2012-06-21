[burgerto.me](http://github.com/tfe/burgertome/)
================================================

An app written on top of the [TaskRabbit API](http://taskrabbit.github.com/) for getting In-N-Out burgers (and associated deliciousness) delivered as quickly and easily as possible.


Development
-----------

The app is set up to use a [Foreman](https://github.com/ddollar/foreman)-style `.env` file for setting up configuration variables. An example `.env` file is provided in `.env.example` and will be loaded automatically if you use Foreman to start your processes, and everything will just work:

### Web

    foreman run rails server

### Console

    foreman run rails console

Alternatively, if you don't want to use Foreman, you can set these environment variables on your own. Since Foreman is optional, it is not included in the `Gemfile`.


Contact
-------

Problems, comments, and pull requests all welcome. [Find me on GitHub.](http://github.com/tfe/)


Copyright
---------

Copyright © 2012 [Todd Eichel](http://toddeichel.com/) and [Loren Cheung](http://about.me/lorencheung). Released under the MIT License (see `LICENSE.txt`).
