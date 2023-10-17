import React, { useState, useEffect, useCallback, useRef, useMemo, RefObject, useLayoutEffect } from 'react'
import {
    showError,
    useThrottledEffect,
    OptionType,
    DeploymentAppTypes,
    getLoginInfo,
} from '@devtron-labs/devtron-fe-common-lib'
import YAML from 'yaml'
import { useWindowSize } from './UseWindowSize'
import { Link } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { getDateInMilliseconds } from '../../apiTokens/authorization.utils'
import { ClusterImageList, ImageList, SelectGroupType } from '../../ClusterNodes/types'
import { ApiResourceGroupType, K8SObjectType } from '../../ResourceBrowser/Types'
import { getAggregator } from '../../app/details/appDetails/utils'
import { SIDEBAR_KEYS } from '../../ResourceBrowser/Constants'
import { DEFAULT_SECRET_PLACEHOLDER } from '../../cluster/cluster.type'
import { AUTO_SELECT } from '../../ClusterNodes/constants'
import { ToastBody3 as UpdateToast } from '../ToastBody'

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
    var re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const result = re.test(String(email).toLowerCase())
    return result
}

export function removeItemsFromArray(array: any[], index: number, items: number, ...itemsToAdd) {
    const newArray = [...array]
    newArray.splice(index, items, ...itemsToAdd)
    return newArray
}

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
            //check errors in all fields
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
        if (validationSchema[name].required) {
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
        let _validator = validationSchema[name].validator
        if (_validator && typeof _validator === 'object') {
            if (!_validateSingleValidator(_validator, value)) {
                return _validator.error
            }
        }

        // multiple validators
        let _validators = validationSchema[name].validators
        if (_validators && typeof _validators === 'object' && Array.isArray(_validators)) {
            let errors = []
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
            let error = validateField(name, value)
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

export function mapByKey(arr: any[], id: string): Map<any, any> {
    if (!Array.isArray(arr)) {
        console.error(arr, 'is not array')
        return new Map()
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
            let id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay])
}

export function shallowEqual(objA, objB) {
    if (objA === objB) {
        return true
    }

    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
        return false
    }

    var keysA = Object.keys(objA)
    var keysB = Object.keys(objB)

    if (keysA.length !== keysB.length) {
        return false
    }

    // Test for A's keys different from B.
    var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB)
    for (var i = 0; i < keysA.length; i++) {
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
    } else if (!isArrayA && !isArrayB) {
        return Object.keys(objA).length === Object.keys(objB).length
    }

    return objA.length === objB.length
}

export function deepEqual(configA: any, configB: any): boolean {
    try {
        if (configA === configB) {
            return true
        } else if ((configA && !configB) || (!configA && configB) || !compareObjectLength(configA, configB)) {
            return false
        } else {
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
        }
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

interface scrollableInterface {
    autoBottomScroll: boolean
}

export function useScrollable(options: scrollableInterface) {
    const targetRef = useRef(null)
    const raf_id = useRef(0)
    const wheelListener = useRef(null)
    const [scrollHeight, setScrollHeight] = useState(0)
    const [scrollTop, setScrollTop] = useState(0)
    const [autoBottom, toggleAutoBottom] = useState(false)

    const target = useCallback((node) => {
        if (node === null) return
        targetRef.current = node
        wheelListener.current = node.addEventListener('wheel', handleWheel)
        raf_id.current = requestAnimationFrame(rAFCallback)
        return () => {
            node.removeEventListener('wheel', handleWheel)
            cancelAnimationFrame(raf_id.current)
        }
    }, [])

    function handleWheel(e) {
        if (e.deltaY < 0) {
            toggleAutoBottom(false)
        }
    }

    const [topScrollable, bottomScrollable] = useMemo(() => {
        if (!targetRef.current) {
            return [false, false]
        }

        let topScrollable = true
        let bottomScrollable = !(
            targetRef.current.scrollHeight - targetRef.current.scrollTop ===
            targetRef.current.clientHeight
        )
        if (scrollTop === 0) {
            topScrollable = false
        }

        if (!bottomScrollable && options.autoBottomScroll) {
            toggleAutoBottom(true)
        }
        return [topScrollable, bottomScrollable]
    }, [scrollHeight, scrollTop])

    useEffect(() => {
        if (options.autoBottomScroll) {
            toggleAutoBottom(true)
        } else {
            toggleAutoBottom(false)
        }
    }, [options.autoBottomScroll])

    useThrottledEffect(
        () => {
            if (!autoBottom || !targetRef.current) return
            targetRef.current.scrollBy({
                top: scrollHeight,
                left: 0,
            })
        },
        500,
        [scrollHeight, autoBottom],
    )

    function scrollToTop(e) {
        targetRef.current.scrollBy({
            top: -1 * scrollTop,
            left: 0,
            behavior: 'smooth',
        })
        if (options.autoBottomScroll) {
            toggleAutoBottom(false)
        }
    }

    function scrollToBottom(e) {
        toggleAutoBottom(true)
        targetRef.current.scrollBy({
            top: scrollHeight,
            left: 0,
            behavior: 'smooth',
        })
    }

    function rAFCallback() {
        if (!targetRef.current) {
            return
        }

        setScrollHeight(targetRef.current.scrollHeight)
        setScrollTop(targetRef.current.scrollTop)
        raf_id.current = requestAnimationFrame(rAFCallback)
    }

    return [target, topScrollable ? scrollToTop : null, bottomScrollable ? scrollToBottom : null]
}

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
        if (keys.length) setKeys([])
    }

    const onKeyDown = ({ key }) => {
        setKeys((k) => Array.from(new Set(k).add(key)))
    }
    const onKeyUp = ({ key }) => {
        setKeys((ks) => ks.filter((k) => k !== key))
    }

    return keys
}

function useDelayedEffect(callback, delay, deps = []) {
    const timeoutRef = useRef(null)
    useEffect(() => {
        timeoutRef.current = setTimeout(callback, delay)
        return () => clearTimeout(timeoutRef.current)
    }, deps)
}

interface ConditionalWrapper<T> {
    condition: boolean
    wrap: (children: T) => T
    children: T
}
export const ConditionalWrap: React.FC<ConditionalWrapper<any>> = ({ condition, wrap, children }) =>
    condition ? wrap(children) : <>{children}</>

export function useJsonYaml(value, tabSize = 4, language = 'json', shouldRun = false) {
    const [json, setJson] = useState('')
    const [yaml, setYaml] = useState('')
    const [nativeObject, setNativeObject] = useState(null)
    const [error, setError] = useState('')
    const yamlParseConfig = {
        prettyErrors: true,
    }

    useEffect(() => {
        if (!shouldRun) return
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
            setYaml(YAML.stringify(obj, { indent: 2 }))
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
        if (eventSourceRef.current?.close) eventSourceRef.current.close()
    }

    function handleMessage(event) {
        onMessage(event)
    }

    useEffect(() => {
        if (!shouldRun) return
        eventSourceRef.current = new EventSource(url, { withCredentials: true })
        eventSourceRef.current.onmessage = handleMessage
        return closeEventSource
    }, [...deps, shouldRun, url, maxLength])

    return eventSourceRef.current
}

export function useDebouncedEffect(callback, delay, deps: unknown[] = [] ) {
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
        if (node === null) return
        targetRef.current = node
        return () => (targetRef.current = null)
    }, [])

    useEffect(() => {
        if (!windowWidth || !windowHeight || !targetRef.current) return
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

export function sortBySelected(selectedArray: any[], availableArray: any[], matchKey: string) {
    const selectedArrayMap = mapByKey(selectedArray, matchKey)

    const actualSelectedArray = availableArray.filter((item) => selectedArrayMap.has(item[matchKey]))

    const unselectedAvailableArray = availableArray.filter((item) => !selectedArrayMap.has(item[matchKey]))

    return [
        ...sortObjectArrayAlphabetically(actualSelectedArray, matchKey),
        ...sortObjectArrayAlphabetically(unselectedAvailableArray, matchKey),
    ]
}

export function sortObjectArrayAlphabetically(arr: Object[], compareKey: string) {
    return arr.sort((a, b) => a[compareKey].localeCompare(b[compareKey]))
}

export function asyncWrap(promise): any[] {
    return promise.then((result) => [null, result]).catch((err) => [err])
}

export function Td({ children, to = null, ...props }) {
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

export function FragmentHOC({ children, ...props }) {
    // passes props to children
    return (
        <React.Fragment>
            {React.Children.map(children, (child) => React.cloneElement(child, { ...props }))}
        </React.Fragment>
    )
}

export const sortOptionsByLabel = (optionA, optionB) => {
    if (optionA.label < optionB.label) {
        return -1
    } else if (optionA.label > optionB.label) {
        return 1
    }
    return 0
}

export const sortOptionsByValue = (optionA, optionB) => {
    if (optionA.value < optionB.value) {
        return -1
    } else if (optionA.value > optionB.value) {
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
    customFieldKey?: string,
): OptionType[] => {
    return arr.map((ele) => {
        const _option = {
            label: customLabel ? ele[customLabel] : ele,
            value: customValue ? ele[customValue] : ele,
        }

        if (customFieldKey) {
            _option[customFieldKey] = ele[customFieldKey] ?? ''
        }

        return _option
    })
}

export const importComponentFromFELibrary = (componentName: string, defaultComponent?, type?: string) => {
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
        const days = Math.floor(elapsedTime / (24 * 60 * 60)),
            hrs = Math.floor((elapsedTime / (60 * 60)) % 24), // hrs mod (%) 24 hrs to get elapsed hrs
            mins = Math.floor((elapsedTime / 60) % 60), // mins mod (%) 60 mins to get elapsed mins
            secs = Math.floor(elapsedTime % 60) // secs mod (%) 60 secs to get elapsed secs

        const dh = `${days}d ${hrs}h`
            .split(' ')
            .filter((a) => !a.startsWith('0'))
            .join(' ')
        // f age is more than hours just show age in days and hours
        if (dh.length > 0) {
            return dh
        }
        //return age in minutes and seconds
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
    let _selectedResource: ApiResourceGroupType,
        isShowNamespace = false,
        isShowEvent = false
    for (let index = 0; index < k8sObjects.length; index++) {
        const element = k8sObjects[index]
        const groupParent = disableGroupFilter
            ? element.gvk.Group
            : getAggregator(element.gvk.Kind, element.gvk.Group.endsWith('.k8s.io'))

        if (element.gvk.Kind.toLowerCase() === selectedResourceKind) {
            _selectedResource = { namespaced: element.namespaced, gvk: element.gvk }
        }
        const currentData = _k8SObjectMap.get(groupParent)
        if (!currentData) {
            _k8SObjectMap.set(groupParent, {
                name: groupParent,
                isExpanded:
                    element.gvk.Kind !== SIDEBAR_KEYS.namespaceGVK.Kind &&
                    element.gvk.Kind !== SIDEBAR_KEYS.eventGVK.Kind &&
                    element.gvk.Kind.toLowerCase() === selectedResourceKind,
                child: [{ namespaced: element.namespaced, gvk: element.gvk }],
            })
        } else {
            currentData.child = [...currentData.child, { namespaced: element.namespaced, gvk: element.gvk }]
            if (element.gvk.Kind.toLowerCase() === selectedResourceKind) {
                currentData.isExpanded =
                    element.gvk.Kind !== SIDEBAR_KEYS.namespaceGVK.Kind &&
                    element.gvk.Kind !== SIDEBAR_KEYS.eventGVK.Kind &&
                    element.gvk.Kind.toLowerCase() === selectedResourceKind
            }
        }
        if (element.gvk.Kind === SIDEBAR_KEYS.eventGVK.Kind) {
            SIDEBAR_KEYS.eventGVK = { ...element.gvk }
        }
        if (element.gvk.Kind === SIDEBAR_KEYS.namespaceGVK.Kind) {
            SIDEBAR_KEYS.namespaceGVK = { ...element.gvk }
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
                      value: obj[optionValue ? optionValue : optionLabel],
                      description: obj['description'],
                      isVirtualEnvironment: obj['isVirtualEnvironment'],
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
    //Parses time(format:- ex. 4h20m) in second
    const matchesNumber = duration.match(/\d+/g)
    const matchesChar = duration.match(/[dhms]/g)
    for (let i = 0; i < matchesNumber.length; i++) {
        let _unit = matchesChar[i]
        let _unitVal = +matchesNumber[i]
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

export const highlightSearchedText = (searchText: string, matchString: string): string => {
    if (!searchText) {
        return matchString
    }
    const highlightText = (highlighted) => `<mark>${highlighted}</mark>`

    const regex = new RegExp(searchText, 'gi')
    return matchString.replace(regex, highlightText)
}

export const trackByGAEvent = (category: string, action: string): void => {
    ReactGA.event({
        category: category,
        action: action,
    })
}

export const createGroupSelectList = (list, nodeLabel): SelectGroupType[] => {
    let emptyHeadingCount = 0
    const objList: Record<string, OptionType[]> = list.reduce((acc, obj) => {
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

export const reloadToastBody = () => {
    return (
        <UpdateToast
            onClick={reloadLocation}
            text="You are viewing an outdated version of Devtron UI."
            buttonText="Reload"
        />
    )
}

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
    } else if (window._env_.HIDE_GITOPS_OR_HELM_OPTION) {
        return ''
    } else if (
        selectedDeploymentAppType &&
        allowedDeploymentTypes.indexOf(selectedDeploymentAppType as DeploymentAppTypes) >= 0
    ) {
        return selectedDeploymentAppType
    }
    return allowedDeploymentTypes[0]
}

export const hasApproverAccess = (approverList: string[]): boolean => {
    const loginInfo = getLoginInfo()
    let hasAccess = false
    for (const approver of approverList) {
        if (approver === loginInfo['email'] || approver === loginInfo['sub']) {
            hasAccess = true
            break
        }
    }
    return hasAccess
}

export const getNonEditableChartRepoText = (name: string): string => {
   return `Cannot edit chart repo "${name}". Some charts from this repository are being used by helm apps.`
}
