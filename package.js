Package.describe({
    name: "tchiers:sockjs-additional-headers",
    summary: "Patch sockjs to pass additional headers listed in $SOCKJS_ADDITIONAL_HEADERS environment var to DDP connections",
    version: '1.0.0',
    git: 'https://github.com/tchiers/meteor-sockjs-additional-headers.git'
});

Npm.depends({
    "@tchiers/sockjs": "0.3.20",
});

Package.onUse(function (api) {
    api.versionsFrom("1.8");
    api.use('ddp-server', 'server'); // must load after DDP has init'ed
    api.use('ecmascript', 'server');
    api.use('webapp', 'server');
    api.use('underscore', 'server');

    api.addFiles('stream_server.js', 'server');
});

Package.onTest(function (api) {
    api.versionsFrom("1.8");
    api.use('ddp-server', 'server'); // must load after DDP has init'ed
    api.use('ecmascript', 'server');
    api.use('webapp', 'server');
    api.use('underscore', 'server');
    api.use('tinytest', 'server');

    process.env.SOCKJS_ADDITIONAL_HEADERS="foo, bar,baz grob";
    api.addFiles('stream_server.js', 'server');
    api.addFiles('stream_server_tests.js', 'server');
});
