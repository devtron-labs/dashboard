import { useBulkSelection } from '@devtron-labs/devtron-fe-common-lib'
import { BulkSelectionState } from './types'

const useAuthorizationBulkSelection = () => {
    const { selectedIdentifiers: bulkSelectionState, ...rest } = useBulkSelection<BulkSelectionState>()

    return { ...rest, bulkSelectionState }
}

export default useAuthorizationBulkSelection
