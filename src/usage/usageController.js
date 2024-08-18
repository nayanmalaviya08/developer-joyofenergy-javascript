const { usageHistory } = require("../usage/usage");
const readUsage = (getReadings, req) => {
    const meter = req.params.smartMeterId
    const readings =  getReadings(meter)
    return usageHistory(readings,readings[readings.length - 1].time,readings[0].time);
};

module.exports = { readUsage };
