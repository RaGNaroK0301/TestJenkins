function FindProxyForURL(url, host) {
  if (dnsDomainIs(host, ".google.com")||dnsDomainIs(host, ".whatismyipaddress.com")) {
    return "PROXY hkg9-pzen.paypalcorp.com:80";
  } else {
    return "DIRECT";
  }
}
