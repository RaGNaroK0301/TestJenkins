function FindProxyForURL(url, host) {
  if (dnsDomainIs(host, ".google.com")||dnsDomainIs(host, ".whatismyipaddress.com")) {
    return "PROXY 127.0.0.1:1090";
  } else {
    return "DIRECT";
  }
}