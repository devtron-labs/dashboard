import { multiSelectStyles } from '@devtron-labs/devtron-fe-common-lib'

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
export const JOBLIST_EMPTY_STATE_MESSAGING = {
    createJob: 'Create your first job',
    createJobInfoText:
        'Jobs allow manual and automated execution of developer actions. Increase productivity by automating the tedious. Get started by creating your first job.',
    createJobButtonLabel: 'Create Job',
    noJobsFound: 'No jobs found',
    noJobFoundInfoText: `We couldn't find any matching applications.`,
    noJobsButtonLabel: 'Clear filters',
}

export const JobsFilterTypeText = {
    PROJECT: 'team',
    APP_STATUS: 'appStatus',
    StatusText: 'Status',
    SearchStatus: 'Search job status',
    ProjectText: 'Projects',
    SearchProject: 'Search Project',
}

export const JobsStatusConstants = {
    APP_STATUS: {
        noSpaceLower: 'appStatus',
        normalText: 'App status',
    },
    PROJECT: {
        pluralLower: 'projects',
        lowerCase: 'project',
    },
}

export const JOB_STATUS = {
    Starting: 'Starting',
    Running: 'Running',
    Succeeded: 'Succeeded',
    Cancelled: 'CANCELLED',
    Failed: 'Failed',
}
