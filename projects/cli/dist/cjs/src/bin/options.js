"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = ["create"];
exports.minimistOptions = {
    string: ["configFile"],
    boolean: ["help", "version"],
    alias: {
        h: "help",
        c: "configFile",
        v: "version"
    },
    default: {
        configFile: "scf.config.js"
    }
};
exports.scfOptions = [
    {
        header: "Usage",
        content: "$ scf <command> [options]"
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
                type: Boolean
            },
            {
                name: "config-file",
                description: "specify config file.",
                alias: "c",
                type: String,
                defaultValue: "scf.config.js",
                typeLabel: "<file>"
            },
            {
                name: "version",
                description: "prints scf version.",
                alias: "v",
                type: Boolean
            }
        ]
    },
    {
        content: "$ scf <command> --help"
    }
];
exports.createOptions = [
    {
        header: "Usage",
        content: [
            "$ scf create <template> [path]",
            "",
            "Scaffold <template> to [path|.]. Template may be a git repo following user/repo format."
        ]
    },
    {
        header: "Example",
        content: "scf create dworthen/scf-static-site-template MyApp"
    }
];
//# sourceMappingURL=options.js.map