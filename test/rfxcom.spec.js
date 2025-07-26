/* global require: false, describe: false, module */
const rfxcom = require('../lib'),
    FakeSerialPort = require('./helper'),
    matchers = require('./matchers'),
    protocols = rfxcom.protocols;

describe("RfxCom", function() {
    beforeEach(function() {
        jasmine.addMatchers({
            toHaveSent: matchers.toHaveSent
        });
    });

    describe("RfxCom class", function() {
        describe("constructor", function() {
            it("should be initialised correctly when created", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                expect(device.portEventHandlersInstalled).toEqual(false);
                expect(device.initialiseWaitTime).toBe(6000);
                expect(device._seqnbr).toBe(0);
                expect(device.connected).toEqual(false);
                expect(device.initialising).toEqual(false);
                expect(device.receiving).toEqual(false);
                expect(device.startReceiverRequired).toEqual(true);
                expect(device.transmitters).toEqual({});
                expect(device.readyCallback).toBe(null);
                done();
            });
        });
        describe("data event handler", function() {
            it("should emit a receive event when it receives a message", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("receive", function() {
                    done();
                });
                device.open();
                device.parser.emit("data", [0x01]);
            });
            it("should emit a status event when it receives message type 0x01", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("status", function() {
                    done();
                });
                device.open();
                device.parser.emit("data", [0x0D, 0x01, 0x00, 0x01, 0x02, 0x53, 0x30, 0x00, 0x02, 0x21, 0x01, 0x00, 0x00, 0x00]);
            });
            it("should emit a response event when it receives message type 0x02", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                        device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("response", function () {
                    done();
                });
                device.open();
                device.parser.emit("data", [0x04, 0x02, 0x01, 0x00, 0x00]);
            });
            it("should emit a lighting1 event when it receives message type 0x10", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("lighting1", function (evt, packetType) {
                    expect(packetType).toBe(0x10);
                    expect(this.packetNames[packetType]).toEqual("lighting1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["X10 lighting"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x07, 0x10, 0x00, 0x00, 0x41, 0x03, 0x00, 0x0F]);
            });
            it("should emit a lighting2 event when it receives message type 0x11", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("lighting2", function (evt, packetType) {
                    expect(packetType).toBe(0x11);
                    expect(this.packetNames[packetType]).toEqual("lighting2");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["HomeEasy EU"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x0B, 0x11, 0x01, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x0F, 0x0F]);
            });
            it("should emit a lighting4 event when it receives message type 0x13", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("lighting4", function (evt, packetType) {
                    expect(packetType).toBe(0x13);
                    expect(this.packetNames[packetType]).toEqual("lighting4");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["PT2262"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x09, 0x13, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x12, 0x00]);
            });
            it("should emit a lighting5 event when it receives message type 0x14", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("lighting5", function (evt, packetType) {
                    expect(packetType).toBe(0x14);
                    expect(this.packetNames[packetType]).toEqual("lighting5");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["LightwaveRF", "Siemens"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x0A, 0x14, 0x00, 0x01, 0xF0, 0x9A, 0xC7, 0x02, 0x00, 0x00, 0x80]);
            });
            it("should emit a lighting6 event when it receives message type 0x15", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("lighting6", function (evt, packetType) {
                    expect(packetType).toBe(0x15);
                    expect(this.packetNames[packetType]).toEqual("lighting6");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Blyss"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x0b, 0x15, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x03, 0x00, 0x00, 0x00]);
            });
            it("should emit a chime1 event when it receives message type 0x16 (old style)", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("chime1", function (evt, packetType) {
                    expect(packetType).toBe(0x16);
                    expect(this.packetNames[packetType]).toEqual("chime1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Byron SX"]);
                    expect(evt.id).toBe("0xFF")
                    expect(evt.commandNumber).toBe(13)
                    expect(evt.command).toBe("Tubular 3 Notes")
                    expect(evt.rssi).toBe(3)
                    done();
                });
                device.open();
                device.parser.emit("data", [0x07, 0x16, 0x00, 0x00, 0x00, 0xff, 0x0d, 0x30]);
            });
            it("should emit a chime1 event when it receives message type 0x16 (new style)", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("chime1", function (evt, packetType) {
                    expect(packetType).toBe(0x16);
                    expect(this.packetNames[packetType]).toEqual("chime1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Byron DBY"]);
                    expect(evt.id).toBe("0x00FF0D01")
                    expect(evt.rssi).toBe(6)
                    done();
                });
                device.open();
                device.parser.emit("data", [0x08, 0x16, 0x07, 0x00, 0x00, 0xff, 0x0d, 0x01, 0x60]);
            });
            it("should emit a blinds1 event when it receives message type 0x19", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("blinds1", function (evt, packetType) {
                    expect(packetType).toBe(0x19);
                    expect(this.packetNames[packetType]).toEqual("blinds1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Raex YR1326"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x09, 0x19, 0x04, 0x06, 0x00, 0xA2, 0x1B, 0x01, 0x02, 0x80]);
            });
            it("should emit a funkbus event when it receives message type 0x1e", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("funkbus", function (evt, packetType) {
                    expect(packetType).toBe(0x1e);
                    expect(this.packetNames[packetType]).toEqual("funkbus");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Gira"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x0B, 0x1e, 0x00, 0x00, 0x12, 0x34, 0x42, 0x01, 0x01, 0x00, 0x00, 0x80]);
            });
            it("should emit a security1 event when it receives message type 0x20", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("security1", function (evt, packetType) {
                    expect(packetType).toBe(0x20);
                    expect(this.packetNames[packetType]).toEqual("security1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["X10 security motion sensor"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x08, 0x20, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            });
            it("should emit a camera1 event when it receives message type 0x28", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("camera1", function (evt, packetType) {
                    expect(packetType).toBe(0x28);
                    expect(this.packetNames[packetType]).toEqual("camera1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["X10 Ninja Camera"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x06, 0x28, 0x00, 0x00, 0x42, 0x03, 0x90]);
            });
            it("should emit a remote event when it receives message type 0x30", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("remote", function (evt, packetType) {
                    expect(packetType).toBe(0x30);
                    expect(this.packetNames[packetType]).toEqual("remote");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["ATI Remote Wonder"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x06, 0x30, 0x00, 0x04, 0x0F, 0x0D, 0x82]);
            });
            it("should emit a blinds2 event when it receives message type 0x31", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("blinds2", function (evt, packetType) {
                    expect(packetType).toBe(0x31);
                    expect(this.packetNames[packetType]).toEqual("blinds2");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Brel", "Dooya DDxxxx"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x0c, 0x31, 0x00, 0x05, 0x12, 0x34, 0x56, 0x78, 0x04, 0x00, 50, 90, 0x83]);
            });
            it("should emit a thermostat1 event when it receives message type 0x40", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("thermostat1", function (evt, packetType) {
                    expect(packetType).toBe(0x40);
                    expect(this.packetNames[packetType]).toEqual("thermostat1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Digimax", "TLX7506"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x09, 0x40, 0x00, 0x1B, 0x6B, 0x18, 0x16, 0x15, 0x02, 0x70]);
            });
            it("should emit a thermostat3 event when it receives message type 0x42", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("thermostat3", function (evt, packetType) {
                    expect(packetType).toBe(0x42);
                    expect(this.packetNames[packetType]).toEqual("thermostat3");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Mertik G6R-H4TB", "Mertik G6R-H4T", "Mertik G6R-H4T21-Z22"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x08, 0x42, 0x01, 0x01, 0x01, 0x9F, 0xAB, 0x02, 0x81]);
            });
            it("should emit a bbq1 event when it receives message type 0x4e", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("bbq1", function (evt, packetType) {
                    expect(packetType).toBe(0x4e);
                    expect(this.packetNames[packetType]).toEqual("bbq1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Maverick ET-732"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x0A, 0x4E, 0x01, 0x00, 0x00, 0x00, 0x00, 0x19, 0x00, 0x17, 0x89]);
            });
            it("should emit a temperaturerain1 event when it receives message type 0x4f, with device type 1", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("temperaturerain1", function (evt, packetType) {
                    expect(packetType).toBe(0x4f);
                    expect(this.packetNames[packetType]).toEqual("temperaturerain1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Alecto WS1200"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x0a, 0x4f, 0x01, 0x00, 0x12, 0x34, 0x01, 0x17, 0x00, 0x42, 0x55]);
            });
            it("should emit a temperature1 event when it receives message type 0x50, with device type 1", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("temperature1", function (evt, packetType) {
                    expect(packetType).toBe(0x50);
                    expect(this.packetNames[packetType]).toEqual("temperature1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["THR128", "THR138", "THC138"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x08, 0x50, 0x01, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x42]);
            });
            it("should emit a temperature1 event when it receives message type 0x50, with device type 2", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("temperature1", function (evt, packetType) {
                    expect(packetType).toBe(0x50);
                    expect(this.packetNames[packetType]).toEqual("temperature1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["THC238", "THC268", "THN132", "THWR288",
                        "THRN122", "THN122", "AW129", "AW131", "THN129"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x08, 0x50, 0x02, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x42]);
            });
            it("should emit a humidity1 event when it receives message type 0x51", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("humidity1", function (evt, packetType) {
                    expect(packetType).toBe(0x51);
                    expect(this.packetNames[packetType]).toEqual("humidity1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["La Crosse TX3"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x08, 0x51, 0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89]);
            });
            it("should emit a temperaturehumidity1 event when it receives message type 0x52, with device type 1", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("temperaturehumidity1", function (evt, packetType) {
                    expect(packetType).toBe(0x52);
                    expect(this.packetNames[packetType]).toEqual("temperaturehumidity1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["THGN122", "THGN123", "THGN132", "THGR122", "THGR228", "THGR238", "THGR268"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x0A, 0x52, 0x01, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59]);
            });
            it("should emit a temphumbaro1 event when it receives message type 0x54", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("temphumbaro1", function (evt, packetType) {
                    expect(packetType).toBe(0x54);
                    expect(this.packetNames[packetType]).toEqual("temphumbaro1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["BTHR918N", "BTHR968"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x0D, 0x54, 0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should emit a rain1 event when it receives message type 0x55, with device type 2", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("rain1", function (evt, packetType) {
                    expect(packetType).toBe(0x55);
                    expect(this.packetNames[packetType]).toEqual("rain1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["PCR800"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x0B, 0x55, 0x02, 0x17, 0xB6, 0x00, 0x00, 0x00, 0x00, 0x4D, 0x3C, 0x69]);
            });
            it("should emit a wind1 event when it receives message type 0x56, with device type 1", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("wind1", function (evt, packetType) {
                    expect(packetType).toBe(0x56);
                    expect(this.packetNames[packetType]).toEqual("wind1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["WTGR800"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x10, 0x56, 0x01, 0x12, 0x2F, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14, 0x00, 0x49, 0x00, 0x00, 0x79]);
            });
            it("should emit a uv1 event when it receives message type 0x57, with device type 1", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("uv1", function (evt, packetType) {
                    expect(packetType).toBe(0x57);
                    expect(this.packetNames[packetType]).toEqual("uv1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["UVN128", "UV138", "Davis"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x09, 0x57, 0x01, 0x00, 0x12, 0x34, 0x38, 0x01, 0x11, 0x79]);
            });
            it("should emit a datetime event when it receives message type 0x58, with device type 1", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("datetime", function (evt, packetType) {
                    expect(packetType).toBe(0x58);
                    expect(this.packetNames[packetType]).toEqual("datetime");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["RTGR328N", "RTGR383"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x0D, 0x58, 0x01, 0x00, 0x12, 0x34, 0x11, 0x08, 0x11, 0x05, 0x14, 0x1B, 0x11, 0x79]);
            });
            it("should emit an elec1 event when it receives message type 0x59", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("elec1", function (evt, packetType) {
                    expect(this.packetNames[packetType]).toEqual("elec1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["CM113", "Electrisave", "Cent-a-meter"]);
                    expect(packetType).toBe(0x59);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x0D, 0x59, 0x01, 0x0F, 0x86, 0x00, 0x04, 0x00, 0x1D, 0x00, 0x00, 0x00, 0x00, 0x49]);
            });
            it("should emit an elec23 event when it receives message type 0x5a, with device type 1", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("elec23", function (evt, packetType) {
                    expect(packetType).toBe(0x5a);
                    expect(this.packetNames[packetType]).toEqual("elec23");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["CM119", "M160"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x11, 0x5a, 0x01, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            });
            it("should emit an elec4 event when it receives message type 0x5b", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("elec4", function (evt, packetType) {
                    expect(packetType).toBe(0x5b);
                    expect(this.packetNames[packetType]).toEqual("elec4");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["CM180i"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x13, 0x5B, 0x01, 0x06, 0xB8, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
                                            0x00, 0x00, 0x00, 0x00, 0x6F, 0x14, 0x88, 0x89]);
            });
            it("should emit an elec5 event when it receives message type 0x5c", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("elec5", function (evt, packetType) {
                    expect(packetType).toBe(0x5c);
                    expect(this.packetNames[packetType]).toEqual("elec5");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Revolt"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x0F, 0x5C, 0x01, 0x03, 0x00, 0x2D, 0xE4, 0x00, 0x00, 0x00, 0x00, 0x00,
                                            0x03, 0x00, 0x32, 0x80]);
            });
            it("should emit a weight1 event when it receives message type 0x5D", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("weight1", function (evt, packetType) {
                    expect(packetType).toBe(0x5d);
                    expect(this.packetNames[packetType]).toEqual("weight1");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["BWR102", "BWR102"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x08, 0x5D, 0x01, 0xF5, 0x00, 0x07, 0x03, 0x40, 0x40]);
            });
            it("should emit a cartelectronic event when it receives message type 0x60", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("cartelectronic", function (evt, packetType) {
                    expect(packetType).toBe(0x60);
                    expect(this.packetNames[packetType]).toEqual("cartelectronic");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["TIC"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x15, 0x60, 0x01, 0x00, 0x12, 0x34, 0x56, 0x78, 0x9a, 0x01, 0x12,
                                            0x34, 0x56, 0x78, 0x12, 0x34, 0x56, 0x78, 0x07, 0x5a, 0x012, 0x79]);
            });
            it("should emit an rfxsensor event when it receives message type 0x70", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("rfxsensor", function (evt, packetType) {
                    expect(packetType).toBe(0x70);
                    expect(this.packetNames[packetType]).toEqual("rfxsensor");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["RFXSensor temperature"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x07, 0x70, 0x00, 0xE9, 0x28, 0x02, 0xE1, 0x70]);
            });
            it("should emit an rfxmeter event when it receives message type 0x71", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("rfxmeter", function (evt, packetType) {
                    expect(packetType).toBe(0x71);
                    expect(this.packetNames[packetType]).toEqual("rfxmeter");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["RFXMeter data"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x0A, 0x71, 0x00, 0x37, 0x08, 0xF8, 0x00, 0x8A, 0x64, 0x67, 0x70]);
            });
            it("should emit a waterlevel event when it receives message type 0x73", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("waterlevel", function (evt, packetType) {
                    expect(packetType).toBe(0x73);
                    expect(this.packetNames[packetType]).toEqual("waterlevel");
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["TS FT002"]);
                    done();
                });
                device.open();
                device.parser.emit("data", [0x0D, 0x73, 0x00, 0x2A, 0x12, 0x34, 0x00, 0x01, 0xF4, 0x01, 0x5f, 0x00, 0x00, 0x73]);
            });
        });
        describe(".initialise function", function () {
            it("should emit a 'connectfailed' event if the serial port device file does not exist", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/tty-i-dont-exist", {
                        port: fakeSerialPort
                    });
                device.on("connectfailed", function () {
                    done();
                });
                device.open();
                fakeSerialPort.emit("error", new Error("Error: No such file or directory, cannot open /dev/tty-i-dont-exist"));
            });
            describe("message sequence", function () {
                let device = {};
                beforeEach(function () {
                    const fakeSerialPort = new FakeSerialPort();
                        device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                            port: fakeSerialPort
                        });
                        jasmine.clock().install(); // There is a 500ms Timeout in the initialisation code, we must mock it
                    });
                afterEach(function () {
                    jasmine.clock().uninstall()
                })
                it("should prepare the device for use.", function (done) {
                    const
                        resetSpy = spyOn(device, "resetRFX").and.callThrough(),
                        flushSpy = spyOn(device, "flush").and.callThrough(),
                        getStatusSpy = spyOn(device, "getRFXStatus").and.callFake(function () {
                            device.statusMessageHandler([0x00, 0x01, 0x02, 0x53, 0x5E, 0x08, 0x02, 0x25, 0x00, 0x01, 0x01, 0x1C])
                        }),
                        openSpy = spyOn(device, "open").and.callFake(function () {
                            device.connected = true;
                            device.emit("ready");
                        });

                    device.initialise(() => { done() });
                    jasmine.clock().tick(501);
                    expect(resetSpy).toHaveBeenCalled();
                    // noinspection JSCheckFunctionSignatures
                    expect(flushSpy).toHaveBeenCalledWith(jasmine.any(Function));
                    // noinspection JSCheckFunctionSignatures
                    expect(getStatusSpy).toHaveBeenCalledWith(jasmine.any(Function));
                    expect(openSpy).toHaveBeenCalled();
                });
                it("should prepare the device for use (current firmware).", function (done) {
                    const
                        resetSpy = spyOn(device, "resetRFX").and.callThrough(),
                        flushSpy = spyOn(device, "flush").and.callThrough(),
                        startRxSpy = spyOn(device, "startRFXReceiver").and.callFake(function () {
                            device.statusMessageHandler([0x07, 0x02, 0x07, 0x43, 0x6F, 0x70, 0x79, 0x72, 0x69, 0x67, 0x68,
                                0x74, 0x20, 0x52, 0x46, 0x58, 0x43, 0x4F, 0x4D])
                        }),
                        getStatusSpy = spyOn(device, "getRFXStatus").and.callFake(function () {
                            device.statusMessageHandler([0x00, 0x01, 0x02, 0x53, 0x5E, 0x08, 0x02, 0x25, 0x00, 0x01, 0x01,
                                0x1C, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
                        }),
                        openSpy = spyOn(device, "open").and.callFake(function () {
                            device.connected = true;
                            device.emit("ready");
                        });

                    device.initialise(() => { done() });
                    jasmine.clock().tick(501);
                    expect(resetSpy).toHaveBeenCalled();
                    // noinspection JSCheckFunctionSignatures
                    expect(flushSpy).toHaveBeenCalledWith(jasmine.any(Function));
                    // noinspection JSCheckFunctionSignatures
                    expect(getStatusSpy).toHaveBeenCalledWith(jasmine.any(Function));
                    // noinspection JSCheckFunctionSignatures
                    expect(startRxSpy).toHaveBeenCalledWith(jasmine.any(Function));
                    expect(openSpy).toHaveBeenCalled();
                });
            });
        });
        it(".open should pipe data from the fake serialport to the parser", function() {
            const fakeSerialPort = new FakeSerialPort(),
                device = new rfxcom.RfxCom("/", {
                    port: fakeSerialPort
                });
            device.open();
            expect(fakeSerialPort.pipeDestination).toBe(device.parser);
        });
        describe(".bytesToUint48", function() {
            it("should convert a sequence of 6 bytes to a longint", function() {
                expect(rfxcom.RfxCom.bytesToUint48([0xF1, 0x27, 0xba, 0x67, 0x28, 0x97])).toBe(265152933341335);
            });
        });
        describe(".bytesToUint32", function() {
            it("should convert a sequence of 4 bytes to a longint", function() {
                expect(rfxcom.RfxCom.bytesToUint32([0xFF, 0x76, 0x21, 0x72])).toBe(4285931890);
            });
        });
        describe(".dumpHex", function() {
            it("should convert a sequence of bytes to a string of hex numbers with a prefix if one is supplied", function() {
                expect(rfxcom.RfxCom.dumpHex([0x00, 0x00, 0x01, 0x72], "0x").toString()).toBe("0x00,0x00,0x01,0x72");
            });
            it("should convert a sequence of bytes to a string of hex numbers with no prefix if none supplied", function() {
                expect(rfxcom.RfxCom.dumpHex([0x00, 0x00, 0x01, 0x72]).toString()).toBe("00,00,01,72");
            });
        });
        describe(".stringToBytes", function() {
            it("should convert a sequence of characters to an array of bytes", function() {
                expect(rfxcom.RfxCom.stringToBytes("203052").bytes.toString()).toBe([32, 48, 82].toString());
            });
            it("should convert a sequence of characters to hex value", function () {
                expect(rfxcom.RfxCom.stringToBytes("203052").value).toBe(0x203052);
            });
            it("should ignore leading 0x on a string", function() {
                expect(rfxcom.RfxCom.stringToBytes("0x203052").bytes.toString()).toBe([32, 48, 82].toString());
            });
        });
        describe(".flush", function() {
            it("should flush the underlying serialport", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.flush(function() {
                    expect(fakeSerialPort.flushed).toBeTruthy();
                    done();
                });
            });
        });
        describe(".resetRFX", function() {
            it("should send the correct bytes to the serialport", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.resetRFX(function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([13, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            });
        });
        describe(".getRFXStatus", function() {
            it("should send the correct bytes to the serialport", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.getRFXStatus(function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([13, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            });
        });
        describe(".configureRFX", function() {
            it("should send the correct bytes to the serialport", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.connected = true;
                device.receiverTypeCode = 0x53;
                device.configureRFX(433.92, +10, [protocols[0x53].LACROSSE, protocols[0x53].OREGON, protocols[0x53].AC, protocols[0x53].ARC, protocols[0x53].X10], function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x03, 0x53, 0x1c, 0x00, 0x08, 0x27, 0x00, 0x00, 0x00, 0x00]);
                expect(device.receiverTypeCode).toBe(0x53);
                expect(device.transmitterPower).toBe(10.0);
                device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
            });
            it("should set 433.42MHz Rx frequency", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.connected = true;
                device.receiverTypeCode = 0x53;
                device.configureRFX(433.42, 0, [protocols[0x53].LACROSSE, protocols[0x53].OREGON, protocols[0x53].AC, protocols[0x53].ARC, protocols[0x53].X10], function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x03, 0x54, 0x1c, 0x00, 0x08, 0x27, 0x00, 0x00, 0x00, 0x00]);
                expect(device.receiverTypeCode).toBe(0x54);
                expect(device.transmitterPower).toBe(10.0);
                device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
            });
            it("should set 434.50MHz Rx frequency", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.connected = true;
                device.receiverTypeCode = 0x53;
                device.configureRFX("434.50", 0, [protocols[0x53].LACROSSE, protocols[0x53].OREGON, protocols[0x53].AC, protocols[0x53].ARC, protocols[0x53].X10], function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x03, 0x5F, 0x1c, 0x00, 0x08, 0x27, 0x00, 0x00, 0x00, 0x00]);
                expect(device.receiverTypeCode).toBe(0x5F);
                expect(device.transmitterPower).toBe(10.0);
                device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
            });
            it("should set the transmitter power for an RFXtrxIOT", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.connected = true;
                device.receiverTypeCode = 0x5C;
                device.configureRFX(433, -5, [protocols[0x5C].LIGHTWAVERF, protocols[0x5C].VISONIC, protocols[0x5C].KEELOQ, protocols[0x5C].MEIANTECH], function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x03, 0x5c, 0x0d, 0x00, 0x02, 0xC0, 0x01, 0x00, 0x00, 0x00]);
                expect(device.receiverTypeCode).toBe(0x5C);
                expect(device.transmitterPower).toBe(-5.0);
                device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
            });
            it("should set the frequency & transmitter power for an RFXtrxIOT", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.connected = true;
                device.receiverTypeCode = 0x5C;
                device.configureRFX(868, 13, [protocols[0x5C].LIGHTWAVERF, protocols[0x5C].VISONIC, protocols[0x5C].KEELOQ, protocols[0x5C].MEIANTECH], function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x03, 0x5d, 0x1f, 0x00, 0x02, 0xC0, 0x01, 0x00, 0x00, 0x00]);
                expect(device.receiverTypeCode).toBe(0x5D);
                expect(device.transmitterPower).toBe(+13.0);
                device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
            });
            it("should set the frequency for an RFXtrx315", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.connected = true;
                device.receiverTypeCode = 0x50;
                device.configureRFX(315, 13, [protocols[0x50].LIGHTING4, protocols[0x50].VISONIC, protocols[0x50].X10], function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x03, 0x51, 0x1c, 0x08, 0x00, 0x81, 0x00, 0x00, 0x00, 0x00]);
                expect(device.receiverTypeCode).toBe(0x51);
                expect(device.transmitterPower).toBe(+10.0);
                device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
            });
            it("should set the frequency for an RFXtrx315", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.connected = true;
                device.receiverTypeCode = 0x51;
                device.configureRFX(310, 13, [protocols[0x51].LIGHTING4, protocols[0x51].VISONIC, protocols[0x51].X10], function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x03, 0x50, 0x1c, 0x08, 0x00, 0x81, 0x00, 0x00, 0x00, 0x00]);
                expect(device.receiverTypeCode).toBe(0x50);
                expect(device.transmitterPower).toBe(+10.0);
                device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
            });
        });
        describe(".enableRFXProtocols", function() {
            it("should send the correct bytes to the serialport", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.connected = true;
                device.receiverTypeCode = 0x53;
                device.enableRFXProtocols([protocols[0x53].LACROSSE, protocols[0x53].OREGON, protocols[0x53].AC, protocols[0x53].ARC, protocols[0x53].X10], function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x03, 0x53, 0x1c, 0x00, 0x08, 0x27, 0x00, 0x00, 0x00, 0x00]);
                device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
            });

            it("should send the correct bytes to the serialport for a single protocol", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.connected = true;
                device.receiverTypeCode = 0x53;
                device.enableRFXProtocols(protocols[0x53].LIGHTWAVERF, function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x03, 0x53, 0x1c, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00]);
                device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
            });
        });
        describe(".saveRFXProtocols", function() {
            it("should send the correct bytes to the serialport", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.saveRFXProtocols(function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0, 0x00, 0x00, 0x00]);
                device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
            });
        });

        describe(".statusMessageHandler", function() {
            let device = {};
            let packetType = 0x01;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a status message when called", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.firmwareVersion).toBe(0x30);
                    expect(evt.firmwareType).toBe("Type 1");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 0x30, 0x30, 0, 0, 0, 0, 0, 0], packetType);
            });
            it("should emit a status message when called", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.receiverTypeCode).toBe(0x53);
                    expect(evt.firmwareVersion).toBe(161);
                    expect(evt.firmwareType).toBe("Type 1");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 161, 0x30, 0, 0, 0, 0, 0, 0], packetType);
            });
            it("should emit a status message when called", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.receiverTypeCode).toBe(0x53);
                    expect(evt.firmwareVersion).toBe(162);
                    expect(evt.firmwareType).toBe("Type 2");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 162, 0x30, 0, 0, 0, 0, 0, 0], packetType);
            });
            it("should emit a status message when called", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.receiverTypeCode).toBe(0x53);
                    expect(evt.firmwareVersion).toBe(224);
                    expect(evt.firmwareType).toBe("Type 2");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 224, 0x30, 0, 0, 0, 0, 0, 0], packetType);
            });
            it("should emit a status message when called", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.receiverTypeCode).toBe(0x53);
                    expect(evt.firmwareVersion).toBe(225);
                    expect(evt.firmwareType).toBe("Ext");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 225, 0x30, 0, 0, 0, 0, 0, 0], packetType);
            });
            it("should emit a status message when called with a long status packet", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.receiverTypeCode).toBe(0x53);
                    expect(evt.firmwareVersion).toBe(1001);
                    expect(evt.firmwareType).toBe("Type 1");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 1, 0x30, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0], packetType);
            });
            it("should emit a status message when called with a long status packet", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.receiverTypeCode).toBe(0x53);
                    expect(evt.firmwareVersion).toBe(1001);
                    expect(evt.firmwareType).toBe("Type 2");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 1, 0x30, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0], packetType);
            });
            it("should emit a status message when called with a long status packet", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.receiverTypeCode).toBe(0x53);
                    expect(evt.firmwareVersion).toBe(1001);
                    expect(evt.firmwareType).toBe("Ext");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 1, 0x30, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0], packetType);
            });
            it("should emit a status message when called with a long status packet", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.receiverTypeCode).toBe(0x53);
                    expect(evt.firmwareVersion).toBe(1001);
                    expect(evt.firmwareType).toBe("Ext 2");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 1, 0x30, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0], packetType);
            });
            it("should emit a status message when called with a long status packet", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.receiverTypeCode).toBe(0x53);
                    expect(evt.firmwareVersion).toBe(1001);
                    expect(evt.firmwareType).toBe("Pro 1");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 1, 0x30, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0], packetType);
            });
            it("should emit a status message when called with a long status packet", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.receiverTypeCode).toBe(0x53);
                    expect(evt.firmwareVersion).toBe(1001);
                    expect(evt.firmwareType).toBe("Pro 2");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 1, 0x30, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0], packetType);
            });
            it("should emit a status message when called with a long status packet", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.receiverTypeCode).toBe(0x53);
                    expect(evt.firmwareVersion).toBe(1001);
                    expect(evt.firmwareType).toBe("ProXL 1");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 1, 0x30, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0], packetType);
            });
            it("should emit a status message when called with a long status packet", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.receiverTypeCode).toBe(0x53);
                    expect(evt.firmwareVersion).toBe(1001);
                    expect(evt.firmwareType).toBe("Unknown firmware");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 1, 0x30, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0], packetType);
            });
            it("should emit a status message when called with a long status packet", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("Unknown device");
                    expect(evt.receiverTypeCode).toBe(0xfe);
                    expect(evt.firmwareVersion).toBe(1001);
                    expect(evt.firmwareType).toBe("Pro 2");
                    expect(evt.enabledProtocols).toEqual([]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0xfe, 1, 0x30, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0], packetType);
            });
        });

        describe(".transmitCommandResponseHandler", function() {
            let packetType = 0x02;
            it("should emit an response message when called", function(done) {
                const device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("response", function(message, seqnbr) {
                    expect(message).toBe("ACK - transmit OK");
                    expect(seqnbr).toBe(3);
                    done();
                });
                device.transmitCommandResponseHandler([0x00, 0x03, 0x00], packetType);
            });
        });

        describe(".lighting1Handler", function() {
            let device = {};
            let packetType = 0x10;
                beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lighting1 message when called", function(done) {
                device.on("lighting1", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.houseCode).toBe("D");
                    expect(evt.unitCode).toBe(2);
                    expect(evt.command).toBe("On");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.rssi).toBe(7);
                    expect(evt.id).toBe("0x4402");
                    done();
                });
                device.lighting1Handler([0x01, 0x01, 0x44, 0x02, 0x01, 0x70], packetType);
            });
            it("should report an unknown command", function (done) {
                device.on("lighting1", function (evt) {
                    expect(evt.command).toBe("Illegal Command");
                    expect(evt.commandNumber).toBe(255);
                    done();
                });
                device.lighting1Handler([0x01, 0x01, 0x44, 0x02, 0xff, 0x70], packetType);
            });
            it("should calculate the id correctly", function(done) {
                device.on("lighting1", function(evt) {
                    expect(evt.id).toBe("0x4305");
                    expect(evt.houseCode).toBe("C");
                    expect(evt.unitCode).toBe(5);
                    done();
                });
                device.lighting1Handler([0x01, 0x01, 0x43, 0x05, 0x01, 0x70], packetType);
            });
            it("should calculate the rssi correctly", function(done) {
                device.on("lighting1", function(evt) {
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.lighting1Handler([0x01, 0x01, 0x43, 0x05, 0x01, 0x80], packetType);
            });
            describe("device type identification", function() {
                it("should identify X10 devices", function(done) {
                    device.on("lighting1", function(evt) {
                        expect(evt.subtype).toBe(0);
                        done();
                    });
                    device.lighting1Handler([0x00, 0x01, 0x43, 0x05, 0x01, 0x80], packetType);
                });
                it("should identify Waveman devices", function(done) {
                    device.on("lighting1", function(evt) {
                        expect(evt.subtype).toBe(3);
                        done();
                    });
                    device.lighting1Handler([0x03, 0x01, 0x43, 0x05, 0x01, 0x80], packetType);
                });
            });
        });

        describe(".lighting2Handler", function() {
            let device = {};
            let packetType = 0x11;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lighting2 message when called", function(done) {
                device.on("lighting2", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.id).toBe("0x039AC7A1");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Off");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.level).toBe(0x0F);
                    expect(evt.rssi).toBe(0x0F);
                    done();
                });
                device.lighting2Handler([0x00, 0x01, 0xC3, 0x9A, 0xC7, 0xA1, 0x01, 0x00, 0x0F, 0xF0], packetType);
            });
            it("should report an unknown command", function (done) {
                device.on("lighting2", function (evt) {
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(255);
                    done();
                });
                device.lighting2Handler([0x00, 0x01, 0xC3, 0x9A, 0xC7, 0xA1, 0x01, 0xFF, 0x0F, 0xF0], packetType);
            });
            it("should calculate the id correctly", function(done) {
                device.on("lighting2", function(evt) {
                    expect(evt.id).toBe("0x029AC7A1");
                    done();
                });
                device.lighting2Handler([0x00, 0x01, 0xCE, 0x9A, 0xC7, 0xA1, 0x01, 0x00, 0x0F, 0x0F], packetType);
            });
            it("should calculate the rssi correctly", function(done) {
                device.on("lighting2", function(evt) {
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.lighting2Handler([0x00, 0x01, 0xC3, 0x9A, 0xC7, 0xA1, 0x01, 0x00, 0x07, 0x7F], packetType);
            });
            describe("device type identification", function() {
                it("should identify HomeEasy EU devices", function(done) {
                    device.on("lighting2", function(evt) {
                        expect(evt.subtype).toBe(1);
                        done();
                    });
                    device.lighting2Handler([0x01, 0x01, 0xC3, 0x9A, 0xC7, 0xA1, 0x01, 0x00, 0x0F, 0x0F], packetType);
                });
                it("should identify ANSLUT devices", function(done) {
                    device.on("lighting2", function(evt) {
                        expect(evt.subtype).toBe(2);
                        done();
                    });
                    device.lighting2Handler([0x02, 0x01, 0xC3, 0x9A, 0xC7, 0xA1, 0x01, 0x00, 0x0F, 0x0F], packetType);
                });
            });
        });

        describe(".lighting4Handler", function() {
            let device = {};
            let packetType = 0x13;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lighting4 message when called", function (done) {
                device.on("lighting4", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.data).toBe("0x010203");
                    expect(evt.pulseWidth).toBe(350);
                    expect(evt.command).toBe("Data");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.rssi).toBe(0x05);
                    done();
                });
                device.lighting4Handler([0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x5E, 0x50], packetType);
            });
        });

        describe(".lighting5Handler", function() {
            let device = {};
            let packetType = 0x14;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lighting5 message when called", function(done) {
                device.on("lighting5", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0xF09AC7");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Off");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(1);
                    done();
                });
                device.lighting5Handler([0x00, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x00, 0x00, 0x80], packetType);
            });
            it("should report an unknown command", function (done) {
                device.on("lighting5", function (evt) {
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(255);
                    done();
                });
                device.lighting5Handler([0x00, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0xFF, 0x00, 0x80], packetType);
            });
            it("should identify the subtype correctly", function(done) {
                device.on("lighting5", function(evt) {
                    expect(evt.subtype).toBe(2);
                    done();
                });
                device.lighting5Handler([0x02, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x00, 0x00, 0x80], packetType);
            });

            it("should identify the command correctly", function(done) {
                device.on("lighting5", function(evt) {
                    expect(evt.command).toBe("On");
                    expect(evt.commandNumber).toBe(1);
                    done();
                });
                device.lighting5Handler([0x02, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x01, 0x00, 0x80], packetType);
            });
            it("should calculate the rssi correctly", function(done) {
                device.on("lighting5", function(evt) {
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.lighting5Handler([0x02, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x01, 0x00, 0x80], packetType);
            });
        });

        describe(".lighting6Handler", function() {
            let device = {};
            let packetType = 0x15;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lighting6 message when called", function(done) {
                device.on("lighting6", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0xF09A");
                    expect(evt.groupCode).toBe("K");
                    expect(evt.unitCode).toBe(4);
                    expect(evt.command).toBe("On");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(1);
                    done();
                });
                device.lighting6Handler([0x00, 0x01, 0xF0, 0x9A, 0x4B, 0x04, 0x00, 0x00, 0x00, 0x80], packetType);
            });
            it("should identify the command correctly", function(done) {
                device.on("lighting6", function(evt) {
                    expect(evt.command).toBe("Off");
                    expect(evt.commandNumber).toBe(1);
                    done();
                });
                device.lighting6Handler([0x00, 0x01, 0xF0, 0x9A, 0x4B, 0x04, 0x01, 0x00, 0x00, 0x80], packetType);
            });
            it("should report an unknown command", function (done) {
                device.on("lighting6", function (evt) {
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(255);
                    done();
                });
                device.lighting6Handler([0x00, 0x01, 0xF0, 0x9A, 0x4B, 0x04, 0xFF, 0x00, 0x00, 0x80], packetType);
            });
            it("should calculate the rssi correctly", function(done) {
                device.on("lighting6", function(evt) {
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.lighting6Handler([0x00, 0x01, 0xF0, 0x9A, 0x4B, 0x04, 0x00, 0x00, 0x00, 0x80], packetType);
            });
        });

        describe(".chimeHandler", function () {
            let device = {};
            let packetType = 0x16;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a chime1 message when called (old style)", function(done) {
                device.on("chime1", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x9A");
                    expect(evt.command).toBe("Big Ben");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.rssi).toBe(1);
                    done();
                });
                device.chimeHandler([0x00, 0x01, 0x00, 0x9A, 0x03, 0x10], packetType);
            });
            it("should emit a chime1 message when called (new style)", function(done) {
                device.on("chime1", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x9A");
                    expect(evt.command).toBe("Big Ben");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.rssi).toBe(1);
                    done();
                });
                device.chimeHandler([0x00, 0x01, 0x00, 0x9A, 0x03, 0x00, 0x10], packetType);
            });
            it("should handle long ID devices (old style)", function(done) {
                device.on("chime1", function(evt) {
                    expect(evt.subtype).toBe(2);
                    expect(evt.id).toBe("0x03FFFF");
                    expect(evt.command).toBeUndefined();
                    expect(evt.commandNumber).toBeUndefined();
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.rssi).toBe(2);
                    done();
                });
                device.chimeHandler([0x02, 0x02, 0x03, 0xFF, 0xFF, 0x20], packetType);
            });
            it("should handle long ID devices (new style)", function(done) {
                device.on("chime1", function(evt) {
                    expect(evt.subtype).toBe(2);
                    expect(evt.id).toBe("0x03FFFF");
                    expect(evt.command).toBeUndefined();
                    expect(evt.commandNumber).toBeUndefined();
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.rssi).toBe(2);
                    done();
                });
                device.chimeHandler([0x02, 0x02, 0x03, 0xFF, 0xFF, 0x00, 0x20], packetType);
            });
            it("should handle long ID devices (old style)", function(done) {
                device.on("chime1", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0xFFFFFF");
                    expect(evt.command).toBeUndefined();
                    expect(evt.commandNumber).toBeUndefined();
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.chimeHandler([0x04, 0x04, 0xFF, 0xFF, 0xFF, 0x80], packetType);
            });
            it("should handle long ID devices (new style)", function(done) {
                device.on("chime1", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0xFFFFFF");
                    expect(evt.command).toBeUndefined();
                    expect(evt.commandNumber).toBeUndefined();
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.chimeHandler([0x04, 0x04, 0xFF, 0xFF, 0xFF, 0x00, 0x80], packetType);
            });
            it("should handle BYRON_MP001 devices (old style)", function(done) {
                device.on("chime1", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("101000");
                    expect(evt.command).toBeUndefined();
                    expect(evt.commandNumber).toBeUndefined();
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(4);
                    done();
                });
                device.chimeHandler([0x01, 0x05, 0x11, 0x5F, 0x54, 0x40], packetType);
            });
            it("should handle BYRON_MP001 devices (new style)", function(done) {
                device.on("chime1", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("101000");
                    expect(evt.command).toBeUndefined();
                    expect(evt.commandNumber).toBeUndefined();
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(4);
                    done();
                });
                device.chimeHandler([0x01, 0x05, 0x11, 0x5F, 0x54, 0x00, 0x40], packetType);
            });
            it("should handle BYRON_BY devices (old style)", function(done) {
                device.on("chime1", function(evt) {
                    expect(evt.subtype).toBe(3);
                    expect(evt.id).toBe("0x012345");
                    expect(evt.command).toBe("");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(6);
                    expect(evt.rssi).toBe(4);
                    done();
                });
                device.chimeHandler([0x03, 0x06, 0x23, 0x45, 0x85, 0x40], packetType);
            });
            it("should handle BYRON_BY devices (new style)", function(done) {
                device.on("chime1", function(evt) {
                    expect(evt.subtype).toBe(3);
                    expect(evt.id).toBe("0x012345");
                    expect(evt.command).toBe("");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(6);
                    expect(evt.rssi).toBe(4);
                    done();
                });
                device.chimeHandler([0x03, 0x06, 0x23, 0x45, 0x85, 0x00, 0x40], packetType);
            });
            it("should handle very long ID devices (new style only)", function(done) {
                device.on("chime1", function(evt) {
                    expect(evt.subtype).toBe(6);
                    expect(evt.id).toBe("0x03FFFFFF");
                    expect(evt.command).toBeUndefined();
                    expect(evt.commandNumber).toBeUndefined();
                    expect(evt.seqnbr).toBe(52);
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.chimeHandler([0x06, 0x34, 0x03, 0xFF, 0xFF, 0xFF, 0x70], packetType);
            });

        });

        describe(".fanHandler", function () {
            let device = {};
            let packetType = 0x17;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should handle SIEMENS_SF01 with an invalid command 0", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x00, 0x00, 0x00, 0x12, 0x34, 0x00, 0x80], packetType);
            });
            it("should handle SIEMENS_SF01 timer command", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("Timer");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x00, 0x00, 0x00, 0x12, 0x34, 0x01, 0x80], packetType);
            });
            it("should handle SIEMENS_SF01 - command", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("-");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x00, 0x01, 0x00, 0x12, 0x34, 0x02, 0x80], packetType);
            });
            it("should handle SIEMENS_SF01 learn command", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("Learn");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x00, 0x02, 0x00, 0x12, 0x34, 0x03, 0x80], packetType);
            });
            it("should handle SIEMENS_SF01 + command", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("+");
                    expect(evt.commandNumber).toBe(4);
                    expect(evt.seqnbr).toBe(3);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x00, 0x03, 0x00, 0x12, 0x34, 0x04, 0x80], packetType);
            });
            it("should handle SIEMENS_SF01 confirm command", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("Confirm");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x00, 0x04, 0x00, 0x12, 0x34, 0x05, 0x80], packetType);
            });
            it("should handle SIEMENS_SF01 light command", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("Light");
                    expect(evt.commandNumber).toBe(6);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x00, 0x05, 0x00, 0x12, 0x34, 0x06, 0x80], packetType);
            });
            it("should handle ITHO_CVE_RFT with an invalid command 0", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x01, 0x00, 0x12, 0x34, 0x56, 0x00, 0x80], packetType);
            });
            it("should handle ITHO_CVE_RFT with command 1", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("1");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x01, 0x01, 0x12, 0x34, 0x56, 0x01, 0x80], packetType);
            });
            it("should handle ITHO_CVE_RFT with command 2", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("2");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x01, 0x02, 0x12, 0x34, 0x56, 0x02, 0x80], packetType);
            });
            it("should handle ITHO_CVE_RFT with command 3", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("3");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(3);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x01, 0x03, 0x12, 0x34, 0x56, 0x03, 0x80], packetType);
            });
            it("should handle ITHO_CVE_RFT with command Timer", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("Timer");
                    expect(evt.commandNumber).toBe(4);
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x01, 0x04, 0x12, 0x34, 0x56, 0x04, 0x80], packetType);
            });
            it("should handle ITHO_CVE_RFT with command Not at Home", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("Not At Home");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x01, 0x05, 0x12, 0x34, 0x56, 0x05, 0x80], packetType);
            });
            it("should handle ITHO_CVE_RFT with command Learn", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("Learn");
                    expect(evt.commandNumber).toBe(6);
                    expect(evt.seqnbr).toBe(6);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x01, 0x06, 0x12, 0x34, 0x56, 0x06, 0x80], packetType);
            });
            it("should handle ITHO_CVE_RFT with command Erase all remotes", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("Erase All Remotes");
                    expect(evt.commandNumber).toBe(7);
                    expect(evt.seqnbr).toBe(7);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x01, 0x07, 0x12, 0x34, 0x56, 0x07, 0x80], packetType);
            });
            it("should handle LUCCI_AIR with an invalid command 0", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(2);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x02, 0x00, 0x00, 0x00, 0x01, 0x00, 0x80], packetType);
            });
            it("should handle LUCCI_AIR with command Hi", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(2);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Hi");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x02, 0x01, 0x00, 0x00, 0x01, 0x01, 0x80], packetType);
            });
            it("should handle LUCCI_AIR with command Med", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(2);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Med");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x02, 0x02, 0x00, 0x00, 0x01, 0x02, 0x80], packetType);
            });
            it("should handle LUCCI_AIR with command Low", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(2);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Low");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(3);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x02, 0x03, 0x00, 0x00, 0x01, 0x03, 0x80], packetType);
            });
            it("should handle LUCCI_AIR with command Off", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(2);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Off");
                    expect(evt.commandNumber).toBe(4);
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x02, 0x04, 0x00, 0x00, 0x01, 0x04, 0x80], packetType);
            });
            it("should handle LUCCI_AIR with command Light", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(2);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Light");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x02, 0x05, 0x00, 0x00, 0x01, 0x05, 0x80], packetType);
            });
            it("should handle SEAV_TXS4 with an invalid command 0", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(3);
                    expect(evt.id).toBe("1/10/0100000001/0x1f");
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x03, 0x00, 0xc0, 0x20, 0x3f, 0x00, 0x80], packetType);
            });
            it("should handle SEAV_TXS4 with command T1", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(3);
                    expect(evt.id).toBe("1/01/0000000001/0x1f");
                    expect(evt.command).toBe("T1");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x03, 0x01, 0xa0, 0x00, 0x3f, 0x01, 0x80], packetType);
            });
            it("should handle SEAV_TXS4 with command T2", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(3);
                    expect(evt.id).toBe("1/01/1000000001/0x1f");
                    expect(evt.command).toBe("T2");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x03, 0x02, 0xa0, 0x40, 0x3f, 0x02, 0x80], packetType);
            });
            it("should handle SEAV_TXS4 with command T3", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(3);
                    expect(evt.id).toBe("0/00/0000000000/0x1f");
                    expect(evt.command).toBe("T3");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(3);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x03, 0x03, 0x00, 0x00, 0x1f, 0x03, 0x80], packetType);
            });
            it("should handle SEAV_TXS4 with command T4", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(3);
                    expect(evt.id).toBe("1/11/1111111110/0x1f");
                    expect(evt.command).toBe("T4");
                    expect(evt.commandNumber).toBe(4);
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x03, 0x04, 0xe7, 0x7f, 0xdf, 0x04, 0x80], packetType);
            });
            it("should handle WESTINGHOUSE_7226640 with an invalid command 0", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x04, 0x00, 0x00, 0x00, 0x01, 0x00, 0x80], packetType);
            });
            it("should handle WESTINGHOUSE_7226640 with command Hi", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Hi");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x04, 0x01, 0x00, 0x00, 0x01, 0x01, 0x80], packetType);
            });
            it("should handle WESTINGHOUSE_7226640 with command Med", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Med");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x04, 0x02, 0x00, 0x00, 0x01, 0x02, 0x80], packetType);
            });
            it("should handle WESTINGHOUSE_7226640 with command Low", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Low");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(3);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x04, 0x03, 0x00, 0x00, 0x01, 0x03, 0x80], packetType);
            });
            it("should handle WESTINGHOUSE_7226640 with command Off", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Off");
                    expect(evt.commandNumber).toBe(4);
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x04, 0x04, 0x00, 0x00, 0x01, 0x04, 0x80], packetType);
            });
            it("should handle WESTINGHOUSE_7226640 with command Light", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Light");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x04, 0x05, 0x00, 0x00, 0x01, 0x05, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DC with an invalid command 0", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(5);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x05, 0x00, 0x00, 0x00, 0x01, 0x00, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DC command Power", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(5);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Power");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x05, 0x01, 0x00, 0x00, 0x01, 0x01, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DC with command +", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(5);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("+");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x05, 0x02, 0x00, 0x00, 0x01, 0x02, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DC with command -", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(5);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("-");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(3);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x05, 0x03, 0x00, 0x00, 0x01, 0x03, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DC with command Light", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(5);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Light");
                    expect(evt.commandNumber).toBe(4);
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x05, 0x04, 0x00, 0x00, 0x01, 0x04, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DC with command Reverse", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(5);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Reverse");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x05, 0x05, 0x00, 0x00, 0x01, 0x05, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DC with command Natural flow", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(5);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Natural Flow");
                    expect(evt.commandNumber).toBe(6);
                    expect(evt.seqnbr).toBe(6);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x05, 0x06, 0x00, 0x00, 0x01, 0x06, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DC with command Pair", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(5);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Pair");
                    expect(evt.commandNumber).toBe(7);
                    expect(evt.seqnbr).toBe(7);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x05, 0x07, 0x00, 0x00, 0x01, 0x07, 0x80], packetType);
            });
            it("should handle CASAFAN with an invalid command 0", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(6);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x06, 0x00, 0x00, 0x00, 0x01, 0x00, 0x80], packetType);
            });
            it("should handle CASAFAN with command Hi", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(6);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Hi");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x06, 0x01, 0x00, 0x00, 0x01, 0x01, 0x80], packetType);
            });
            it("should handle CASAFAN with command Med", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(6);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Med");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x06, 0x02, 0x00, 0x00, 0x01, 0x02, 0x80], packetType);
            });
            it("should handle CASAFAN with command Low", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(6);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Low");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(3);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x06, 0x03, 0x00, 0x00, 0x01, 0x03, 0x80], packetType);
            });
            it("should handle CASAFAN with command Off", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(6);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Off");
                    expect(evt.commandNumber).toBe(4);
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x06, 0x04, 0x00, 0x00, 0x01, 0x04, 0x80], packetType);
            });
            it("should handle CASAFAN with command Light", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(6);
                    expect(evt.id).toBe("0x01");
                    expect(evt.command).toBe("Light");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x06, 0x05, 0x00, 0x00, 0x01, 0x05, 0x80], packetType);
            });
            it("should handle FT1211R with an invalid command 0", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(7);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x07, 0x00, 0x00, 0x12, 0x34, 0x00, 0x80], packetType);
            });
            it("should handle FT1211R with command Power", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(7);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("Power");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x07, 0x01, 0x00, 0x12, 0x34, 0x01, 0x80], packetType);
            });
            it("should handle FT1211R with command Light", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(7);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("Light");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x07, 0x02, 0x00, 0x12, 0x34, 0x02, 0x80], packetType);
            });
            it("should handle FT1211R with command 1", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(7);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("1");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(3);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x07, 0x03, 0x00, 0x12, 0x34, 0x03, 0x80], packetType);
            });
            it("should handle FT1211R with command 2", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(7);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("2");
                    expect(evt.commandNumber).toBe(4);
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x07, 0x04, 0x00, 0x12, 0x34, 0x04, 0x80], packetType);
            });
            it("should handle FT1211R with command 3", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(7);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("3");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x07, 0x05, 0x00, 0x12, 0x34, 0x05, 0x80], packetType);
            });
            it("should handle FT1211R with command 4", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(7);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("4");
                    expect(evt.commandNumber).toBe(6);
                    expect(evt.seqnbr).toBe(6);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x07, 0x06, 0x00, 0x12, 0x34, 0x06, 0x80], packetType);
            });
            it("should handle FT1211R with command 5", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(7);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("5");
                    expect(evt.commandNumber).toBe(7);
                    expect(evt.seqnbr).toBe(7);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x07, 0x07, 0x00, 0x12, 0x34, 0x07, 0x80], packetType);
            });
            it("should handle FT1211R with command F/R", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(7);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("F/R");
                    expect(evt.commandNumber).toBe(8);
                    expect(evt.seqnbr).toBe(8);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x07, 0x08, 0x00, 0x12, 0x34, 0x08, 0x80], packetType);
            });
            it("should handle FT1211R with command 1H", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(7);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("1H");
                    expect(evt.commandNumber).toBe(9);
                    expect(evt.seqnbr).toBe(9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x07, 0x09, 0x00, 0x12, 0x34, 0x09, 0x80], packetType);
            });
            it("should handle FT1211R with command 4H", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(7);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("4H");
                    expect(evt.commandNumber).toBe(10);
                    expect(evt.seqnbr).toBe(10);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x07, 0x0a, 0x00, 0x12, 0x34, 0x0a, 0x80], packetType);
            });
            it("should handle FT1211R with command 8H", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(7);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.command).toBe("8H");
                    expect(evt.commandNumber).toBe(11);
                    expect(evt.seqnbr).toBe(11);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x07, 0x0b, 0x00, 0x12, 0x34, 0x0b, 0x80], packetType);
            });
            it("should handle FALMEC with an invalid command 0", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(8);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x08, 0x00, 0x00, 0x12, 0x0f, 0x00, 0x80], packetType);
            });
            it("should handle FALMEC with command Power Off", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(8);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("Power Off");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x08, 0x01, 0x00, 0x12, 0x0f, 0x01, 0x80], packetType);
            });
            it("should handle FALMEC with command Speed 1", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(8);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("Speed 1");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x08, 0x02, 0x00, 0x12, 0x0f, 0x02, 0x80], packetType);
            });
            it("should handle FALMEC with command Speed 2", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(8);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("Speed 2");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(3);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x08, 0x03, 0x00, 0x12, 0x0f, 0x03, 0x80], packetType);
            });
            it("should handle FALMEC with command Speed 3", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(8);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("Speed 3");
                    expect(evt.commandNumber).toBe(4);
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x08, 0x04, 0x00, 0x12, 0x0f, 0x04, 0x80], packetType);
            });
            it("should handle FALMEC with command Speed 4", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(8);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("Speed 4");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x08, 0x05, 0x00, 0x12, 0x0f, 0x05, 0x80], packetType);
            });
            it("should handle FALMEC with command Timer 1", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(8);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("Timer 1");
                    expect(evt.commandNumber).toBe(6);
                    expect(evt.seqnbr).toBe(6);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x08, 0x06, 0x00, 0x12, 0x0f, 0x06, 0x80], packetType);
            });
            it("should handle FALMEC with command Timer 2", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(8);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("Timer 2");
                    expect(evt.commandNumber).toBe(7);
                    expect(evt.seqnbr).toBe(7);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x08, 0x07, 0x00, 0x12, 0x0f, 0x07, 0x80], packetType);
            });
            it("should handle FALMEC with command Timer 3", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(8);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("Timer 3");
                    expect(evt.commandNumber).toBe(8);
                    expect(evt.seqnbr).toBe(8);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x08, 0x08, 0x00, 0x12, 0x0f, 0x08, 0x80], packetType);
            });
            it("should handle FALMEC with command Timer 4", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(8);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("Timer 4");
                    expect(evt.commandNumber).toBe(9);
                    expect(evt.seqnbr).toBe(9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x08, 0x09, 0x00, 0x12, 0x0f, 0x09, 0x80], packetType);
            });
            it("should handle FALMEC with command Light On", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(8);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("Light On");
                    expect(evt.commandNumber).toBe(10);
                    expect(evt.seqnbr).toBe(10);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x08, 0x0a, 0x00, 0x12, 0x0f, 0x0a, 0x80], packetType);
            });
            it("should handle FALMEC with command Light Off", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(8);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("Light Off");
                    expect(evt.commandNumber).toBe(11);
                    expect(evt.seqnbr).toBe(11);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x08, 0x0b, 0x00, 0x12, 0x0f, 0x0b, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DCII with an invalid command 0", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(9);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x09, 0x00, 0x00, 0x12, 0x0f, 0x00, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DCII with command Off", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(9);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("Off");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x09, 0x01, 0x47, 0x12, 0x0f, 0x01, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DCII with command 1", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(9);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("1");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x09, 0x02, 0x47, 0x12, 0x0f, 0x02, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DCII with command 2", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(9);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("2");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(3);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x09, 0x03, 0x00, 0x12, 0x0f, 0x03, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DCII with command 3", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(9);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("3");
                    expect(evt.commandNumber).toBe(4);
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x09, 0x04, 0x00, 0x12, 0x0f, 0x04, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DCII with command 4", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(9);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("4");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x09, 0x05, 0x00, 0x12, 0x0f, 0x05, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DCII with command 5", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(9);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("5");
                    expect(evt.commandNumber).toBe(6);
                    expect(evt.seqnbr).toBe(6);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x09, 0x06, 0x00, 0x12, 0x0f, 0x06, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DCII with command 6", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(9);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("6");
                    expect(evt.commandNumber).toBe(7);
                    expect(evt.seqnbr).toBe(7);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x09, 0x07, 0x00, 0x12, 0x0f, 0x07, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DCII with command Light", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(9);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("Light");
                    expect(evt.commandNumber).toBe(8);
                    expect(evt.seqnbr).toBe(8);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x09, 0x08, 0x00, 0x12, 0x0f, 0x08, 0x80], packetType);
            });
            it("should handle LUCCI_AIR_DCII with command Reverse", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(9);
                    expect(evt.id).toBe("0x0F");
                    expect(evt.command).toBe("Reverse");
                    expect(evt.commandNumber).toBe(9);
                    expect(evt.seqnbr).toBe(9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x09, 0x09, 0x00, 0x12, 0x0f, 0x09, 0x80], packetType);
            });
            it("should handle ITHO_CVE_ECO_RFT with an invalid command 0", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(10);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0a, 0x00, 0x12, 0x34, 0x56, 0x00, 0x80], packetType);
            });
            it("should handle ITHO_CVE_ECO_RFT with command Low", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(10);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("Low");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0a, 0x01, 0x12, 0x34, 0x56, 0x01, 0x80], packetType);
            });
            it("should handle ITHO_CVE_ECO_RFT with command Medium", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(10);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("Medium");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0a, 0x02, 0x12, 0x34, 0x56, 0x02, 0x80], packetType);
            });
            it("should handle ITHO_CVE_ECO_RFT with command High", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(10);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("High");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(3);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0a, 0x03, 0x12, 0x34, 0x56, 0x03, 0x80], packetType);
            });
            it("should handle ITHO_CVE_ECO_RFT with command Timer 1", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(10);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("Timer 1");
                    expect(evt.commandNumber).toBe(4);
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0a, 0x04, 0x12, 0x34, 0x56, 0x04, 0x80], packetType);
            });
            it("should handle ITHO_CVE_ECO_RFT with command Timer 2", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(10);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("Timer 2");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0a, 0x05, 0x12, 0x34, 0x56, 0x05, 0x80], packetType);
            });
            it("should handle ITHO_CVE_ECO_RFT with command Timer 3", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(10);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("Timer 3");
                    expect(evt.commandNumber).toBe(6);
                    expect(evt.seqnbr).toBe(6);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0a, 0x06, 0x12, 0x34, 0x56, 0x06, 0x80], packetType);
            });
            it("should handle ITHO_CVE_ECO_RFT with command Standby", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(10);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("Standby");
                    expect(evt.commandNumber).toBe(7);
                    expect(evt.seqnbr).toBe(7);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0a, 0x07, 0x12, 0x34, 0x56, 0x07, 0x80], packetType);
            });
            it("should handle ITHO_CVE_ECO_RFT with command Full", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(10);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("Full");
                    expect(evt.commandNumber).toBe(8);
                    expect(evt.seqnbr).toBe(8);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0a, 0x08, 0x12, 0x34, 0x56, 0x08, 0x80], packetType);
            });
            it("should handle ITHO_CVE_ECO_RFT with command Join", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(10);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("Join");
                    expect(evt.commandNumber).toBe(9);
                    expect(evt.seqnbr).toBe(9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0a, 0x09, 0x12, 0x34, 0x56, 0x09, 0x80], packetType);
            });
            it("should handle ITHO_CVE_ECO_RFT with command Leave", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(10);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.command).toBe("Leave");
                    expect(evt.commandNumber).toBe(10);
                    expect(evt.seqnbr).toBe(10);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0a, 0x0a, 0x12, 0x34, 0x56, 0x0a, 0x80], packetType);
            });

            it("should handle NOVY with an invalid command 0", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(11);
                    expect(evt.id).toBe("0x09");
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0b, 0x00, 0x12, 0x34, 0x09, 0x00, 0x80], packetType);
            });
            it("should handle NOVY with command Power", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(11);
                    expect(evt.id).toBe("0x09");
                    expect(evt.command).toBe("Power");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0b, 0x01, 0x12, 0x34, 0x09, 0x01, 0x80], packetType);
            });
            it("should handle NOVY with command +", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(11);
                    expect(evt.id).toBe("0x09");
                    expect(evt.command).toBe("+");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0b, 0x02, 0x12, 0x34, 0x09, 0x02, 0x80], packetType);
            });
            it("should handle NOVY with command -", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(11);
                    expect(evt.id).toBe("0x09");
                    expect(evt.command).toBe("-");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(3);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0b, 0x03, 0x12, 0x34, 0x09, 0x03, 0x80], packetType);
            });
            it("should handle NOVY with command Light", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(11);
                    expect(evt.id).toBe("0x09");
                    expect(evt.command).toBe("Light");
                    expect(evt.commandNumber).toBe(4);
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0b, 0x04, 0x12, 0x34, 0x09, 0x04, 0x80], packetType);
            });
            it("should handle NOVY with command Learn", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(11);
                    expect(evt.id).toBe("0x09");
                    expect(evt.command).toBe("Learn");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0b, 0x05, 0x12, 0x34, 0x09, 0x05, 0x80], packetType);
            });
            it("should handle NOVY with command Reset Filter", function(done) {
                device.on("fan", function(evt) {
                    expect(evt.subtype).toBe(11);
                    expect(evt.id).toBe("0x09");
                    expect(evt.command).toBe("Reset Filter");
                    expect(evt.commandNumber).toBe(6);
                    expect(evt.seqnbr).toBe(6);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.fanHandler([0x0b, 0x06, 0x12, 0x34, 0x09, 0x06, 0x80], packetType);
            });
        });

        describe(".blinds1Handler", function () {
            let device = {};
            let packetType = 0x19;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should handle BLINDS_T0 devices open event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Open");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x00, 0x05, 0x00, 0x12, 0x34, 0x05, 0x00, 0x80], packetType);
            });
            it("should handle BLINDS_T0 devices close event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Close");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x00, 0x05, 0x00, 0x12, 0x34, 0x05, 0x01, 0x80], packetType);
            });
            it("should handle BLINDS_T0 devices stop event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Stop");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x00, 0x05, 0x00, 0x12, 0x34, 0x05, 0x02, 0x80], packetType);
            });
            it("should handle BLINDS_T0 devices confirm event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Confirm/Pair");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x00, 0x05, 0x00, 0x12, 0x34, 0x05, 0x03, 0x80], packetType);
            });
            it("should handle BLINDS_T0 devices set limit event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Set Limit");
                    expect(evt.commandNumber).toBe(4);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x00, 0x05, 0x00, 0x12, 0x34, 0x05, 0x04, 0x80], packetType);
            });
            it("should handle BLINDS_T0 devices unknown command event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(255);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x00, 0x05, 0x00, 0x12, 0x34, 0x05, 0xff, 0x80], packetType);
            });
            it("should handle BLINDS_T1 devices", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Open");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x01, 0x05, 0x00, 0x12, 0x34, 0x05, 0x00, 0x80], packetType);
            });
            it("should handle BLINDS_T2 devices", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(2);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Open");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x02, 0x05, 0x00, 0x12, 0x34, 0x05, 0x00, 0x80], packetType);
            });
            it("should handle BLINDS_T3 devices", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(3);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Open");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x03, 0x05, 0x00, 0x12, 0x34, 0x04, 0x00, 0x80], packetType);
            });
            it("should handle BLINDS_T3 devices group code", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(3);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(0);
                    expect(evt.command).toBe("Open");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x03, 0x05, 0x00, 0x12, 0x34, 0x10, 0x00, 0x80], packetType);
            });
            it("should handle BLINDS_T4 devices", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Open");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x04, 0x05, 0x00, 0x12, 0x34, 0x00, 0x00, 0x80], packetType);
            });
            it("should handle BLINDS_T4 devices delete limits event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Delete Limits");
                    expect(evt.commandNumber).toBe(6);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x04, 0x05, 0x00, 0x12, 0x34, 0x00, 0x06, 0x80], packetType);
            });
            it("should handle BLINDS_T4 devices change direction event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Change Direction");
                    expect(evt.commandNumber).toBe(7);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x04, 0x05, 0x00, 0x12, 0x34, 0x00, 0x07, 0x80], packetType);
            });
            it("should handle BLINDS_T4 devices set lower limit event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Set Lower Limit");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x04, 0x05, 0x00, 0x12, 0x34, 0x00, 0x05, 0x80], packetType);
            });
            it("should handle BLINDS_T6 devices", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(6);
                    expect(evt.id).toBe("0x5638010");
                    expect(evt.unitCode).toBe(3);
                    expect(evt.command).toBe("Close");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.blinds1Handler([0x06, 0x04, 0x56, 0x38, 0x01, 0x03, 0x01, 0x78], packetType);
            });
            it("should handle BLINDS_T10 devices change direction event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(10);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Change Direction");
                    expect(evt.commandNumber).toBe(6);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x0a, 0x05, 0x00, 0x12, 0x34, 0x00, 0x06, 0x80], packetType);
            });
            it("should handle BLINDS_T11 devices", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(11);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(3);
                    expect(evt.command).toBe("Open");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x0b, 0x05, 0x00, 0x12, 0x34, 0x03, 0x00, 0x80], packetType);
            });
        });

        describe(".edisioHandler", function () {
            let device = {};
            let packetType = 0x1c;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should handle an Off command", function (done) {
                device.on("edisio", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.unitCode).toBe(9);
                    expect(evt.command).toBe("Off");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(64);
                    expect(evt.level).toBe(1);
                    expect(evt.colour).toEqual({R: 2, G: 3, B: 4});
                    expect(evt.maxRepeat).toBe(5);
                    expect(evt.repeatCount).toBe(1);
                    expect(evt.batteryVoltage).toBe(8.9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.edisioHandler([0x00, 0x40, 0x12, 0x34, 0x56, 0x78, 0x09, 0x00, 0x01,
                    0x02, 0x03, 0x04, 0x05, 0x01, 0x59, 0x08], packetType);
            });
            it("should handle an On command", function (done) {
                device.on("edisio", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.unitCode).toBe(9);
                    expect(evt.command).toBe("On");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(65);
                    expect(evt.level).toBe(1);
                    expect(evt.colour).toEqual({R: 2, G: 3, B: 4});
                    expect(evt.maxRepeat).toBe(5);
                    expect(evt.repeatCount).toBe(1);
                    expect(evt.batteryVoltage).toBe(8.9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.edisioHandler([0x00, 0x41, 0x12, 0x34, 0x56, 0x78, 0x09, 0x01, 0x01,
                    0x02, 0x03, 0x04, 0x05, 0x01, 0x59, 0x08], packetType);
            });
            it("should handle a Toggle command", function (done) {
                device.on("edisio", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.unitCode).toBe(9);
                    expect(evt.command).toBe("Toggle");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.seqnbr).toBe(66);
                    expect(evt.level).toBe(1);
                    expect(evt.colour).toEqual({R: 2, G: 3, B: 4});
                    expect(evt.maxRepeat).toBe(5);
                    expect(evt.repeatCount).toBe(1);
                    expect(evt.batteryVoltage).toBe(8.9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.edisioHandler([0x00, 0x42, 0x12, 0x34, 0x56, 0x78, 0x09, 0x02, 0x01,
                    0x02, 0x03, 0x04, 0x05, 0x01, 0x59, 0x08], packetType);
            });
            it("should handle a Set level command", function (done) {
                device.on("edisio", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.unitCode).toBe(9);
                    expect(evt.command).toBe("Set Level");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(67);
                    expect(evt.level).toBe(82);
                    expect(evt.colour).toEqual({R: 2, G: 3, B: 4});
                    expect(evt.maxRepeat).toBe(5);
                    expect(evt.repeatCount).toBe(1);
                    expect(evt.batteryVoltage).toBe(8.9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.edisioHandler([0x00, 0x43, 0x12, 0x34, 0x56, 0x78, 0x09, 0x03, 0x52,
                    0x02, 0x03, 0x04, 0x05, 0x01, 0x59, 0x08], packetType);
            });
            it("should handle a Dim command", function (done) {
                device.on("edisio", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.unitCode).toBe(9);
                    expect(evt.command).toBe("Dim");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(69);
                    expect(evt.level).toBe(1);
                    expect(evt.colour).toEqual({R: 2, G: 3, B: 4});
                    expect(evt.maxRepeat).toBe(5);
                    expect(evt.repeatCount).toBe(1);
                    expect(evt.batteryVoltage).toBe(8.9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.edisioHandler([0x00, 0x45, 0x12, 0x34, 0x56, 0x78, 0x09, 0x05, 0x01,
                    0x02, 0x03, 0x04, 0x05, 0x01, 0x59, 0x08], packetType);
            });
            it("should handle a Toggle dim command", function (done) {
                device.on("edisio", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.unitCode).toBe(9);
                    expect(evt.command).toBe("Toggle Dim");
                    expect(evt.commandNumber).toBe(6);
                    expect(evt.seqnbr).toBe(70);
                    expect(evt.level).toBe(1);
                    expect(evt.colour).toEqual({R: 2, G: 3, B: 4});
                    expect(evt.maxRepeat).toBe(5);
                    expect(evt.repeatCount).toBe(1);
                    expect(evt.batteryVoltage).toBe(8.9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.edisioHandler([0x00, 0x46, 0x12, 0x34, 0x56, 0x78, 0x09, 0x06, 0x01,
                    0x02, 0x03, 0x04, 0x05, 0x01, 0x59, 0x08], packetType);
            });
            it("should handle a Stop dim command", function (done) {
                device.on("edisio", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.unitCode).toBe(9);
                    expect(evt.command).toBe("Stop Dim");
                    expect(evt.commandNumber).toBe(7);
                    expect(evt.seqnbr).toBe(71);
                    expect(evt.level).toBe(1);
                    expect(evt.colour).toEqual({R: 2, G: 3, B: 4});
                    expect(evt.maxRepeat).toBe(5);
                    expect(evt.repeatCount).toBe(1);
                    expect(evt.batteryVoltage).toBe(8.9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.edisioHandler([0x00, 0x47, 0x12, 0x34, 0x56, 0x78, 0x09, 0x07, 0x01,
                    0x02, 0x03, 0x04, 0x05, 0x01, 0x59, 0x08], packetType);
            });
            it("should handle an RGB command", function (done) {
                device.on("edisio", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.unitCode).toBe(9);
                    expect(evt.command).toBe("RGB");
                    expect(evt.commandNumber).toBe(8);
                    expect(evt.seqnbr).toBe(72);
                    expect(evt.level).toBe(1);
                    expect(evt.colour).toEqual({R: 2, G: 3, B: 4});
                    expect(evt.maxRepeat).toBe(5);
                    expect(evt.repeatCount).toBe(1);
                    expect(evt.batteryVoltage).toBe(8.9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.edisioHandler([0x00, 0x48, 0x12, 0x34, 0x56, 0x78, 0x09, 0x08, 0x01,
                    0x02, 0x03, 0x04, 0x05, 0x01, 0x59, 0x08], packetType);
            });
            it("should handle a Learn command", function (done) {
                device.on("edisio", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.unitCode).toBe(9);
                    expect(evt.command).toBe("Learn");
                    expect(evt.commandNumber).toBe(9);
                    expect(evt.seqnbr).toBe(73);
                    expect(evt.level).toBe(1);
                    expect(evt.colour).toEqual({R: 2, G: 3, B: 4});
                    expect(evt.maxRepeat).toBe(5);
                    expect(evt.repeatCount).toBe(1);
                    expect(evt.batteryVoltage).toBe(8.9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.edisioHandler([0x00, 0x49, 0x12, 0x34, 0x56, 0x78, 0x09, 0x09, 0x01,
                    0x02, 0x03, 0x04, 0x05, 0x01, 0x59, 0x08], packetType);
            });
            it("should handle a Shutter Open command", function (done) {
                device.on("edisio", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.unitCode).toBe(9);
                    expect(evt.command).toBe("Shutter Open");
                    expect(evt.commandNumber).toBe(10);
                    expect(evt.seqnbr).toBe(74);
                    expect(evt.level).toBe(1);
                    expect(evt.colour).toEqual({R: 2, G: 3, B: 4});
                    expect(evt.maxRepeat).toBe(5);
                    expect(evt.repeatCount).toBe(1);
                    expect(evt.batteryVoltage).toBe(8.9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.edisioHandler([0x00, 0x4a, 0x12, 0x34, 0x56, 0x78, 0x09, 0x0a, 0x01,
                    0x02, 0x03, 0x04, 0x05, 0x01, 0x59, 0x08], packetType);
            });
            it("should handle a Shutter Stop command", function (done) {
                device.on("edisio", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.unitCode).toBe(9);
                    expect(evt.command).toBe("Shutter Stop");
                    expect(evt.commandNumber).toBe(11);
                    expect(evt.seqnbr).toBe(75);
                    expect(evt.level).toBe(1);
                    expect(evt.colour).toEqual({R: 2, G: 3, B: 4});
                    expect(evt.maxRepeat).toBe(5);
                    expect(evt.repeatCount).toBe(1);
                    expect(evt.batteryVoltage).toBe(8.9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.edisioHandler([0x00, 0x4b, 0x12, 0x34, 0x56, 0x78, 0x09, 0x0b, 0x01,
                    0x02, 0x03, 0x04, 0x05, 0x01, 0x59, 0x08], packetType);
            });
            it("should handle a Shutter Close command", function (done) {
                device.on("edisio", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.unitCode).toBe(9);
                    expect(evt.command).toBe("Shutter Close");
                    expect(evt.commandNumber).toBe(12);
                    expect(evt.seqnbr).toBe(76);
                    expect(evt.level).toBe(1);
                    expect(evt.colour).toEqual({R: 2, G: 3, B: 4});
                    expect(evt.maxRepeat).toBe(5);
                    expect(evt.repeatCount).toBe(1);
                    expect(evt.batteryVoltage).toBe(8.9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.edisioHandler([0x00, 0x4c, 0x12, 0x34, 0x56, 0x78, 0x09, 0x0c, 0x01,
                    0x02, 0x03, 0x04, 0x05, 0x01, 0x59, 0x08], packetType);
            });
            it("should handle a Contact Normal message", function (done) {
                device.on("edisio", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.unitCode).toBe(9);
                    expect(evt.command).toBe("Contact Normal");
                    expect(evt.commandNumber).toBe(13);
                    expect(evt.seqnbr).toBe(77);
                    expect(evt.level).toBe(1);
                    expect(evt.colour).toEqual({R: 2, G: 3, B: 4});
                    expect(evt.maxRepeat).toBe(5);
                    expect(evt.repeatCount).toBe(1);
                    expect(evt.batteryVoltage).toBe(8.9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.edisioHandler([0x00, 0x4d, 0x12, 0x34, 0x56, 0x78, 0x09, 0x0d, 0x01,
                    0x02, 0x03, 0x04, 0x05, 0x01, 0x59, 0x08], packetType);
            });
            it("should handle a Contact Alert message", function (done) {
                device.on("edisio", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.unitCode).toBe(9);
                    expect(evt.command).toBe("Contact Alert");
                    expect(evt.commandNumber).toBe(14);
                    expect(evt.seqnbr).toBe(78);
                    expect(evt.level).toBe(1);
                    expect(evt.colour).toEqual({R: 2, G: 3, B: 4});
                    expect(evt.maxRepeat).toBe(5);
                    expect(evt.repeatCount).toBe(1);
                    expect(evt.batteryVoltage).toBe(8.9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.edisioHandler([0x00, 0x4e, 0x12, 0x34, 0x56, 0x78, 0x09, 0x0e, 0x01,
                    0x02, 0x03, 0x04, 0x05, 0x01, 0x59, 0x08], packetType);
            });
            it("should handle extra bytes", function (done) {
                device.on("edisio", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.unitCode).toBe(9);
                    expect(evt.command).toBe("Off");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(64);
                    expect(evt.extraBytes).toEqual([0xab, 0xcd, 0xef]);
                    expect(evt.batteryVoltage).toBe(8.9);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.edisioHandler([0x00, 0x40, 0x12, 0x34, 0x56, 0x78, 0x09, 0x00, 0x00,
                    0x00, 0x00, 0x00, 0x05, 0x01, 0x59, 0x08, 0xab, 0xcd, 0xef], packetType);
            });
        });

        describe(".activLinkHandler", function () {
            let device = {};
            let packetType = 0x1d;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should handle a bell push message", function(done) {
                device.on("activlink", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(18);
                    expect(evt.id).toBe("0x012345");
                    expect(evt.alert).toBe(0);
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.command).toBe("Normal");
                    expect(evt.rssi).toBe(6);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.activLinkHandler([0x00, 0x12, 0x01, 0x23, 0x45, 0x00, 0x00, 0x00, 0x69], packetType);
            });
            it("should decode the secret knock", function(done) {
                device.on("activlink", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(18);
                    expect(evt.id).toBe("0x012345");
                    expect(evt.alert).toBe(3);
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.command).toBe("Secret Knock");
                    expect(evt.rssi).toBe(6);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.activLinkHandler([0x00, 0x12, 0x01, 0x23, 0x45, 0x03, 0x01, 0x00, 0x69], packetType);
            });
            it("should handle a PIR message", function(done) {
                device.on("activlink", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.seqnbr).toBe(18);
                    expect(evt.id).toBe("0x012345");
                    expect(evt.alert).toBe(0);
                    expect(evt.deviceStatus).toBe(0);
                    expect(evt.rssi).toBe(6);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.activLinkHandler([0x01, 0x12, 0x01, 0x23, 0x45, 0x00, 0x00, 0x00, 0x69], packetType);
            });
        });

        describe(".funkbusHandler", function () {
            let device = {};
            let packetType = 0x1e;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a funkbus message when called", function(done) {
                device.on("funkbus", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.groupCode).toBe("B");
                    expect(evt.channelNumber).toBe(1);
                    expect(evt.command).toBe("Channel Up");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(64);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.funkbusHandler([0x00, 0x40, 0x12, 0x34, 0x42, 0x01, 0x01, 0x00, 0x00, 0x80], packetType);
            });
            it("should handle a Gira scene command", function(done) {
                device.on("funkbus", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.groupCode).toBe("B");
                    expect(evt.command).toBe("Scene");
                    expect(evt.sceneNumber).toBe(3);
                    expect(evt.channelNumber).toBeUndefined();
                    expect(evt.commandNumber).toBe(4);
                    expect(evt.seqnbr).toBe(64);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.funkbusHandler([0x00, 0x40, 0x12, 0x34, 0x42, 0x03, 0x04, 0x00, 0x00, 0x80], packetType);
            });
            it("should handle an Insta channel command", function(done) {
                device.on("funkbus", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.groupCode).toBe("B");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.command).toBe("Channel Down");
                    expect(evt.sceneNumber).toBeUndefined();
                    expect(evt.channelNumber).toBe(6);
                    expect(evt.seqnbr).toBe(65);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.funkbusHandler([0x01, 0x41, 0x12, 0x34, 0x42, 0x06, 0x00, 0x00, 0x00, 0x80], packetType);
            });
            it("should handle a command time & device type number", function(done) {
                device.on("funkbus", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.groupCode).toBe("B");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.command).toBe("Channel Up");
                    expect(evt.sceneNumber).toBeUndefined();
                    expect(evt.channelNumber).toBe(3);
                    expect(evt.seqnbr).toBe(64);
                    expect(evt.commandTime).toBe(35);
                    expect(evt.deviceTypeNumber).toBe(2);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.funkbusHandler([0x00, 0x40, 0x12, 0x34, 0x42, 0x03, 0x01, 0x23, 0x02, 0x80], packetType);
            });
        });

        describe(".hunterfanHandler", function () {
            let device = {};
            let packetType = 0x1f;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should handle an Off command", function (done) {
                device.on("hunterfan", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x123456789ABC");
                    expect(evt.command).toBe("Off");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(64);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.hunterfanHandler([0x00, 0x40, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0x01, 0x80], packetType);
            });
            it("should handle a Light command", function (done) {
                device.on("hunterfan", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x123456789ABC");
                    expect(evt.command).toBe("Light");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.seqnbr).toBe(64);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.hunterfanHandler([0x00, 0x40, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0x02, 0x80], packetType);
            });
            it("should handle a Speed 1 command", function (done) {
                device.on("hunterfan", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x123456789ABC");
                    expect(evt.command).toBe("Speed 1");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(64);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.hunterfanHandler([0x00, 0x40, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0x03, 0x80], packetType);
            });
            it("should handle a Speed 2 command", function (done) {
                device.on("hunterfan", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x123456789ABC");
                    expect(evt.command).toBe("Speed 2");
                    expect(evt.commandNumber).toBe(4);
                    expect(evt.seqnbr).toBe(64);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.hunterfanHandler([0x00, 0x40, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0x04, 0x80], packetType);
            });
            it("should handle a Speed 3 command", function (done) {
                device.on("hunterfan", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x123456789ABC");
                    expect(evt.command).toBe("Speed 3");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(64);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.hunterfanHandler([0x00, 0x40, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0x05, 0x80], packetType);
            });
            it("should handle a Program command", function (done) {
                device.on("hunterfan", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x123456789ABC");
                    expect(evt.command).toBe("Program");
                    expect(evt.commandNumber).toBe(6);
                    expect(evt.seqnbr).toBe(64);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.hunterfanHandler([0x00, 0x40, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0x06, 0x80], packetType);
            });
        });

        describe(".security1Handler", function () {
            let device = {};
            let packetType = 0x20;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.id).toBe("0xFF00");
                    done();
                });
                device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x02, 0x89], packetType);
            });

            it("should correctly identify the NORMAL device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.NORMAL);
                    done();
                });
                device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x00, 0x89], packetType);
            });
            it("should correctly identify the NORMAL_DELAYED device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.NORMAL_DELAYED);
                    done();
                });
                device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x01, 0x89], packetType);
            });

            it("should correctly identify the ALARM device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.ALARM);
                    done();
                });
                device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x02, 0x89], packetType);
            });
            it("should correctly identify the ALARM_DELAYED device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.ALARM_DELAYED);
                    done();
                });
                device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x03, 0x89], packetType);
            });
            it("should correctly identify the MOTION device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.MOTION);
                    done();
                });
                device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89], packetType);
            });
            it("should correctly identify the NO_MOTION device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.NO_MOTION);
                    done();
                });
                device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x05, 0x89], packetType);
            });

            it("should identify the X10 security motion sensor correctly", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.security.X10_MOTION_SENSOR);
                    done();
                });
                device.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89], packetType);
            });
            it("should identify the X10 security window sensor correctly", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.security.X10_DOOR_WINDOW_SENSOR);
                    done();
                });
                device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89], packetType);
            });
            it("should correctly identify the tamper notification from a device", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus)
                        .toBe(rfxcom.security.MOTION);
                    expect(evt.tampered)
                        .toBeTruthy();
                    done();
                });
                device.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x84, 0x89], packetType);
            });
            it("should report not tampered if the device isn't tampered with", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.tampered).not.toBeTruthy();
                    done();
                });
                device.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89], packetType);
            });
            it("should correctly identify the battery status", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89], packetType);
            });
            it("should correctly identify the signal strength", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89], packetType);
            });
        });

        describe(".camera1Handler", function () {
            let device = {};
            let packetType = 0x28;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the event data", function(done) {
                device.on("camera1", function(evt) {
                    expect(evt.houseCode).toBe("A");
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.command).toBe("Right");
                    done();
                });
                device.camera1Handler([0x00, 0x00, 0x41, 0x01, 0x80], packetType);
            });
            it("should handle the highest command number and house code", function (done) {
                device.on("camera1", function(evt) {
                    expect(evt.houseCode).toBe("P");
                    expect(evt.commandNumber).toBe(15);
                    expect(evt.command).toBe("Program Sweep");
                    done();
                });
                device.camera1Handler([0x00, 0x00, 0x50, 0x0f, 0x80], packetType);
            });

        });

        describe(".remoteHandler", function () {
            let device = {};
            let packetType = 0x30;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should handle a command packet", function (done) {
                device.on("remote", function (evt) {
                    expect(evt.id).toBe("0x0F");
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.commandNumber).toBe(12);
                    expect(evt.command).toBe("CHAN-");
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.remoteHandler([0x00, 0x04, 0x0F, 0x0C, 0x82], packetType);
            });
        });

        describe(".blinds2Handler", function () {
            let device = {};
            let packetType = 0x31;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should handle BREL_DOOYA device up event", function(done) {
                device.on("blinds2", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Up");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.percent).toBe(50);
                    expect(evt.angle).toBe(90);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.batteryLevel).toBe(3);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds2Handler([0x00, 0x05, 0x12, 0x34, 0x56, 0x78, 0x04, 0x00, 50, 90, 0x83], packetType);
            });
        });

        describe(".thermostat1Handler", function () {
            let device = {};
            let packetType = 0x40;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should handle a status update packet", function (done) {
                device.on("thermostat1", function (evt) {
                    expect(evt.id).toBe("0x6B18");
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(27);
                    expect(evt.temperature).toBe(22);
                    expect(evt.setpoint).toBe(21);
                    expect(evt.mode).toBe("Heating");
                    expect(evt.modeNumber).toBe(0);
                    expect(evt.status).toBe("No Demand");
                    expect(evt.statusNumber).toBe(2);
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.thermostat1Handler([0x00, 0x1B, 0x6B, 0x18, 0x16, 0x15, 0x02, 0x70], packetType);
            });
        });

        describe(".thermostat3Handler", function () {
            let device = {};
            let packetType = 0x42;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should handle a status update packet", function (done) {
                device.on("thermostat3", function (evt) {
                    expect(evt.id).toBe("0x019FAB");
                    expect(evt.subtype).toBe(1);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.command).toBe("Up");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.thermostat3Handler([0x01, 0x01, 0x01, 0x9F, 0xAB, 0x02, 0x81], packetType);
            });
        });

        describe(".bbqHandler", function () {
            let device = {};
            let packetType = 0x4e;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("bbq1", function(evt) {
                    expect(evt.id).toBe("0x0000");
                    expect(evt.subtype).toBe(1);
                    expect(evt.seqnbr).toBe(0);
                    done();
                });
                device.bbqHandler([0x01, 0x00, 0x00, 0x00, 0x00, 0x19, 0x00, 0x17, 0x89], packetType);
            });
            it("should report the sensor temperatures", function (done) {
                device.on("bbq1", function(evt) {
                    expect(evt.temperature[0]).toBe(25);
                    expect(evt.temperature[1]).toBe(23);
                    done();
                });
                device.bbqHandler([0x01, 0x00, 0x00, 0x00, 0x00, 0x19, 0x00, 0x17, 0x89], packetType);
            });
            it("should correctly identify the battery status", function(done) {
                device.on("bbq1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.bbqHandler([0x01, 0x00, 0x00, 0x00, 0x00, 0x19, 0x00, 0x17, 0x89], packetType);
            });
            it("should correctly identify the signal strength", function(done) {
                device.on("bbq1", function(evt) {
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.bbqHandler([0x01, 0x00, 0x00, 0x00, 0x00, 0x19, 0x00, 0x17, 0x89], packetType);
            });

        });

        describe(".temprainHandler", function() {
            let device = {};
            let packetType = 0x4f;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("temperaturerain1", function(evt) {
                    expect(evt.id).toBe("0xDEAD");
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.temprainHandler([0x01, 0x01, 0xde, 0xad, 0x01, 0x4A, 0x02, 0xee, 0x42], packetType);
            });
            it("should extract the rainfall value", function(done) {
                device.on("temperaturerain1", function(evt) {
                    expect(evt.rainfall).toBe(75.0);
                    done();
                });
                device.temprainHandler([0x01, 0x01, 0xde, 0xad, 0x01, 0x4A, 0x02, 0xee, 0x42], packetType);
            });
            it("should extract the temperature value", function(done) {
                device.on("temperaturerain1", function(evt) {
                    expect(evt.temperature).toBe(33.3);
                    done();
                });
                device.temprainHandler([0x01, 0x01, 0xde, 0xad, 0x01, 0x4D, 0x02, 0xee, 0x42], packetType);
            });
            it("should extract a negative temperature value", function(done) {
                device.on("temperaturerain1", function(evt) {
                    expect(evt.temperature).toBe(-10.0);
                    done();
                });
                device.temprainHandler([0x01, 0x01, 0xde, 0xad, 0x80, 0x64, 0x02, 0xee, 0x42], packetType);
            });
            it("should extract the battery strength correctly", function(done) {
                device.on("temperaturerain1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.temprainHandler([0x01, 0x01, 0xde, 0xad, 0x80, 0x64, 0x02, 0xee, 0x09], packetType);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("temperaturerain1", function(evt) {
                    expect(evt.rssi).toBe(6);
                    done();
                });
                device.temprainHandler([0x01, 0x01, 0xde, 0xad, 0x80, 0x64, 0x02, 0xee, 0x60], packetType);
            });
        });

        describe(".tempHandler", function() {
            let device = {};
            let packetType = 0x50;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("temperature1", function(evt) {
                    expect(evt.id).toBe("0xFAAF");
                    expect(evt.subtype).toBe(3);
                    done();
                });
                device.tempHandler([0x03, 0x01, 0xFA, 0xAF, 0x00, 0x14, 0x42], packetType);
            });
            it("should extract the temperature of the device", function(done) {
                device.on("temperature1", function(evt) {
                    expect(evt.temperature).toBe(2.0);
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.tempHandler([0x01, 0x01, 0xFA, 0xAF, 0x00, 0x14, 0x9f], packetType);
            });
            it("should extract the temperature respecting the sign", function(done) {
                device.on("temperature1", function(evt) {
                    expect(evt.temperature).toBe(-2.0);
                    done();
                });
                device.tempHandler([0x01, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x9f], packetType);
            });
            it("should extract the battery strength correctly", function(done) {
                device.on("temperature1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    expect(evt.subtype).toBe(2);
                    done();
                });
                device.tempHandler([0x02, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x69], packetType);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("temperature1", function(evt) {
                    expect(evt.rssi).toBe(6);
                    done();
                });
                device.tempHandler([0x02, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x69], packetType);
            });
        });

        describe(".humidityHandler", function() {
            let device = {};
            let packetType = 0x51;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("humidity1", function(evt) {
                    expect(evt.id).toBe("0x7700");
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.humidityHandler([0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89], packetType);
            });
            it("should extract the humidity value", function(done) {
                device.on("humidity1", function(evt) {
                    expect(evt.humidity).toBe(54);
                    done();
                });
                device.humidityHandler([0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89], packetType);
            });
            it("should extract the humidity status", function(done) {
                device.on("humidity1", function(evt) {
                    expect(evt.humidityStatus).toBe(1);
                    done();
                });
                device.humidityHandler([0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89], packetType);
            });
            it("should extract the battery status", function(done) {
                device.on("humidity1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.humidityHandler([0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89], packetType);
            });
            it("should extract the rssi", function(done) {
                device.on("humidity1", function(evt) {
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.humidityHandler([0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89], packetType);
            });
        });

        describe(".temphumidityHandler", function() {
            let device = {};
            let packetType = 0x52;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("temperaturehumidity1", function(evt) {
                    expect(evt.id).toBe("0xAF01");
                    expect(evt.subtype).toBe(3);
                    done();
                });
                device.temphumidityHandler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59], packetType);
            });
            it("should extract the temperature of the device", function(done) {
                device.on("temperaturehumidity1", function(evt) {
                    expect(evt.temperature).toBe(14.4);
                    done();
                });
                device.temphumidityHandler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59], packetType);
            });
            it("should extract the temperature respecting the sign", function(done) {
                device.on("temperaturehumidity1", function(evt) {
                    expect(evt.temperature).toBe(-14.4);
                    done();
                });
                device.temphumidityHandler([0x03, 0x04, 0xAF, 0x01, 0x80, 0x90, 0x36, 0x02, 0x59], packetType);
            });
            it("should extract the humidity figure", function(done) {
                device.on("temperaturehumidity1", function(evt) {
                    expect(evt.humidity).toBe(54);
                    done();
                });
                device.temphumidityHandler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59], packetType);
            });
            it("should extract the humidity status", function(done) {
                device.on("temperaturehumidity1", function(evt) {
                    expect(evt.humidityStatus).toBe(rfxcom.humidity.DRY);
                    done();
                });
                device.temphumidityHandler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59], packetType);
            });
            it("should extract the battery strength correctly", function(done) {
                device.on("temperaturehumidity1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.temphumidityHandler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x89], packetType);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("temperaturehumidity1", function(evt) {
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.temphumidityHandler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x89], packetType);
            });
        });

        describe(".temphumbaroHandler", function() {
            let device = {};
            let packetType = 0x54;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.id).toBe("0xE900");
                    expect(evt.subtype).toBe(2);
                    done();
                });
                device.temphumbaroHandler([0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39], packetType);
            });
            it("should extract the seqnbr of the message", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.seqnbr).toBe(14);
                    done();
                });
                device.temphumbaroHandler([0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39], packetType);
            });
            it("should extract the temperature of the device", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.temperature).toBe(20.1);
                    done();
                });
                device.temphumbaroHandler([0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39], packetType);
            });
            it("should extract the temperature respecting the sign", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.temperature).toBe(-20.1);
                    done();
                });
                device.temphumbaroHandler([0x02, 0x0E, 0xE9, 0x00, 0x80, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39], packetType);
            });
            it("should extract the humidity figure", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.humidity).toBe(39);
                    done();
                });
                device.temphumbaroHandler([0x01, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39], packetType);
            });
            it("should extract the humidity status", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.humidityStatus).toBe(rfxcom.humidity.DRY);
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.temphumbaroHandler([0x01, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39], packetType);
            });
            it("should extract the weather forecast", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.forecast).toBe(rfxcom.forecast.RAIN);
                    done();
                });
                device.temphumbaroHandler([0x01, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39], packetType);
            });
            it("should extract the battery strength correctly", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.temphumbaroHandler([0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39], packetType);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.rssi).toBe(3);
                    done();
                });
                device.temphumbaroHandler([0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39], packetType);
            });
        });

        describe(".rainHandler", function() {
            let device = {};
            let packetType = 0x55;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.id).toBe("0xB600");
                    expect(evt.subtype).toBe(2);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69], packetType);
            });
            it("should extract the total rainfall", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rainfall).toBe(1977.2);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69], packetType);
            });
            it("should not emit a rainfall increment", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.hasOwnProperty("rainfallIncrement")).toBe(false);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69], packetType);
            });
            it("should extract the rainfall rate", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rainfallRate).toBe(0.0);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69], packetType);
            });
            it("should extract the battery level", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69], packetType);
            });
            it("should extract the signal level", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rssi).toBe(6);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69], packetType);
            });
            it("should extract the rainfall increment for a RAIN6 sensor", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rainfallIncrement).toBeCloseTo(3.458, 8);
                    expect(evt.subtype).toBe(6);
                    done();
                });
                device.rainHandler([0x06, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x0d, 0x69], packetType);
            });
            it("should extract the rainfall increment for a RAIN8 sensor", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rainfallIncrement).toBeCloseTo(3.40, 8);
                    expect(evt.subtype).toBe(8);
                    done();
                });
                device.rainHandler([0x08, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x11, 0x69], packetType);
            });
            it("should extract the rainfall increment for a RAIN8 sensor", function(done) {
                device.setDeviceParameter("rain1", "RAIN8", 0xb600, "cartridgeVolume", 0.01);
                device.on("rain1", function(evt) {
                    expect(evt.rainfallIncrement).toBeCloseTo(0.17, 9);
                    expect(evt.subtype).toBe(8);
                    done();
                });
                device.rainHandler([0x08, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x11, 0x69], packetType);
            });
            it("should extract the rainfall increment for a RAIN8 sensor", function(done) {
                device.setDeviceParameter("rain1", "RAIN8", "0xb600", "cartridgeVolume", 0.2);
                device.on("rain1", function(evt) {
                    expect(evt.rainfallIncrement).toBeCloseTo(3.40, 8);
                    expect(evt.subtype).toBe(8);
                    done();
                });
                device.rainHandler([0x08, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x11, 0x69], packetType);
            });
            it("should extract the rainfall increment for a RAIN9 sensor", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rainfallIncrement).toBeCloseTo(68.326, 7);
                    expect(evt.subtype).toBe(9);
                    done();
                });
                device.rainHandler([0x09, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x01, 0x0d, 0x69], packetType);
            });
            it("should not emit a total rainfall", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.hasOwnProperty("rainfall")).toBe(false);
                    done();
                });
                device.rainHandler([0x06, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x0d, 0x69], packetType);
            });
            it("should extract the rainfall rate", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rainfallRate).toBe(289.0);
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.rainHandler([0x01, 0x17, 0xb6, 0x00, 0x01, 0x21, 0x00, 0x4d, 0x3c, 0x69], packetType);
            });
            it("should extract the rainfall rate", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rainfallRate).toBe(2.89);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x01, 0x21, 0x00, 0x4d, 0x3c, 0x69], packetType);
            });
            it("should extract the battery level correctly", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x01, 0x21, 0x00, 0x4d, 0x3c, 0x69], packetType);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rssi).toBe(6);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x01, 0x21, 0x00, 0x4d, 0x3c, 0x69], packetType);
            });
        });

        describe(".windHandler", function() {
            let device = {};
            let packetType = 0x56;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.id).toBe("0x2F00");
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.windHandler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79], packetType);
            });
            it("should extract the wind direction", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.direction).toBe(135);
                    done();
                });
                device.windHandler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79], packetType);
            });
            it("should extract the average wind speed", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.averageSpeed).toBe(0.0);
                    done();
                });
                device.windHandler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79], packetType);
            });
            it("should extract the gust speed", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.gustSpeed).toBe(2.0);
                    done();
                });
                device.windHandler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79], packetType);
            });
            it("should not provide temperature or windchill with a subtype 1 sensor", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.hasOwnProperty("temperature")).toBe(false);
                    expect(evt.hasOwnProperty("chillfactor")).toBe(false);
                    done();
                });
                device.windHandler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79], packetType);
            });
            it("should not provide direction or windchill with a subtype 8 sensor", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.hasOwnProperty("direction")).toBe(false);
                    expect(evt.hasOwnProperty("chillfactor")).toBe(false);
                    done();
                });
                device.windHandler([0x08, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79], packetType);
            });
            it("should extract the windchill from a subtype 4 sensor", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.chillfactor).toBe(1.0);
                    expect(evt.subtype).toBe(4);
                    done();
                });
                device.windHandler([0x04, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x0a, 0x79], packetType);
            });
            it("should extract a negative windchill correctly", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.chillfactor).toBe(-31.4);
                    done();
                });
                device.windHandler([0x04, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x81, 0x3a, 0x79], packetType);
            });
            it("should extract the temperature", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.temperature).toBe(7.3);
                    done();
                });
                device.windHandler([0x04, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x0a, 0x79], packetType);
            });
            it("should extract a negative temperature correctly", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.temperature).toBe(-7.3);
                    done();
                });
                device.windHandler([0x04, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x80, 0x49, 0x81, 0x3a, 0x79], packetType);
            });
            it("should extract the wind speed from a subtype 5 sensor", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.gustSpeed).toBe(2.0);
                    expect(evt.hasOwnProperty("averageSpeed")).toBe(false);
                    expect(evt.subtype).toBe(5);
                    done();
                });
                device.windHandler([0x05, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79], packetType);
            });
            it("should extract the battery level correctly", function(done) {
                device.on("wind1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.windHandler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79], packetType);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("wind1", function(evt) {
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.windHandler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79], packetType);
            });
        });

        describe(".uvHandler", function() {
            let device = {};
            let packetType = 0x57;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function (done) {
                device.on("uv1", function (evt) {
                    expect(evt.id).toBe("0xF1D0");
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.uvHandler([0x01, 0x13, 0xf1, 0xd0, 0x0a, 0x00, 0xc8, 0x79], packetType);
            });
            it("should extract the uv index", function (done) {
                device.on("uv1", function (evt) {
                    expect(evt.uv).toBe(1.0);
                    done();
                });
                device.uvHandler([0x01, 0x13, 0xf1, 0xd0, 0x0a, 0x00, 0xc8, 0x79], packetType);
            });
            it("should extract the temperature", function (done) {
                device.on("uv1", function (evt) {
                    expect(evt.temperature).toBe(20.0);
                    done();
                });
                device.uvHandler([0x03, 0x13, 0xf1, 0xd0, 0x0a, 0x00, 0xc8, 0x79], packetType);
            });
            it("should extract a negative temperature", function (done) {
                device.on("uv1", function (evt) {
                    expect(evt.temperature).toBe(-5.0);
                    done();
                });
                device.uvHandler([0x03, 0x13, 0xf1, 0xd0, 0x0a, 0x80, 0x32, 0x79], packetType);
            });
            it("should extract the battery level correctly", function(done) {
                device.on("uv1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.uvHandler([0x01, 0x13, 0xf1, 0xd0, 0x0a, 0x80, 0x32, 0x79], packetType);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("uv1", function(evt) {
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.uvHandler([0x01, 0x13, 0xf1, 0xd0, 0x0a, 0x80, 0x32, 0x79], packetType);
            });
        });

        describe(".dateTimeHandler", function () {
            let device = {};
            let packetType = 0x58;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should handle a command packet", function (done) {
                device.on("datetime", function (evt) {
                    expect(evt.id).toBe("0x1234");
                    expect(evt.subtype).toBe(1);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.year).toBe(17);
                    expect(evt.month).toBe(8);
                    expect(evt.day).toBe(17);
                    expect(evt.hour).toBe(20);
                    expect(evt.minute).toBe(27);
                    expect(evt.second).toBe(17);
                    expect(evt.weekDay).toBe(5);
                    expect(evt.timestamp).toEqual(new Date(17,8,17,20,27,17));
                    expect(evt.rssi).toBe(7);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.dateTimeHandler([0x01, 0x00, 0x12, 0x34, 0x11, 0x08, 0x11, 0x05, 0x14, 0x1B, 0x11, 0x79], packetType);
            });
        });

        describe(".elec1Handler", function () {
            let device = {};
            let packetType = 0x59;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit an elec1 event when called with subtype CM113", function (done) {
                device.on("elec1", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x8600");
                    expect(evt.count).toBe(4);
                    expect(evt.current[0]).toBeCloseTo(2.9, 11);
                    expect(evt.current[1]).toBeCloseTo(0.0, 11);
                    expect(evt.current[2]).toBeCloseTo(0.0, 11);
                    expect(evt.rssi).toBe(4);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.elec1Handler([0x01, 0x0F, 0x86, 0x00, 0x04, 0x00, 0x1D, 0x00, 0x00, 0x00, 0x00, 0x49], packetType);
            })
        });

        describe(".elec23Handler", function () {
            let device = {};
            let packetType = 0x5a;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit an elec23 event when called with subtype CM119_160", function (done) {
                device.on("elec23", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x1A73");
                    expect(evt.count).toBe(0);
                    expect(evt.power).toBe(1014);
                    expect(evt.energy).toBeCloseTo(60.7110602416, 10);
                    expect(evt.rssi).toBe(8);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.elec23Handler([0x01, 0x07, 0x1A, 0x73, 0x00, 0x00, 0x00, 0x03, 0xF6, 0x00, 0x00, 0x00, 0x00, 0x35, 0x0B, 0x89], packetType);
            });
            it("should emit an elec23 event when called with subtype CM180", function (done) {
                device.on("elec23", function (evt) {
                    expect(evt.subtype).toBe(2);
                    expect(evt.id).toBe("0xA412");
                    expect(evt.power).toBe(370);
                    expect(evt.energy).toBeCloseTo(30226.3151306, 6);
                    expect(evt.rssi).toBe(7);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.elec23Handler([0x02, 0x00, 0xA4, 0x12, 0x00, 0x00, 0x00, 0x01, 0x72, 0x00, 0x00, 0x00, 0x67, 0x28, 0x97, 0x79], packetType);
            });
            it("should not include an energy reading when called with subtype CM180 and count != 0", function (done) {
                device.on("elec23", function (evt) {
                    expect(evt.subtype).toBe(2);
                    expect(evt.id).toBe("0xA412");
                    expect(evt.power).toBe(370);
                    expect(evt.energy).toBeUndefined();
                    expect(evt.rssi).toBe(7);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.elec23Handler([0x02, 0x01, 0xA4, 0x12, 0x01, 0x00, 0x00, 0x01, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79], packetType);
            });

        });

        describe(".elec4Handler", function () {
            let device = {};
            let packetType = 0x5b;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit an elec4 event when called with subtype CM180I", function (done) {
                device.on("elec4", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0xB800");
                    expect(evt.seqnbr).toBe(6);
                    expect(evt.count).toBe(0);
                    expect(evt.current[0]).toBeCloseTo(2.2, 11);
                    expect(evt.current[1]).toBeCloseTo(0.0, 11);
                    expect(evt.current[2]).toBeCloseTo(0.0, 11);
                    expect(evt.energy).toBeCloseTo(32547.4233902, 7);
                    expect(evt.rssi).toBe(8);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.elec4Handler([0x01, 0x06, 0xB8, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x6F, 0x14, 0x88, 0x89], packetType);
            });
            it("should not include an energy reading when called with subtype CM180I and count != 0", function (done) {
                device.on("elec4", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0xB800");
                    expect(evt.seqnbr).toBe(79);
                    expect(evt.count).toBe(2);
                    expect(evt.current[0]).toBeCloseTo(2.9, 11);
                    expect(evt.current[1]).toBeCloseTo(0.0, 11);
                    expect(evt.current[2]).toBeCloseTo(0.0, 11);
                    expect(evt.energy).toBeUndefined();
                    expect(evt.rssi).toBe(7);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.elec4Handler([0x01, 0x4F, 0xB8, 0x00, 0x02, 0x00, 0x1D, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79], packetType);
            });
        });

        describe(".elec5Handler", function () {
            let device = {};
            let packetType = 0x5c;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit an elec event when called with subtype REVOLT", function (done) {
                device.on("elec5", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x002D");
                    expect(evt.seqnbr).toBe(3);
                    expect(evt.voltage).toBe(228.0);
                    expect(evt.current).toBe(0.0);
                    expect(evt.power).toBe(0.0);
                    expect(evt.energy).toBe(30);
                    expect(evt.powerFactor).toBe(0);
                    expect(evt.frequency).toBe(50);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.elec5Handler([0x01, 0x03, 0x00, 0x2D, 0xE4, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x00, 0x32, 0x80], packetType);
            });
            it("should emit an elec event when called with subtype REVOLT", function (done) {
                device.on("elec5", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x002D");
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.voltage).toBe(228.0);
                    expect(evt.current).toBe(0.02);
                    expect(evt.power).toBe(4.7);
                    expect(evt.energy).toBe(30);
                    expect(evt.powerFactor).toBe(1);
                    expect(evt.frequency).toBe(50);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.elec5Handler([0x01, 0x04, 0x00, 0x2D, 0xE4, 0x00, 0x02, 0x00, 0x2F, 0x00, 0x03, 0x64, 0x32, 0x80], packetType);
            });
            it("should emit an elec event when called with subtype REVOLT", function (done) {
                device.on("elec5", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x002D");
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.voltage).toBe(227.0);
                    expect(evt.current).toBe(0.2);
                    expect(evt.power).toBe(44.5);
                    expect(evt.energy).toBe(30);
                    expect(evt.powerFactor).toBe(1);
                    expect(evt.frequency).toBe(50);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.elec5Handler([0x01, 0x05, 0x00, 0x2D, 0xE3, 0x00, 0x14, 0x01, 0xBD, 0x00, 0x03, 0x64, 0x32, 0x80], packetType);
            });
            it("should emit an elec event when called with subtype REVOLT", function (done) {
                device.on("elec5", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x002D");
                    expect(evt.seqnbr).toBe(6);
                    expect(evt.voltage).toBe(227.0);
                    expect(evt.current).toBe(0.05);
                    expect(evt.power).toBe(8.7);
                    expect(evt.energy).toBe(30);
                    expect(evt.powerFactor).toBe(0.77);
                    expect(evt.frequency).toBe(50);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.elec5Handler([0x01, 0x06, 0x00, 0x2D, 0xE3, 0x00, 0x05, 0x00, 0x57, 0x00, 0x03, 0x4D, 0x32, 0x80], packetType);
            });
        });

        describe(".weightHandler", function() {
            let device = {};
            let packetType = 0x5d;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a weight event when called", function(done) {
                device.on("weight1", function(evt) {
                    expect(evt.subtype).toBe(0x01);
                    expect(evt.seqnbr).toBe(0xF5);
                    expect(evt.weight).toBe(83.2);
                    expect(evt.id).toBe("0x0007");
                    expect(evt.batteryLevel).toBe(3);
                    expect(evt.rssi).toBe(9);
                    done();
                });
                device.weightHandler([0x01, 0xF5, 0x00, 0x07, 0x03, 0x40, 0x93], packetType);
            });
        });

        describe("cartelectronicHandler", function () {
            let device = {};
            let packetType = 0x60;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a cartelectronic event when called with a CARTELECTRONIC_TIC subtype", function(done) {
                device.on("cartelectronic", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.cartelectronic.CARTELECTRONIC_TIC);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.id).toBe("0x123456789A");
                    expect(evt.identifiantCompteur).toBe("078187493530");
                    expect(evt.typeContrat).toBe("Tempo");
                    expect(evt.périodeTarifaireEnCours).toBe("Heures creuses blanches");
                    expect(evt.compteur).toEqual([{valeur: 0x12345678, unité: "Wh", période: "Heures creuses blanches"},
                        {valeur: 0x12345678, unité: "Wh", période: "Heures pleines blanches"}]);
                    expect(evt.puissanceApparente).toBe(1882.0);
                    expect(evt.puissanceApparenteValide).toBe(true);
                    expect(evt.teleInfoPrésente).toBe(true);
                    expect(evt.rssi).toBe(7);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.cartelectronicHandler([0x01, 0x00, 0x12, 0x34, 0x56, 0x78, 0x9a,
                    0x47, 0x12, 0x34, 0x56, 0x78, 0x12, 0x34, 0x56, 0x78, 0x07, 0x5a, 0x12, 0x79], packetType);
            });
            it("should emit a cartelectronic event when called with a CARTELECTRONIC_ENCODER subtype", function(done) {
                device.on("cartelectronic", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.cartelectronic.CARTELECTRONIC_ENCODER);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.compteur).toEqual([{valeur: 0x12345678, unité: "impulsions"},
                        {valeur: 0x12345678, unité: "impulsions"}]);
                    expect(evt.rssi).toBe(7);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.cartelectronicHandler([0x02, 0x00, 0x12, 0x34, 0x56, 0x78,
                    0x12, 0x34, 0x56, 0x78, 0x12, 0x34, 0x56, 0x78, 0x12, 0x79], packetType);
            });
            it("should emit a cartelectronic event when called with a CARTELECTRONIC_LINKY subtype", function(done) {
                device.on("cartelectronic", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.cartelectronic.CARTELECTRONIC_LINKY);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.id).toBe("0x288A70A4");
                    expect(evt.identifiantCompteur).toBe("021761684196");
                    expect(evt.compteur).toEqual([{valeur: 0x12345678, unité: "Wh", contenu: "Consommation"},
                        {valeur: 0x12345678, unité: "Wh", contenu: "non utilisé"}]);
                    expect(evt.puissanceApparente).toBe(1882.0);
                    expect(evt.puissanceApparenteValide).toBe(true);
                    expect(evt.teleInfoPrésente).toBe(true);
                    expect(evt.indexTariffaireEnCours).toBe(1);
                    expect(evt.avertissementCouleurAujourdHui).toBe("Blanc");
                    expect(evt.avertissementCouleurDemain).toBe("Rouge");
                    expect(evt.tensionMoyenne).toBe(230.0);
                    expect(evt.rssi).toBe(7);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.cartelectronicHandler([0x03, 0x00,
                    0x28, 0x8a, 0x70, 0xa4,
                    0x12, 0x34, 0x56, 0x78,
                    0x12, 0x34, 0x56, 0x78,
                    0x01,
                    0x1e,
                    0x07, 0x5a,
                    0x74,
                    0x79], packetType);
            });

        });

        describe(".rfxsensorHandler", function() {
            let device = {};
            let packetType = 0x70;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a rfxsensor event when called with sensor subtype 0 data", function(done) {
                device.on("rfxsensor", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.rfxsensor.TEMP);
                    expect(evt.seqnbr).toBe(233);
                    expect(evt.id).toBe("0x28");
                    expect(evt.message).toBe(7.37);
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.rfxsensorHandler([0x00, 0xE9, 0x28, 0x02, 0xE1, 0x70], packetType);
            });
            it("should interpret the signbit in subtype 0 data", function(done) {
                device.on("rfxsensor", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.rfxsensor.TEMP);
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.id).toBe("0x08");
                    expect(evt.message).toBe(-1.5);
                    expect(evt.rssi).toBe(5);
                    done();
                });
                device.rfxsensorHandler([0x00, 0x02, 0x08, 0x80, 0x96, 0x50], packetType);
            });
            it("should emit a rfxsensor event when called with sensor subtype 2 data", function(done) {
                device.on("rfxsensor", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.rfxsensor.VOLTAGE);
                    expect(evt.seqnbr).toBe(234);
                    expect(evt.id).toBe("0x28");
                    expect(evt.message).toBe(472);
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.rfxsensorHandler([0x02, 0xEA, 0x28, 0x01, 0xD8, 0x70], packetType);
            });
            it("should emit a rfxsensor event when called with sensor subtype 1 data", function(done) {
                device.on("rfxsensor", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.rfxsensor.AD);
                    expect(evt.seqnbr).toBe(235);
                    expect(evt.id).toBe("0x28");
                    expect(evt.message).toBe(385);
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.rfxsensorHandler([0x01, 0xEB, 0x28, 0x01, 0x81, 0x70], packetType);
            });
        });

        describe(".rfxmeterHandler", function() {
            let device = {};
            let packetType = 0x71;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a rfxmeter event when called", function(done) {
                device.on("rfxmeter", function(evt) {
                    expect(evt.subtype).toBe(0x00);
                    expect(evt.seqnbr).toBe(55);
                    expect(evt.rssi).toBe(7);
                    expect(evt.counter).toBe(9069671);
                    done();
                });
                device.rfxmeterHandler([0x00, 0x37, 0x08, 0xF8, 0x00, 0x8A, 0x64, 0x67, 0x70], packetType);
            });
        });

        describe(".waterlevelHandler", function () {
            let device = {};
            let packetType = 0x73;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a waterlevel event when called", function(done) {
                device.on("waterlevel", function(evt) {
                    expect(evt.subtype).toBe(0x00);
                    expect(evt.seqnbr).toBe(42);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.level).toBe(500); // (cm)
                    expect(evt.temperature).toBe(35.1);
                    expect(evt.rssi).toBe(7);
                    expect(evt.batteryLevel).toBe(3);
                    done();
                });
                device.waterlevelHandler([0x00, 0x2A, 0x12, 0x34, 0x00, 0x01, 0xF4, 0x01, 0x5f,0x00, 0x00, 0x73], packetType);
            });
        });

        describe(".lightningHandler", function () {
            let device = {};
            let packetType = 0x74;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lightning event when called", function(done) {
                device.on("lightning", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.seqnbr).toBe(3);
                    expect(evt.id).toBe("0x123456");
                    expect(evt.status).toBe("strike");
                    expect(evt.distance).toBe(12);
                    expect(evt.strikes).toBe(6);
                    expect(evt.rssi).toBe(5);
                    expect(evt.batteryLevel).toBe(8);
                    done();
                });
                device.lightningHandler([0x01, 0x03, 0x12, 0x34, 0x56, 0x08, 0x0c, 0x06, 0x00, 0x00, 0x58], packetType);
            });
        });

        describe(".weatherHandler", function () {
            let device = {};
            let packetType = 0x76;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a weather event when called for subtype 0", function(done) {
                device.on("weather", function(evt) {
                    expect(evt.subtype).toBe(0x00);
                    expect(evt.seqnbr).toBe(0xF5);
                    expect(evt.id).toBe("0x0007");
                    expect(evt.direction).toBe(270.0);
                    expect(evt.averageSpeed).toBe(6.7);
                    expect(evt.gustSpeed).toBe(11.4);
                    expect(evt.temperature).toBe(-2.3);
                    expect(evt.chill).toBeUndefined();
                    expect(evt.humidity).toBe(58.0);
                    expect(evt.humidityStatus).toBe(1);
                    expect(evt.rainrate).toBeUndefined();
                    expect(evt.rainfallIncrement).toBe(41.6);
                    expect(evt.uv).toBe(3.1);
                    expect(evt.insolation).toBe(218.0);
                    expect(evt.barometer).toBeUndefined();
                    expect(evt.forecast).toBeUndefined();
                    expect(evt.chill).toBeUndefined();
                    expect(evt.batteryLevel).toBe(3);
                    done();
                });
                device.weatherHandler([0x00, 0xF5, 0x00, 0x07,
                    0x01, 0x0e, 0x00, 0x43, 0x00, 0x72, 0x80, 0x17, 0x00, 0x00, 0x3a, 0x01, 0x00, 0x00,
                    0x00, 0x01, 0xa0, 0x1f, 0x00, 0xda, 0x03, 0xfd, 0x00, 0x00, 0x00, 0x93], packetType);
            });
            it("should emit a weather event when called for subtype 1", function(done) {
                device.on("weather", function(evt) {
                    expect(evt.direction).toBeUndefined();
                    expect(evt.averageSpeed).toBe(6.7);
                    expect(evt.gustSpeed).toBe(11.4);
                    expect(evt.temperature).toBe(-2.3);
                    expect(evt.chill).toBeUndefined();
                    expect(evt.humidity).toBeUndefined();
                    expect(evt.humidityStatus).toBeUndefined();
                    expect(evt.rainrate).toBeUndefined();
                    expect(evt.rainfallIncrement).toBe(124.8);
                    expect(evt.uv).toBeUndefined();
                    expect(evt.insolation).toBeUndefined();
                    expect(evt.barometer).toBeUndefined();
                    expect(evt.forecast).toBeUndefined();
                    expect(evt.chill).toBeUndefined();
                    expect(evt.batteryLevel).toBeUndefined();
                    done();
                });
                device.weatherHandler([0x01, 0xF5, 0x00, 0x07,
                    0x01, 0x0e, 0x00, 0x43, 0x00, 0x72, 0x80, 0x17, 0x00, 0x00, 0x3a, 0x01, 0x00, 0x00,
                    0x00, 0x01, 0xa0, 0x1f, 0x00, 0xda, 0x03, 0xfd, 0x00, 0x00, 0x00, 0x93], packetType);
            });
            it("should emit a weather message when called for subtype 2", function(done) {
                device.on("weather", function(evt) {
                    expect(evt.subtype).toBe(0x02);
                    expect(evt.seqnbr).toBe(0xF5);
                    expect(evt.id).toBe("0x0007");
                    expect(evt.direction).toBe(270.0);
                    expect(evt.averageSpeed).toBe(6.7);
                    expect(evt.gustSpeed).toBe(11.4);
                    expect(evt.temperature).toBe(-2.3);
                    expect(evt.chill).toBeUndefined();
                    expect(evt.humidity).toBe(58.0);
                    expect(evt.humidityStatus).toBe(1);
                    expect(evt.rainrate).toBeUndefined();
                    expect(evt.rainfallIncrement).toBe(105.664);
                    expect(evt.uv).toBe(3.1);
                    expect(evt.insolation).toBe(218.0);
                    expect(evt.barometer).toBeUndefined();
                    expect(evt.forecast).toBeUndefined();
                    expect(evt.chill).toBeUndefined();
                    expect(evt.batteryLevel).toBeUndefined();
                    done();
                });
                device.weatherHandler([0x02, 0xF5, 0x00, 0x07,
                    0x01, 0x0e, 0x00, 0x43, 0x00, 0x72, 0x80, 0x17, 0x00, 0x00, 0x3a, 0x01, 0x00, 0x00,
                    0x00, 0x01, 0xa0, 0x1f, 0x00, 0xda, 0x03, 0xfd, 0x00, 0x00, 0x00, 0x93], packetType);
            });
