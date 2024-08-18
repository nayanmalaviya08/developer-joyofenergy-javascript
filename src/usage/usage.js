const average = (readings) => {
    return (
        readings.reduce((prev, next) => prev + next.reading, 0) /
        readings.length
    );
};

const timeElapsedInHours = (readings) => {
    readings.sort((a, b) => a.time - b.time);
    const seconds = readings[readings.length - 1].time - readings[0].time;
    const hours = Math.floor(seconds / 3600);
    return hours;
};

const usage = (readings) => {
    return average(readings) / timeElapsedInHours(readings);
};

const usageCost = (readings, rate) => {
    return usage(readings) * rate;
};

const usageForAllPricePlans = (pricePlans, readings) => {
    return Object.entries(pricePlans).map(([key, value]) => {
        return {
            [key]: usageCost(readings, value.rate),
        };
    });
};
const usageHistory = (readings, startDate, endDate) => {
    const filteredReadings = readings.filter(reading => reading.time >= startDate && reading.time <= endDate);
    if (filteredReadings.length === 0) {
        return {
            totalConsumption: 0,
            averageConsumptionPerHour: 0,
            readings: []
        };
    }

    const totalConsumption = filteredReadings.reduce((sum, reading) => sum + reading.reading, 0);
    const averageConsumptionPerHour = usage(filteredReadings);

    return {
        totalConsumption,
        averageConsumptionPerHour,
        readings: filteredReadings
    };
}

module.exports = {
    average,
    timeElapsedInHours,
    usage,
    usageCost,
    usageForAllPricePlans,
    usageHistory
};
