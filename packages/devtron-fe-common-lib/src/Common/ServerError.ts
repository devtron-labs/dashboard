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

export class ServerError {
    code: number

    internalMessage: string | null

    userMessage: string | null

    moreInfo?: string | null

    constructor(error) {
        this.code = error.code || 0
        this.userMessage = error.userMessage || ''
        this.internalMessage = error.internalMessage || ''
        this.moreInfo = error.moreInfo || ''
    }
}

export class ServerErrors extends Error {
    code: number

    errors: ServerError[]

    constructor(obj: { code: number; errors: ServerError[] }) {
        super()
        this.code = obj.code
        const message = obj.errors.reduce((str: string, err: ServerError) => {
            str += `${err.internalMessage || err.userMessage}`
            return str
        }, '')
        this.name = `[${obj.code.toString()}]`
        this.message = message
        this.errors = obj.errors.map((err) => new ServerError(err))
        Object.setPrototypeOf(this, ServerErrors.prototype)
    }
}
