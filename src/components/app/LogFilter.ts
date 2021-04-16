export class LogFilter {
    private lastTrueIndex: number = -1000000
    private buffer: Array<string> = new Array()
    private trailing: Array<string> = new Array()
    private grepTokens: any

    constructor(grepTokens: any) {
        this.grepTokens = grepTokens
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
        if (!this.grepTokens) {
            return [log]
        }
        const { _args, a = 0, b = 0 } = this.grepTokens[0]
        if (new RegExp(_args, 'gi').test(log)) {
            if (b != 0 && this.lastTrueIndex >= -1*b) {
                this.trailing = new Array()
            } else if (this.lastTrueIndex >= -1*b + -1*a) {
                let size = -1*(this.lastTrueIndex + b)
                for(let i = 0; i< size && i < this.trailing.length; i++) {
                    bufferedLogs.push(this.trailing[i])
                }
                this.trailing = new Array<string>()
            }
            this.lastTrueIndex = 0
            bufferedLogs = bufferedLogs.concat(this.buffer.concat(log))
            this.buffer = []
        } else {
            this.lastTrueIndex -= 1
            if (b > 0) {
                this.buffer = this.buffer.concat(log).slice(-1 * b)
            } else {
                this.buffer = []
            }
            if (this.lastTrueIndex + a >= 0) {
                this.trailing.push(log)
                // bufferedLogs = [log]
                if (b == 0 && this.lastTrueIndex + a == 0) {
                    this.trailing.forEach((val) => {
                        bufferedLogs.push(val)
                    })
                    this.trailing = new Array()
                }
            } else if (this.lastTrueIndex + a == -1*b) {
                this.trailing.forEach((val) => {
                    bufferedLogs.push(val)
                })
                this.trailing = new Array()
            }
        }
        for (let i = 1; i < this.grepTokens.length; i++) {
            const { v, _args } = this.grepTokens[i]
            bufferedLogs = bufferedLogs.filter(l => (new RegExp(_args, 'gi').test(l)))
        }
        return bufferedLogs
    }
}