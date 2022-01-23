export default () => {

    // let filteredArray = []
    var bp = {
        // let eventSrc= undefined
        // let filteredArray = []
        // let grepTokens = undefined
        // let indexFromLastMatch = -1000000
        // let buffer = []
        // let trailingLines= []
        // let prefix = "",
        eventSrc: undefined,
        filteredArray: [],
        grepTokens: undefined,
        indexFromLastMatch: -1000000,
        buffer: [],
        trailingLines: [],
        prefix: "",
        eventListener: function (ev) {
            let log;
            try {
                log = JSON.parse(ev.data).result.content;
            } catch (e) {
                log = ev.data;
            }
            let bufferedLogs: Array<string> = []
            if (!log || log.length == 0) {
                console.log("no log lines")
            } else {
                log = this.prefix + log
                if (!this.grepTokens) {
                    bufferedLogs = [log]
                } else {
                    const { _args, a = 0, b = 0 } = this.grepTokens[0]
                    if (new RegExp(_args, 'gi').test(log)) {
                        if (this.indexFromLastMatch <= 1 * (a+b)) {
                            let size = Math.min(1*(this.indexFromLastMatch - b), this.trailingLines.length)
                            bufferedLogs = bufferedLogs.concat(this.trailingLines.slice(0, size))
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
                        if (this.indexFromLastMatch <= 1 * (a)) {
                            this.trailingLines.push(log)
                        }
                        if (this.indexFromLastMatch == 1 * (a+b)) {
                            bufferedLogs = bufferedLogs.concat(this.trailingLines)
                            this.trailingLines = new Array()
                        }
                    }
                    for (let i = 1; i < this.grepTokens.length; i++) {
                        const { v, _args } = this.grepTokens[i]
                        bufferedLogs = bufferedLogs.filter(l => (new RegExp(_args, 'gi').test(l)))
                    }
                }
            }
            let matches = bufferedLogs
            // console.log("matching "+matches)
            this.filteredArray = this.filteredArray.concat(matches)
            if (this.grepTokens && this.grepTokens.length > 0) {
                this.filteredArray = this.filteredArray.map(log => log.replace(new RegExp(this.grepTokens[this.grepTokens.length - 1]._args, 'gi'), m => `\x1B[1;31m${m}\x1B[0m`))
            }
        }
    }
    var wrappers = []
    self.onmessage = e => { // eslint-disable-line no-restricted-globals
        if (!e) {
            console.log('no event found');
            return
        }
        if (!e.data.type && !e.data.paylod) return
        switch (e.data.type) {
            case 'start':
                const { urls, grepTokens, pods } = e.data.payload
                wrappers.forEach(wrapper => {
                    try {
                        wrapper.eventSrc.close()
                    }
                    catch (err) { }
                })
                // console.log(urls)
                for (let index = 0; index < urls.length; index++) {
                    const element = urls[index];
                    console.log(element)
                    wrappers[index] = Object.assign({}, bp)
                    wrappers[index].prefix = `${typeof pods[index] === 'object' ? pods[index].name : pods[index]}: `;
                    wrappers[index].eventSrc = new EventSource(element, { withCredentials: true })
                    wrappers[index].grepTokens = grepTokens
                    const eventListener = wrappers[index].eventListener.bind(wrappers[index])
                    wrappers[index].eventSrc.addEventListener('message', eventListener)
                    wrappers[index].eventSrc.addEventListener('open', function (ev) {
                        self.postMessage({ result: [], signal: 'open', readyState: wrappers[index].eventSrc.readyState }, null); // eslint-disable-line no-restricted-globals
                    })
                    wrappers[index].eventSrc.addEventListener('error', function (ev) {
                        self.postMessage({ result: [], signal: 'close', readyState: wrappers[index].eventSrc.readyState }, null); // eslint-disable-line no-restricted-globals
                    })
                }
                break
            case 'stop':
                // wrapper.filteredArray = logFilter.stop()
                respond()
                try {
                    wrappers.forEach(val => val.eventSrc.close())
                }
                catch (err) { }
                finally {
                    wrappers.forEach( val => val.filteredArray = [])
                }
        }

    }

    function respond() {
        // console.log(wrapper.filteredArray.length)
        wrappers.forEach( wrapper => {
            if (wrapper.filteredArray.length === 0) return
            self.postMessage({ result: wrapper.filteredArray, readyState: wrapper.eventSrc.readyState }, null);// eslint-disable-line no-restricted-globals
            wrapper.filteredArray.length = 0
        })
    }
    self.setInterval(respond, 500); // eslint-disable-line no-restricted-globals
}