function orderDates(covidData) {
    const dates = Object.keys(covidData.value ? covidData.value : covidData);
    return dates.sort();
}

const getFirstDate = function(covidData) {
    const dates = orderDates(covidData);
    return dates[0];
}

const getLastDate = function(covidData) {
    const dates = orderDates(covidData);
    return dates[dates.length - 1];
}

export {
    getFirstDate,
    getLastDate,
}
