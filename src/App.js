import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { SBrick } from './sbrick.js';
//const SBrick = require('sbrick-protocol');
import { WebBluetooth } from './bluetooth'
import Queue from 'promise-queue';

//let SBRICK2 = new SBrick('SBrick');


const ID_SBRICK                             = "SBrick";
const FIRMWARE_COMPATIBILITY                 = 4.17;

const UUID_SERVICE_DEVICEINFORMATION        = "device_information";
const UUID_CHARACTERISTIC_MODELNUMBER       = "model_number_string";
const UUID_CHARACTERISTIC_FIRMWAREREVISION  = "firmware_revision_string";
const UUID_CHARACTERISTIC_HARDWAREREVISION  = "hardware_revision_string";
const UUID_CHARACTERISTIC_SOFTWAREREVISION  = "software_revision_string";
const UUID_CHARACTERISTIC_MANUFACTURERNAME  = "manufacturer_name_string";

const UUID_SERVICE_REMOTECONTROL            = "4dc591b0-857c-41de-b5f1-15abda665b0c";
const UUID_CHARACTERISTIC_REMOTECONTROL     = "02b8cbcc-0e25-4bda-8790-a15f53e6010f";
const UUID_CHARACTERISTIC_QUICKDRIVE        = "489a6ae0-c1ab-4c9c-bdb2-11d373c1b7fb";

const UUID_SERVICE_OTA                      = "1d14d6ee-fd63-4fa1-bfa4-8f47b42119f0";
const UUID_CHARACTERISTIC_OTACONTROL        = "f7bf3564-fb6d-4e53-88a4-5e37e0326063";

// REMOTE CONTROL COMMANDS

// Exceptions
const ERROR_LENGTH  = 0x80; // Invalid command length
const ERROR_PARAM   = 0x81; // Invalid parameter
const ERROR_COMMAND = 0x82; // No such command
const ERROR_NOAUTH  = 0x83; // No authentication needed
const ERROR_AUTH    = 0x84; // Authentication error
const ERROR_DOAUTH  = 0x85; // Authentication needed
const ERROR_AUTHOR  = 0x86; // Authorization error
const ERROR_THERMAL = 0x87; // Thermal protection is active
const ERROR_STATE   = 0x88; // The system is in a state where the command does not make sense

// Commands
const CMD_BREAK     = 0x00; // Stop command
const CMD_DRIVE     = 0x01; // Drive command
const CMD_ADC       = 0x0F; // Query ADC
const CMD_ADC_VOLT  = 0x08; // Get Voltage
const CMD_ADC_TEMP  = 0x09; // Get Temperature
const CMD_PVM       = 0x2C; // Periodic Voltage Measurements

// SBrick Ports / Channels
const PORTS = [
  { portId: 0x00, channelsId: [ 0x00, 0x01 ]},
  { portId: 0x01, channelsId: [ 0x02, 0x03 ]},
  { portId: 0x02, channelsId: [ 0x04, 0x05 ]},
  { portId: 0x03, channelsId: [ 0x06, 0x07 ]}
];

// Port Mode
const INPUT  = 'input';
const OUTPUT = 'output';
const BREAK  = 'break';

// Direction
const CLOCKWISE        = 0x00; // Clockwise
const COUNTERCLOCKWISE = 0x01; // Counterclockwise

// Values limits
const MIN      = 0;   // No Speed
const MAX      = 255; // Max Speed
const MAX_QD   = 127; // Max Speed for QuickDrive
const MAX_VOLT = 9;   // Max Voltage = Full battery

// Times in milliseconds
const T_KA  = 300; // Time interval for the keepalive loop (must be < 500ms - watchdog default)
const T_PVM = 500; // Time delay for PVM completion: the registry is update approximately 5 times per second (must be > 200ms)


