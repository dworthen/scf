export const scfOptions = [
  {
    header: "Usage",
    content: "$ skaf <command> [options]"
  },
  {
    header: "Commands",
    content: [
      {
        name: "create <template> [path]",
        description: "Scaffold out <template> to specified path [.]"
      },
      {
        name: "install <template> [name]",
        description: "install <template> with name [template]"
      }
    ]
  },
  {
    header: "Global Options",
    optionList: [
      {
        name: "version",
        description: "prints Skaf version.",
        alias: "v",
        type: Boolean,
        defaultValue: false
      },
      {
        name: "help",
        description: "Print this usage guide.",
        alias: "h",
        type: Boolean,
        defaultValue: false
      },
      {
        name: "config",
        description: "specify config file. [skaf.config.js]",
        type: String,
        defaultValue: "skaf.config.js",
        typeLabel: "<file>"
      }
    ]
  },
  {
    header: "Help",
    content: "$ skaf <command> --help"
  }
];

export const createOptions = [
  {
    header: "Usage",
    content: [
      "$ skaf create <template> [path]",
      "Scaffold <template> to path [.]. Template may be a git repo following user/repo format."
    ]
  },
  {
    header: "Options",
    optionList: [
      {
        name: "force",
        alias: "f",
        description: "overwrite existing files",
        type: Boolean,
        defaultValue: false
      }
    ]
  },
  {
    header: "Example",
    content: "skaf create dworthen/scf-static-site-template MyApp"
  }
];

export const installOptions = [
  {
    header: "Usage",
    content: [
      "$ skaf install <template> [as]",
      "Install <template> to path [.]. Template is a git repo following user/repo format."
    ]
  },
  {
    header: "Options",
    optionList: [
      {
        name: "global",
        alias: "g",
        description: "Install the template to global templates directory.",
        type: Boolean,
        defaultValue: false
      }
    ]
  },
  {
    header: "Example",
    content: [
      "skaf install dworthen/scf-static-site-template static-site -g",
      "Template can then be scaffolded using",
      "skaf create static-site"
    ]
  }
];
