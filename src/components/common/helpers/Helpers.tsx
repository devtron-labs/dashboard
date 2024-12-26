/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, useEffect, useCallback, useRef, RefObject, useLayoutEffect } from 'react'
import {
    showError,
    OptionType,
    DeploymentAppTypes,
    APIOptions,
    useWindowSize,
    APPROVAL_MODAL_TYPE,
    YAMLStringify,
    ACTION_STATE,
    DEFAULT_SECRET_PLACEHOLDER,
    ApiResourceGroupType,
    PluginDetailServiceParamsType,
    PipelineBuildStageType,
    SeverityCount,
} from '@devtron-labs/devtron-fe-common-lib'
import YAML from 'yaml'
import { Link, PromptProps } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { getDateInMilliseconds } from '../../../Pages/GlobalConfigurations/Authorization/APITokens/apiToken.utils'
import { ClusterImageList, ImageList, SelectGroupType } from '../../ClusterNodes/types'
import { K8SObjectType } from '../../ResourceBrowser/Types'
import {
    getAggregator as getAppDetailsAggregator,
    AggregationKeys,
    NodeType,
} from '../../v2/appDetails/appDetails.type'
import { getAggregator } from '../../app/details/appDetails/utils'
import { JUMP_TO_KIND_SHORT_NAMES, SIDEBAR_KEYS } from '../../ResourceBrowser/Constants'
import { AUTO_SELECT } from '../../ClusterNodes/constants'
import { PATTERNS } from '../../../config/constants'
import { ReactComponent as GitLab } from '../../../assets/icons/git/gitlab.svg'
import { ReactComponent as Git } from '../../../assets/icons/git/git.svg'
import { ReactComponent as GitHub } from '../../../assets/icons/git/github.svg'
import { ReactComponent as BitBucket } from '../../../assets/icons/git/bitbucket.svg'
import { ReactComponent as ICAWSCodeCommit } from '../../../assets/icons/ic-aws-codecommit.svg'
import { AppEnvLocalStorageKeyType, FilterParentType } from '@Components/ApplicationGroup/AppGroup.types'
import { APP_GROUP_LOCAL_STORAGE_KEY, ENV_GROUP_LOCAL_STORAGE_KEY } from '@Components/ApplicationGroup/Constants'
import { GetAndSetAppGroupFiltersParamsType, SetFiltersInLocalStorageParamsType } from './types'

let module
export type IntersectionChangeHandler = (entry: IntersectionObserverEntry) => void

export type IntersectionOptions = {
    root?: React.RefObject<Element>
    rootMargin?: string
    threshold?: number | number[]
    once?: boolean
    defaultIntersecting?: boolean
}

export function validateEmail(email) {
    const re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const result = re.test(String(email).toLowerCase())
    return result
}

/**
 * @deprecated use `useForm` from fe-common-lib.
 */
export function useForm(stateSchema, validationSchema = {}, callback) {
    const [state, setState] = useState(stateSchema)
    const [disable, setDisable] = useState(true)
    const [isDirty, setIsDirty] = useState(false)

    // Disable button in initial render.
    useEffect(() => {
        setDisable(true)
    }, [])

    // For every changed in our state this will be fired
    // To be able to disable the button
    useEffect(() => {
        if (isDirty) {
            setDisable(validateState(state))
        }
    }, [state, isDirty])

    // Used to disable submit button if there's an error in state
    // or the required field in state has no value.
    // Wrapped in useCallback to cached the function to avoid intensive memory leaked
    // in every re-render in component
    const validateState = useCallback(
        (state) => {
            // check errors in all fields
            const hasErrorInState = Object.keys(validationSchema).some((key) => {
                const isInputFieldRequired = validationSchema[key].required
                const stateValue = state[key].value // state value
                const stateError = state[key].error // state error
                return (isInputFieldRequired && !stateValue) || stateError
            })
            return hasErrorInState
        },
        [state, validationSchema],
    )

    function validateField(name, value): string | string[] {
        if (validationSchema[name]?.required) {
            if (!value) {
                return 'This is a required field.'
            }
        }

        function _validateSingleValidator(validator, value) {
            if (value && !validator.regex.test(value)) {
                return false
            }
            return true
        }

        // single validator
        const _validator = validationSchema[name]?.validator
        if (_validator && typeof _validator === 'object') {
            if (!_validateSingleValidator(_validator, value)) {
                return _validator.error
            }
        }

        // multiple validators
        const _validators = validationSchema[name]?.validators
        if (_validators && typeof _validators === 'object' && Array.isArray(_validators)) {
            const errors = []
            _validators.forEach((_validator) => {
                if (!_validateSingleValidator(_validator, value)) {
                    errors.push(_validator.error)
                }
            })
            if (errors.length > 0) {
                return errors
            }
        }

        return ''
    }

    const handleOnChange = useCallback(
        (event) => {
            setIsDirty(true)

            const { name, value } = event.target
            const error = validateField(name, value)
            setState((prevState) => ({
                ...prevState,
                [name]: { value, error },
            }))
        },
        [validationSchema],
    )

    const handleOnSubmit = (event) => {
        event.preventDefault()
        const newState = Object.keys(validationSchema).reduce((agg, curr) => {
            agg[curr] = { ...state[curr], error: validateField(curr, state[curr].value) }
            return agg
        }, state)
        if (!validateState(newState)) {
            callback(state)
        } else {
            setState({ ...newState })
        }
    }
    return { state, disable, handleOnChange, handleOnSubmit }
}