class App extends Component {



  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      value2: 0
    };
    this.SBRICK2 = new SBrick('SBrick');
    this.BT = null;
    this.webBT = new WebBluetooth();
    this.char2 = null;
    this.isConnected = false;
    this.keepalive = null;
    this.maxConcurrent = 1;
    this.maxQueue      = Infinity;
    this.queue         = new Queue( this.maxConcurrent, this.maxQueue );
    //
    this.characteristic2 = null;
  }


  _keepalive2() {
    return setInterval( () => {
    if( this.queue.getQueueLength() === 0 ) {
        this.queue.add( () => {
          return this.characteristic2.writeValue(
            new Uint8Array( [ CMD_ADC, CMD_ADC_TEMP ] )
          );
        } );
      }
    }, T_KA);
  }


  connect2() {
  console.log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice(
    {
      //filters: [{ services: ['4dc591b0-857c-41de-b5f1-15abda665b0c'] }]
      acceptAllDevices: true,
      optionalServices: ['4dc591b0-857c-41de-b5f1-15abda665b0c']
    })
    .then(device => {
      console.log('> Found ' + device.name);
      console.log('Connecting to GATT Server...');
      console.log('device', device)
      //device.addEventListener('gattserverdisconnected', onDisconnected)
      return device.gatt.connect();
    })
    .then(server => {
      console.log('Getting Service - Sbrick Remote control...');
      console.log('server', server)
      return server.getPrimaryService('4dc591b0-857c-41de-b5f1-15abda665b0c');
    })
    .then(service => {
      console.log('Getting Characteristic 0xffe9 - Light control...');
      return service.getCharacteristic('02b8cbcc-0e25-4bda-8790-a15f53e6010f');
    })
    .then(characteristic => {
      console.log('All ready!');
      console.log(characteristic)
      this.characteristic2 = characteristic;
      //onConnected();
    })
    .then( () => {
      this._keepalive2();
    })
    // .then(() => {
    //   console.log('keep live')
    //   this.keepalive = this._keepalive(this);
    //   return setInterval( () => {
    //     console.log('interval')
    //       return this.characteristic2.writeValue(
    //         new Uint8Array( [ CMD_ADC, CMD_ADC_TEMP ] )
    //   );
    //   }, T_KA)})
    .catch(error => {
      console.log('Argh! ' + error);
    });
}

  /* Utils */

  getSupportedProperties = (characteristic) => {
    let supportedProperties = [];
    for (const p in characteristic.properties) {
      if (characteristic.properties[p] === true) {
        supportedProperties.push(p.toUpperCase());
      }
    }
    return '[' + supportedProperties.join(', ') + ']';
  }

  getCharacteristic3 = () => {
    console.log(this.BT)
    console.log(this.isConnected)
    //this.SBRICK2.drive( 0x03, this.SBRICK2.CW, 255 )
    // this.webBT.writeCharacteristicValue(
    //   "02b8cbcc-0e25-4bda-8790-a15f53e6010f",
    //   new Uint8Array([ 0x01, 0x03, 'CLOCKWISE', 255 ])
    // )
    // this.BT.gatt.disconnect()
    // console.log(this.BT)
    // this.webBT.writeCharacteristicValue(
    //   UUID_CHARACTERISTIC_REMOTECONTROL,
    //   new Uint8Array([ CMD_DRIVE, 0x03, 0x00, 255 ])
    // )
  }


  getCharacteristic2 = () => {
    //   const SERVICES = {
    //   [UUID_SERVICE_DEVICEINFORMATION] : {
    //     name : "Device Information",
    //     characteristics : {
    //       [UUID_CHARACTERISTIC_MODELNUMBER] : {
    //         name : "Model Number String"
    //       },
    //       [UUID_CHARACTERISTIC_FIRMWAREREVISION] : {
    //         name : "Firmware Revision String"
    //       },
    //       [UUID_CHARACTERISTIC_HARDWAREREVISION] : {
    //         name : "Hardware Revision String"
    //       },
    //       [UUID_CHARACTERISTIC_SOFTWAREREVISION] : {
    //         name : "Software Revision String"
    //       },
    //       [UUID_CHARACTERISTIC_MANUFACTURERNAME] : {
    //         name : "Manufacturer Name String"
    //       }
    //     }
    //   },
    //   [UUID_SERVICE_REMOTECONTROL] : {
    //     name : "Remote Control",
    //     characteristics : {
    //       [UUID_CHARACTERISTIC_REMOTECONTROL] : {
    //         name : "Quick Drive"
    //       },
    //       [UUID_CHARACTERISTIC_QUICKDRIVE] : {
    //         name : "Remote Control"
    //       }
    //     }
    //   }
    // }
    // let options = {
    //   // filter by service should work but it doesn't show any SBrick...
    //   // filters: [{
    //   // 	services: [ UUID_SERVICE_DEVICEINFORMATION, UUID_SERVICE_OTA, UUID_SERVICE_REMOTECONTROL ]
    //   // }],
    //   acceptAllDevices: true
    // };
    // this.webBT.connect(options,SERVICES)
    navigator.bluetooth.requestDevice({
      // filters: [...] <- Prefer filters to save energy & show relevant devices.
      acceptAllDevices: true,
      optionalServices: ['4dc591b0-857c-41de-b5f1-15abda665b0c']
    })
      .then(device => {
        this.BT = device;
        console.log('Connecting to GATT Server...');
        return device.gatt.connect();
      })
      .then(server => {// Note that we could also get all services that match a specific UUID by
        // passing it to getPrimaryServices().
        this.isConnected = true
        console.log('Getting Services...');
        return server.getPrimaryServices('4dc591b0-857c-41de-b5f1-15abda665b0c')
      })
      .then(service => {
        console.log('Getting Characteristics...');
        console.log('service', service)
        // Get all characteristics.
        return service[0].getCharacteristics();
      })
      .then(char => {
        this.char2 = char[0]
        console.log('> Characteristics: ', char[0])
        //return char[0].writeValue(new Uint8Array([ CMD_DRIVE, 0x03, 0x01, 255 ]))
      })
      .then(() => {
        console.log('keep live')
        return setInterval( () => {
            console.log('interval')
            this.queue.add( () => {
              return this.char2.writeValue(
                new Uint8Array( [ CMD_ADC, CMD_ADC_TEMP ] )
              );
            } );
        }, T_KA);
      })

      // .then(services => {
      //   console.log('Getting Characteristics...');
      //   console.log(services)
      //   //services.getCharacteristic("02b8cbcc-0e25-4bda-8790-a15f53e6010f");
      //   let queue = Promise.resolve();
      //   services.forEach(service => {
      //     queue = queue.then(_ => service.getCharacteristic('02b8cbcc-0e25-4bda-8790-a15f53e6010f').then(characteristics => {
      //       console.log(characteristics)
      //       // console.log('> Service: ' + service.uuid);
      //       //   console.log('>> Characteristic: ' + characteristics.uuid + ' ' +
      //       //     this.getSupportedProperties(characteristics));
      //       return characteristics
      //     }).then(char => {
      //         //char.writeValue(new Uint8Array([ CMD_DRIVE, 0x03, 0x01, 200 ]))
      //       })
      //     );
      //   });
      //   return queue
      // })
      // .then(service => {
      //   console.log('Getting Characteristics...');
      //   // Get all characteristics.
      //   return service.getCharacteristics();
      // })
      // .then(characteristics => {
      //   console.log('> Characteristics: ' +
      //     characteristics.map(c => c.uuid).join('\n' + ' '.repeat(19)));
      // })
      // .then((characteristic) => {
      //   console.log('ttt', characteristic)
        // this.webBT.writeCharacteristicValue(
        //   UUID_CHARACTERISTIC_REMOTECONTROL,
        //   new Uint8Array([ CMD_DRIVE, 0x03, 0x00, 255 ])
        // )
      //})
      .catch(error => {
        console.log('Argh! ' + error);
      });

    //this.SBRICK2.connect().then(() => console.log('connect'))
      }


  startLights = () => {
      this.queue.add( () => {
        return this.characteristic2.writeValue(
          new Uint8Array( [ CMD_DRIVE, 0x00, 0x01, 255 ] )
        );
      } );
    // this.characteristic2.writeValue(
    //   new Uint8Array( [ CMD_DRIVE, 0x00, 0x01, 255 ] ))
  }

  offLights = () => {
      this.queue.add( () => {
        return this.characteristic2.writeValue(
          new Uint8Array( [ CMD_DRIVE, 0x00, 0x01, 0 ] )
        );
      } );
    // this.characteristic2.writeValue(
    //   new Uint8Array( [ CMD_DRIVE, 0x00, 0x01, 0 ] ))
  }

  start1 = (val) => {
    this.char2.writeValue(new Uint8Array([ CMD_DRIVE, 0x03, 0x01, 55 ]))
    console.log(this.isConnected)
    //this.SBRICK2.drive( 0x03, this.SBRICK2.CW, val )
  }
  start2 = (val) => {
    this.char2.writeValue(new Uint8Array([ CMD_DRIVE, 0x03, 0x01, 255 ]))
    //this.SBRICK2.drive( 0x03, this.SBRICK2.CW, val )
  }
  start3 = (val ) => {
    this.SBRICK2.drive( 0x03, this.SBRICK2.CW, val )
  }

  stop = () => {
    this.SBRICK2.drive( 0x03, this.SBRICK2.CW, 0 )
  }

  handleOnChange = (e) => {
    //console.log(e.target.value)
    this.setState({value: e.target.value})
    console.log(e.target.value)
    let direction = e.target.value < 0 ? this.SBRICK2.CW : this.SBRICK2.CCW
    this.SBRICK2.drive( 0x01, direction, e.target.value )
  }
  handleOnChange3 = (e) => {
    //console.log(e.target.value)
    this.setState({value2: e.target.value})
    console.log(e.target.value)
    let direction = e.target.value < 0 ? 0x00 : 0x01
    //this.SBRICK2.drive( 0x01, direction, e.target.value )
    // this.characteristic2.writeValue(
    //   new Uint8Array( [ CMD_DRIVE, 0x03, direction, Math.abs(e.target.value) ] ))
    e.persist()
    this.queue.add( () => {
      return this.characteristic2.writeValue(
        new Uint8Array( [ CMD_DRIVE, 0x03, direction, Math.abs(e.target.value) ] )
      );
    } );
  }
  handleOnChange2 = (e) => {
    //console.log(e.target.value)
    this.SBRICK2.drive( 0x03, this.SBRICK2.CW, e.target.value )
  }

  setSbrick = (val) => {
    //console.log(e.target.value)
    //this.setState({value: e.target.value})
    this.SBRICK2.drive( 0x01, this.SBRICK2.CW, val )
  }

  setSbrick3 = (val) => {
    //console.log(e.target.value)
    //this.setState({value: e.target.value})
    //this.SBRICK2.drive( 0x01, this.SBRICK2.CW, val )
    this.queue.add( () => {
      return this.characteristic2.writeValue(
        new Uint8Array( [CMD_DRIVE, 0x03, 0x01, val ] )
      );
    } );
    // this.characteristic2.writeValue(
    //   new Uint8Array( [ CMD_DRIVE, 0x03, 0x01, val ] ))
  }

  render() {
    console.log('render')
    //let SBRICK1 = new SBrick(); // create a new SBrick object
  //  let SBRICK2 = new SBrick('SBrick'); // create a new SBrick object

  const inputStyle = {
    transformOorigin: "75px 75px",
    transform: "rotate(-90deg)",
    boxShadow: "inset 0px 1px 3px rgba(0, 0, 0, 0.3)",
    height: "20px !important",
    width: "200px"
  }

    return (
      <div className="App">
        <div style={{margin: "0 0 100px 0 "}}>
          <p>BT TEST</p>
          <button onClick={() => this.start1(20)}>start50</button>
          <button onClick={() => this.start2(100)}>start100</button>
          <button onClick={() => this.start3(255)}>start255</button>
          <button onClick={() => this.stop()}>stop</button>
          <button onClick={() => this.getCharacteristic2()}>connect Sbrick</button>
          <button onClick={() => this.connect2()}>connect2</button>
          <button onClick={() => this.getCharacteristic3()}>test Sbrick</button>
          <button onClick={() => this.startLights()}>on</button>
          <button onClick={() => this.offLights()}>off</button>
        </div>
        <div>
          <input style={inputStyle}
            name='SBrick'
            type='range'
            min="-255"
            max="255"
            value={this.state.value}
            onChange={this.handleOnChange}
            //onTouchStart={() => this.setState({value: 0})}
            onTouchEnd={() => {
              this.setSbrick(0);
              this.setState({value: 0});
            }}
            onMouseUp={() => {
              this.setSbrick(0);
              this.setState({value: 0});
            }}
            //onMouseDown={() => this.setState({value: 0})}
          />
          <input style={inputStyle}
                 name='SBrick3'
                 type='range'
                 min="-255"
                 max="255"
                 value={this.state.value2}
                 onChange={this.handleOnChange3}
            //onTouchStart={() => this.setState({value: 0})}
                 onTouchEnd={() => {
                   this.setSbrick3(0);
                   this.setState({value2: 0});
                 }}
                 onMouseUp={() => {
                   this.setSbrick3(0);
                   this.setState({value2: 0});
                 }}
            //onMouseDown={() => this.setState({value: 0})}
          />
          <input name="Sbrick2"
            type="number"
            onChange={this.handleOnChange2}
          />
          <p>{this.state.value}</p>
        </div>
      </div>
    );
  }
}

