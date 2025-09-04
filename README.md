<div align=center>
  <h1>Timezones CLI</h1>
  <h6>Command line tool to convert a date or timestamp into different timezones.<h6>
</div>

## Usage

See: [timezones-cli: How to Stay Sane Working With US Timezones](https://medium.com/@alexishevia/timezones-cli-how-to-stay-sane-working-with-us-timezones-72829ac409a9)

convert current datetime

```
$ npx timezones-cli
UTC             2017-09-14 03:13 PM
PST     (-8:00) 2017-09-14 07:13 AM
PDT/MST (-7:00) 2017-09-14 08:13 AM Los Angeles, Phoenix
CST/MDT (-6:00) 2017-09-14 09:13 AM Denver
EST/CDT (-5:00) 2017-09-14 10:13 AM Chicago
EDT     (-4:00) 2017-09-14 11:13 AM New York
```

convert date in ISO-8601 format

```
$ npx timezones-cli 2016-12-14T04:40:44.248Z
UTC             2016-12-14 04:40 AM
PST     (-8:00) 2016-12-13 08:40 PM Los Angeles
PDT/MST (-7:00) 2016-12-13 09:40 PM Phoenix, Denver
CST/MDT (-6:00) 2016-12-13 10:40 PM Chicago
EST/CDT (-5:00) 2016-12-13 11:40 PM New York
EDT     (-4:00) 2016-12-14 12:40 AM
```

convert epoch timestamp

```
$ npx timezones-cli 1505880000000
UTC             2017-09-20 04:00 AM
PST     (-8:00) 2017-09-19 08:00 PM
PDT/MST (-7:00) 2017-09-19 09:00 PM Los Angeles, Phoenix
CST/MDT (-6:00) 2017-09-19 10:00 PM Denver
EST/CDT (-5:00) 2017-09-19 11:00 PM Chicago
EDT     (-4:00) 2017-09-20 12:00 AM New York
```

## Installation

```shell
npm install timezones-cli --global
```

## Development

### Running Tests

```shell
npm test
```

### Code Quality

```shell
npm run lint        # Check for linting issues
npm run lint:fix    # Auto-fix linting issues
npm run format      # Format code with Prettier
```

### Publishing to npm

To update the package on [npmjs.com](https://www.npmjs.com/package/timezones-cli):

1. **Update the version** in `package.json` (this also creates a git tag automatically):
   ```shell
   npm version patch   # for bug fixes (1.1.0 → 1.1.1)
   npm version minor   # for new features (1.1.0 → 1.2.0)
   npm version major   # for breaking changes (1.1.0 → 2.0.0)
   ```

2. **Publish to npm**:
   ```shell
   npm publish
   ```

3. **Push changes and tags to git**:
   ```shell
   git push origin master --tags
   ```

4. **Create GitHub Release** (optional but recommended):
   - Go to [GitHub Releases](https://github.com/alexishevia/timezones-cli/releases)
   - Click "Create a new release"
   - Select the tag created by `npm version`
   - Add release title (e.g., "v1.2.0")
   - Add release notes describing changes, new features, bug fixes
   - Click "Publish release"

**Note**: 
- `npm version` automatically creates a git commit and tag
- Make sure you're logged in to npm (`npm login`) and have publish permissions for the `timezones-cli` package
- GitHub releases provide better documentation and changelog for users
