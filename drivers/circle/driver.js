"use strict";
var http = require("http");
var util = require('util');
var xml2js = require('xml2js');
var pollInterval = 15000;


var sourcedata = {};  // xml string from plugwise
var sourceobject = {}; // translated xml to object
var source = {};
var devices = [];   // all circles in plugwise translated to homey device  in homey
var PairedDevicesOld = [] ; // to hold the old state parameters to compere them to the new to see if values are changed for realtime
var pairedDevices = []; //imported devices in homey 
var device = {};    // circle translated to homey device in homey
var appliances = [];  // appliances = circles in plugwise
var cloned_devices_data = [];  // an realtine actual devices_data updated after deleting and adding a device, the init dd is not updated.
var stateModulus = 2;// poller to devide number of realtime updates



var self = {
    
    init: function (devices_data, callback) {
        
       cloned_devices_data = devices_data;
        console.log('driver 19', "init driver")
        if (Homey.appcloned_devices_data) { console.log('driver 22 devices_data', util.inspect(Homey.appcloned_devices_data, false, null)) }
        else { console.log('no device data') }
        
       // console.log('driver 32  plugiseserverset value :', Homey.app.plugwiseserverset) this didnt work in 0.10.0
        
        callback();
        
    },
    
    
    
    
    
    
    pair: function (socket) {
     
        socket.on('press_button', function (data, callback) {
       
            console.log('pressbutton');
            
            if (Homey.app.plugwiseserverset) {
                socket.emit('button_pressed');
            } else { socket.emit('noserver') }

        });
        
        
        
        socket.on('list_devices', function (data, callback) {
            
         
            console.log('devise length  ' , devices.length)
            // err, result style
            callback(null, devices);
            
            // even when we found another device, these can be shown in the front-end
            //setTimeout(function () {
            //    socket.emit('list_devices', moreDevices)
            //}, 2000)


        });
        
        socket.on("add_device", function (device, callback) {
            
            
            console.log('drivr 174 add device', device)
            console.log('drivr 174 add device.data.id ', device.data.id)
            console.log('driver 175 device.data.id', device.data.id)
            
            
            var circle = getCircle(device.data.id);
            addDeviceToPairedDevices(device.data.id);
            cloned_devices_data.push({ "id" : device.data.id });
            
            console.log('driver 179 device from getcircel ', circle);
            //  console.log('driver 180 device data' , device_data)
            
            //   console.log('device onoff', circle)
            //var deviceObj = false;
            //devices.forEach(function (installed_device) {
            
            //    // If already installed
            //    if (installed_device.uuid == device.data.id) {
            //        deviceObj = installed_device;
            //    }
            //});
            
            //// Add device to internal list
            //devices.push(device.data);
            
            //// Mark as offline by default
            //module.exports.setUnavailable(device.data, "Offline");
            
            //// Conntect to the new Device
            //Homey.app.connectToDevice(devices, device.data, function (err, device_data) {
            
            //    // Mark the device as available
            //    if (!err && device_data) module.exports.setAvailable(device_data);
            //});
            
            //// Empty found devices to prevent piling up
            //foundDevices = [];
            
            // Return success
            
            var devicedataobj = { "id" : device.data.id };
            
            // callback(null);
            callback(null, devicedataobj);
            socket.emit('pairingdone', '', function (err, result) {
                console.log(result) // Hi!
            });
          
        });
        
        
        
        
        socket.on('disconnect', function () {
            
        })

    },
    
    capabilities : {
        
        onoff: {
          
            
            get: function (device_data, callback) {
                
                console.log('capabilitis get onoff entered  device_data:', device_data)
                // get the bulb with a locally defined function
                device = getPairedDevice(device_data.id);
                console.log('capabilitis get onoff device data ', device.data.id);
                console.log('driver 279 capabilitis get onoff ', device.onoff);
                if (device instanceof Error) return callback(device);
                
                
                // send the dim value to Homey
                if (typeof callback == 'function') {
                    callback(null, device.onoff);
                }
            },
            
            
            
            
            
            set: function (device_data, onoff, callback) {
                // to set a circle you have to tranlate te modulemaccadress to appliance.id
                // applinace id is  send to plugwise
                
                console.log('capabilitis set onoff    ', onoff)
               
                
                //if (device_data instanceof Error) return callback(device_data);
                console.log('capabilitis set  onoff entered')
                
                device = getPairedDevice(device_data.id);
                
                if (device.onoff == true) {
                    onoff = false;
                }
                else if (device.onoff == false) {
                    onoff = true;
                }
                
                device.onoff = onoff;
                
                console.log('capabilitis set  send to plugwise', onoff)
                sendCommandToPlugwise(device.plugwiseid, onoff)
                
                
               
                module.exports.realtime(device_data, 'onoff', onoff);
                
                //     // Return state
                callback(null, onoff);
               // });
            }
        },
        
        measure_power : {
   //  watt
            
            
            get: function (device_data, callback) {
                
                console.log('capabilitis get measure_power entered')
                
                // get the bulb with a locally defined function
                device = getPairedDevice(device_data.id);
                console.log('driver 279 capabilitis get device.measure_power  ', device.measure_power)
                if (device instanceof Error) return callback(device);
                
                
                
                // send the dim value to Homey
                if (typeof callback == 'function') {
                    callback(null, device.measure_power);
                }
            }
            
        },  
        
        meter_power : {
   // kwuur
            
            get: function (device_data, callback) {
                
                console.log('driver 358 capabilitis get meter_power entered')
                
                // get the bulb with a locally defined function
                device = getPairedDevice(device_data.id);
                console.log('driver 362 capabilitis get device.measure_power  ', device.meter_power)
                if (device instanceof Error) return callback(device);
                
                // send the dim value to Homey
                if (typeof callback == 'function') {
                    callback(null, device.meter_power);
                }
            }
        
        }

    }




}// end self

