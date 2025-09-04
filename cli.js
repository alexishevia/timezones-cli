#!/usr/bin/env node

const { formatInTimeZone, getTimezoneOffset } = require('date-fns-tz');
const { parseISO, isValid } = require('date-fns');

const FORMAT = 'yyyy-MM-dd hh:mm a';

const TIME_ZONES = {
  UTC: { offset: '', tz: 'UTC' },
  PST: { offset: '(-8:00)', tz: 'Etc/GMT+8' },
  'PDT/MST': { offset: '(-7:00)', tz: 'Etc/GMT+7' },
  'CST/MDT': { offset: '(-6:00)', tz: 'Etc/GMT+6' },
  'CDT/EST': { offset: '(-5:00)', tz: 'Etc/GMT+5' },
  EDT: { offset: '(-4:00)', tz: 'Etc/GMT+4' },
};

const CITIES = {
  'Los Angeles': 'America/Los_Angeles',
  'New York': 'America/New_York',
  Phoenix: 'America/Phoenix',
  Chicago: 'America/Chicago',
  Denver: 'America/Denver',
};

/**
 * Get timezone abbreviation using Intl API
 * @param {string} timeZone - IANA timezone identifier
 * @param {Date} date - Date to get abbreviation for
 * @returns {string} Timezone abbreviation
 */
