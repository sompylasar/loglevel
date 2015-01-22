"use strict";

if (typeof window === "undefined") {
    window = {};
}

var logMethods = [
    "trace",
    "debug",
    "info",
    "warn",
    "error"
];

define(function () {
    var self = {};

    // Jasmine matcher to check the log level of a log object
    self.toBeAtLevel = function toBeAtLevel(level) {
        var log = this.actual;
        var expectedWorkingCalls = log.levels.SILENT - log.levels[level.toUpperCase()];
        var realLogMethod = window.console.log;

        for (var ii = 0; ii < logMethods.length; ii++) {
            var methodName = logMethods[ii];
            log[methodName](methodName);
        }

        expect(realLogMethod.calls.length).toEqual(expectedWorkingCalls);
        return true;
    };

    self.describeIf = function describeIf(condition, name, test) {
        if (condition) {
            jasmine.getEnv().describe(name, test);
        }
    };

    self.itIf = function itIf(condition, name, test) {
        if (condition) {
            jasmine.getEnv().it(name, test);
        }
    };

    // Forcibly reloads loglevel, and asynchronously hands the resulting log back to the given callback
    // via Jasmine async magic
    self.withFreshLog = function withFreshLog(toRun) {
        require.undef("lib/loglevel");

        var freshLog;

        waitsFor(function() {
            require(['lib/loglevel'], function(log) {
                freshLog = log;
            });
            return typeof freshLog !== "undefined";
        });

        runs(function() {
            toRun(freshLog);
        });
    };

    // Wraps Jasmine's it(name, test) call to reload the loglevel dependency for the given test
    self.itWithFreshLog = function itWithFreshLog(name, test) {
        jasmine.getEnv().it(name, function() {
            self.withFreshLog(test);
        });
    };

    return self;
});
