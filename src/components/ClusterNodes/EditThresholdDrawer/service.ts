import { post, showError } from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

import { SaveNodeThresholdPayload } from './types'

export const saveNodeThresholdValues = async (payload: SaveNodeThresholdPayload) => {
    try {
        await post(URLS.SAVE_NODE_THRESHOLD, payload)
    } catch (err) {
        showError(err)
    }
}
