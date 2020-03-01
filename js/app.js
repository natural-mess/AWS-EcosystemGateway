/*
Copyright 2016-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
(function() {
  'use strict';

  function LogMsg(type, content){
    this.type = type;
    this.content = content;
    this.createdTime = Date.now();
    if (this.type === 'success') {
      this.className = 'list-group-item-info';
    } else {
      this.className = 'list-group-item-danger';
    }
  }

  function LogService(){
    this.logs = [];
  }

  LogService.prototype.log = function(msg) {
    var logObj = new LogMsg('success', msg);
    this.logs.push(logObj);
  };

  LogService.prototype.logError = function(msg) {
    var logObj = new LogMsg('error', msg);
    this.logs.push(logObj);
  };

  /**
   * wrapper of received paho message
   * @class
   * @param {Paho.MQTT.Message} msg
   */
  function ReceivedMsg(msg) {
    this.msg = msg;
    this.content = msg.payloadString;
    this.destination = msg.destinationName;
    this.receivedTime = Date.now();
  }

  /** controller of the app */
  function AppController(scope){
    this.clientId = 'phuc';
    this.endpoint = 'a134mcoov02fqn.iot.us-east-1.amazonaws.com';
    this.accessKey = 'AKIAIHVQDB742YNVUKAQ';
    this.secretKey = '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';
    this.regionName = 'us-east-1';
    this.logs = new LogService();
    this.clients = new ClientControllerCache(scope, this.logs);
  }

  AppController.$inject = ['$scope'];

  AppController.prototype.createClient = function() {
    var options = {
      clientId : this.clientId,
      endpoint: this.endpoint.toLowerCase(),
      accessKey: this.accessKey,
      secretKey: this.secretKey,
      regionName: this.regionName
    };
    var client = this.clients.getClient(options);
    if (!client.connected) {
      client.connect(options);
    }
  };

  AppController.prototype.removeClient = function(clientCtr) {
    this.clients.removeClient(clientCtr);
  };

  // would be better to use a seperate derective
  function ClientController(client, logs) {
    this.client = client;
    //Subscribe
    this.topicName1 = "/sensors/Power";
    this.topicName2 = "/sensors/Lux";
    this.topicName3 = "/sensors/Humd";
    this.topicName4 = "/sensors/Dist";
    this.topicName5 = "/sensors/Motion";
    this.topicName6 = "/devices/LightA/state";
    this.topicName7 = "/devices/LightB/state";
    this.topicName8 = "/devices/Switch/state";
    this.topicName9 = "/devices/LightC/state";

    //Publish
    this.topicNameA = "/devices/LightA/command";
    this.topicNameB = "/devices/LightB/command";
    this.topicNameC = "/devices/LightC/command";
    this.topicNameS = "/devices/Switch/command";

    this.messagea = null;
    this.messageb = null;
    this.messages = null;
    this.messagec = null;
    this.value = 0;
    this.msgs = [];
    this.logs = logs;
    this.letter = null;
    var self = this;


    this.client.on('connectionLost', function(){
      self.logs.logError('Connection lost');
    });
    this.client.on('messageArrived', function(msg){
      self.logs.log('messageArrived in ' + self.id);
      self.msgs.push(new ReceivedMsg(msg));
      if(msg.destinationName == self.topicName1) {
        console.log("Power: "+msg.payloadString);
        document.getElementById("power").innerHTML = msg.payloadString;
      }

      if(msg.destinationName == self.topicName2) {
        console.log("Lux: "+msg.payloadString);
        document.getElementById("lux").innerHTML = msg.payloadString;
      }

      if(msg.destinationName == self.topicName3) {
        console.log("Humd: "+msg.payloadString);
        document.getElementById("humd").innerHTML = msg.payloadString;
      }

      if(msg.destinationName == self.topicName4) {
        console.log("Distance: "+msg.payloadString);
        document.getElementById("dist").innerHTML = msg.payloadString;
      }

      if(msg.destinationName == self.topicName5) {
        console.log("Motion: "+msg.payloadString);
        document.getElementById("motion").innerHTML = msg.payloadString;
      }

      if(msg.destinationName == self.topicName6) {
        console.log("Light A sub: "+msg.payloadString);
        document.getElementById("lightasub").innerHTML = msg.payloadString;
        if(msg.payloadString =="1") {
          document.getElementById("lighta").checked = true;
        }
        else if(msg.payloadString =="0"){
          document.getElementById("lighta").checked = false;
        }
      }

      if(msg.destinationName == self.topicName7) {
        console.log("Light B sub: "+msg.payloadString);
        document.getElementById("lightbsub").innerHTML = msg.payloadString;
        if(msg.payloadString =="1") {
          document.getElementById("lightb").checked = true;
        }
        else if(msg.payloadString =="0"){
          document.getElementById("lightb").checked = false;
        }
      }

      if(msg.destinationName == self.topicName8) {
        console.log("Switch sub: "+msg.payloadString);
        document.getElementById("switchsub").innerHTML = msg.payloadString;
        if(msg.payloadString =="1") {
          document.getElementById("lights").checked = true;
        }
        else if(msg.payloadString =="0"){
          document.getElementById("lights").checked = false;
        }
      }

      if(msg.destinationName == self.topicName9) {
        console.log("Light C sub: "+msg.payloadString);
        document.getElementById("lightcsub").innerHTML = msg.payloadString;
        document.getElementById("lightc").value = msg.payloadString;
    }
    });

    this.client.on('connected', function(){
      self.logs.log('connected');
    });
    this.client.on('subscribeFailed', function(e){
      self.logs.logError('subscribeFailed ' + e);
    });
    this.client.on('subscribeSucess', function(){
      self.logs.log('subscribeSucess');
    });
    this.client.on('publishFailed', function(e){
      self.logs.log('publishFailed');
    });
  }

  ClientController.prototype.subscribe = function() {
    this.client.subscribe(this.topicName1);
    this.client.subscribe(this.topicName2);
    this.client.subscribe(this.topicName3);
    this.client.subscribe(this.topicName4);
    this.client.subscribe(this.topicName5);
    this.client.subscribe(this.topicName6);
    this.client.subscribe(this.topicName7);
    this.client.subscribe(this.topicName8);
    this.client.subscribe(this.topicName9);
  };

  // ClientController.prototype.subscribe = function() {
  //   this.client.subscribe(this.topicName2);
  // };



  ClientController.prototype.publish = function() {
    //var checka = document.getElementById("lighta").checked;
    //var checkb = document.getElementById("lightb").checked;
    // var checkc = document.getElementById("lightc").value;
    //var checks = document.getElementById("lights").checked;
    // var output = document.getElementById("valueSlider");

    // output.innerHTML = checkc;
    // document.getElementById("lightc").oninput = function() {
    //   output.innerHTML = checkc;
    // }
    // console.log("checka "+checka);
    // console.log("mess "+this.messagea);

    // this.messagea = checka;
    // this.messageb = checkb;
    // this.messages = checks;

    if (this.messagea)
    {
      console.log("Light A on");
      this.client.publish(this.topicNameA, "1");
    }
    else if(!this.messagea)
    {
      console.log("Light A off");
      this.client.publish(this.topicNameA, "0");
    }

    if (this.messageb)
    {
      console.log("Light B on");
      this.client.publish(this.topicNameB, "1");
    }
    else if(!this.messageb)
    {
      console.log("Light B off");
      this.client.publish(this.topicNameB, "0");
    }

    console.log("Light C value: "+this.value);
    this.client.publish(this.topicNameC, this.value);
    document.getElementById("valueSlider").innerHTML =  this.value;

    if (this.messages)
    {
      console.log("Socket on");
      this.client.publish(this.topicNameS, "1");
    }
    else if(!this.messages)
    {
      console.log("Socket off");
      this.client.publish(this.topicNameS, "0");
    }

};


  ClientController.prototype.messageKey = function() {
      this.publish();
  };


  function ClientControllerCache(scope, logs){
    this.scope = scope;
    this.logs = logs;
    this.val = [];
  }

  ClientControllerCache.prototype.getClient = function(options) {
    var id = options.accessKey + '>' + options.clientId + '@' + options.endpoint;
    for (var i = 0; i < this.val.length; i++) {
      var ctr = this.val[i];
      if (ctr.id === id) {
        return ctr.client;
      }
    }
    var client =  new MQTTClient(options, this.scope);
    var clientController = new ClientController(client, this.logs);
    clientController.id = id;
    this.val.push(clientController);
    return client;
  };

  ClientControllerCache.prototype.removeClient = function(clientCtr) {
    clientCtr.client.disconnect();
    var index = this.val.indexOf(clientCtr);
    this.val.splice(index, 1);
  };


  /**
   * utilities to do sigv4
   * @class SigV4Utils
   */
  function SigV4Utils(){}

  SigV4Utils.sign = function(key, msg){
    var hash = CryptoJS.HmacSHA256(msg, key);
    return hash.toString(CryptoJS.enc.Hex);
  };

  SigV4Utils.sha256 = function(msg) {
    var hash = CryptoJS.SHA256(msg);
    return hash.toString(CryptoJS.enc.Hex);
  };

  SigV4Utils.getSignatureKey = function(key, dateStamp, regionName, serviceName) {
    var kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + key);
    var kRegion = CryptoJS.HmacSHA256(regionName, kDate);
    var kService = CryptoJS.HmacSHA256(serviceName, kRegion);
    var kSigning = CryptoJS.HmacSHA256('aws4_request', kService);
    return kSigning;
  };

  /**
  * AWS IOT MQTT Client
  * @class MQTTClient
  * @param {Object} options - the client options
  * @param {string} options.endpoint
  * @param {string} options.regionName
  * @param {string} options.accessKey
  * @param {string} options.secretKey
  * @param {string} options.clientId
  * @param {angular.IScope}  [scope]  - the angular scope used to trigger UI re-paint, you can
  omit this if you are not using angular
  */
  function MQTTClient(options, scope){
    this.options = options;
    this.scope = scope;

    this.endpoint = this.computeUrl();
    this.clientId = options.clientId;
    this.name = this.clientId + '@' + options.endpoint;
    this.connected = false;
    this.client = new Paho.MQTT.Client(this.endpoint, this.clientId);
    this.listeners = {};
    var self = this;
    this.client.onConnectionLost = function() {
      self.emit('connectionLost');
      self.connected = false;
    };
    this.client.onMessageArrived = function(msg) {
      self.emit('messageArrived', msg);
    };
    this.on('connected', function(){
      self.connected = true;
    });
  }

  /**
   * compute the url for websocket connection
   * @private
   *
   * @method     MQTTClient#computeUrl
   * @return     {string}  the websocket url
   */
  MQTTClient.prototype.computeUrl = function(){
    // must use utc time
    var time = moment.utc();
    var dateStamp = time.format('YYYYMMDD');
    var amzdate = dateStamp + 'T' + time.format('HHmmss') + 'Z';
    var service = 'iotdevicegateway';
    var region = this.options.regionName;
    var secretKey = this.options.secretKey;
    var accessKey = this.options.accessKey;
    var algorithm = 'AWS4-HMAC-SHA256';
    var method = 'GET';
    var canonicalUri = '/mqtt';
    var host = this.options.endpoint;

    var credentialScope = dateStamp + '/' + region + '/' + service + '/' + 'aws4_request';
    var canonicalQuerystring = 'X-Amz-Algorithm=AWS4-HMAC-SHA256';
    canonicalQuerystring += '&X-Amz-Credential=' + encodeURIComponent(accessKey + '/' + credentialScope);
    canonicalQuerystring += '&X-Amz-Date=' + amzdate;
    canonicalQuerystring += '&X-Amz-Expires=86400';
    canonicalQuerystring += '&X-Amz-SignedHeaders=host';

    var canonicalHeaders = 'host:' + host + '\n';
    var payloadHash = SigV4Utils.sha256('');
    var canonicalRequest = method + '\n' + canonicalUri + '\n' + canonicalQuerystring + '\n' + canonicalHeaders + '\nhost\n' + payloadHash;
    console.log('canonicalRequest ' + canonicalRequest);

    var stringToSign = algorithm + '\n' +  amzdate + '\n' +  credentialScope + '\n' +  SigV4Utils.sha256(canonicalRequest);
    var signingKey = SigV4Utils.getSignatureKey(secretKey, dateStamp, region, service);
    console.log('stringToSign-------');
    console.log(stringToSign);
    console.log('------------------');
    console.log('signingKey ' + signingKey);
    var signature = SigV4Utils.sign(signingKey, stringToSign);

    canonicalQuerystring += '&X-Amz-Signature=' + signature;
    var requestUrl = 'wss://' + host + canonicalUri + '?' + canonicalQuerystring;
    return requestUrl;
  };

  /**
  * listen to client event, supported events are connected, connectionLost,
  * messageArrived(event parameter is of type Paho.MQTT.Message), publishFailed,
  * subscribeSucess and subscribeFailed
  * @method     MQTTClient#on
  * @param      {string}  event
  * @param      {Function}  handler
  */
  MQTTClient.prototype.on = function(event, handler) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(handler);
  };

  /** emit event
   *
   * @method MQTTClient#emit
   * @param {string}  event
   * @param {...any} args - event parameters
   */
  MQTTClient.prototype.emit = function(event) {
    var listeners = this.listeners[event];
    if (listeners) {
      var args = Array.prototype.slice.apply(arguments, [1]);
      for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        listener.apply(null, args);
      }
      // make angular to repaint the ui, remove these if you don't use angular
      if(this.scope && !this.scope.$$phase) {
        this.scope.$digest();
      }
    }
  };

  /**
   * connect to AWS, should call this method before publish/subscribe
   * @method MQTTClient#connect
   */
  MQTTClient.prototype.connect = function() {
    var self = this;
    var connectOptions = {
      onSuccess: function(){
        self.emit('connected');
      },
      useSSL: true,
      timeout: 3,
      mqttVersion:4,
      onFailure: function() {
        self.emit('connectionLost');
      }
    };
    this.client.connect(connectOptions);
  };

  /**
   * disconnect
   * @method MQTTClient#disconnect
   */
  MQTTClient.prototype.disconnect = function() {
    this.client.disconnect();
  };

  /**
   * publish a message
   * @method     MQTTClient#publish
   * @param      {string}  topic
   * @param      {string}  payload
   */
  MQTTClient.prototype.publish = function(topic, payload) {
    try {
      var message = new Paho.MQTT.Message(payload);
      message.destinationName = topic;
      this.client.send(message);
    } catch (e) {
      this.emit('publishFailed', e);
    }
  };

  /**
   * subscribe to a topic
   * @method     MQTTClient#subscribe
   * @param      {string}  topic
   */
  MQTTClient.prototype.subscribe = function(topic) {
    var self = this;
    try{
      this.client.subscribe(topic, {
        onSuccess: function(){
          self.emit('subscribeSucess');
        },
        onFailure: function(){
          self.emit('subscribeFailed');
        }
      });
    }catch(e) {
      this.emit('subscribeFailed', e);
    }

  };

  angular.module('awsiot.sample', []).controller('AppController', AppController);
})();