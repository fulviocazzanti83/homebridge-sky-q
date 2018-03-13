# homebridge-sky-q

Based on [Homebridge](https://github.com/nfarina/homebridge) plugin to turn on/off a Sky Q box.
Added feature to change channel (work eith Siri). I use Elgato Eve app for define a scene like Channel 501.

## Installation

Not published to npm

## Configuration

Add this to your `~/.homebridge/config.json` as an accessory:
```
{
	"accessory": "SkyQ",
	"name": "Sky Q Box",
	"ipAddress": "<Sky Q Box IP Address>"
}
```

## Getting your Sky Q Box's IP address

On your Sky Q Box, go to Settings > Setup > Network > Advanced Settings > IP address.
