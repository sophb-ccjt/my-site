class EventEmitter {
    constructor() {
        this.events = {}
    }

    on(event, listener) {
        if (!event) return
        if (!this.events.hasOwnProperty(event)) {
            this.events[event] = []
        }
        this.events[event].push(listener)
    }

    off(event, listener) {
        if (!event) return
        if (this.events.hasOwnProperty(event)) {
            const index = this.events[event].indexOf(listener)
            if (index !== -1) this.events[event].splice(index, 1)
        }
    }

    emit(event, ...args) {
        if (!event) return
        if (this.events.hasOwnProperty(event)) {
            this.events[event].forEach(listener => {
                args.forEach(arg => {
                    listener(arg)
                })
            })
        }
    }
}