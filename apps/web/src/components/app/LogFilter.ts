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

export class LogFilter {
    private indexFromLastMatch: number = -1000000

    private buffer: Array<string> = []

    private trailingLines: Array<string> = []

    private grepTokens: any

    private prefix: string

    constructor(grepTokens: any, prefix: string = '') {
        this.grepTokens = grepTokens
        prefix = prefix.trimEnd()
        if (prefix.length > 0) {
            this.prefix = `${prefix.trimEnd()}: `
        } else {
            this.prefix = ''
        }
    }

    /**
     * @param log
     * @returns
     */
    public filter(log: string): Array<string> {
        let bufferedLogs: Array<string> = new Array<string>()
        if (log.length == 0) {
            return []
        }
        log = this.prefix + log
        if (!this.grepTokens) {
            return [log]
        }
        const { _args, a = 0, b = 0 } = this.grepTokens[0]
        if (new RegExp(_args, 'gi').test(log)) {
            if (this.distanceFromPreviousLessThanEqualTo(a + b)) {
                bufferedLogs = bufferedLogs.concat(this.fetchNonOverlappingTrailingLines(b))
                this.trailingLines = new Array<string>()
            }
            this.indexFromLastMatch = 0
            bufferedLogs = bufferedLogs.concat(this.buffer.concat(log))
            this.buffer = []
        } else {
            this.indexFromLastMatch += 1
            if (b > 0) {
                this.buffer = this.buffer.concat(log).slice(-1 * b)
            }
            if (this.distanceFromPreviousLessThanEqualTo(a)) {
                this.trailingLines.push(log)
            }
            if (this.distanceFromPreviousEqualTo(a + b)) {
                bufferedLogs = bufferedLogs.concat(this.trailingLines)
                this.trailingLines = []
            }
        }
        for (let i = 1; i < this.grepTokens.length; i++) {
            const { v, _args } = this.grepTokens[i]
            bufferedLogs = bufferedLogs.filter((l) => new RegExp(_args, 'gi').test(l))
        }
        return bufferedLogs
    }

    private distanceFromPreviousLessThanEqualTo(dist: number): boolean {
        return this.indexFromLastMatch <= 1 * dist
    }

    private distanceFromPreviousEqualTo(dist: number): boolean {
        return this.indexFromLastMatch == 1 * dist
    }

    private fetchNonOverlappingTrailingLines(previousLinesCount: number): Array<string> {
        const size = Math.min(1 * (this.indexFromLastMatch - previousLinesCount), this.trailingLines.length)
        return this.trailingLines.slice(0, size)
    }

    public stop(): Array<string> {
        let bufferedLogs = this.trailingLines
        for (let i = 1; i < this.grepTokens.length; i++) {
            const { v, _args } = this.grepTokens[i]
            bufferedLogs = bufferedLogs.filter((l) => new RegExp(_args, 'gi').test(l))
        }
        this.trailingLines = new Array<string>()
        return bufferedLogs
    }
}