/**
 * @deprecated
 */
export function mapByKey<T = Map<any, any>>(arr: any[], id: string): T {
    if (!Array.isArray(arr)) {
        console.error(arr, 'is not array')
        return new Map() as T
    }
    return arr.reduce((agg, curr) => agg.set(curr[id], curr), new Map())
}

export function usePrevious(value) {
    const ref = useRef(null)

    useEffect(() => {
        ref.current = value
    }, [value])
    return ref.current
}

export function useWhyDidYouUpdate(name, props) {
    // Get a mutable ref object where we can store props ...
    // ... for comparison next time this hook runs.
    const previousProps = useRef({})

    useEffect(() => {
        if (previousProps.current) {
            // Get all keys from previous and current props
            const allKeys = Object.keys({ ...previousProps.current, ...props })
            // Use this object to keep track of changed props
            const changesObj = {}
            // Iterate through keys
            allKeys.forEach((key) => {
                // If previous is different from current
                if (previousProps.current[key] !== props[key]) {
                    // Add to changesObj
                    changesObj[key] = {
                        from: previousProps.current[key],
                        to: props[key],
                    }
                }
            })
        }

        // Finally update previousProps with current props for next hook call
        previousProps.current = props
    })
}

/**
 * @deprecated - Use from fe-common-lib
 */
export const useIntersection = (
    target: React.RefObject<Element> | Element | null,
    options: IntersectionOptions = {},
    callback?: IntersectionChangeHandler,
) => {
    const { defaultIntersecting, once, ...opts } = options
    const optsRef = useRef(opts)
    const [intersecting, setIntersecting] = useState(defaultIntersecting === true)
    const intersectedRef = useRef(false)

    useEffect(() => {
        if (!shallowEqual(optsRef.current, opts)) {
            optsRef.current = opts
        }
    })

    useEffect(() => {
        if (target == null) {
            return
        }

        const element = target instanceof Element ? target : target.current
        if (element == null) {
            return
        }

        if (once && intersectedRef.current) {
            return
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIntersecting(entry.isIntersecting)

                if (callback != null) {
                    callback(entry)
                }

                if (entry.isIntersecting) {
                    intersectedRef.current = true
                }

                if (once && entry.isIntersecting && element != null) {
                    observer.unobserve(element)
                }
            },
            {
                ...optsRef.current,
                root: optsRef.current.root != null ? optsRef.current.root.current : null,
            },
        )

        observer.observe(element)

        return () => {
            if (once && intersectedRef.current) {
                return
            }

            if (element != null) {
                observer.unobserve(element)
            }
        }
    }, [optsRef.current, target])

    return intersecting
}

/**
 * @deprecated
 */
export function useInterval(callback, delay) {
    const savedCallback = useRef(null)
    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current()
        }
        if (delay !== null) {
            const id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay])
}

/**
 * @deprecated
 */
export function shallowEqual(objA, objB) {
    if (objA === objB) {
        return true
    }

    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
        return false
    }

    const keysA = Object.keys(objA)
    const keysB = Object.keys(objB)

    if (keysA.length !== keysB.length) {
        return false
    }

    // Test for A's keys different from B.
    const bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB)
    for (let i = 0; i < keysA.length; i++) {
        if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
            return false
        }
    }

    return true
}

export function compareObjectLength(objA: any, objB: any): boolean {
    if (objA === objB) {
        return true
    }

    const isArrayA = Array.isArray(objA)
    const isArrayB = Array.isArray(objB)

    if ((isArrayA && !isArrayB) || (!isArrayA && isArrayB)) {
        return false
    }
    if (!isArrayA && !isArrayB) {
        return Object.keys(objA).length === Object.keys(objB).length
    }

    return objA.length === objB.length
}

