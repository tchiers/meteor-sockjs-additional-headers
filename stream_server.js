import {createServer} from '@tchiers/sockjs';

const originalStreamServer = Meteor.server.stream_server;
const originalSockJS = originalStreamServer.server
const serverOptions = {...originalSockJS.options};

//Allow additional header properties to pass through sockjs via $SOCKJS_ADDITIONAL_HEADERS
//which should be a comma and/or space separated list of http headers to pass through
const additional_headers = process.env.SOCKJS_ADDITIONAL_HEADERS;
if (additional_headers) {
    serverOptions.additional_headers = additional_headers.split(/\s*,\s*|\s+/);
}

//create a new SockJS server from the patched variant
const newSockJS = createServer(serverOptions);

// Configure the server as ddp does
// newSockJS.installHandlers() should effectively disable the old server
// Note that this code is copied nearly verbatim from ddp-server/stream_server and must be kept in sync should it change

// Install the sockjs handlers, but we want to keep around our own particular
// request handler that adjusts idle timeouts while we have an outstanding
// request.  This compensates for the fact that sockjs removes all listeners
// for "request" to add its own.
WebApp.httpServer.removeListener(
    'request', WebApp._timeoutAdjustmentRequestCallback);
newSockJS.installHandlers(WebApp.httpServer);
WebApp.httpServer.addListener(
    'request', WebApp._timeoutAdjustmentRequestCallback);

newSockJS.on('connection', function (socket) {
    // sockjs sometimes passes us null instead of a socket object
    // so we need to guard against that. see:
    // https://github.com/sockjs/sockjs-node/issues/121
    // https://github.com/meteor/meteor/issues/10468
    if (!socket) return;

    // We want to make sure that if a client connects to us and does the initial
    // Websocket handshake but never gets to the DDP handshake, that we
    // eventually kill the socket.  Once the DDP handshake happens, DDP
    // heartbeating will work. And before the Websocket handshake, the timeouts
    // we set at the server level in webapp_server.js will work. But
    // faye-websocket calls setTimeout(0) on any socket it takes over, so there
    // is an "in between" state where this doesn't happen.  We work around this
    // by explicitly setting the socket timeout to a relatively large time here,
    // and setting it back to zero when we set up the heartbeat in
    // livedata_server.js.
    socket.setWebsocketTimeout = function (timeout) {
        if ((socket.protocol === 'websocket' ||
            socket.protocol === 'websocket-raw')
            && socket._session.recv) {
            socket._session.recv.connection.setTimeout(timeout);
        }
    };
    socket.setWebsocketTimeout(45 * 1000);

    socket.send = function (data) {
        socket.write(data);
    };
    socket.on('close', function () {
        originalStreamServer.open_sockets = _.without(originalStreamServer.open_sockets, socket);
    });
    originalStreamServer.open_sockets.push(socket);

    // XXX COMPAT WITH 0.6.6. Send the old style welco/me message, which
    // will force old clients to reload. Remove this once we're not
    // concerned about people upgrading from a pre-0.7.0 release. Also,
    // remove the clause in the client that ignores the welcome message
    // (livedata_connection.js)
    socket.send(JSON.stringify({server_id: "0"}));

    // call all our callbacks when we get a new socket. they will do the
    // work of setting up handlers and such for specific messages.
    _.each(originalStreamServer.registration_callbacks, function (callback) {
        callback(socket);
    });
});


// Install the patched version
originalStreamServer.server = newSockJS;

