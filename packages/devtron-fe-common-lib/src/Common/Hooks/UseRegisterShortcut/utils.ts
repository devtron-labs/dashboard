import { ShortcutType } from './types'

export const preprocessKeys = (keys: ShortcutType['keys']) => {
    if (!keys) {
        throw new Error('keys undefined')
    }

    // NOTE: converting key to a string for the case for bad inputs
    const processedKeys = keys.map((key) => `${key}`.toUpperCase()).sort() as ShortcutType['keys']

    return {
        keys: processedKeys,
        id: processedKeys.join(),
    }
}

export const verifyCallbackStack = (stack: ShortcutType['callbackStack']) => {
    if (!stack || !Array.isArray(stack) || !stack.every((callback) => typeof callback === 'function')) {
        throw new Error('callback stack is undefined')
    }
}
