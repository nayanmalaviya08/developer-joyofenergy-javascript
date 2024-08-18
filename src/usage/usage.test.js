const { meters, meterPricePlanMap } = require("../meters/meters");
const { pricePlanNames, pricePlans } = require("../price-plans/price-plans");
const { readings } = require("../readings/readings");
const {
    average,
    timeElapsedInHours,
    usage,
    usageCost,
    usageForAllPricePlans,
    usageHistory
} = require("./usage");

//Configuramos nuestro randomizador
const readingsRandom = [];
const numReadings = 3 // cantidad de lecturas
const startTime = Math.floor(new Date()/ 1000) - (3 * 24 * 60 * 60)
let endTime = 0

//Randomizamos las lecturas para el METER0
for (let i = 0; i < numReadings; i++) {
    const randomTime = startTime + (86400*i);
    if(i == numReadings -1) endTime = randomTime
    const randomReading = (Math.random() * (1.0 - 0.25) + 0.25).toFixed(5);
    readingsRandom.push({ time: randomTime, reading: parseFloat(randomReading) });
}

//Cargamos lecturas que utilizaremos del randomizer
const { getReadings } = readings({
    [meters.METER0]: readingsRandom,
    [meters.METER1]: readingsRandom,
    [meters.METER2]: readingsRandom
});

//Cargamos respuestas que esperariamos  para hacer la comparacion de los funciones de dominio usage
const averageRandomMeter0 = getReadings(meters.METER0).map(r => r.reading).reduce((sum,reading) => sum+reading,0).toFixed(5);
const timeElapsedMeter0 = timeElapsedInHours(
    getReadings(meters.METER0)
);
const averageRandomMeter2 = getReadings(meters.METER2).map(r => r.reading).reduce((sum,reading) => sum+reading,0).toFixed(5);
const timeElapsedMeter2 = timeElapsedInHours(
    getReadings(meters.METER2)
);

describe("usage", () => {

    it("should average all readings for a meter", () => {
        const averageMeter0 = average(getReadings(meters.METER0));

        expect(averageMeter0).toBe(averageRandomMeter0/numReadings);
    });

    it("should get time elapsed in hours for all readings for a meter", () => {
        expect(timeElapsedMeter0).toBe((numReadings - 1) * 24);
    });

    it("should get usage for all readings for a meter", () => {
        const usageMeter0 = usage(getReadings(meters.METER0));
        
        expect(usageMeter0).toBe((averageRandomMeter0/numReadings) / timeElapsedMeter0);
    });

    it("should get usage cost for all readings for a meter", () => {
        const rate = meterPricePlanMap[meters.METER2].rate;
        const { getReadings } = readings({
            [meters.METER2]: readingsRandom,
        });

        const usageCostForMeter = usageCost(getReadings(meters.METER2), rate);

        expect(usageCostForMeter).toBe(((averageRandomMeter0/numReadings) / timeElapsedMeter0) * rate);
    });

    it("should get usage cost for all readings for all price plans", () => {
        const expected = [
            {
                [pricePlanNames.PRICEPLAN0]: (averageRandomMeter2/numReadings) / timeElapsedMeter2 * 10,
            },
            {
                [pricePlanNames.PRICEPLAN1]: (averageRandomMeter2/numReadings) / timeElapsedMeter2 * 2,
            },
            {
                [pricePlanNames.PRICEPLAN2]: (averageRandomMeter2/numReadings) / timeElapsedMeter2 * 1,
            },
        ];

        const usageForAllPricePlansArray = usageForAllPricePlans(
            pricePlans,
            getReadings(meters.METER2)
        );

        expect(usageForAllPricePlansArray).toEqual(expected);
    });
});

describe('Historical Usage', () => {
    
    it('should return correct usage data for a given date range', () => {
        const result = usageHistory(getReadings(meters.METER0), startTime, endTime);
        
        expect(result).toEqual({
            totalConsumption: parseFloat(averageRandomMeter0),
            averageConsumptionPerHour: ((averageRandomMeter0 / numReadings) / timeElapsedMeter0),
            readings: getReadings(meters.METER0)
        });
    });

    it('should return an empty array if no readings are within the date range', () => {
        const result = usageHistory(getReadings(meters.METER0), 1607686125, 1607512024);
        
        expect(result).toEqual({
            totalConsumption: 0,
            averageConsumptionPerHour: 0,
            readings: []
        });
    });
});