module.exports = self;

self.processDeviceData = function (data,poller) {
    
    
    console.log('driver 469  processdevcedata entered ');
    
    sourcedata = data;
    
    //  "[{"error":{"type":101,"address":"","description":"link button not pressed"}}]"
    // "[{"error":{"type":2,"address":"","description":"body contains invalid json"}}]"
    // "[{"success":{"username":"abd7825e - aa9d - c301 - 8e4a - 3e6de64a8aaf"}}]"
    
    
    //  Homey.log(data)
    
    // console.log(data);
    
    var parser = new xml2js.Parser({ explicitArray: false })
    
    parser.parseString(data, function (err, result) {
        
        // console.log(util.inspect(result, false, null))
        //console.log(result);
        // console.log('results length', results.length);
        
        
        
        //  console.log(util.inspect(results, false, null));
        
        
        sourceobject = result;
        appliances = sourceobject.items.appliance;
        devices = TranslateAppliancesToAppDevices(sourceobject.items.appliance);

        PairedDevicesOld = pairedDevices.slice();

        pairedDevices = getPairedDevicesFromDevices(cloned_devices_data, devices);
        
        for (var i = 0; i < cloned_devices_data.length; i++) {
            
          //  console.log('driver 278   virtual setavailablity' , cloned_devices_data[i])
                      //  module.exports.setAvailable(devices_data[i])                      
                      //  module.exports.getSettings(devices_data[i], function (err, settings) {
   // console.log(settings.toString)
             //           })
            
          //  var plugewiseid = getCircleId2(device_data.id);
          //  console.log('driver 29 init', plugwiseid)
       
        };
        console.log(' poller poller % stateModulus (poller % stateModulus) == 0)', poller + '  ' + poller % stateModulus + '  ' + (poller % stateModulus == 0));
        //if (((poller % stateModulus) == 0) && poller > 1 )
        //{
        //    for (var i = 0; i < pairedDevices.length; i++)
        //    {

        //        var thisdevice = {};
        //        console.log('driver 292   realtime  device capabilities for insights paireddevices[i]":', pairedDevices[i].data);
        //        console.log('driver 292   realtime  device capabilities for insights paireddevicesOld[i]":', PairedDevicesOld[i].data);
        //        thisdevice = pairedDevices[i];

        //        if (thisdevice.onoff !== PairedDevicesOld[i].onoff)
        //        {
        //            module.exports.realtime(thisdevice.data, 'onoff', thisdevice.onoff);
        //        }
        //        if (thisdevice.measure_power !== PairedDevicesOld[i].measure_power)
        //        {
        //            module.exports.realtime(thisdevice.data, 'measure_power', thisdevice.measure_power);
        //        }
        //        if (thisdevice.meter_power !== PairedDevicesOld[i].meter_power)
        //        {
        //            module.exports.realtime(thisdevice.data, 'meter_power', thisdevice.meter_power);
        //        }
        //    };
        //};






    }); // parser

}// processdevicedata

