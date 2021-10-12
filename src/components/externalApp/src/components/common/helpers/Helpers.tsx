import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import { ServerErrors } from '../../common';
import * as Sentry from '@sentry/browser';
import YAML from 'yaml';
import { useWindowSize } from './UseWindowSize';
import { useLocation } from 'react-router'
import { Link } from 'react-router-dom';

// export function showError(serverError, showToastOnUnknownError = true) {
//     if (serverError instanceof ServerErrors && Array.isArray(serverError.errors)) {
//         serverError.errors.map(({ userMessage, internalMessage }) => {
//             toast.error(userMessage || internalMessage);
//         });
//     } else {
//         Sentry.captureException(serverError);
//         if (showToastOnUnknownError) {
//             if (serverError.message) {
//                 toast.error(serverError.message);
//             } else {
//                 toast.error('Some Error Occurred');
//             }
//         }
//     }
// }

export function useEffectAfterMount(cb, dependencies) {
    const justMounted = React.useRef(true);
    React.useEffect(() => {
        if (!justMounted.current) {
            return cb();
        }
        justMounted.current = false;
    }, dependencies);
}

interface UseSize {
    x: number;
    y: number;
    height: number;
    width: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
    target: React.Ref<any>;
}

export function useSize(): UseSize {
    const targetRef = useRef(null);
    const { height: windowHeight, width: windowWidth } = useWindowSize();
    const [dimension, setDimension] = useState({
        x: 0,
        y: 0,
        height: 0,
        width: 0,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    });

    const target = useCallback((node) => {
        if (node === null) return;
        targetRef.current = node;
        return () => (targetRef.current = null);
    }, []);

    useEffect(() => {
        if (!windowWidth || !windowHeight || !targetRef.current) return;
        const { x, y, height, width, left, right, top, bottom } = targetRef.current.getBoundingClientRect();
        setDimension({ x, y, height, width, left, right, top, bottom });
    }, [windowHeight, windowWidth]);
    return {
        target,
        x: dimension.x,
        y: dimension.y,
        height: dimension.height,
        width: dimension.width,
        left: dimension.left,
        right: dimension.right,
        top: dimension.right,
        bottom: dimension.bottom,
    };
}

export function useJsonYaml(value, tabSize = 4, language = 'json', shouldRun = false) {
    const [json, setJson] = useState('');
    const [yaml, setYaml] = useState('');
    const [nativeObject, setNativeObject] = useState(null);
    const [error, setError] = useState('');
    const yamlParseConfig = {
        prettyErrors: true,
    };

    useEffect(() => {
        if (!shouldRun) return;
        let obj;
        let jsonError = null;
        let yamlError = null;
        if (language === 'json') {
            try {
                obj = JSON.parse(value);
                jsonError = null;
                yamlError = null;
            } catch (err) {
                jsonError = err;
                try {
                    obj = YAML.parse(value, yamlParseConfig);
                    jsonError = null;
                    yamlError = null;
                } catch (err2) {
                    yamlError = err2;
                }
            }
        } else {
            try {
                obj = YAML.parse(value, yamlParseConfig);
                jsonError = null;
                yamlError = null;
            } catch (err) {
                yamlError = err;
                try {
                    obj = JSON.parse(value);
                    jsonError = null;
                    yamlError = null;
                } catch (err2) {
                    jsonError = err2;
                }
            }
        }
        if (jsonError || yamlError) {
            setError(language === 'json' ? jsonError.message : yamlError.message);
        }
        if (obj && typeof obj === 'object') {
            setJson(JSON.stringify(obj, null, tabSize));
            setYaml(YAML.stringify(obj, { indent: tabSize }));
            setNativeObject(obj);
            setError('');
        } else {
            setNativeObject(null);
            if (jsonError || yamlError) {
                setError(language === 'json' ? jsonError.message : yamlError.message);
            } else {
                setError('cannot parse to valid object');
            }
        }
    }, [value, tabSize, language, shouldRun]);

    return [nativeObject, json, yaml, error];
}

export function noop() { }

export function copyToClipboard(str, callback = noop) {
    const listener = function (ev) {
        ev.preventDefault();
        ev.clipboardData.setData('text/plain', str);
    };
    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
    callback()
}
