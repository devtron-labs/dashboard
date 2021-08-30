import { PATTERNS } from '../../config';
import React, { lazy, Suspense, useCallback, useRef, useEffect, useState } from 'react';

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

export function handleKeyDown(labelTags, setAppTagLabel, event) {

    labelTags.inputTagValue = labelTags.inputTagValue.trim();
    switch (event.key) {
        case 'Enter':
        case 'Tab':
        case ',':
            if (labelTags.inputTagValue) {
                setAppTagLabel()
            }
            if (event.key !== 'Tab') {
                event.preventDefault();
            }
            break;
    }
}