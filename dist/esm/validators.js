"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notNull = (v1) => {
    return ((v1.value !== undefined && v1.value !== null) ||
        `${v1.name} is null or undefined.`);
};
exports.instanceOf = (v1, v2) => {
    return (v1.value instanceof v2.value || `${v1.name} is not instanceof ${v2.name}`);
};
exports.typeOf = (v1, v2) => {
    return typeof v1.value === v2 || `${v1.name} is not typeof ${v2}`;
};
exports.eq = (v1, v2) => {
    return v1 === v2 || `${v1.toString()} does not equal ${v2.toString()}`;
};
exports.neq = (v1, v2) => {
    return v1.value !== v2.value || `${v1.name} is equal to ${v2.name}`;
};
exports.gt = (v1, v2) => {
    return v1.value > v2.value || `${v1.name} is not greater than ${v2.name}`;
};
exports.gte = (v1, v2) => {
    return (v1.value >= v2.value ||
        `${v1.name} is not greater than or equal to ${v2.name}`);
};
exports.lt = (v1, v2) => {
    return v1.value < v2.value || `${v1.name} is not less than ${v2.name}`;
};
exports.lte = (v1, v2) => {
    return (v1.value <= v2.value || `${v1.name} is not less than or equal to ${v2.name}`);
};
exports.isError = (input) => {
    if (typeof input === "string") {
        return [true, new Error(input)];
    }
    return [false];
};