export function deepEqual(configA: any, configB: any): boolean {
    try {
        if (configA === configB) {
            return true
        }
        if ((configA && !configB) || (!configA && configB) || !compareObjectLength(configA, configB)) {
            return false
        }
        let isEqual = true
        for (const idx in configA) {
            if (!isEqual) {
                break
            } else if (typeof configA[idx] === 'object' && typeof configB[idx] === 'object') {
                isEqual = deepEqual(configA[idx], configB[idx])
            } else if (configA[idx] !== configB[idx]) {
                isEqual = false
            }
        }
        return isEqual
    } catch (err) {
        showError(err)
        return true
    }
}

export function useOnline() {
    const [online, setOnline] = useState(navigator.onLine)
    useEffect(() => {
        function handleOnline(e) {
            setOnline(true)
        }

        function handleOffline(e) {
            setOnline(false)
        }
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return online
}

/**
 * @deprecated
 */
export function useKeyDown() {
    const [keys, setKeys] = useState([])
    useEffect(() => {
        document.addEventListener('keydown', onKeyDown)
        document.addEventListener('keyup', onKeyUp)
        return () => {
            document.removeEventListener('keydown', onKeyDown)
            document.removeEventListener('keyup', onKeyUp)
        }
    }, [keys])

    // another hook just to reset the key becayse Meta key on mac ignores all other keyUps while MetaKey is pressed.
    useDelayedEffect(clearKeys, 500, [keys.join('+')])

    function clearKeys() {
        if (keys.length) {
            setKeys([])
        }
    }

    const onKeyDown = ({ key }) => {
        setKeys((k) => Array.from(new Set(k).add(key)))
    }
    const onKeyUp = ({ key }) => {
        setKeys((ks) => ks.filter((k) => k !== key))
    }

    return keys
}

/**
 * @deprecated
 */
function useDelayedEffect(callback, delay, deps = []) {
    const timeoutRef = useRef(null)
    useEffect(() => {
        timeoutRef.current = setTimeout(callback, delay)
        return () => clearTimeout(timeoutRef.current)
    }, deps)
}

export function useJsonYaml(value, tabSize = 4, language = 'json', shouldRun = false) {
    const [json, setJson] = useState('')
    const [yaml, setYaml] = useState('')
    const [nativeObject, setNativeObject] = useState(null)
    const [error, setError] = useState('')
    const yamlParseConfig = {
        prettyErrors: true,
    }

    useEffect(() => {
        if (!shouldRun) {
            return
        }
        let obj
        let jsonError = null
        let yamlError = null
        if (language === 'json') {
            try {
                obj = JSON.parse(value)
                jsonError = null
                yamlError = null
            } catch (err) {
                jsonError = err
                try {
                    obj = YAML.parse(value, yamlParseConfig)
                    jsonError = null
                    yamlError = null
                } catch (err2) {
                    yamlError = err2
                }
            }
        } else {
            try {
                obj = YAML.parse(value, yamlParseConfig)
                jsonError = null
                yamlError = null
            } catch (err) {
                yamlError = err
                try {
                    obj = JSON.parse(value)
                    jsonError = null
                    yamlError = null
                } catch (err2) {
                    jsonError = err2
                }
            }
        }
        if (jsonError || yamlError) {
            setError(language === 'json' ? jsonError.message : yamlError.message)
        }
        if (obj && typeof obj === 'object') {
            setJson(JSON.stringify(obj, null, tabSize))
            setYaml(YAMLStringify(obj))
            setNativeObject(obj)
            setError('')
        } else {
            setNativeObject(null)
            if (jsonError || yamlError) {
                setError(language === 'json' ? jsonError.message : yamlError.message)
            } else {
                setError('cannot parse to valid object')
            }
        }
    }, [value, tabSize, language, shouldRun])

    return [nativeObject, json, yaml, error]
}

export function useEventSource(
    url: string,
    deps: any[],
    shouldRun,
    onMessage: (...args) => void,
    maxLength = 10000,
): EventSource {
    useWhyDidYouUpdate('props ', { url, deps, shouldRun, onMessage, maxLength })
    const eventSourceRef = useRef(null)

    function closeEventSource() {
        if (eventSourceRef.current?.close) {
            eventSourceRef.current.close()
        }
    }

    function handleMessage(event) {
        onMessage(event)
    }

    useEffect(() => {
        if (!shouldRun) {
            return
        }
        eventSourceRef.current = new EventSource(url, { withCredentials: true })
        eventSourceRef.current.onmessage = handleMessage
        return closeEventSource
    }, [...deps, shouldRun, url, maxLength])

    return eventSourceRef.current
}

export function useDebouncedEffect(callback, delay, deps: unknown[] = []) {
    // function will be executed only after the specified time once the user stops firing the event.
    const firstUpdate = useRef(true)
    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false
            return
        }
        const handler = setTimeout(() => {
            callback()
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [delay, ...deps])
}

interface UseSize {
    x: number
    y: number
    height: number
    width: number
    left: number
    right: number
    top: number
    bottom: number
    target: React.Ref<any>
}

export function useSize(): UseSize {
    const targetRef = useRef(null)
    const { height: windowHeight, width: windowWidth } = useWindowSize()
    const [dimension, setDimension] = useState({
        x: 0,
        y: 0,
        height: 0,
        width: 0,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    })

    const target = useCallback((node) => {
        if (node === null) {
            return
        }
        targetRef.current = node
        return () => (targetRef.current = null)
    }, [])

    useEffect(() => {
        if (!windowWidth || !windowHeight || !targetRef.current) {
            return
        }
        const { x, y, height, width, left, right, top, bottom } = targetRef.current.getBoundingClientRect()
        setDimension({ x, y, height, width, left, right, top, bottom })
    }, [windowHeight, windowWidth])
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
    }
}

export function getRandomString() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const sortObjectArrayAlphabetically = <T extends unknown>(arr: T[], compareKey: string) => {
    return arr.sort((a, b) => a[compareKey].localeCompare(b[compareKey]))
}

/**
 * @deprecated
 */
export function asyncWrap(promise): any[] {
    return promise.then((result) => [null, result]).catch((err) => [err])
}

export const Td = ({ children, to = null, ...props }) => {
    return (
        <td>
            {to ? (
                <Link to={to} {...props}>
                    {children}
                </Link>
            ) : (
                <div {...props}>{children}</div>
            )}
        </td>
    )
}

export const FragmentHOC = ({ children, ...props }) => {
    // passes props to children
    return <>{React.Children.map(children, (child) => React.cloneElement(child, { ...props }))}</>
}

export const sortOptionsByLabel = (optionA, optionB) => {
    if (optionA.label < optionB.label) {
        return -1
    }
    if (optionA.label > optionB.label) {
        return 1
    }
    return 0
}

export const sortOptionsByValue = (optionA, optionB) => {
    if (optionA.value < optionB.value) {
        return -1
    }
    if (optionA.value > optionB.value) {
        return 1
    }
    return 0
}

// Create instance of MutationObserver & watch for DOM changes until
// disconnect() is called.
export const watchDOMForChanges = (callback: (observer: MutationObserver) => void) => {
    const observer = new MutationObserver(() => {
        callback(observer)
    })

    observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
    })
}

