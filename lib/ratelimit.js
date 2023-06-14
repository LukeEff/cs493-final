let IpTable = {};

function initIpTable() {
  setInterval(function () {
    IpTable = {};
  }, 10000);
}

function rateLimit(req, res, next) {
  const ip = req.ip;
  const reqCount = IpTable[ip] || 0;

  if (reqCount < 10) {
    IpTable[ip] = reqCount + 1;
    next();
  } else {
    res.status(429).send('Too Many Requests');
  }
}

initIpTable();

module.exports = rateLimit;