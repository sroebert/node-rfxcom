/* global require: false, module */
const events = require("events"),
        util = require("util");

class FakeSerialPort extends events.EventEmitter {
    constructor() {
        super ();
        this.bytesWritten = [];
        this.flushed = false;
        this.isOpen = true;
        this.pipeDestination = undefined;
    }

    write(buffer, callback) {
        // Must use array concatenation to handle recording multiple packets
        this.bytesWritten = this.bytesWritten.concat(buffer);
        if (callback && typeof callback === "function") {
            callback();
        }
    };

    pipe(destination) {
        this.pipeDestination = destination;
    }

    flush(callback) {
        this.flushed = true;
        if (callback && typeof callback === "function") {
            callback();
        }
    };

    close(callback) {
        this.isOpen = false;
        if (callback && typeof callback === "function") {
            callback();
        }
    };    
}
module.exports = FakeSerialPort;