function TranslateAppliancesToAppDevices(dat) {
    
    
    
    var len = dat.length
    var homeydevices = [];
    console.log('enterd tranlateapplicance to appdevice');
    
    for (var i = 0; i < len; i++) {
        var homeydevice = {};
      //  util.log(util.inspect((dat[i].moduletype == "Circle" || dat[i].moduletype == "Circle+"), false, null))
      //  util.log(util.inspect((dat[i]), false, null))
        // filter out all other devices as circles and circles+
        if (dat[i].moduletype == "Circle" || dat[i].moduletype == "Circle+" ) {
            homeydevice = {
                data: { id: dat[i].macaddr },
                name: dat[i].name,
                capabilities: ["onoff", "measure_power", "meter_power"],
                plugwiseid: dat[i].id,  // id in plugwise needed  to send command
                measure_power: Number(((dat[i].powerusage) / 100).toFixed(2)),
                meter_power: Number(((dat[i].totalusage) / 100).toFixed(0)),
                type: dat[i].type,
                room: dat[i].room,
                onoff: translatePowerstateFromPlugwiseToHomey(dat[i].realstate)

            };

            //  console.log('device',   homeydevice);

            //   console.log(device);
            homeydevices.push(homeydevice);
        };
    };
    
    
    return homeydevices;

}

function  getPairedDevicesFromDevices(devdat, devs) {
    var pdevs = [];
    
    // console.log('driver 546 get paired devices devdat devs', devdat)
    //  console.log('driver 546 get paired devices devs length', devs[10].data.id)
    for (var i = 0; i < devdat.length; i++) {
        
        for (var j = 0; j < devs.length; j++) {
            
            if (devdat[i].id == devs[j].data.id) {
                
                pdevs.push(devs[j]);
                //  console.log('driver 566 paired device', devs[j]);
                //update homey
                module.exports.realtime(devs[j].data, 'onoff', devs[j].onoff);
                module.exports.realtime(devs[j].data, 'measure_power', devs[j].measure_power);
                module.exports.realtime(devs[j].data, 'meter_power', devs[j].meter_power);
                console.log('driver 377 onoff device data  ' + util.inspect(devdat[i], false, null) , devs[j].onoff)
                console.log('driver 378 powerusage device data  ' + util.inspect(devdat[i], false, null) , devs[j].measure_power)
                console.log('driver 379 meter power device data  ' + util.inspect(devdat[i], false, null) , devs[j].meter_power)
            }
        }
            
    }
    
    return pdevs;
}

function getCircle(id) {
    
    var deviceexport = {}
    
    console.log('getCircle entered ;')
    
    
    
    console.log('applinaces.length  ', appliances.length)
    
    for (var i = 0; i < appliances.length; i++) {
        
        
        if (appliances[i].macaddr == id) {
            console.log('circel found in getcircle');
            console.log('applinace macadres ;', appliances[i].macaddr);
            console.log("id", id);
            console.log("appliance  ", appliances[i]);
            deviceexport = appliances[i];
            
      
        }

       
    }
    
    return deviceexport;
    
    
}


//// get circle id for action 
function getCircleId(id) {
    
    var idexport = {}
    
    console.log('getCircle entered ;')
    
    
    
    console.log('paireddevice.length  ', pairedDevices.length)
    
    for (var i = 0; i < pairedDevices.length; i++) {
        
        
        
        
        if (pairedDevices[i].data.id == id) {
            console.log('circel found in getcircleid');
            console.log('applinace macadres ;', pairedDevices[i].data.id);
            console.log("id", id);
            console.log("appliance  ", pairedDevices[i]);
            idexport = appliances[i].plugwiseid; // id in plugwise needed  to send command
            
        }

       
    }
    
    return idexport;
    
    
}

