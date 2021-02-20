/*
 * File: ZHAWater.js
 * Project: homematic-virtual-deConz
 * File Created: Thursday, 15th October 2020 9:25:24 pm
 * Author: Thomas Kluge (th.kluge@me.com)
 * -----
 * The MIT License (MIT)
 *
 * Copyright (c) Thomas Kluge <th.kluge@me.com> (https://github.com/thkl)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * ==========================================================================
 */

const path = require('path')
const DeConzDevice = require(path.join(__dirname, 'DeConzDevice.js'))

class ZHAWaterSensor extends DeConzDevice {
  constructor (plugin, sensor) {
    super(plugin, sensor, 'HM-Sec-WDS')
    this.sensors = []
    this.addSensor(sensor)
    this.updateSensor()
  }

  updateSensor () {
    let self = this
    let sensor = this.sensors[0]
    this.gateway.refreshSensor(sensor).then(() => {
      let mC = self.hmDevice.getChannelWithTypeAndIndex('MAINTENANCE', 0)
      mC.updateValue('LOWBAT', (sensor.battery < 40), true, true)
    })

    setTimeout(() => {
      self.updateSensor()
    }, 1000 * 1800)
  }

  addSensor (sensor) {
    let self = this
    let channel
    sensor.on('change', () => {
      self.lastMessageTime = new Date()
      switch (sensor.type) {
        case 'ZHAWater':
          channel = self.hmDevice.getChannelWithTypeAndIndex('WATERDETECTIONSENSOR', 1)
          self.log.info('Updating STATE %s', sensor.water)
          channel.updateValue('STATE', sensor.water, true, true)
          break
      }
    })
    this.sensors.push(sensor)
  }
}

module.exports = ZHAWaterSensor
