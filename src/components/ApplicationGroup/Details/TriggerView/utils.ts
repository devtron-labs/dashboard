import { BulkCIDetailType } from '../../AppGroup.types'

export const getIsAppUnorthodox = (app: BulkCIDetailType): boolean =>
    app.isLinkedCI || app.isWebhookCI || app.isLinkedCD
