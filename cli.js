#!/usr/bin/env node

const moment = require('moment-timezone');
const FORMAT = 'YYYY-MM-DD hh:mm A';
const TIME_ZONES = {
  'UTC    ': { offset: '       ', tz: 'UTC' },
  'PST    ': { offset: '(-8:00)', tz: 'Etc/GMT+8' },
  'PDT/MST': { offset: '(-7:00)', tz: 'Etc/GMT+7' },
  'CST/MDT': { offset: '(-6:00)', tz: 'Etc/GMT+6' },
  'EST/CDT': { offset: '(-5:00)', tz: 'Etc/GMT+5' },
  'EDT    ': { offset: '(-4:00)', tz: 'Etc/GMT+4' },
}
const CITIES = {
  'Los Angeles': 'America/Los_Angeles',
  'New York': 'America/New_York',
  'Phoenix': 'America/Phoenix',
  'Chicago': 'America/Chicago',
  'Denver': 'America/Denver',
}

const [,, ...args ] = process.argv;
let date = args[0];

// if `date` is a timestamp, convert to Number
date = isNaN(date) ? date : Number(date);

date = moment(date);

const cityDates = Object.keys(CITIES).reduce((memo, city) => {
  const tz = CITIES[city];
  memo[city] = date.tz(tz).format(FORMAT);
  return memo;
}, {});

Object.keys(TIME_ZONES).forEach((timezone) => {
  const { offset, tz } = TIME_ZONES[timezone];
  const formattedDate = date.tz(tz).format(FORMAT);
  const matchingCities = Object.keys(cityDates).filter((city) => (
    cityDates[city] === formattedDate
  ));

  let msg = `${timezone} ${offset} ${formattedDate}`;
  if (matchingCities.length) {
    msg = `${msg} ${matchingCities.join(', ')}`;
  }

  console.log(msg);
})
