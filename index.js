'use strict';

var SkyRemote = require('sky-remote');
var SkyQCheck = require('sky-q');
var Accessory, Service, Characteristic;

module.exports = function(homebridge) {

	Accessory = homebridge.platformAccessory;
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	
	var inherits = require('util').inherits;
	
	//	Create the characteristic for the channel number.
	Characteristic.ChannelNumber = function() {
		Characteristic.call(this, 'Channel Number','0000006E-0000-1000-8000-0037BB765291');
		this.setProps({
			format: Characteristic.Formats.INT,
			unit: Characteristic.Units.NONE,
			maxValue: 9999,
			minValue: 101,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(Characteristic.ChannelNumber, Characteristic);
	Characteristic.ChannelNumber.UUID = '0000006E-0000-1000-8000-0037BB765291';
	
	//	Create the characteristic for the channel name.
	Characteristic.ChannelName = function() {
		Characteristic.call(this, 'Channel Name','0000006E-0000-1000-8000-0037BB765292');
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ]
		});
		this.value = this.getDefaultValue();
	};
	inherits(Characteristic.ChannelName, Characteristic);
	Characteristic.ChannelName.UUID = '0000006E-0000-1000-8000-0037BB765292';
	
	//	Create the characteristic for the channel show.
	Characteristic.ChannelShow = function() {
		Characteristic.call(this, 'Channel Show','0000006E-0000-1000-8000-0037BB765293');
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ]
		});
		this.value = this.getDefaultValue();
	};
	inherits(Characteristic.ChannelShow, Characteristic);
	Characteristic.ChannelShow.UUID = '0000006E-0000-1000-8000-0037BB765293';
	
	
	homebridge.registerAccessory("homebridge-sky-q", "SkyQ", SkyQAccessory);
};

function SkyQAccessory(log, config, api) {

	this.log = log;
	this.config = config;
	this.name = config.name || 'Sky Q';

	var remoteControl = new SkyRemote(config.ipAddress);
	var boxCheck = new SkyQCheck({ip:config.ipAddress})
	this.skyQ = remoteControl;
	this.box = boxCheck;
}


SkyQAccessory.prototype = {

	setPowerState: function(powerOn, callback) {

		var log = this.log;
		var name = this.name;

		log("Sending on command to '" + name + "'...");

		this.skyQ.press('power', function(error) {
			if (error) {
				log('Failed to turn on ' + name + '. ' + error);
			}
			callback();
		});
	},

	setChannelNumber: function(channel, callback) {
		var channelStr = channel.toString();		

		this.log('Turning channel to' + channelStr);		
		var array = ["dismiss"];
		for (var i = 0; i < channelStr.length; i++) {			
			array.push(channelStr.charAt(i))
		}

		this.skyQ.press(array, function(err) {
			if (err	) {
				log('Failed to change channel to ' + channelStr + '. ' + error);
			}
		});
		callback();
	},

	identify: function(callback) {

		this.log("Identify...");

		callback();
	},

	getState: function(callback) {
		this.box.getPowerState().then(isOn=>{
  		if (isOn) {
		    this.log(this.name + " is on :-)")
		  } else {
		    this.log(this.name + " is in standby :-(")
		  }
		  callback(null, isOn);
		}).catch(err=>{
		  this.log("Unable to determine power state")
		  this.log("Perhaps looking at this error will help you figure out why" + err)
		  callback(err || new Error('Error getting state of ' + this.name));
		})
	},

	getServices: function() {

		var switchService = new Service.Switch(this.name);
		
		//	Control the box power status.
		switchService.getCharacteristic(Characteristic.On).on('set', this.setPowerState.bind(this));
		switchService.getCharacteristic(Characteristic.On).on('get', this.getState.bind(this));


		//	Control the box channel.
		switchService.addCharacteristic(Characteristic.ChannelNumber);
		switchService.getCharacteristic(Characteristic.ChannelNumber)
			.on('set', this.setChannelNumber.bind(this));
			// .on('get', this.getChannelNumber.bind(this));
		
		//	Provide some information about the channel name.
		switchService.addCharacteristic(Characteristic.ChannelName);
		// switchService.getCharacteristic(Characteristic.ChannelName)
		// 				.on('get', this.getChannelName.bind(this));
		
		//	Provide some information about the show.
		switchService.addCharacteristic(Characteristic.ChannelShow);
		// switchService.getCharacteristic(Characteristic.ChannelShow)
		// 				.on('get', this.getChannelShow.bind(this));
		
		return [switchService];
	}
};
