class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode
        this.vm = require('vm')
        this.context = {
            require,
            setInterval,
            clearInterval
        }
        this.vm.createContext(this.context)
        this.vm.runInContext(message, this.context);
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorHandler;