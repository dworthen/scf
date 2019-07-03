# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.0.0"></a>
# [2.0.0](https://github.com/dworthen/scf/compare/v1.0.1...v2.0.0) (2019-07-03)


### Bug Fixes

* Remove unnecessary fs package ([c8d1116](https://github.com/dworthen/scf/commit/c8d1116))


### Features

* Add conditional scaffolding ([bda9e1c](https://github.com/dworthen/scf/commit/bda9e1c))
* Change default local template directory ([7bce2c7](https://github.com/dworthen/scf/commit/7bce2c7))
* Remove --flatten flag ([3856d00](https://github.com/dworthen/scf/commit/3856d00))


### BREAKING CHANGES

* Change local template directory from
.scf-templates to .scf
* Remove ability to scaffold out flat file structures
from a directory structure.



<a name="1.0.1"></a>
## [1.0.1](https://github.com/dworthen/scf/compare/v1.0.0...v1.0.1) (2019-07-02)


### Bug Fixes

* Bug in installing templates without name ([0c932d6](https://github.com/dworthen/scf/commit/0c932d6))
* Bug in scaffolding global installed templates ([19521f3](https://github.com/dworthen/scf/commit/19521f3))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/dworthen/scf/compare/v0.2.0...v1.0.0) (2019-07-02)


### Bug Fixes

* Fix bug for installing from git ([2b95e68](https://github.com/dworthen/scf/commit/2b95e68))


### Features

* Add ability to initialize new template dir ([d692c14](https://github.com/dworthen/scf/commit/d692c14))
* Add short flag for templates. ([16ca463](https://github.com/dworthen/scf/commit/16ca463))
* Move global templates location ([52339d2](https://github.com/dworthen/scf/commit/52339d2))


### BREAKING CHANGES

* Updated the name for templates directory
from templates/ to .scf-templates/
* Global templates are now stored in the home
or temp directory instead of the global npm module.



<a name="0.2.0"></a>
# [0.2.0](https://github.com/dworthen/scf/compare/v0.1.0...v0.2.0) (2019-07-02)


### Features

* Add ability to install templates ([0dadcfe](https://github.com/dworthen/scf/commit/0dadcfe))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/dworthen/scf/compare/v0.0.1...v0.1.0) (2019-07-02)


### Features

* Add list command ([aaf49d7](https://github.com/dworthen/scf/commit/aaf49d7))



<a name="0.0.1"></a>
## 0.0.1 (2018-06-30)
