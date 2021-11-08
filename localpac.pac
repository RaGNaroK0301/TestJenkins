function FindProxyForURL(url, host) {
	if (isInNet(host, "121.41.0.0", "255.255.0.0" ) ||
	isInNet(host, "66.220.0.0", "255.255.0.0" ) ||
	isInNet(host, "172.217.0.0", "255.255.0.0" ) 
	) {
    return "SOCKS5 127.0.0.1:1090";
  } else {
    return "DIRECT";
  }
}