// It'll watch DOM for changes & wait for the element to be mounted.
// Once element is presnt, it'll return it & stop watching for DOM changes.
export const elementDidMount = (identifier: string): Promise<unknown> => {
    return new Promise((resolve) => {
        const element = document.querySelector(identifier)
        if (element) {
            return resolve(element)
        }

        watchDOMForChanges((observer) => {
            if (document.querySelector(identifier)) {
                resolve(document.querySelector(identifier))
                observer.disconnect()
            }
        })
    })
}

// Setting expiry time in local storage for specified action key
export const setActionWithExpiry = (key: string, days: number): void => {
    localStorage.setItem(key, `${getDateInMilliseconds(days)}`)
}

/**
 * @deprecated
 */
export const preventBodyScroll = (lock: boolean): void => {
    if (lock) {
        document.body.style.overflowY = 'hidden'
        document.body.style.height = '100vh'
        document.documentElement.style.overflow = 'initial'
    } else {
        document.body.style.overflowY = null
        document.body.style.height = null
        document.documentElement.style.overflow = null
    }
}

// Creates object of arrays containing items grouped by item value of provided key
export const createGroupedItemsByKey = (arr: any[], key: string) => {
    return arr.reduce((prevObj, currentObj) => {
        return {
            ...prevObj,
            [currentObj[key]]: (prevObj[currentObj[key]] || []).concat(currentObj),
        }
    }, {})
}

export const filterImageList = (imageList: ClusterImageList[], serverVersion: string): ImageList[] => {
    if (!imageList) {
        return []
    }

    let nodeImageList = imageList.find((imageObj) => {
        const regex = new RegExp(imageObj.groupRegex)
        return regex.test(serverVersion)
    })

    if (!nodeImageList) {
        nodeImageList = imageList.find((imageObj) => {
            return imageObj.groupId === 'latest'
        })
    }

    return nodeImageList?.imageList || []
}

