//this is the right one
"use strict";

var http = require("http");
var util = require('util');
var xml2js = require('xml2js');
var driver = require('./drivers/circle/driver.js');

var self = module.exports= {
    
    // variables for server
    plugwiseserverset   : false,    
    plugwiseserverconnected : false,
    plugwiseservertesting : true, // testing at start and if servervariables are set, have to test first
    plugwiseservertested : false , //Homey.manager('settings').get('testing'),
    polleri : 0,
    pollInterval : 15000,
    serverip : Homey.manager('settings').get('serverip'),
    serverport : Homey.manager('settings').get('serverport'),
    serverusername : Homey.manager('settings').get('serverusername'),
    serverpassword : Homey.manager('settings').get('serverpassword'),
    serverpath : '',
    servermethod : '',
    serveraction : false ,  // = retrieve xml  get or post retrieve xml or send command false if no action send
    serverdata : {} , // data from on end request

    
    
    
    
    // to be done after setting all server variables read them agian from settings;
    // remoe all settings except the serveriables options
    
    
    
    
    
     torepeat : {} ,
    toset : {},

    
    pollplugwise : function () {
        self.torepeat = function () {
            self.polleri += 1;
            console.log('app 19 polleri before', self.polleri);
            
            
            console.log('pollplugwise  self.plugwiseserverset', self.plugwiseserverset               );
            console.log('pollplugwise  self.testplugwiseserver', self.plugwiseservertested            ) ;
            console.log('pollplugwise  self.plugwiseserverconnected', self.plugwiseserverconnected);
            

           if (self.plugwiseserverset&&self.plugwiseserverconnected) {

                self.reqserver(self.serverip, self.serverport, self.serverpath, self.servermethod, self.serverusername, self.serverpassword);
                
            };
            console.log('app 27 polleri after ', self.polleri);


        };
        
        
       self.toset = setInterval(function () { self.torepeat() }, self.pollInterval);

    },  
    


    init: function () {
   
        self.serverpath = '/statistics.xml';
        self.servermethod = 'GET';
        
        console.log('Hello world init app.js');    
        
        console.log('Hello world');        
        
        console.log('app 25  plugiseserverset value :', self.plugwiseserverset)

        // get variables
        self.serverip = Homey.manager('settings').get('serverip');
        self.serverport = Homey.manager('settings').get('serverport');
        self.serverusername = Homey.manager('settings').get('serverusername');
        self.serverpassword = Homey.manager('settings').get('serverpassword');
        
        
        Homey.log("value ip setting input box", self.serverip);
        Homey.log("value port setting input box", self.serverport);
        Homey.log("value user setting input box", self.serverusername);
        Homey.log("value password  setting input box", self.serverpassword);
        Homey.log("value testing setting", self.plugwiseservertested);
        Homey.log("99 plugwiseserverconnected ", self.plugwiseserverconnected);
        Homey.log("plugwiseservertested ", self.plugwiseservertested); 
        
        
        
        
        
        


        // check if server is set
        if (!(self.serverip == undefined) && !(self.serverip == undefined) && !(self.serverusername == undefined) && !(self.serverip == undefined)) {
            self.plugwiseserverset = true;

            console.log('app 102 check if server is set     server is set');
        } else {
            self.plugwiseserverset = false;
            console.log('app 102  check if server is set    server is notset');
        }

   
        
        

        
        
       

        
     
       // test first if server is connected/reachable
        if (self.plugwiseserverset) {
            
            // must be set after req
            //self.plugwiseservertested = true;
            console.log('driver 103  before testserver if (self.plugwiseserverset)');
            self.polleri += 1
            self.reqserver(self.serverip, self.serverport, self.serverpath, self.servermethod, self.serverusername, self.serverpassword);
                       
        } ;
        
        

        
        


      /// invoked when testing server from index.html
     //  Homey.manager('settings').on('set', function (testing) {
            //  if (err) return console.error('Could not get test', err);
            
            console.log('entered Homey.manager(settings).on(set, function (testing)');
            console.log('function (plugwiseservertested)the variable', self.plugwiseservertested);
            // got username!
            console.log(' 156 testing ', self.plugwiseservertested);
            
            
            
            var key = Homey.manager('settings').get('serverip');
            
            console.log('app 162 setting value of key serverip :', key);
            console.log('app 146 testing :', key);
            
        
            
           
        

            console.log('153 self.plugwiseservertested ', self.plugwiseservertested)
            
            // this one gets testing = false
           
            console.error('app init 157init test');
            
            //sends event to settingspage
            Homey.manager('api').realtime('my_event', { testing : true });
            // gives circular requests
            if (!(self.serverip == null) && !(self.serverip == null) && !(self.serverusername == null) && !(self.serverip == null)) {
                self.reqserver(self.serverip, self.serverport, self.serverpath, self.servermethod, self.serverusername, self.serverpassword);
                self.polleri += 1
            };

      //  })
        
        
        
        
        
        
        
//Homey.manager('settings').on('set', function (
//string name   // name of the setting 
//) )
        

        Homey.manager('settings').on('set', function () {
            
            self.serverip = Homey.manager('settings').get('serverip');
            self.serverport = Homey.manager('settings').get('serverport');
            self.serverusername = Homey.manager('settings').get('serverusername');
            self.serverpassword = Homey.manager('settings').get('serverpassword');
            
            self.plugwiseserverset = true;

            console.log('181 settings on set with serverip ', self.serverip);
            
            clearInterval(self.toset);
            self.polleri += 1
            self.reqserver(self.serverip, self.serverport, self.serverpath, self.servermethod, self.serverusername, self.serverpassword);
            self.pollplugwise();
            console.log('181 settings saved on index ');
            
        });

    




        self.pollplugwise();




    }  // wns init
    
   
    
    
    
    






}// self



