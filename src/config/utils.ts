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

import {
    DEVTRON_DEFAULT_RELEASE_NAME,
    DEVTRON_DEFAULT_NAMESPACE,
    DEVTRON_DEFAULT_CLUSTER_ID,
    UNSAVED_CHANGES_PROMPT_MESSAGE,
} from '.'

export const checkIfDevtronOperatorHelmRelease = (
    releaseName: string,
    namespace: string,
    clusterId: string,
): boolean => {
    return (
        releaseName === DEVTRON_DEFAULT_RELEASE_NAME &&
        namespace === DEVTRON_DEFAULT_NAMESPACE &&
        clusterId === DEVTRON_DEFAULT_CLUSTER_ID
    )
}

/**
 * Checks if the provided pathname matches the current path.
 * If the paths do not match, returns a custom message or a default unsaved changes prompt.
 *
 * @param currentPathName - The current path to compare against.
 * @param customMessage - Optional custom message to display when the path does not match.
 * @returns A function that takes an object with a `pathname` property and performs the path match check.
 */
export const checkIfPathIsMatching =
    (currentPathName: string, customMessage = '') =>
    ({ pathname }: { pathname: string }): boolean | string =>
        currentPathName === pathname || customMessage || UNSAVED_CHANGES_PROMPT_MESSAGE
