export declare const commands: string[];
export declare const minimistOptions: {
    string: string[];
    boolean: string[];
    alias: {
        h: string;
        c: string;
        v: string;
    };
    default: {
        configFile: string;
    };
};
export declare const scfOptions: ({
    header: string;
    content: string;
    optionList?: undefined;
} | {
    header: string;
    content: {
        name: string;
        description: string;
    }[];
    optionList?: undefined;
} | {
    header: string;
    optionList: ({
        name: string;
        description: string;
        alias: string;
        type: BooleanConstructor;
        defaultValue?: undefined;
        typeLabel?: undefined;
    } | {
        name: string;
        description: string;
        alias: string;
        type: StringConstructor;
        defaultValue: string;
        typeLabel: string;
    })[];
    content?: undefined;
} | {
    content: string;
    header?: undefined;
    optionList?: undefined;
})[];
export declare const createOptions: ({
    header: string;
    content: string[];
} | {
    header: string;
    content: string;
})[];
