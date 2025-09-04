const { execSync } = require('child_process');

/**
 * Execute CLI command and return result
 * @param {string} args - Command line arguments
 * @param {Object} options - Execution options
 * @returns {Object} Result with stdout, stderr, and exitCode
 */
function runCli(args = '', options = {}) {
  try {
    const stdout = execSync(`node cli.js ${args}`, {
      encoding: 'utf8',
      ...options,
    });
    return { stdout: stdout.trim(), stderr: '', exitCode: 0 };
  } catch (error) {
    return {
      stdout: (error.stdout || '').trim(),
      stderr: (error.stderr || '').trim(),
      exitCode: error.status || 1,
    };
  }
}

describe('Timezones CLI', () => {
  describe('Help functionality', () => {
    test('should show help with --help flag', () => {
      const result = runCli('--help');
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('USAGE:');
      expect(result.stdout).toContain('timezones-cli');
    });

    test('should show help with -h flag', () => {
      const result = runCli('-h');
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('USAGE:');
      expect(result.stdout).toContain('timezones-cli');
    });
  });

  describe('Date conversion functionality', () => {
    test('should convert specific date correctly in Europe/Berlin timezone', () => {
      const result = runCli('"2024-01-15 10:30"', { 
        env: { ...process.env, TZ: 'Europe/Berlin' } 
      });
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(`
PST      (-8:00)  2024-01-15 01:30 AM Los Angeles
PDT/MST  (-7:00)  2024-01-15 02:30 AM Phoenix, Denver
CST/MDT  (-6:00)  2024-01-15 03:30 AM Chicago
CDT/EST  (-5:00)  2024-01-15 04:30 AM New York
EDT      (-4:00)  2024-01-15 05:30 AM
UTC               2024-01-15 09:30 AM
GMT+1    (+1:00)  2024-01-15 10:30 AM Berlin (LOCAL)`.trim());
    });

    test('should convert Unix timestamp correctly in Europe/Berlin timezone', () => {
      // January 15, 2024, 10:30:00 Europe/Berlin = 1705309800000
      const result = runCli('1705309800000', { 
        env: { ...process.env, TZ: 'Europe/Berlin' } 
      });
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(`
PST      (-8:00)  2024-01-15 01:30 AM Los Angeles
PDT/MST  (-7:00)  2024-01-15 02:30 AM Phoenix, Denver
CST/MDT  (-6:00)  2024-01-15 03:30 AM Chicago
CDT/EST  (-5:00)  2024-01-15 04:30 AM New York
EDT      (-4:00)  2024-01-15 05:30 AM
UTC               2024-01-15 09:30 AM
GMT+1    (+1:00)  2024-01-15 10:30 AM Berlin (LOCAL)`.trim());
    });

    test('should show local timezone marker when matching predefined timezone', () => {
      const result = runCli('"2024-01-15 10:30"', { 
        env: { ...process.env, TZ: 'America/New_York' } 
      });
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(`
PST      (-8:00)  2024-01-15 07:30 AM Los Angeles
PDT/MST  (-7:00)  2024-01-15 08:30 AM Phoenix, Denver
CST/MDT  (-6:00)  2024-01-15 09:30 AM Chicago
CDT/EST  (-5:00)  2024-01-15 10:30 AM New York (LOCAL)
EDT      (-4:00)  2024-01-15 11:30 AM
UTC               2024-01-15 03:30 PM`.trim());
    });

    test('should add separate row for non-matching local timezone', () => {
      const result = runCli('"2024-01-15 10:30"', { 
        env: { ...process.env, TZ: 'Asia/Tokyo' } 
      });
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(`
PST      (-8:00)  2024-01-15 05:30 AM Los Angeles
PDT/MST  (-7:00)  2024-01-15 06:30 AM Phoenix, Denver
CST/MDT  (-6:00)  2024-01-15 07:30 AM Chicago
CDT/EST  (-5:00)  2024-01-15 08:30 AM New York
EDT      (-4:00)  2024-01-15 09:30 AM
UTC               2024-01-15 01:30 PM
GMT+9    (+9:00)  2024-01-15 10:30 PM Tokyo (LOCAL)`.trim());
    });

    test('should handle summer time (DST) correctly', () => {
      const result = runCli('"2024-07-15 10:30"', { 
        env: { ...process.env, TZ: 'America/Los_Angeles' } 
      });
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(`
PST      (-8:00)  2024-07-15 09:30 AM
PDT/MST  (-7:00)  2024-07-15 10:30 AM Los Angeles, Phoenix (LOCAL)
CST/MDT  (-6:00)  2024-07-15 11:30 AM Denver
CDT/EST  (-5:00)  2024-07-15 12:30 PM Chicago
EDT      (-4:00)  2024-07-15 01:30 PM New York
UTC               2024-07-15 05:30 PM`.trim());
    });
  });

  describe('Current time functionality', () => {
    test('should use current time when no arguments provided', () => {
      const result = runCli('', { 
        env: { 
          ...process.env, 
          TZ: 'Europe/Berlin',
          TEST_CURRENT_TIME: '2024-01-15T10:30:00.000Z'
        } 
      });
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(`
PST      (-8:00)  2024-01-15 02:30 AM Los Angeles
PDT/MST  (-7:00)  2024-01-15 03:30 AM Phoenix, Denver
CST/MDT  (-6:00)  2024-01-15 04:30 AM Chicago
CDT/EST  (-5:00)  2024-01-15 05:30 AM New York
EDT      (-4:00)  2024-01-15 06:30 AM
UTC               2024-01-15 10:30 AM
GMT+1    (+1:00)  2024-01-15 11:30 AM Berlin (LOCAL)`.trim());
    });

    test('should use current time with different timezone', () => {
      const result = runCli('', { 
        env: { 
          ...process.env, 
          TZ: 'America/New_York',
          TEST_CURRENT_TIME: '2024-01-15T15:30:00.000Z'
        } 
      });
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(`
PST      (-8:00)  2024-01-15 07:30 AM Los Angeles
PDT/MST  (-7:00)  2024-01-15 08:30 AM Phoenix, Denver
CST/MDT  (-6:00)  2024-01-15 09:30 AM Chicago
CDT/EST  (-5:00)  2024-01-15 10:30 AM New York (LOCAL)
EDT      (-4:00)  2024-01-15 11:30 AM
UTC               2024-01-15 03:30 PM`.trim());
    });
  });

  describe('Error handling', () => {
    test('should show error message and help for invalid date', () => {
      const result = runCli('"invalid-date"');
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toBe('Error: Invalid date format: invalid-date');
      expect(result.stdout).toContain('USAGE:');
      expect(result.stdout).toContain('timezones-cli');
    });
  });
});