function getCircleId2(id) {
    
    
    
    for (var i = 0; i < cloned_devices_data.length; i++) {
        
        console.log('driver 25   setavailablity' , cloned_devices_data[i])
        module.exports.setAvailable(cloned_devices_data[i])
        
        var plugwiseid = getCircleId2(device_data.plugwiseid);
        
        return
    }

};



///  translates on off to true false
function  translatePowerstateFromPlugwiseToHomey(state) {
    if (state == "on") {
        return true
    }
    else if (state == "off") {
        return false
    }



}
/// send command to plugwise
function sendCommandToPlugwise(id, onoff) {
    console.log('479 sendcmmand with deviseid   ' + id + ' and    command   ' + onoff);
    
    var command = '';
    if (onoff == true) {
        command = 'on';
    }
    else if (onoff == false) {
        command = "off";
    }
    console.log('commandpath = /api/actions.html?option=switch' + command + '&id=' + id)
    
    
    
 
    var path= '/api/actions.html?option=switch' + command + '&id=' + id
  
    //Homey.app.
    //self.reqserver = function (ip, port, path, method, username, password) { 
    Homey.app.reqserver(Homey.app.serverip, Homey.app.serverport, path, Homey.app.servermethod, Homey.app.serverusername, Homey.app.serverpassword);
   






}









/// <summary>Determines the area of a circle that has the specified radius parameter.</summary>
/// <param name="radius" type="Number">The radius of the circle.</param>
/// <returns type="Number">The area.</returns>    

//// devs = homeydevices object 


//#region main

function getPairedDevice(id) {
    
    var deviceexport = {}
    
    //console.log('getPairedDevice entered ;')
    
    
    
    //console.log('paireddevice.length  ', pairedDevices.length)
    
    for (var i = 0; i < pairedDevices.length; i++) {
        
        
        if (pairedDevices[i].data.id == id) {
            //console.log('circel found in getcircle');
            
            //console.log("id", id);
            //console.log("paireddevice  ", pairedDevices[i]);
            deviceexport = pairedDevices[i];
            
      
        }

       
    }
    
    return deviceexport;
    
    
}

//#endregion

function  addDeviceToPairedDevices(macid) {
    
    var tobeadddedtopaireddevices = getCircle(macid)
    
    
    
    console.log('driver 726 addDeviceToPairedDevices cirvle ', tobeadddedtopaireddevices);
    
    
    var homeycircle = {};
    
    homeycircle = { // = paireddevice if paired
        data : { id : tobeadddedtopaireddevices.macaddr },
        name: tobeadddedtopaireddevices.name,
        capabilities: ["onoff", "measure_power", "meter_power"],
        plugwiseid: tobeadddedtopaireddevices.id,  // id in plugwise needed  to send command
        measure_power: Number(((tobeadddedtopaireddevices.powerusage) / 100).toFixed(2)),
        meter_power: Number(((tobeadddedtopaireddevices.totalusage) / 100).toFixed(0)),
        type       : tobeadddedtopaireddevices.type,
        room       : tobeadddedtopaireddevices.room,
        onoff      : translatePowerstateFromPlugwiseToHomey(tobeadddedtopaireddevices.realstate)
                     
    };
    //  console.log('device',   homeydevice);
    
    //   console.log(device);
    
    console.log('driver 726 addDeviceToPairedDevices homeycircle ', homeycircle);
    
    pairedDevices.push(homeycircle);

   // TODO:    filter out realtime no changes made 

    // TODO:  realtime check one in four or 40 etc

   // TODO: filter out the plugwise smiley in the xml 

    // TODO: regions  http://stackoverflow.com/questions/1921628/how-to-implement-regions-code-collapse-in-javascript
    //  http://vswebessentials.com/features/javascript
    //   web essential Web Extension Pack  https://visualstudiogallery.msdn.microsoft.com/f3b504c6-0095-42f1-a989-51d5fc2a8459
}




