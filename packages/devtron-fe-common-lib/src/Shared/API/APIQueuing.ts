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

import { PromiseAllStatusType, ApiQueuingWithBatchResponseItem, BatchConfigType } from '../types'

const eachCall = (batchConfig, functionCalls, resolve, reject, shouldRejectOnError) => {
    const callIndex = batchConfig.lastIndex
    Promise.resolve(functionCalls[callIndex]())
        .then((result) => {
            // eslint-disable-next-line no-param-reassign
            batchConfig.results[callIndex] = { status: PromiseAllStatusType.FULFILLED, value: result }
        })
        .catch((error) => {
            // eslint-disable-next-line no-param-reassign
            batchConfig.results[callIndex] = { status: PromiseAllStatusType.REJECTED, reason: error }
        })
        .finally(() => {
            if (shouldRejectOnError && batchConfig.results[callIndex].status === PromiseAllStatusType.REJECTED) {
                reject(batchConfig.results[callIndex].reason)
                return
            }

            // eslint-disable-next-line no-plusplus, no-param-reassign
            batchConfig.completedCalls++
            if (batchConfig.lastIndex < functionCalls.length) {
                eachCall(batchConfig, functionCalls, resolve, reject, shouldRejectOnError)
                // eslint-disable-next-line no-plusplus, no-param-reassign
                batchConfig.lastIndex++
            } else if (batchConfig.completedCalls === functionCalls.length) {
                resolve(batchConfig.results)
            }
        })
}

/**
 * Executes a batch of function calls concurrently with queuing.
 * @param functionCalls The array of function calls returning promise to be executed.
 * @param batchSize The maximum number of function calls to be executed concurrently. Defaults to the value of `window._env_.API_BATCH_SIZE`.
 * @param shouldRejectOnError If set to true, the promise will reject if any of the function calls rejects, i.e, acts like Promise.all else Promise.allSettled . Defaults to false.
 * @returns A promise that resolves to a array of objects containing the status and value of the batch execution.
 */
const ApiQueuingWithBatch = <T>(
    functionCalls,
    httpProtocol: string,
    shouldRejectOnError: boolean = false,
    batchSize: number = window._env_.API_BATCH_SIZE,
): Promise<ApiQueuingWithBatchResponseItem<T>[]> => {
    if (!batchSize || batchSize <= 0) {
        // eslint-disable-next-line no-param-reassign
        batchSize = ['http/0.9', 'http/1.0', 'http/1.1'].indexOf(httpProtocol) !== -1 ? 5 : 30
    }

    return new Promise((resolve, reject) => {
        if (functionCalls.length === 0) {
            resolve([])
        }
        const batchConfig: BatchConfigType = {
            lastIndex: 0,
            concurrentCount: batchSize,
            results: functionCalls.map(() => null),
            completedCalls: 0,
        }
        for (
            let index = 0;
            index < batchConfig.concurrentCount && index < functionCalls.length;
            index++, batchConfig.lastIndex++
        ) {
            eachCall(batchConfig, functionCalls, resolve, reject, shouldRejectOnError)
        }
    })
}

export default ApiQueuingWithBatch
