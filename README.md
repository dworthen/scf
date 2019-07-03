# SCF

SCF provids a declarative way to build project scaffolders that include cli prompts.

At the most basic level, SCF will copy (scaffold) a directory from one location to another. As SCF copies files, it checks each file to see if it contains [YAML front matter](https://www.npmjs.com/package/yaml-front-matter). If it does, SCF prompts for input based on the YAML front matter. SCF supports [ES template strings](https://www.npmjs.com/package/es6-template-strings), allowing it to expand variables as it scaffolds out files. SCF uses YAML front matter to gather data through cli prompts and ES template strings to consume the data within templated files. 

# Usage

```
scf <command> [options]
```

**Commands**

- **Create \<name\> [as]**: Scaffolds out the named template.
- **install \<src\> [as]**: Installs template from github, gitlab or bitbucket.
- **list**: List available templates. 
- **link [src] [as]**: Link current directory to global templates directory.
- **help \<command>**: Display help for a specific command

**Global options**

- **-h, --help**: Display help
- **-V, --version**: Display version
- **--no-color**: Disable colors
- **--quiet**: Quiet mode - only display warn and error messages.
- **-v, --verbose**: Verbose mode - will also output debug messages.

# Example

Let's start by scaffolding out a simple, predefined static site template.

## 1. Install scf

```shell
npm install scf -g
```

> May also use `npx` instead of installing `scf` globally.

## 2. Scaffold template

```shell
scf create dworthen/scf-static-site-template#basic MyApp -s
```

> The `-s, --skip-filenames` option will skip prompting users for filenames. More on flags and cli usage later. 
>
> The `create` command will run the `install` command internally if the named template does not exist. Templates can be installed from github, gitlab and bitbucket and are installed to _~/.scf_ . SCF uses degit to install templates from github, gitlab and butbucket. View [Rich-Harris/degit](https://github.com/Rich-Harris/degit) for more information.

This command will scaffold out [dworthen/scf-static-site-template/tree/basic](https://github.com/dworthen/scf-static-site-template/tree/basic), is a simple static website template, to _MyApp_.

![Simple static site example](docs/images/example5.png)

The following structure now exist in _MyApp_. 

```
MyApp
|-- css
    |-- site.css
|-- js
    |-- app.js
|-- index.html
```

Which matches the contents of [dworthen/scf-static-site-template/tree/basic](https://github.com/dworthen/scf-static-site-template/tree/basic).

This is a straight forward example. None of the template files contain any YAML front matter so SCF just copies the project structure the desired location, _MyApp_, without prompting for any input.

# A more complete example

Let's scaffold a project template that will prompt for input, [dworthen/scf-static-site-template](https://github.com/dworthen/scf-static-site-template).

```shell
scf create dworthen/scf-static-site-template MyApp
```

This template contains YAML front matter so SCF will prompt for input during the scaffolding process.

![Example with prompts](docs/images/example6.png)

Notice we did not have to write the code for the cli prompts or instruct SCF on how to prompt for input. SCF prompts for input based on the YAML front matter of the scaffolded template.

The above command and responses produces the following structure. 

```
MyApp
|-- css
    |-- style.css
|-- scripts
    |-- bundle.js
|-- index.html
|-- package.json
```

> `cd MyApp && npm install && npm start` will start up a static file server accessible at `localhost:5000/index.html`.

Notice that the above structure does not quite match [dworthen/scf-static-site-template](https://github.com/dworthen/scf-static-site-template). 

```
dworthen/scf-static-site-template
|-- css
    |-- site.css
|-- js
    |-- app.js
|-- index.html
|-- package.json
```

For example, _site.css_ was renamed to _style.css_ during the scaffolding process and _app.js_ was not only renamed to _bundle.js_ but was also moved to _scripts/_. SCF let's you rename files and and even move them by using relative paths when scaffolding. 

How does SCF handle file references and links if files can be renamed and moved? Let's take a look at the outputed _MyApp/index.html_ for clues.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>My Awesome App</title>
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <h1>Hello Derek</h1>
    <script src="scripts/bundle.js"></script>
  </body>
</html>
```

Notice that the `link` and `script` elements reference the correct, renamed and moved files, _style.css_ and _scripts/bundle.js_ respectively. _MyApp/index.html_ also references some other information provided during the scaffolding process such as `My Awesome App` and `Derek`. 

Compare this to the templated file, [dworthen/scf-static-site-template/blob/master/index.html](https://github.com/dworthen/scf-static-site-template/blob/master/index.html).

```html
---
- filename: index.html
- name: title
  message: Document title
- name: name
  default: World
  message: Name to say hello to
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>${title ? title : "Basic HTML Template"}</title>
    <link rel="stylesheet" href="${files['css/site.css'].dest}" />
  </head>
  <body>
    <h1>Hello ${name}</h1>
    <script src="${files['js/app.js'].dest}"></script>
  </body>
</html>
```

Ignore the YAML front matter (content between the opening and closing `---`) for now. Notice that the html content contains `${}` throughout. This is [ES template string](https://www.npmjs.com/package/es6-template-strings) syntax, which allows us to reference variables.

Both `link` and `script` elements reference a `file` object instead of a static path. The file object is a global object accessible to all template files and represents a mapping of original file locations to the scaffolded out location. The following is the `file` object for the current example.

```js
{
  "css/sites.css": {
    dest: "css/style.css"
  },
  "js/app.js": {
    dest: "scripts/bundle.js"
  }
}
```

This allows us, as shown by the above _index.html_ template, to reference other files within a project template without knowing where the referenced files will end up after scaffolding.

# YAML Front Matter

In the previous example, the content between the opening and closing `---` is is called [YAML Front Matter](https://www.npmjs.com/package/yaml-front-matter). YAML front matter either holds import information for SCF or instructs SCF to prompt for input during the scaffolding process. 

## Prompts

Prompts take the following YAML shape.

- **name\<string> (required)**: The name of the variable that will store the user response.
- **type\<string> (optional)**: `[input]|number|confirm|list`. Type of prompt to display.
- **Choices\<string[]> (required with type=list)**: A list of choices to display when `type` is set to `list`.
- **messge\<string> (optional)**: Message to use when prompting for input.
- **default\<string> (optional)**: Default value if one is not provided.
- **pattern\<RegExp> (optionl)**: Regular expression used to validate user input. May be a string or, as in the above example, a js regular expression using the `!!js/regexp` label.
- **validate\<Function> (optional)**: A js function used to validate user input. Should return either `true` or a string to display when input does not satisfy requirements. Validate and pattern cannot be used together.

Example

```html
---
- name: greeting
  type: list
  choices:
    - Hello
    - Greetings
- name: person
  message: Person to say hello to.
  default: World
  pattern: !!js/regexp /^[A-Z]+.*/
- name: punctuationMark
  message: Define punctuation mark to use.
  validate: !!js/function >
    function(input) {
      return /^[.!]$/.test(input) || `Provided ${input}. Can only use \".\" or !`;
    }
---

<h1>${greeting} ${person}${punctuationMark}</h1>
```

The first prompt presents a list of choices, `Hello` and `Greetings`, and store the selected choice in a variable titled `greeting`.

The second prompt takes user input and ensures it passes the requirements defined by the `pattern` regular expression before storing it in a variable titled `person`.

The third prompt takes user input and validate it using the `validate` function instead of the `pattern` regular expression. `validate` is more flexible and can provide better feedback for when user input does not meet requirements.

Can use either `pattern` or `validate` to validate user input but not both at the same time. If neither `pattern` nor `validate` is defined then the input is optional and the user may leave the response blank.

## Reserved YAML keys

- **filename\<string> (optional)**: Define the filename, skipping user input when scaffolding. Useful for files that have signicant meaning such as _package.json_ or _webpack.config.js_. _package.json_ and _index.html_ in [dworthen/scf-static-site-template](https://github.com/dworthen/scf-static-site-template) demonstrate using `filename`.
- **skip<bool> (optional)**: if `true`, SCF will not scaffold out the file. 
- **conditions\<object[]> (optional)**: Defines a set of conditions for when the file should be scaffolded out. Conditions are checked against [global prompts](#global-prompts).
  - **conditions object**: 
    - **name\<string> (required)**: name of global prompt variable to check against.
    - **operator\<eq|neq|gt|gte|lt|lte> (required)**: defines how to check against global variable.
    - **value\<any> (required)**: value used to check against global variable.

# Conditional scaffolding

SCF supports conditional scaffolding. We can define conditions, declaratively, to dictate when a file will be scaffolded. For example, defining conditions for when a configuration file or build file will be scaffolded.

```yaml
---
# webpack.config.js
# Top level conditions are ORed
- conditions:
  # These conditions are ANDed
  - name: useBuildSystem
    operator: eq
    value: true
  - name: useWebpack
    operator: eq
    value: true
# OR
- conditions:
  - name: simpleScaffold
    operator: eq
    value: true
---

# File contents for webpack.config.js
```

SCF scaffolds out the above file if `(useBuildSystem === true && useWebpack === true) || simpeScaffold === true`. This is a contrived example but it demonstrates both ANDed and ORed conditionals. 

Conditions work by checking values against [global prompt](#global-prompts) variables. The global prompts, defined in _globals.yaml_, for this example:

```yaml
- name: useBuildSystem
  type: confirm
  message: Do you wish to use a build tool?
- name: useWebpack
  type: confirm
  message: Do you wish to use webpack?
- name: simpleScaffold
  type: confirm
  message: Do you not want to worry about configuration and just scaffold?
```

> _globals.yaml_ is a YAML file and does not need to contain opening and closing `---` as with files containing YAML front matter.

The _package.json_ and _globals.yaml_ files of [dworthen/scf-static-site-template](https://github.com/dworthen/scf-static-site-template) demonstrates conditional scaffolding.

# ES template strings

As we have seen, SCF uses [ES template strings](https://www.npmjs.com/package/es6-template-strings), `${}`, to interpolate variables.

Prompts defined within the YAML front matter of a file are available as variables within the templated file. For example, the following demonstrates that the `greeting` prompt variable is accessible as `greeting` within the templated file.

```html
---
- name: greeting
  type: list
  choices:
    - Hello
    - Greetings
---

<h1>${greeting} world!</h1>
```

Scaffolding out the above template results in a file containing

```html
<h1>Hello world!</h1>
```

[Global prompts](#global-prompts) are accessible in the same way that local variable prompts are.

On top of prompt variables, files have access to a list of predefined globals. Here is the list of global variables accessible to all template files.

- **src\<string>**: The path of the template source, e.g., _css/site.css_.
- **dest\<string>**: Where the file is going to be scaffolded, e.g., _css/style.css_.
- **__path\<object>**: a path object for the destination path as returned by [path.parse](https://nodejs.org/api/path.html#path_path_parse_path)
- **files\<object>**: An object that represents a mapping of template source paths to the selected scaffolded path.

  Example files object
  
  ```js
  {
    "path/to/template/source/file.ext": {
      "dest": "path/to/scaffolded/location/file.ext",
      "__path": { // path.parse object for destion path 
        "root": "",
        "dir": "path/to/scaffolded/location",
        "base": "file.ext",
        "ext": ".ext",
        "name": "file"
      } 
    }
  }
  ```

[dworthen/scf-static-site-template/blob/master/index.html](https://github.com/dworthen/scf-static-site-template/blob/master/index.html) demonstrates using the `files` object within the `link` and `scripts` elements to correctly reference other template files.

> ES templates support expressions but not statements. This means that ternary expressions are supported but `if` statements or loops are not supported.

# Global prompts

[Prompts](#prompts) defined in _globals.yaml_ will be prompted first when scaffolding and are available to all templated files. 

Global variables may also be used for [conditional scaffolding](#conditional-scaffolding). _package.json_ and _globals.yaml_ files of [dworthen/scf-static-site-template](https://github.com/dworthen/scf-static-site-template) demonstrate conditional scaffolding. 


# Special files

- **globals.yaml**: defines a list of global [prompts](#prompts) that will be accessible to all files and can be used for [conditional scaffolding](#conditional-scaffolding).
- **.scfignore**: [gitignore](https://git-scm.com/docs/gitignore) style ignore file. SCF will ignore files and directories listed in _.scfignore_ when scaffolding. May also define gitignore style ignore rules/globs as an array in `scfignore` key of _package.json_.

# Conditional scaffolding strategies

## Branch based

`scf create dworthen/scf-static-site-template#basic MyApp` and `scf create dworthen/scf-static-site-template MyApp` dmonstrates scaffolding different structures from one project template by targeting different branches. Notice that the two commands are almost identical. In both cases, [dworthen/scf-static-site-template](https://github.com/dworthen/scf-static-site-template) is getting scaffolded but one is tartargetig the basic branch and the other the master branch. The `create` and `install` commands target branches using `#BRANCH_NAME`. Master is the default branch.

Template developers can creae multiple branches to allow developers to scaffold out a variety of structures from one project template. For example, one could create `#webpack` and `#rollup` branches to scaffold out different build tools based on which branch the developer targets when running `scf create` or `scf install`. 

SCF uses degit to install templates from github, gitlab and butbucket. View [Rich-Harris/degit](https://github.com/Rich-Harris/degit) for more information on targeting specific branches and tags.

## YAML front matter

One can use [global prompts](#global-prompts) and YAML front matter to achieve file-based [conditional scaffolding](#conditional-scaffolding).

To continue our build tools example, we could use the following [global prompts](#global-prompts) (_globals.yaml_).

```yaml
- name: buildTool
  type: list
  choices:
    - webpack
    - rollup
```

Our template repo will then contain both a _webpack.config.js_ and _rollup.config.js_. Both files containing conditions to define when each should be scaffolded.

```js
---
- filename: webpack.config.js
- conditions
  - name: buildTool
    operator: eq
    value: webpack
---

// webpack.config.js
```

```js
---
- filename: rollup.config.js
- conditions
  - name: buildTool
    operator: eq
    value: rollup
---

// rollup.config.js
```

SCF scaffolds out the correct build tool config file based on which one the user selects during the scaffolding process. The advantage with this approach is that developers use the same `scf create username/repo <ProjectName>` command. SCF will then prompt the user for which build tool to use. No need to change the `username/repo` source or target a different branch based on which version one wishes to scaffold.  

# Creating an scf project template

1. Start with a project structure you want to scaffold. 
2. Add [global prompts](#global-prompts) variables with _globals.yaml_.
3. Add [YAML front matter](#yaml-front-matter) to files that need variables.
4. Add [ES template strings](#es-template-strings), `${VARIABLE_NAME}`, to replace static content with variables.
5. Add [_.scfignore_](#special-files) file to specify which files should not be scaffolded out by SCF. _readme_ files are good candidates for _.scfignore_.
6. Use. Can either upload to github and use `scf create username/repo <ProjectName>` Or you can run `scf link . TEMPLATE_NAME` within the template project directory. Then you can run `scf create TEMPLATE_NAME <ProjectName>` anywhere. `scf link` works like `npm link`, allowing you to install local templates as global templates and then scaffold them anywhere.

# Example SCF project templates

[dworthen/scf-static-site-template](https://github.com/dworthen/scf-static-site-template)

This example demonstrates [reserved YAML keys](#reserved-yaml-keys), [prompts](#prompts), [ES templates](#es-template-strings), [special files](#special-files), and [conditional scaffolding](#conditional-scaffolding)

<!-- # Types of scaffolding

Typically there are two types of templates to scaffold. 

1. **Project templates** are for scaffolding out an entire project, as in the above example. Project templates are good candidates for installing globally using `-g`. Again, the above example installs `dworthen/scf-static-site-template` as a global template using `-g` and renames it to `static-site`. From there, we can scaffold out `static-site` anywhere using `scf create static-site`.
2. **Component templates** are templates for scaffolding out individual aspects of a project. By component I mean any component of a project that gets created over and over again. Examples include scaffolding out a Model or Controller or View for some MVC framework. Or, scaffolding out consistent React class components. Component templates are great candidates for installing locally within the app project and can committed to source control. That way, all developers will have access to the same scaffolding templates and will create components that are stylistically consistent.  -->
