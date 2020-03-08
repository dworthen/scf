export const scfOptions = [
  {
    header: "Usage",
    content: "$ skaf <command> [options]"
  },
  {
    header: "Commands",
    content: [
      {
        name: "Create <template> [path]",
        description: "Scaffold out <template> to specified [path|.]"
      }
    ]
  },
  {
    header: "Global Options",
    optionList: [
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
      },
      {
        name: "version",
        description: "prints Skaf version.",
        alias: "v",
        type: Boolean
      }
    ]
  },
  {
    content: "$ skaf <command> --help"
  }
];

export const createOptions = [
  {
    header: "Usage",
    content: [
      "$ skaf create <template> [path]",
      "Scaffold <template> to [path|.]. Template may be a git repo following user/repo format."
    ]
  },
  {
    header: "Example",
    content: "skaf create dworthen/scf-static-site-template MyApp"
  }
];
