/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ErrorScreenManager, ErrorScreenNotAuthorized, GenericEmptyState, Progressing, Reload } from '../../../Common'
import { GenericSectionErrorState } from '../GenericSectionErrorState'
import { NOT_FOUND_DEFAULT_TEXT } from './constants'
import { APIResponseHandlerProps } from './types'

const APIResponseHandler = ({
    isLoading,
    progressingProps,
    customLoader,
    error,
    notAuthorized,
    notFoundText,
    reloadProps,
    genericSectionErrorProps,
    errorScreenManagerProps,
    children,
}: APIResponseHandlerProps) => {
    // keeping it above loading since, not expected to send a call if not authorized
    if (notAuthorized) {
        return <ErrorScreenNotAuthorized />
    }

    if (isLoading) {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return customLoader ? <>{customLoader}</> : <Progressing {...progressingProps} />
    }

    if (error) {
        // This will be used for handling error screen for small screen size
        if (genericSectionErrorProps) {
            return <GenericSectionErrorState {...genericSectionErrorProps} />
        }

        if (errorScreenManagerProps) {
            return <ErrorScreenManager {...errorScreenManagerProps} />
        }

        if (error?.code === 404) {
            return (
                <GenericEmptyState
                    title={notFoundText?.title ?? NOT_FOUND_DEFAULT_TEXT.title}
                    subTitle={notFoundText?.subTitle ?? NOT_FOUND_DEFAULT_TEXT.subTitle}
                />
            )
        }

        return <Reload {...reloadProps} />
    }

    // Had to add this since while using it is throwing ts error
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>
}

export default APIResponseHandler
