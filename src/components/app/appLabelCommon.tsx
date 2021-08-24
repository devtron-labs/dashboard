import { PATTERNS } from '../../config';

export function validateTags(tag) {
    var re = PATTERNS.APP_LABEL_CHIP;
    let regExp = new RegExp(re);
    let result = regExp.test(String(tag));
    return result;
}

export const TAG_VALIDATION_MESSAGE = {
     error: 'Please provide tags in key:value format only'
}

export const createOption = (label: string) => (
    {
        label: label,
        value: label,
    });