export const convertToOptionsList = (
    arr: any[],
    customLabel?: string,
    customValue?: string,
    customDescription?: string,
    customFieldKey?: string,
): OptionType[] => {
    if (!Array.isArray(arr) || !arr) {
        return []
    }
    return arr.map((ele) => {
        const _option = {
            label: customLabel ? ele[customLabel] : ele,
            value: customValue ? ele[customValue] : ele,
            description: customDescription ? ele[customDescription] : '',
        }

        if (customFieldKey) {
            _option[customFieldKey] = ele[customFieldKey] ?? ''
        }

        return _option
    })
}

export const importComponentFromFELibrary = (componentName: string, defaultComponent?, type?: 'function') => {
    try {
        let component = defaultComponent || null
        if (!module) {
            const path = '../../../../node_modules/@devtron-labs/devtron-fe-lib/dist/index.js'
            const modules = import.meta.glob(`../../../../node_modules/@devtron-labs/devtron-fe-lib/dist/index.js`, {
                eager: true,
            })
            module = modules[path]
        }
        if (module) {
            if (type === 'function') {
                component = module[componentName]
            } else {
                component = module[componentName]?.default
            }
        }
        return component
    } catch (e) {
        if (e['code'] !== 'MODULE_NOT_FOUND') {
            throw e
        }
        return defaultComponent || null
    }
}

export const getElapsedTime = (createdAt: Date) => {
    const elapsedTime = Math.floor((new Date().getTime() - createdAt.getTime()) / 1000)
    if (elapsedTime >= 0) {
        const days = Math.floor(elapsedTime / (24 * 60 * 60))
        const hrs = Math.floor((elapsedTime / (60 * 60)) % 24) // hrs mod (%) 24 hrs to get elapsed hrs
        const mins = Math.floor((elapsedTime / 60) % 60) // mins mod (%) 60 mins to get elapsed mins
        const secs = Math.floor(elapsedTime % 60) // secs mod (%) 60 secs to get elapsed secs

        const dh = `${days}d ${hrs}h`
            .split(' ')
            .filter((a) => !a.startsWith('0'))
            .join(' ')
        // f age is more than hours just show age in days and hours
        if (dh.length > 0) {
            return dh
        }
        // return age in minutes and seconds
        return `${mins}m ${secs}s`
            .split(' ')
            .filter((a) => !a.startsWith('0'))
            .join(' ')
    }
    return ''
}

export const clusterImageDescription = (nodeImageList: ImageList[], selectedImage: string): string => {
    const nodeImageObj = nodeImageList.find((obj) => {
        return obj.image === selectedImage
    })
    return nodeImageObj?.description || ''
}

export const processK8SObjects = (
    k8sObjects: ApiResourceGroupType[],
    selectedResourceKind?: string,
    disableGroupFilter?: boolean,
): { k8SObjectMap: Map<string, K8SObjectType>; selectedResource: ApiResourceGroupType } => {
    const _k8SObjectMap = new Map<string, K8SObjectType>()
    let _selectedResource: ApiResourceGroupType
    for (let index = 0; index < k8sObjects.length; index++) {
        const element = k8sObjects[index]
        const groupParent = disableGroupFilter
            ? element.gvk.Group
            : getAggregator(element.gvk.Kind, element.gvk.Group.endsWith('.k8s.io'))

        const shortNames = element.shortNames?.map((name) => name.toLowerCase()) ?? null
        const k8sObject = { namespaced: element.namespaced, gvk: { ...element.gvk }, shortNames }
        if (element.gvk.Kind.toLowerCase() === selectedResourceKind) {
            _selectedResource = structuredClone(k8sObject)
        }
        const currentData = _k8SObjectMap.get(groupParent)
        if (!currentData) {
            _k8SObjectMap.set(groupParent, {
                name: groupParent,
                isExpanded:
                    element.gvk.Kind !== SIDEBAR_KEYS.namespaceGVK.Kind &&
                    element.gvk.Kind !== SIDEBAR_KEYS.eventGVK.Kind &&
                    element.gvk.Kind !== SIDEBAR_KEYS.nodeGVK.Kind &&
                    element.gvk.Kind.toLowerCase() === selectedResourceKind,
                child: [k8sObject],
            })
        } else {
            currentData.child = [...currentData.child, k8sObject]
            if (element.gvk.Kind.toLowerCase() === selectedResourceKind) {
                currentData.isExpanded =
                    element.gvk.Kind !== SIDEBAR_KEYS.namespaceGVK.Kind &&
                    element.gvk.Kind !== SIDEBAR_KEYS.eventGVK.Kind &&
                    element.gvk.Kind !== SIDEBAR_KEYS.nodeGVK.Kind &&
                    element.gvk.Kind.toLowerCase() === selectedResourceKind
            }
        }
        if (element.gvk.Kind === SIDEBAR_KEYS.eventGVK.Kind) {
            JUMP_TO_KIND_SHORT_NAMES.events = shortNames
            SIDEBAR_KEYS.eventGVK = { ...element.gvk }
        }
        if (element.gvk.Kind === SIDEBAR_KEYS.namespaceGVK.Kind) {
            JUMP_TO_KIND_SHORT_NAMES.namespaces = shortNames
            SIDEBAR_KEYS.namespaceGVK = { ...element.gvk }
        }
        if (element.gvk.Kind === SIDEBAR_KEYS.nodeGVK.Kind) {
            JUMP_TO_KIND_SHORT_NAMES.node = shortNames
            SIDEBAR_KEYS.nodeGVK = { ...element.gvk }
        }
    }
    for (const [, _k8sObject] of _k8SObjectMap.entries()) {
        _k8sObject.child.sort((a, b) => a['gvk']['Kind'].localeCompare(b['gvk']['Kind']))
    }
    return { k8SObjectMap: _k8SObjectMap, selectedResource: _selectedResource }
}

