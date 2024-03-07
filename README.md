# SCF - Simple project and file scaffolding

Scaffold this repo's contents to `./testing` directory.

```bash
scf dworthen/scf ./testing
```

Scaffold subdirectory.

```bash
scf dworthen/scf/scripts ./testing
```

Scaffold specific file to current directory.

```bash
scf dworthen/scf/README.md
```

Scaffold from private repo with GitHub PAT.

```bash
scf OWNER/PRIVATE-REPO --gh-token TOKEN...
# Or by setting SCF_GH_TOKEN
SCF_GH_TOKEN=TOKEN scf ...
```

Scaffold from local templates

```bash
scf ./templates/controller ./controllers/
```

## Features

- Scaffold repos, directories, and files from GitHub.
- Scaffold local templates.
- Scaffold private GitHub repos with the use of GitHub Personal Access Tokens.
- User prompts.
- File templating.
- Conditional scaffolding.

## Inspiration

Inspired by [degit](https://github.com/Rich-Harris/degit) with some differences:

- SCF uses the GitHub API and does not depend on git.
- Since it uses the GitHub API, SCF does not support other git hosts.
- Supports private GitHub repos with the use of GitHub PATs.
- Supports prompts, templating, and conditional scaffolding.
- Supports scaffolding from local sources. Think scaffolding out repeatable boilerplate code that may be specific to a project, such as components, controllers, models, services, or file patterns to aid open source contributors, etc. The templates can be within a project repo and checked into source control that way all developers can use the same templates and patterns for new files.

## Installation

### NPM

```
npm install @d-dev/scf -g
```

### Binaries

#### Windows

```powershell
curl -sSfL https://raw.githubusercontent.com/dworthen/scf/main/scripts/install.ps1 | pwsh -Command -
```

This will install `scf` to `~/bin`, be sure to export the location in the user or machine `$PATH` or use the `-to` flag to specify a download location.

Running the installer with additional flags:

```powershell
curl -sSfL https://raw.githubusercontent.com/dworthen/scf/main/scripts/install.ps1 -o install.ps1 &&
pwsh -File install.ps1 -force -tag v0.0.1 -to ~/bin &&
rm install.ps1
```

#### Linux/Darwin

```bash
curl -sSfL https://raw.githubusercontent.com/dworthen/scf/main/scripts/install.sh | bash
```

This will install `scf` to `~/bin`, be sure to export the location in the user `$PATH or use the `-to` flag to specify a download location.

Running the installer with additional flags:

```bash
curl -sSfL https://raw.githubusercontent.com/dworthen/scf/main/scripts/install.sh | bash -s -- --force --tag v0.0.1 --to ~/bin
```

### From Source with [Go](https://go.dev/)

```bash
go install github.com/dworthen/scf@latest
```

## Usage

Scaffold from remote GitHub repo.

```bash
scf REPO_OWNER/REPO[/OPTIONAL_SUB_DIRECTORY_OR_FILE] ./destination
```

Or from a local template

```bash
scf ./local/templates/some_template_dir_or_file ./destination
```

### Options

- `--gh-token`: GitHub Personal Access Token. defaults to `$SCF_GH_TOKEN`

### Help

```bash
scf help
```

## GitHub Personal Access Tokens

SCF uses the GitHub API which is [rate limited to 60 requests per hour](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#primary-rate-limit-for-unauthenticated-users) for unauthenticated guests. [GitHub personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) can be used to get around the rate limiting or to scaffold from private GitHub repos. A token can be provided through the use of the `--gh-token` flag or by setting the `SCF_GH_TOKEN` environment variable. The token needs repository read access.

## Creating Project Templates

SCF supports scaffolding out any local directory or remote repo. Nothing special needs to be done to the source directory/files in order to be scaffoldable but SCF does suppot additional features such as user prompts, file templates, and condtional scaffolding. These features are declared in a single config file, `scf.config.json`. If present in the source project, SCF will read in the config and act accordingly.

An example use case may be a javascript project template that support scaffolding out either a JavaScript project structure or a TypeScript project structure. When scaffolding out the files, SCF may prompt users on whether or not the project should use TypeScript and then conditionally scaffold out the appropriate files.

## Prompts

### Prompt Type

- `variableName` (string) [Required]: The name of the variable for storing the user response.
- `type` (string) [Required]: `prompt` | `choose` | `password` | `yn` | `yesno`
- `default` (string|boolean|number) [Optional]: default value for the prompt. The type should correspond to the type of prompt.
- `message` [Required]: The message to prompt the user.
- `options` [Required if type == `choose`]: Options to present for the `choose` type prompt.
- `required` [Optional]: A boolean to indicate if an answer is required. Defaults to `false`

### Example

**REPO_OWNER/REPO/scf.config.json**

```json
{
  "prompts": [
    {
      "variableName": "projectName",
      "type": "prompt",
      "message": "Project Name",
      "required": true
    }
  ]
}
```

Running `scf REPO_OWNER/REPO` will then prompt the user for a project name.

The `scf.config.json` may appear in subdirectories. This is helpful if one wishes to house multiple project templates in a single repo. Running `scf OWNER/REPO/sub/directory` will use the `scf.config.json` config at that location if one is present. The `scf.config.json` file itself is never scaffolded out into the destination.

## Templates

Prompts on their own are not that useful. SCF supports file templating with [handlebars](https://handlebarsjs.com/) through the use of [mailgun/raymond](https://github.com/mailgun/raymond). Any file ending in `.hbs` will be processed as a handlebars file during scaffolding and made available the prompt responses. The `.hbs` extension is stripped from the output filename.

### Example

**Project Structure**

```bash
|-- Project
    |-- templates
        |-- react-component
            |-- {{componentName}}.jsx.hbs
            |-- scf.config.json
    |-- src
        |-- components
```

**./templates/react-component/scf.config.json**

```json
{
  "prompts": [
    {
      "variableName": "componentName",
      "type": "prompt",
      "message": "Component Name",
      "required": true
    }
  ]
}
```

**./templates/react-component/{{componentName}}.jsx**

```hbs
export const {{componentName}} = function {{componentName}}() {
  return <></>
}
```

Running `scf ./templates/react-component ./src/components` within the project root will prompt the user for a component name and then use that name to create `./src/components/COMPONENT_NAME.jsx`. This example demonstrates using handlebars for file naming as well as file contents. Handlebars can be used anywhere in the file path for dynamically naming directories or files.

Be sure to view the full list of [built in handlebar helpers](https://github.com/mailgun/raymond?tab=readme-ov-file#built-in-helpers) made available by mailgun/raymond.

### Additional Handlebar Helpers

SCF provides a few additional handlebar helpers for convenience.

#### tif (ternary if)

This helper acts as a modified ternary if expression. Both the false and true values are optional. If the false value is not provided and the expression evaluates to false then an empty string is returned. If the truth value is not provided then the expression resolves to the variable value if "truthy" else an empty string.

```js
// Resolves to "true" if someVar is truthy else "false"
{{tif someVar "true" "false" }}

// Resolve to "true" if someVar is truthy else ""
{{tif someVar "true"}}

// Resolves to the value of someVar if truthy else ""
{{tif someVar}}
```

#### ntif (the negation of tif)

Since handlebar expressions do not support negation, `ntif` is a convenience to check the negation of a variable.

```js
// Equivalent to !someVar ? "true" : "false"
{{ntif someVar "true" "false"}}

// Like tif, the false and true values are optional
{{ntif someVar "ok"}}
{{ntif someVar}}
```

[View the docs](https://github.com/mailgun/raymond?tab=readme-ov-file#istrue) on what is considered "truthy" in handlebars.

## Conditional Scaffolding

By default, scf will scaffold out all subdirectories and files present in the source to the destination except for the `scf.config.json` config file. The config supports an optional `files` field for specifying which files should be scaffolded and under which conditions.

### File Specifier Type

- `files` (Array<string|glob>) [Required]: An array of strings or globs specifying which files should be scaffolded.
- `condition` (string|handlebars expression) [Optional]: A string or handlebars expression indicating when the associated files should be scaffolded. The files will only be scaffolded if the condition results in the string "true".
- "workingDirectory" (string) [Optional]: A subdirectory relative to the `scf.config.json` file where the files list will be evaluated. The working directory itself will not be scaffolded out to the destination.

### Example

**Project Structure**

```bash
|-- REPO_OWNER/REPO
    |-- templates
        |-- javascript-project
            |-- typescript
                |-- typescript files to scaffold...
            |-- javascript
                |-- javascript files to scaffold...
            |-- scf.config.json
```

**REPO_OWNER/REPO/javascript-project/scf.config.json**

```json
{
  "prompts": [
    {
      "variableName": "useTypescript",
      "type": "yesno",
      "default": false,
      "message": "Use TypeScript?",
      "required": true
    },
  ],
  "files": [
    {
      "condition": "{{tif useTypescript}}",
      "workingDirectory": "typescript",
      "files": [
        "**/*"
      ]
    },
    {
      "condition": "{{ntif useTypescript}}",
      "workingDirectory": "javascript",
      "files": [
        "**/*"
      ]
    }
  ]
}
```

Running `scf REPO_OWNER/REPO/templates/javascript-project ./my-project` will scaffold out either the contents of the `typescript` or `javascript` directory to `./my-project/` depending on the answer to the prompt. Only the contents are scaffolded out, the `typescript` or `javascript` directories themselves will not be scaffolded since the `workingDirectory` field was provided.

### An alternative approach to conditional scaffolding (not recommended)

If any of the handlebar expressions within file paths returns an empty string then that path and all subpaths is ignored and those files will not be scaffolded out. We can modify the above project structure example to

**Project Structure**

```bash
|-- REPO_OWNER/REPO
    |-- templates
        |-- javascript-project
            |-- {{tif useTypescript projectName}}
                |-- typescript files to scaffold...
            |-- {{ntif useTypescript projectName}}
                |-- javascript files to scaffold...
            |-- scf.config.json
```

**REPO_OWNER/REPO/javascript-project/scf.config.json**

```json
{
  "prompts": [
    {
      "variableName": "projectName",
      "type": "prompt",
      "message": "Project Name",
      "required": true
    },
    {
      "variableName": "useTypescript",
      "type": "yesno",
      "default": false,
      "message": "Use TypeScript?",
      "required": true
    },
  ]
}
```

Now running `scf REPO_ONWER/REPO/templates/javascript-project` will create a directory within the current working directory with the name stored in the `projectName` prompt and either scaffold out the typescript or javascript contents based on the prompt response.

I personally don't recommend this approach for conditionally scaffolding since it can lead to longer, messier file paths and makes it less clear as to which files will be scaffolded out and when. I prefer explicitly specifying how files should be scaffolded out within the config file.

## Examples

View the ./examples directory within this repo for more project template examples using prompts, handlebars templating, and conditional scaffolding.
