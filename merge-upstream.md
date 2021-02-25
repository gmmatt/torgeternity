The development of torgeternity system is done on both a private and a public repository:
1. Public: https://github.com/gmmatt/torgeternity
1. Private: https://github.com/gmmatt/torgeternity-development

In order to work with **two** repositories one first need to have a single local directory connected to these two repositories.
In this setting: 
1. `origin`/`downstream` is the public repository (`torgeternity`).
1. `upstream` is development repository (`torgeternity-development`).

The command line to add a remote repository is the following (exeample for `upstream`):

`git remote add upstream https://github.com/gmmatt/torgeternity-development.git`

Each time `upstream` is updated one first need to update ones own development branch:

1. `git checkout development`
1. `git  pull upstream/development`
1. `git checkout master`
1. `git pull origin/master`
1. `git merge development --no-ff`
1. `git push  origin`
1. At that step you may create a new release on github (see below).
1. `git pull` # in order to get the release.
1. `git checkout development`
1. `git merge master`
1. `git push upstream`
1. `git push upstream --tags`

(This can be done simply from VSC)


Performing the release on github:

1. Locally: create `torgeternity.zip`, a zip file containing **every files and folders present at the top level of the repository**.
1. Start to "draft" a new release on github (right-hand side of the "code" dashboard).
1. Upload `torgeternity.zip` and `system.json` when proceeding to the release.

**Important**: Do not forget to increment the release number in`system.json` and tag the release accordingly.



