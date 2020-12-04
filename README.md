# sockjs-additional-headers
***
## Installation
`meteor add tchiers:sockjs-additional-headers`

## Use
SockJS restricts HTTP headers passed though to the server connecting to the socket to avoid some security pitfalls.
See https://github.com/sockjs/sockjs-node#authorisation
The list of approved headers is fixed in the source of SockJS, but some apps have a need to see additional headers. 

This package will allow you to specify additional headers to pass in the environment variable `SOCKJS_ADDITIONAL_HEADERS`  
whcih can be a comma- and/or space- separated list of header names. 

Be sure you understand the security implications of anything you pass through.

## Example
```shell
export SOCKJS_ADDITIONAL_HEADERS=foo,bar,baz
```