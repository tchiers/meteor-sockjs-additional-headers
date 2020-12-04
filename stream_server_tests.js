Tinytest.add("sockjs-additional-headers - test for sucessful sockjs modifiation", test => {
 test.isTrue(
     _.isEqual(Meteor.server.stream_server.server.options.additional_headers, ['foo', 'bar', 'baz', 'grob']),
     "SOCKJS did not pass through expected headers");
})