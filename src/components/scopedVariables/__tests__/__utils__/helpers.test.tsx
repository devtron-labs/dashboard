import { validator, downloadData } from '../../utils/helpers'
import {
    EMPTY_FILE_STATUS,
    FILE_NOT_SUPPORTED_STATUS,
    PARSE_ERROR_STATUS,
    JSON_PARSE_ERROR_STATUS,
    YAML_PARSE_ERROR_STATUS,
    ROUTES,
} from '../../constants'

describe('ScopedVariables helpers', () => {
    describe('validator', () => {
        it('should return EMPTY_FILE_STATUS when data is empty', () => {
            expect(validator({ data: null, type: 'application/json', name: 'sample-file' })).toEqual(EMPTY_FILE_STATUS)
        })
    })
})
