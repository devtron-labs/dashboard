import dayjs from 'dayjs'

import { DATE_TIME_FORMATS } from '@devtron-labs/devtron-fe-common-lib'

export const parseTimestampToDate = (timestamp: string): string => {
    const dateObj = dayjs(timestamp)
    return dateObj.format(DATE_TIME_FORMATS.DD_MMM)
}