export default App;
//
//pionowe
// .slider-wrapper {
//   display: inline-block;
//   width: 20px;
//   height: 150px;
//   padding: 0;
// }
// Then comes the style information for the <input> element within the reserved space:
// .slider-wrapper input {
//   width: 150px;
//   height: 20px;
//   margin: 0;
//   transform-origin: 75px 75px;
//   transform: rotate(-90deg);
// }
/*
 * Copyright (c) 2016-17 Francesco Marino
 *
 * @author Francesco Marino <francesco@360fun.net>
 * @website www.360fun.net
 *
 * This is just a basic Class to start playing with the new Web Bluetooth API,
 * specifications can change at any time so keep in mind that all of this is
 * mostly experimental! ;)
 *
 * Check your browser and platform implementation status first
 * https://github.com/WebBluetoothCG/web-bluetooth/blob/gh-pages/implementation-status.md
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
//
// let WebBluetooth = (function() {
//   'use strict';
//
//   // UTF-8
//   let encoder = new TextEncoder('utf-8');
//   let decoder = new TextDecoder('utf-8');
//
//   class WebBluetooth {
//
//     constructor() {
//       this.device           = null;
//       this.server           = null;
//       this._characteristics = new Map();
//       this._debug           = false;
//     }
//
//     isConnected() {
//       return this.device && this.device.gatt.connected;
//     }
//
//     connect(options,services) {
//       return navigator.bluetooth.requestDevice(options)
//         .then(device => {
//           this.device = device;
//           this._log('Connected to device named "' + device.name + '" with ID "' + device.id + '"');
//           return device.gatt.connect();
//         })
//         .then(server => {
//           this.server = server;
//           return Promise.all(
//             Object.keys(services).map( serviceId => {
//               return server.getPrimaryService(serviceId).then(service => {
//                 return Promise.all(
//                   Object.keys(services[serviceId].characteristics).map( characteristicId => {
//                     return this._cacheCharacteristic(service, characteristicId)
//                       .then( () => {
//                         this._log('Found characteristic "' + characteristicId + '"');
//                       })
//                       .catch( e => { this._error('Characteristic "' + characteristicId + '" NOT found') } );
//                   })
//                 );
//               })
//                 .then( () => {
//                   this._log('Found service "' + serviceId + '"');
//                 })
//                 .catch( e => { this._error('Service "' + serviceId + '"') } );
//             })
//           );
//         });
//     }
//
//     disconnect() {
//       return new Promise( (resolve, reject) =>  {
//           if( this.isConnected() ) {
//             resolve();
//           } else {
//             reject('Device not connected');
//           }
//         }
//       ).then( ()=> {
//         this._log('Device disconnected')
//         return this.device.gatt.disconnect();
//       }).catch( e => { this._error(e) } );
//     }
//
//     readCharacteristicValue(characteristicUuid) {
//       return new Promise( (resolve, reject) =>  {
//           if( this.isConnected() ) {
//             resolve();
//           } else {
//             reject('Device not connected');
//           }
//         }
//       ).then( ()=> {
//         let characteristic = this._characteristics.get(characteristicUuid);
//         return characteristic.readValue()
//           .then(value => {
//             // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
//             value = value.buffer ? value : new DataView(value);
//             this._log('READ', characteristic.uuid, value);
//             return value;
//           });
//       })
//         .catch( e => { this._error(e) } );
//     }
//
//     writeCharacteristicValue(characteristicUuid, value) {
//       return new Promise( (resolve, reject) =>  {
//           if( this.isConnected() ) {
//             resolve();
//           } else {
//             reject('Device not connected');
//           }
//         }
//       ).then( ()=> {
//         let characteristic = this._characteristics.get(characteristicUuid);
//         this._log('WRITE', characteristic.uuid, value);
//         return characteristic.writeValue(value);
//       }).catch( e => { this._error(e) } );
//     }
//
//     _error(msg) {
//       if(this._debug) {
//         console.debug(msg);
//       } else {
//         throw msg;
//       }
//     }
//
//     _log(msg) {
//       if(this._debug) {
//         console.log(msg);
//       }
//     }
//
//     _cacheCharacteristic(service, characteristicUuid) {
//       return service.getCharacteristic(characteristicUuid)
//         .then(characteristic => {
//           this._characteristics.set(characteristicUuid, characteristic);
//         });
//     }
//
//     _decodeString(data) {
//       return decoder.decode(data);
//     }
//     _encodeString(data) {
//       return encoder.encode(data);
//     }
//   }
//
//   return WebBluetooth;
//
// })();
