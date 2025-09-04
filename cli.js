#!/usr/bin/env node

const { formatInTimeZone } = require('date-fns-tz');
const { parseISO, isValid } = require('date-fns');

const FORMAT = 'yyyy-MM-dd hh:mm a';

const TIME_ZONES = {
  'UTC    ': { offset: '       ', tz: 'UTC' },
  'PST    ': { offset: '(-8:00)', tz: 'Etc/GMT+8' },
  'PDT/MST': { offset: '(-7:00)', tz: 'Etc/GMT+7' },
  'CST/MDT': { offset: '(-6:00)', tz: 'Etc/GMT+6' },
  'CDT/EST': { offset: '(-5:00)', tz: 'Etc/GMT+5' },
  'EDT    ': { offset: '(-4:00)', tz: 'Etc/GMT+4' },
};

const CITIES = {
  'Los Angeles': 'America/Los_Angeles',
  'New York': 'America/New_York',
  Phoenix: 'America/Phoenix',
  Chicago: 'America/Chicago',
  Denver: 'America/Denver',
};

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
`);
}

/**
 * Parse input date string or timestamp
 * @param {string} input - Date string or timestamp
 * @returns {Date} Parsed date object
 */
function parseInputDate(input) {
  if (!input) {
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

    // Generate city dates for comparison
    const cityDates = Object.entries(CITIES).reduce((memo, [city, tz]) => {
      memo[city] = formatDateInTimezone(date, tz);
      return memo;
    }, {});

    // Display timezone information
    Object.entries(TIME_ZONES).forEach(([timezone, { offset, tz }]) => {
      const formattedDate = formatDateInTimezone(date, tz);
      const matchingCities = Object.entries(cityDates)
        .filter(([, cityDate]) => cityDate === formattedDate)
        .map(([city]) => city);

      let message = `${timezone} ${offset} ${formattedDate}`;
      if (matchingCities.length > 0) {
        message += ` ${matchingCities.join(', ')}`;
      }

      console.log(message);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error('Usage: timezones-cli [date|timestamp]');
    console.error('Examples:');
    console.error('  timezones-cli');
    console.error('  timezones-cli "2024-01-15 10:30"');
    console.error('  timezones-cli 1705320600000');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
