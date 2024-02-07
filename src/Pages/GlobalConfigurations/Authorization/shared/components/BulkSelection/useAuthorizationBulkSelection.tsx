import { useBulkSelection } from '@devtron-labs/devtron-fe-common-lib'
import { BulkSelectionState } from './types'

const useAuthorizationBulkSelection = () => useBulkSelection<BulkSelectionState>()

export default useAuthorizationBulkSelection