// http://stackoverflow.com/questions/31394416/pass-extra-parameter-to-nodejs-http-callback-method
self.reqserver = function (ip, port, path, method, username, password) {
    
    var callback2 = function (response) {
        var str = '';
       
        //another chunk of data has been recieved, so append it to `str`
                
        console.log('driver 174  callback2 entered ')

        response.on('data', function (chunk) {
            str += chunk;
          ;
        });
        
        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            
            
            console.log('app 50         response on end' );
            
            console.log('app 231    before   if (self.plugwiseservertested)      ', self.plugwiseservertested);
            console.log('app 232   befor   if (response.statusCode == 200)      ', response.statusCode);
            console.log('app 233   before    if (!self.plugwiseserverconnected)      ', !self.plugwiseserverconnected);
            
            if (self.plugwiseservertesting) {
                
                console.log('app 237    after   if (self.plugwiseservertesting)      ', self.plugwiseservertesting);

                Homey.manager('api').realtime('my_event', { plugwiseserverconnected : true });

                if (response.statusCode == 200) {
                    console.log('app 240   after    if (response.statusCode == 200)      ', response.statusCode);
                    self.plugwiseservertested = true;
                                      // only do a meesage if value chaneged
                    if (!self.plugwiseserverconnected) {
                        console.log('app 268  after    if (!self.plugwiseserverconnected)      ', !self.plugwiseserverconnected);
                        console.log('app 269  server isconnected      ');
                   
                        self.plugwiseserverconnected = true;
                        self.plugwiseservertesting = false // not more we are connected to  the server
                    
                        Homey.manager('api').realtime('my_event', { plugwiseserverconnected : true });
                    
                        
                        console.log('app 277   response.statusCode        ', response.statusCode);
                        console.log('app 277    self.testplugwiseserver    ', self.plugwiseservertested);
                    }; //connected
                }
            }
            //else {
                
              //  console.log('app 201 callback2 response.statusCode', response.statusCode)
            
          //  self.serverdata = str;   // to send to driver
            
            var checkpath = '';  //    /api/actions.html?

            checkpath = path.substring(0, 4);
            
            console.log('/api/  checkpath = ', checkpath)
            
            if (!(checkpath == '/api/')) {
                console.log('!(checkpath == /api/)', !(checkpath == '/api/'))
                driver.processDeviceData(str,self.polleri);
            };
           
           
        }); // on end
          
                
    };// callbCK2
    
      
    

        var options2 = {
            
            host : ip,
            port: port,
            path: path,
            method: method,
    
            
            auth : username + ':' + password

        };
        
        
        
        
        
        
        
     
        console.log(' before req to be executed options2  ', options2);
        var req = http.request(options2, callback2);       
    req.end();
    req.on('error', function (err) {
           console.log('err req' , err)
    });

    }// end request


// processes the devicedata

