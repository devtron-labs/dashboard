import { OptionType } from '../app/types'
import { multiSelectStyles } from '../common'

export const _multiSelectStyles = {
    ...multiSelectStyles,
    control: (base, state) => ({
        ...base,
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
        border: state.isDisabled ? '1px solid var(--N200)' : state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf',
        backgroundColor: state.isDisabled ? 'var(--N50)' : 'white',
        boxShadow: 'none',
    }),
    menu: (base) => ({
        ...base,
        marginTop: 'auto',
    }),
    menuList: (base) => {
        return {
            ...base,
            position: 'relative',
            paddingBottom: '0px',
            maxHeight: '250px',
        }
    },
}

export const tempMultiSelectStyles = {
    ...multiSelectStyles,
    multiValue: (base, state) => {
        return {
            ...base,
            border: `1px solid var(--N200)`,
            borderRadius: `4px`,
            background: 'white',
            height: '28px',
            marginRight: '8px',
            padding: '2px',
            fontSize: '12px',
        }
    },
    dropdownIndicator: (base, state) => ({
        ...base,
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    }),
}

export const TARGET_PLATFORM_LIST: OptionType[] = [
    { label: 'linux/arm64', value: 'linux/arm64' },
    { label: 'linux/amd64', value: 'linux/amd64' },
    { label: 'linux/arm/v7', value: 'linux/arm/v7' },
]

export const getTargetPlatformMap = (): Map<string, boolean> => {
    const targetPlatformMap = new Map<string, boolean>()

    for (const targetPlatform of TARGET_PLATFORM_LIST) {
        targetPlatformMap.set(targetPlatform.value, true)
    }
    return targetPlatformMap
}