export function createClusterEnvGroup<T>(
    list: T[],
    propKey: string,
    optionLabel?: string,
    optionValue?: string,
): { label: string; options: T[]; isVirtualEnvironment?: boolean }[] {
    const objList: Record<string, T[]> = list.reduce((acc, obj) => {
        const key = obj[propKey]
        if (!acc[key]) {
            acc[key] = []
        }
        acc[key].push(
            optionLabel
                ? {
                      label: obj[optionLabel],
                      value: obj[optionValue || optionLabel],
                      description: obj['description'],
                      isVirtualEnvironment: obj['isVirtualEnvironment'],
                      isClusterCdActive: obj['isClusterCdActive'],
                  }
                : obj,
        )
        return acc
    }, {})

    return Object.entries(objList)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, value]) => ({
            label: key,
            options: value,
            isVirtualEnvironment: value[0]['isVirtualEnvironment'], // All the values will be having similar isVirtualEnvironment
        }))
}

export const k8sStyledAgeToSeconds = (duration: string): number => {
    let totalTimeInSec: number = 0
    if (!duration) {
        return totalTimeInSec
    }
    // Parses time(format:- ex. 4h20m) in second
    const matchesNumber = duration.match(/\d+/g)
    const matchesChar = duration.match(/[dhms]/g)
    for (let i = 0; i < matchesNumber.length; i++) {
        const _unit = matchesChar[i]
        const _unitVal = +matchesNumber[i]
        switch (_unit) {
            case 'd':
                totalTimeInSec += _unitVal * 24 * 60 * 60
                break
            case 'h':
                totalTimeInSec += _unitVal * 60 * 60
                break
            case 'm':
                totalTimeInSec += _unitVal * 60
                break
            default:
                totalTimeInSec += _unitVal
                break
        }
    }
    return totalTimeInSec
}

export const eventAgeComparator = <T,>(key: string): any => {
    return (a: T, b: T) => k8sStyledAgeToSeconds(a[key]) - k8sStyledAgeToSeconds(b[key])
}

export const handleOnFocus = (e): void => {
    if (e.target.value === DEFAULT_SECRET_PLACEHOLDER) {
        e.target.value = ''
    }
}

/**
 * @deprecated
 */
export const highlightSearchedText = (searchText: string, matchString: string): string => {
    if (!searchText) {
        return matchString
    }
    try {
        const highlightText = (highlighted) => `<mark>${highlighted}</mark>`
        const escapedSearchText = searchText.replace(PATTERNS.ESCAPED_CHARACTERS, '\\$&') // Escape special characters handling
        const regex = new RegExp(escapedSearchText, 'gi')
        return matchString.replace(regex, highlightText)
    } catch (err) {
        return matchString
    }
}

export const trackByGAEvent = (category: string, action: string): void => {
    ReactGA.event({
        category,
        action,
    })
}

export const createGroupSelectList = (list, nodeLabel): SelectGroupType[] => {
    if (!list) {
        return []
    }
    let emptyHeadingCount = 0
    const objList: Record<string, OptionType[]> = list?.reduce((acc, obj) => {
        if (obj.nodeGroup) {
            emptyHeadingCount++
        }
        const key = obj.nodeGroup || 'Independent nodes'
        if (!acc[key]) {
            acc[key] = []
        }
        acc[key].push({ label: obj[nodeLabel], value: obj[nodeLabel] })
        return acc
    }, {})

    const groupList = Object.entries(objList).map(([key, value]) => ({
        label: emptyHeadingCount ? key : '',
        options: value,
    }))

    return [{ label: '', options: [AUTO_SELECT] }, ...groupList]
}

