import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { SBrick } from './sbrick.js';
//const SBrick = require('sbrick-protocol');

//let SBRICK2 = new SBrick('SBrick');

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {value: 0};
    this.SBRICK2 = new SBrick('SBrick');
  }

  componentDidMount() {
    console.log('mount')
  }

  connectBt= () => {
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

    const services = {
      [UUID_SERVICE_DEVICEINFORMATION] : {
        name : "Device Information",
        characteristics : {
          [UUID_CHARACTERISTIC_MODELNUMBER] : {
            name : "Model Number String"
          },
          [UUID_CHARACTERISTIC_FIRMWAREREVISION] : {
            name : "Firmware Revision String"
          },
          [UUID_CHARACTERISTIC_HARDWAREREVISION] : {
            name : "Hardware Revision String"
          },
          [UUID_CHARACTERISTIC_SOFTWAREREVISION] : {
            name : "Software Revision String"
          },
          [UUID_CHARACTERISTIC_MANUFACTURERNAME] : {
            name : "Manufacturer Name String"
          }
        }
      },
      [UUID_SERVICE_REMOTECONTROL] : {
        name : "Remote Control",
        characteristics : {
          [UUID_CHARACTERISTIC_REMOTECONTROL] : {
            name : "Quick Drive"
          },
          [UUID_CHARACTERISTIC_QUICKDRIVE] : {
            name : "Remote Control"
          }
        }
      }
    }

  	const CMD_DRIVE     = 0x01; // Drive command
    const PORTS = [
      { portId: 0x00, channelsId: [ 0x00, 0x01 ]},
      { portId: 0x01, channelsId: [ 0x02, 0x03 ]},
      { portId: 0x02, channelsId: [ 0x04, 0x05 ]},
      { portId: 0x03, channelsId: [ 0x06, 0x07 ]}
    ];
    // Direction
    const CLOCKWISE        = 0x00; // Clockwise
    const COUNTERCLOCKWISE = 0x01; // Counterclockwise

    let options = {};
      options.acceptAllDevices = true;
      options.optionalServices = ['4dc591b0-857c-41de-b5f1-15abda665b0c']

    console.log('Requesting Bluetooth Device...');
    //console.log('with ' + JSON.stringify(options));
    navigator.bluetooth.requestDevice(options, services
      // {
      //   filters: [{
      //     services: ['device_information']
      //   }]
      // }
    )
        .then(device => {
          console.log('id:' ,device.id, 'name:', device.name)
          return device.gatt.connect();
        })
        .then(server => {
          console.log('getting services', server)
          return server.getPrimaryService('4dc591b0-857c-41de-b5f1-15abda665b0c')
        })
        .then(services => {
          console.log(services)
          return services.getCharacteristics()
        }).then(ch => {
          console.log(ch[0]);
          //return ch.writeValue()
        })
  }

  disconnectBt= (SBRICK1) => {
    // let options = {};
    // options.acceptAllDevices = true;
    //
    // console.log('Requesting Bluetooth Device...');
    // console.log('with ' + JSON.stringify(options));
    // navigator.bluetooth.requestDevice(options)
    //   .then(device => {
    //     device.gatt.connect().then((aa) => console.log('connectedd', aa))
    //
    //     console.log('> Name:             ' + device.name);
    //     console.log('> Id:               ' + device.id);
    //     //console.log('> Connected:        ' + device.gatt.connected);
    //   })
    this.SBRICK2.disconnect();
  }

  getCharacteristic2 = () => {
    this.SBRICK2.connect().then(() => console.log('connect'))

  }

  start1 = (val) => {
    this.SBRICK2.drive( 0x03, this.SBRICK2.CW, val )
  }
  start2 = (val) => {
    this.SBRICK2.drive( 0x03, this.SBRICK2.CW, val )
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
  handleOnChange2 = (e) => {
    //console.log(e.target.value)
    this.SBRICK2.drive( 0x03, this.SBRICK2.CW, e.target.value )
  }

  setSbrick = (val) => {
    //console.log(e.target.value)
    //this.setState({value: e.target.value})
    this.SBRICK2.drive( 0x01, this.SBRICK2.CW, val )
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
