<div align=center>
  <h1>Timestamps CLI</h1>
  <h6>Command line tool to convert a date or timestamp into different timezones.<h6>
</div>

## Installation

```shell
npm install timezones-cli --global
```

You need to have installed Node 6+.

## Usage

convert current datetime
```
$ timezones
UTC             2017-09-14 03:13 PM
PST     (-8:00) 2017-09-14 07:13 AM
PDT/MST (-7:00) 2017-09-14 08:13 AM Los Angeles, Phoenix
CST/MDT (-6:00) 2017-09-14 09:13 AM Denver
EST/CDT (-5:00) 2017-09-14 10:13 AM Chicago
EDT     (-4:00) 2017-09-14 11:13 AM New York
```

convert date in ISO-8601 format
```
$ timezones 2016-12-14T04:40:44.248Z
UTC             2016-12-14 04:40 AM
PST     (-8:00) 2016-12-13 08:40 PM Los Angeles
PDT/MST (-7:00) 2016-12-13 09:40 PM Phoenix, Denver
CST/MDT (-6:00) 2016-12-13 10:40 PM Chicago
EST/CDT (-5:00) 2016-12-13 11:40 PM New York
EDT     (-4:00) 2016-12-14 12:40 AM
```

# convert epoch timestamp
```
$ timezones 1505880000000
UTC             2017-09-20 04:00 AM
PST     (-8:00) 2017-09-19 08:00 PM
PDT/MST (-7:00) 2017-09-19 09:00 PM Los Angeles, Phoenix
CST/MDT (-6:00) 2017-09-19 10:00 PM Denver
EST/CDT (-5:00) 2017-09-19 11:00 PM Chicago
EDT     (-4:00) 2017-09-20 12:00 AM New York
```
