import { AppCreationType, ViewType } from '../../config'
import { DEFAULT_TAG_DATA } from '../app/config'
import { multiSelectStyles } from '../common'
import { CreateJobViewState } from './Types'

export const _multiSelectStyles = {
    ...multiSelectStyles,
    control: (base) => ({
        ...base,
        cursor: 'pointer',
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
            maxHeight: '180px',
        }
    },
}

export const JobCreationType = {
    Blank: 'BLANK',
    Existing: 'EXISTING',
}
