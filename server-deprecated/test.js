// perc = 12.00
// const beforePercentage = 10.11

function test (beforePercentage, perc) {
    if (beforePercentage < 25 && perc >= 25 && perc < 50) {
        console.log(`${beforePercentage} ${perc} it is 25%`)
    } else if (beforePercentage < 50 && perc >= 50 && perc <= 75) {
        console.log(`${beforePercentage} ${perc} it is 50%`)
    } else if (beforePercentage < 75 && perc >= 75 && perc <= 75) {
        console.log(`${beforePercentage} ${perc} it is 75%`)
    } else if (beforePercentage < 100 && perc >= 100) {
        console.log(`${beforePercentage} ${perc} it is 100%`)
    }
}

// test (10.11, 12)
// test (10.12, 12)
test (10.11, 25.01)
test (25.01, 49)
test (25.01, 51)
test (51, 75)
test (75, 100)
// test (26.11, 50)
// test (54, 100)
// test (55, 100)