export const handleOnBlur = (e): void => {
    if (!e.target.value) {
        e.target.value = DEFAULT_SECRET_PLACEHOLDER
    }
}

export const parsePassword = (password: string): string => {
    return password === DEFAULT_SECRET_PLACEHOLDER ? '' : password.trim()
}

export const reloadLocation = () => {
    window.location.reload()
}

/**
 * @deprecated
 */
export function useHeightObserver(callback): [RefObject<HTMLDivElement>] {
    const ref = useRef(null)
    const callbackRef = useRef(callback)

    useLayoutEffect(() => {
        callbackRef.current = callback
    }, [callback])

    const handleHeightChange = useCallback(() => {
        callbackRef.current?.(ref.current.clientHeight)
    }, [callbackRef])

    useLayoutEffect(() => {
        if (!ref.current) {
            return
        }
        const observer = new ResizeObserver(handleHeightChange)
        observer.observe(ref.current)
        return () => {
            observer.disconnect()
        }
    }, [handleHeightChange, ref])

    return [ref]
}

export const getDeploymentAppType = (
    allowedDeploymentTypes: DeploymentAppTypes[],
    selectedDeploymentAppType: string,
    isVirtualEnvironment: boolean,
): string => {
    if (isVirtualEnvironment) {
        return DeploymentAppTypes.MANIFEST_DOWNLOAD
    }
    if (window._env_.HIDE_GITOPS_OR_HELM_OPTION) {
        return ''
    }
    if (
        selectedDeploymentAppType &&
        allowedDeploymentTypes.indexOf(selectedDeploymentAppType as DeploymentAppTypes) >= 0
    ) {
        return selectedDeploymentAppType
    }
    return allowedDeploymentTypes[0]
}

export const getNonEditableChartRepoText = (name: string): string => {
    return `Cannot edit chart repo "${name}". Some charts from this repository are being used by helm apps.`
}

export const getAPIOptionsWithTriggerTimeout = (options?: APIOptions): APIOptions => {
    const _options: APIOptions = options ? JSON.parse(JSON.stringify(options)) : {}
    if (window._env_.TRIGGER_API_TIMEOUT) {
        _options.timeout = window._env_.TRIGGER_API_TIMEOUT
    }

    return _options
}

export const getShowResourceScanModal = (selectedResourceKind: NodeType, isTrivyInstalled: boolean): boolean => {
    const fromWorkloadOrRollout =
        getAppDetailsAggregator(selectedResourceKind) === AggregationKeys.Workloads ||
        selectedResourceKind === NodeType.Rollout
    return window._env_.ENABLE_RESOURCE_SCAN && isTrivyInstalled && fromWorkloadOrRollout
}

export const getApprovalModalTypeFromURL = (url: string): APPROVAL_MODAL_TYPE => {
    if (url.includes(APPROVAL_MODAL_TYPE.DEPLOYMENT.toLocaleLowerCase())) {
        return APPROVAL_MODAL_TYPE.DEPLOYMENT
    }

    if (url.includes(APPROVAL_MODAL_TYPE.IMAGE_PROMOTION.toLocaleLowerCase())) {
        return APPROVAL_MODAL_TYPE.IMAGE_PROMOTION
    }

    return APPROVAL_MODAL_TYPE.CONFIG
}

export const getPluginIdsFromBuildStage = (
    stage: PipelineBuildStageType,
): PluginDetailServiceParamsType['pluginIds'] => {
    if (!stage?.steps?.length) {
        return []
    }

    const pluginIds = []
    stage.steps.forEach((step) => {
        if (step.pluginRefStepDetail?.pluginId) {
            pluginIds.push(step.pluginRefStepDetail.pluginId)
        }
    })

    return pluginIds
}
// Should contain git-codecommit.*.amazonaws.com
export const isAWSCodeCommitURL = (url: string = ''): boolean => {
    return url.includes('git-codecommit.') && url.includes('.amazonaws.com')
}

export const renderMaterialIcon = (url: string = '') => {
    if (url.includes('gitlab')) {
        return <GitLab className="dc__vertical-align-middle icon-dim-20" />
    }

    if (url.includes('github')) {
        return <GitHub className="dc__vertical-align-middle icon-dim-20" />
    }

    if (url.includes('bitbucket')) {
        return <BitBucket className="dc__vertical-align-middle icon-dim-20" />
    }

    if (isAWSCodeCommitURL(url)) {
        return <ICAWSCodeCommit className="dc__vertical-align-middle icon-dim-18" />
    }

    return <Git className="dc__vertical-align-middle icon-dim-20" />
}

