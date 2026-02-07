import path from 'node:path';
import { hooks } from './tests/support/hooks';

// Configure ts-node for WebdriverIO
process.env.TS_NODE_PROJECT = './tsconfig.json';
process.env.TS_NODE_TRANSPILE_ONLY = 'true';

const dirname = __dirname;

export const config: WebdriverIO.Config = {
  //
  // ====================
  // Runner Configuration
  // ====================
  //
  // WebdriverIO allows it to run your tests in arbitrary locations (e.g. locally or
  // on a remote machine).
  runner: 'local',
  //
  // ==================
  // Specify Test Files
  // ==================
  // Define which test specs should run. The pattern is relative to the directory
  // from which `wdio` was called. Notice that, if you are calling `wdio` from an
  // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
  // directory is where your package.json resides, so `wdio` will be called from there.
  //
  specs: ['./tests/features/**/*.feature'],
  // Patterns to exclude.
  exclude: [],
  //
  // ============
  // Capabilities
  // ============
  // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
  // time. Depending on the number of capabilities, WebdriverIO launches several test
  // sessions. Within your capabilities you can overwrite the spec and exclude options in
  // order to group specific specs to a specific capability.
  //
  // First, you can define how many instances should be started at the same time. Let's
  // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
  // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
  // files and you set maxInstances to 10, all spec files will get tested at the same time
  // and 30 processes will get spawned. The property handles how many capabilities
  // from the same test should run tests.
  //
  maxInstances: 1,
  //
  // If you have trouble getting all important capabilities together, check out the
  // Sauce Labs platform configurator - a great tool to configure your capabilities:
  // https://docs.saucelabs.com/basics/platform-configurator/
  //
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [
          '--headless',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-logging',
          '--disable-notifications',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-component-extensions-with-background-pages',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--disable-renderer-backgrounding',
          '--disable-sync',
          '--metrics-recording-only',
          '--mute-audio',
          '--no-first-run',
          '--safebrowsing-disable-auto-update',
          '--enable-automation',
          '--password-store=basic',
          '--use-mock-keychain',
          '--log-level=3', // Only show fatal errors
        ],
        excludeSwitches: ['enable-logging'], // Disable Chrome logging
      },
      // If outputDir is provided WebdriverIO can capture driver session logs
      // it is possible to configure which logTypes to include/exclude.
      // excludeDriverLogs: ['*'], // pass '*' to exclude all driver session logs
      // excludeDriverLogs: ['bugreport', 'server'],
    },
  ],
  //
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  //
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevel: 'info',
  outputDir: path.join(dirname, '/logs'),
  //
  // Set specific log levels per logger
  // loggers:
  // - webdriver, webdriverio
  // - @wdio/applitools-service, @wdio/browserstack-service,
  // @wdio/devtools-service, @wdio/sauce-service
  // - @wdio/mocha-framework, @wdio/jasmine-framework
  // - @wdio/local-runner, @wdio/lambda-runner
  // - @wdio/sumologic-reporter
  // - @wdio/cli, @wdio/config, @wdio/sync, @wdio/utils
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  // logLevels: {
  //   webdriver: 'info',
  //   '@wdio/applitools-service': 'info'
  // },
  //
  // If you only want to run your tests until a specific amount of tests have failed use
  // bail (default is 0 - don't bail, run all tests).
  bail: 0,
  //
  // Set a base URL in order to shorten url command calls. If your `url` parameter starts
  // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
  // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
  // gets prepended directly.
  baseUrl: 'http://localhost:3000',
  //
  // Default timeout for all waitFor* commands.
  waitforTimeout: 10000,
  //
  // Default timeout in milliseconds for request
  // if browser driver or grid doesn't send response
  connectionRetryTimeout: 120000,
  //
  // Default request retries count
  connectionRetryCount: 3,
  //
  // Test runner services
  // Services take over a specific job you don't want to take care of. They enhance
  // your test setup with almost no effort. Unlike plugins, they don't add new
  // commands. Instead, they hook themselves up into the test process.
  // services: [],
  //
  // Framework you want to run your specs with.
  // The following are supported: Mocha, Jasmine, and Cucumber
  // see also: https://webdriver.io/docs/frameworks.html
  //
  // Make sure you have the wdio adapter package for the specific framework installed
  // before running any tests.
  framework: 'cucumber',
  //
  // The number of times to retry the entire specfile when it fails as a whole
  // specFileRetries: 1,
  //
  // Whether or not retried specfiles should be retried immediately or deferred
  // to the end of the queue specFileRetriesDeferred: false,
  //
  // Test reporter for stdout.
  // The only one supported by default is 'dot'
  // see also: https://webdriver.io/docs/dot-reporter.html
  reporters: [
    [
      'spec',
      {
        realtimeReporting: true,
        showPreface: true,
        addConsoleLogs: true,
        onlyFailures: false,
        color: true,
      },
    ],
    [
      'json',
      {
        outputDir: './test-results/json',
        outputFileFormat: () => {
          return `test-results-${Date.now()}.json`;
        },
      },
    ],
  ],
  //
  // If you are using Cucumber you need to specify the location of your step definitions.
  cucumberOpts: {
    // show full backtrace for errors
    backtrace: false,
    // module used for processing required features
    requireModule: ['ts-node/register'],
    // invoke formatters without executing steps
    // dryRun: false,
    // abort the run on first failure
    failFast: false,
    // Enable this config to treat undefined definitions as
    // warnings
    ignoreUndefinedDefinitions: false,
    // ("extension:module") require files with the given
    // EXTENSION after requiring MODULE (repeatable)
    names: [],
    // hide step definition snippets for pending steps
    snippets: true,
    // hide source uris
    source: true,
    // (name) specify the profile to use
    profile: [],
    // (file/dir) require files before executing features
    require: ['./tests/step-definitions/**/*.ts'],
    scenarioLevelReporter: false,
    order: 'defined',
    // specify a custom snippet syntax
    snippetSyntax: undefined,
    // fail if there are any undefined or pending steps
    strict: false,
    // (expression) only execute the features or scenarios with
    // tags matching the expression, see
    // https://docs.cucumber.io/tag-expressions/
    tagExpression: 'not @Pending',
    // add cucumber tags to feature or scenario name
    tagsInTitle: false,
    // timeout for step definitions
    timeout: 60000,
  } as WebdriverIO.CucumberOpts,
  ...hooks,
};