function getTimezoneAbbreviation(timeZone, date) {
  const formatter = new Intl.DateTimeFormat('en', {
    timeZone,
    timeZoneName: 'short',
  });
  return formatter.formatToParts(date).find(part => part.type === 'timeZoneName')?.value || timeZone;
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
timezones-cli - Convert dates and timestamps to different timezones

USAGE:
  timezones-cli [date|timestamp]
  timezones-cli --help

ARGUMENTS:
  date|timestamp    Optional. Date string or Unix timestamp to convert.
                    If not provided, uses current date/time.

OPTIONS:
  --help, -h        Show this help message

EXAMPLES:
  timezones-cli                           # Use current date/time
  timezones-cli "2024-01-15 10:30"        # Convert specific date
  timezones-cli "2024-01-15T10:30:00Z"    # ISO format
  timezones-cli 1705320600000             # Unix timestamp (milliseconds)
  timezones-cli --help                    # Show this help

OUTPUT:
  Displays the input date/time converted to various timezones:
  - UTC, PST, PDT/MST, CST/MDT, CDT/EST, EDT
  - Shows matching major cities for each timezone
  - Marks your local timezone with (LOCAL) when it matches
  - Adds a separate LOCAL row if your timezone doesn't match any listed
`);
}

/**
 * Parse input date string or timestamp
 * @param {string} input - Date string or timestamp
 * @returns {Date} Parsed date object
 */
function parseInputDate(input) {
  if (!input) {
    // Allow overriding current time for testing
    if (process.env.TEST_CURRENT_TIME) {
      return new Date(process.env.TEST_CURRENT_TIME);
    }
    return new Date();
  }

  // Check if it's a timestamp (number)
  const timestamp = Number(input);
  if (!isNaN(timestamp)) {
    return new Date(timestamp);
  }

  // Try to parse as ISO string
  const parsedDate = parseISO(input);
  if (isValid(parsedDate)) {
    return parsedDate;
  }

  // Fallback to Date constructor
  const fallbackDate = new Date(input);
  if (isValid(fallbackDate)) {
    return fallbackDate;
  }

  throw new Error(`Invalid date format: ${input}`);
}

/**
 * Format date in specified timezone
 * @param {Date} date - Date to format
 * @param {string} timeZone - IANA timezone identifier
 * @returns {string} Formatted date string
 */
function formatDateInTimezone(date, timeZone) {
  return formatInTimeZone(date, timeZone, FORMAT);
}

/**
 * Generate city dates for comparison
 * @param {Date} date - Date to convert
 * @returns {Object} Object mapping city names to formatted dates
 */
function generateCityDates(date) {
  return Object.entries(CITIES).reduce((memo, [city, tz]) => {
    memo[city] = formatDateInTimezone(date, tz);
    return memo;
  }, {});
}

/**
 * Create a timezone entry object
 * @param {string} timezone - Timezone name/abbreviation
 * @param {string} offset - Timezone offset string
 * @param {Date} date - Date to format
 * @param {string} tz - IANA timezone identifier
 * @param {Object} cityDates - Pre-computed city dates
 * @param {string} localFormattedDate - Local timezone formatted date
 * @returns {Object} Timezone entry object
 */
function createTimezoneEntry(timezone, offset, date, tz, cityDates, localFormattedDate) {
  const formattedDate = formatDateInTimezone(date, tz);
  const matchingCities = Object.entries(cityDates)
    .filter(([, cityDate]) => cityDate === formattedDate)
    .map(([city]) => city);

  const isLocalMatch = localFormattedDate === formattedDate;

  return {
    timezone,
    offset,
    formattedDate,
    cities: matchingCities,
    isLocal: isLocalMatch,
  };
}

/**
 * Create local timezone entry when it doesn't match predefined timezones
 * @param {Date} date - Date to convert
 * @param {string} localTimeZone - Local timezone identifier
 * @param {string} localFormattedDate - Local timezone formatted date
 * @returns {Object} Local timezone entry object
 */
function createLocalTimezoneEntry(date, localTimeZone, localFormattedDate) {
  // Calculate timezone offset
  const offsetMs = getTimezoneOffset(localTimeZone, date);
  const offsetMinutes = offsetMs / (1000 * 60);
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
  const offsetMins = Math.abs(offsetMinutes) % 60;
  const offsetSign = offsetMinutes >= 0 ? '+' : '-';
  const offsetString = `(${offsetSign}${offsetHours}:${offsetMins.toString().padStart(2, '0')})`;

  // Get timezone abbreviation and city name
  const timezoneAbbr = getTimezoneAbbreviation(localTimeZone, date);
  const cityName = localTimeZone.substring(localTimeZone.lastIndexOf('/') + 1);

  return {
    timezone: timezoneAbbr,
    offset: offsetString,
    formattedDate: localFormattedDate,
    cities: [cityName],
    isLocal: true,
  };
}

/**
 * Build timezone entries array
 * @param {Date} date - Date to convert
 * @returns {Array} Array of timezone entry objects
 * 
 * @example
 * // Returns an array like:
 * [
 *   { timezone: 'UTC', offset: '', formattedDate: '2024-01-15 10:30 AM', cities: [], isLocal: false },
 *   { timezone: 'PST', offset: '(-8:00)', formattedDate: '2024-01-15 02:30 AM', cities: ['Los Angeles'], isLocal: false },
 *   { timezone: 'GMT+2', offset: '(+2:00)', formattedDate: '2024-01-15 12:30 PM', cities: ['Berlin'], isLocal: true }
 * ]
 */
function buildTimezoneEntries(date) {
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localFormattedDate = formatDateInTimezone(date, localTimeZone);
  const cityDates = generateCityDates(date);

  const entries = [];
  let localTimezoneMatched = false;

  // Build predefined timezone entries
  Object.entries(TIME_ZONES).forEach(([timezone, { offset, tz }]) => {
    const entry = createTimezoneEntry(timezone, offset, date, tz, cityDates, localFormattedDate);

    if (entry.isLocal) {
      localTimezoneMatched = true;
    }

    entries.push(entry);
  });

  // Add local timezone entry if it doesn't match any predefined timezone
  if (!localTimezoneMatched) {
    const localEntry = createLocalTimezoneEntry(date, localTimeZone, localFormattedDate);
    entries.push(localEntry);
  }

  // Sort entries by datetime (ascending order)
  entries.sort((a, b) => {
    // Parse the formatted dates to compare them
    const dateA = new Date(a.formattedDate);
    const dateB = new Date(b.formattedDate);
    return dateA.getTime() - dateB.getTime();
  });

  return entries;
}

/**
 * Print timezone entries to console
 * @param {Array} entries - Array of timezone entry objects
 */
function printTimezoneEntries(entries) {
  entries.forEach(({ timezone, offset, formattedDate, cities, isLocal }) => {
    // Ensure consistent column alignment by padding timezone to 8 characters
    const paddedTimezone = timezone.padEnd(8);

    // Pad offset to consistent width (8 characters) for proper alignment
    const paddedOffset = offset.padEnd(8);

    let message = `${paddedTimezone} ${paddedOffset} ${formattedDate}`;
    if (cities.length > 0) {
      message += ` ${cities.join(', ')}`;
    }
    if (isLocal) {
      message += ' (LOCAL)';
    }
    console.log(message);
  });
}

function main() {
  try {
    const [, , ...args] = process.argv;
    const firstArg = args[0];

    // Check for help flag
    if (firstArg === '--help' || firstArg === '-h') {
      showHelp();
      return;
    }

    const date = parseInputDate(firstArg);
    const entries = buildTimezoneEntries(date);
    printTimezoneEntries(entries);
  } catch (error) {
    console.error(`Error: ${error.message}\n`);
    showHelp();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