export const getSeverityWithCount = (severityCount: SeverityCount) => {
    if (severityCount.critical) {
        return (
            <span className="severity-chip severity-chip--critical dc__w-fit-content">
                {severityCount.critical} Critical
            </span>
        )
    }
    if (severityCount.high) {
        return <span className="severity-chip severity-chip--high dc__w-fit-content">{severityCount.high} High</span>
    }
    if (severityCount.medium) {
        return (
            <span className="severity-chip severity-chip--medium dc__w-fit-content">{severityCount.medium} Medium</span>
        )
    }
    if (severityCount.low) {
        return <span className="severity-chip severity-chip--low dc__w-fit-content">{severityCount.low} Low</span>
    }
    if (severityCount.unknown) {
        return (
            <span className="severity-chip severity-chip--unknown dc__w-fit-content">
                {severityCount.unknown} Unknown
            </span>
        )
    }
    return <span className="severity-chip severity-chip--passed dc__w-fit-content">Passed</span>
}

// FIXME: Ideally whole branch calculations should be in fe-lib
export const getParsedBranchValuesForPlugin = (branchName: string): string => {
    if (!branchName) {
        return ''
    }

    if (window._env_.FEATURE_CD_MANDATORY_PLUGINS_ENABLE) {
        return `[${branchName}]`
    }

    return branchName
}

export const getAppFilterLocalStorageKey = (filterParentType: FilterParentType): AppEnvLocalStorageKeyType =>
    filterParentType === FilterParentType.app ? ENV_GROUP_LOCAL_STORAGE_KEY : APP_GROUP_LOCAL_STORAGE_KEY

export const getAndSetAppGroupFilters = ({
    filterParentType,
    resourceId,
    appListOptions,
    groupFilterOptions,
    setSelectedAppList,
    setSelectedGroupFilter,
}: GetAndSetAppGroupFiltersParamsType) => {
    const localStorageKey = getAppFilterLocalStorageKey(filterParentType)

    const localStorageValue = localStorage.getItem(localStorageKey)
    if (!localStorageValue) {
        return
    }
    try {
        const valueForCurrentResource = new Map(JSON.parse(localStorageValue)).get(resourceId)
        // local storage value for app list/ env list
        const localStorageResourceList = valueForCurrentResource?.[0] || []
        // local storage value for group filter
        const localStorageGroupList = valueForCurrentResource?.[1] || []

        const appListOptionsMap = appListOptions.reduce<Record<string, true>>((agg, curr) => {
            agg[curr.value] = true
            return agg
        }, {})

        const groupFilterOptionsMap = groupFilterOptions.reduce<Record<string, true>>((agg, curr) => {
            agg[curr.value] = true
            return agg
        }, {})

        // filtering local storage lists acc to new appList/ envList or groupFilterList as local values might be deleted or does not exist anymore
        const filteredLocalStorageResourceList = localStorageResourceList.filter(
            ({ value }) => appListOptionsMap[value],
        )
        const filteredLocalStorageGroupList = localStorageGroupList.filter(({ value }) => groupFilterOptionsMap[value])

        // this means last selected group filter has been deleted
        if (!!localStorageGroupList.length && !filteredLocalStorageGroupList.length) {
            setSelectedAppList([])
            setSelectedGroupFilter([])
            setAppGroupFilterInLocalStorage({ filterParentType, resourceId, resourceList: [], groupList: [] })
            return
        }

        setSelectedAppList(filteredLocalStorageResourceList)
        setSelectedGroupFilter(filteredLocalStorageGroupList)
    } catch {
        localStorage.setItem(localStorageKey, '')
    }
}

export const setAppGroupFilterInLocalStorage = ({
    filterParentType,
    resourceId,
    resourceList,
    groupList,
}: SetFiltersInLocalStorageParamsType) => {
    const localStorageKey = getAppFilterLocalStorageKey(filterParentType)
    try {
        const localStorageValue = localStorage.getItem(localStorageKey)
        const localStoredMap = new Map(localStorageValue ? JSON.parse(localStorageValue) : null)
        localStoredMap.set(resourceId, [resourceList, groupList])
        // Set filter in local storage as Array from Map of resourceId vs [selectedAppList, selectedGroupFilter]
        localStorage.setItem(localStorageKey, JSON.stringify(Array.from(localStoredMap)))
    } catch {
        localStorage.setItem(localStorageKey, '')
    }
}