/*             it("should emit a weather event when called for subtype 3", function(done) {
                device.on("weather", function(evt) {
                    expect(evt.subtype).toBe(0x03);
                    expect(evt.seqnbr).toBe(0xF5);
                    expect(evt.id).toBe("0x0007");
                    // expect(evt.batteryLevel).toBe(3);
                    expect(evt.rssi).toBe(9);
                    expect(evt.direction).toBe(270.0);
                    expect(evt.averageSpeed).toBe(6.7);
                    expect(evt.gustSpeed).toBe(11.4);
                    expect(evt.temperature).toBe(-2.3);
                    expect(evt.humidity).toBe(58.0);
                    expect(evt.humidityStatus).toBe(1);
                    expect(evt.rainfallIncrement).toBe(105.664);
                    expect(evt.uv).toBe(3.1);
                    expect(evt.insolation).toBe(218.0);
                    done();
                });
                device.weatherHandler([0x03, 0xF5, 0x00, 0x07,
                    0x01, 0x0e, 0x00, 0x43, 0x00, 0x72, 0x80, 0x17, 0x00, 0x00, 0x3a, 0x01, 0x00, 0x00,
                    0x00, 0x01, 0xa0, 0x1f, 0x00, 0xda, 0x03, 0xfd, 0x00, 0x00, 0x00, 0x93], packetType);
            }); */
        });

        describe(".solarHandler", function() {
            let device = {};
            let packetType = 0x77;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a solar event when called for subtype 1", function(done) {
                device.on("solar", function(evt) {
                    expect(evt.subtype).toBe(0x02);
                    expect(evt.seqnbr).toBe(0x21);
                    expect(evt.id).toBe("0x0707");
                    expect(evt.batteryLevel).toBe(3);
                    expect(evt.rssi).toBe(9);
                    expect(evt.insolation).toBe(218.0);
                    done();
                });
                device.solarHandler([0x02, 0x21, 0x07, 0x07, 0x55, 0x28, 0x00, 0x00, 0x93], packetType);
            });
        });
    });
});
