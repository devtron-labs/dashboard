import { multiSelectStyles } from '../common'

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

export const JobListViewType = {
    LOADING: 'LOADING',
    LIST: 'LIST',
    EMPTY: 'LIST_EMPTY',
    NO_RESULT: 'NO_RESULT',
    ERROR: 'ERROR',
}

export const JOB_LIST_HEADERS = {
    Name: 'NAME',
    LastJobStatus: 'LAST RUN STATUS',
    LastRunAt: 'LAST RUN AT',
    LastSuccessAt: 'LAST SUCCESS AT',
    Description: 'Description',
}

export const YET_TO_RUN = 'Yet to run'