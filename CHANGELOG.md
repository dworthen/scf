# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.5.0"></a>
# [2.5.0](https://github.com/dworthen/scf/compare/v2.4.1...v2.5.0) (2019-07-31)


### Features

* Add includes operator ([69854f4](https://github.com/dworthen/scf/commit/69854f4))



<a name="2.4.1"></a>
## [2.4.1](https://github.com/dworthen/scf/compare/v2.4.0...v2.4.1) (2019-07-09)


### Bug Fixes

* Update dependencies ([0e450f0](https://github.com/dworthen/scf/commit/0e450f0))



<a name="2.4.0"></a>
# [2.4.0](https://github.com/dworthen/scf/compare/v2.3.1...v2.4.0) (2019-07-09)


### Features

* Add default command for scaffolding ([61daa4c](https://github.com/dworthen/scf/commit/61daa4c))



<a name="2.3.1"></a>
## [2.3.1](https://github.com/dworthen/scf/compare/v2.3.0...v2.3.1) (2019-07-07)


### Bug Fixes

* Improve documentation ([e3cf148](https://github.com/dworthen/scf/commit/e3cf148))



<a name="2.3.0"></a>
# [2.3.0](https://github.com/dworthen/scf/compare/v2.2.1...v2.3.0) (2019-07-07)


### Bug Fixes

* Add ejs template information to readme ([d817d91](https://github.com/dworthen/scf/commit/d817d91))


### Features

* Add ejs template support ([c0b9908](https://github.com/dworthen/scf/commit/c0b9908))



<a name="2.2.1"></a>
## [2.2.1](https://github.com/dworthen/scf/compare/v2.2.0...v2.2.1) (2019-07-06)


### Bug Fixes

* Bug scaffolding out app directory ([0631e31](https://github.com/dworthen/scf/commit/0631e31))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/dworthen/scf/compare/v2.1.3...v2.2.0) (2019-07-06)


### Bug Fixes

* List all local templates ([16b0e87](https://github.com/dworthen/scf/commit/16b0e87))


### Features

* Add rm command ([6cd4554](https://github.com/dworthen/scf/commit/6cd4554))



<a name="2.1.3"></a>
## [2.1.3](https://github.com/dworthen/scf/compare/v2.1.2...v2.1.3) (2019-07-06)


### Bug Fixes

* Update readme for version 2.x ([c0ab87c](https://github.com/dworthen/scf/commit/c0ab87c))



<a name="2.1.2"></a>
## [2.1.2](https://github.com/dworthen/scf/compare/v2.1.1...v2.1.2) (2019-07-06)


### Bug Fixes

* Install in current directory ([a6ce23a](https://github.com/dworthen/scf/commit/a6ce23a))



<a name="2.1.1"></a>
## [2.1.1](https://github.com/dworthen/scf/compare/v2.1.0...v2.1.1) (2019-07-05)


### Bug Fixes

* Package.json and blank contents bugs ([5569d12](https://github.com/dworthen/scf/commit/5569d12))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/dworthen/scf/compare/v2.0.0...v2.1.0) (2019-07-05)


### Bug Fixes

* Change logging to show info when debugging ([4357517](https://github.com/dworthen/scf/commit/4357517))


### Features

* Add --skip-filenames flag to create command ([578c5d1](https://github.com/dworthen/scf/commit/578c5d1))
* Add ability to create project folder ([4ae23ba](https://github.com/dworthen/scf/commit/4ae23ba))
* Update create command to install if needed ([fcf9c1b](https://github.com/dworthen/scf/commit/fcf9c1b))



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
