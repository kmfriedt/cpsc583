
// set up global reference or scatterplot
// d3 = require("d3")
//

var clickedCars = [];
// export clickedCars;
var _scatChart;

var _brandChart;

const margins = {top: 20, right: 80, bottom: 60, left: 80};

function setupModel(id, xax, yax, xtitle, ytitle, avg1, avg2){
    //Changed this to import the brands only
    d3.csv("evdata2.csv").then(function (d){

       _scatChart = new scatterChart(id, d, xax, yax, xtitle, ytitle, avg1, avg2);
       _scatChart.draw();
   });



}
function setupBrand(id, xax, yax, xtitle, ytitle, avg1, avg2){
    //Changed this to import the brands only
    d3.csv("brandAvg.csv").then(function (d){


        _brandChart = new scatterChart(id, d, xax, yax, xtitle, ytitle, avg1, avg2)
    });
}



function drawBackground(chart, left, top, width, height){
    chart.append("rect")
        .attr("x", left)
        .attr("y", top)
        .attr("width", width)
        .attr("height", height)
        .style("fill", "white");
}
// attempts at data manipulation CURRENTLY NOT USED
function dataMainpulation(data){

    // each row is a JSON object, each feature is stored in a key for that object
    // all objects are stored in a single array
    // each row is an object in the array

    console.log(data[0]) // this will get you the first object in the array
    console.log(Object.keys(data[0])); // get the names of all the columns.
    console.log(d3.groups(data, d =>d.brand));
    var brandGroups = d3.groups(data, d => d.brand);
    console.log(brandGroups);
    brandGroups = genBrandGroups(brandGroups);
    console.log(brandGroups);
    //filter the data
    console.log(data.filter(d => d.range >= 400));
}

function genBrandGroups(data){
    var array = []


    data = d3.groups(data, d => d.brand);

    for(var i = 0; i < data.length; i++){

        array.push( { "brand": data[i][0],
        "accel": d3.mean(data[i][1], d => d.accel), // gives you the mean acceleration
        "topspeed": d3.mean(data[i][1], d => d.topspeed),
        "range": d3.mean(data[i][1], d => d.range),
        "efficiency": d3.mean(data[i][1], d => d.efficiency),
        "price" : d3.mean(data[i][1], d => d.price),
        "pricek": d3.mean(data[i][1], d => d.pricek),
        "price_km": d3.mean(data[i][1], d => d.price_km),
        "price_range": d3.mean(data[i][1], d => d.price_range) })
    }
    return array
}


/**
 * Only used for the first mean line, not used for the transition
 */
function meanYLine(mean, chart, scale, left, right, width, yoffset, bottom ) {
    // Draw the mean line
    console.log("Mean y: " + mean.toString());

    chart.append("line")
        .attr("class", "yMean")
        .attr("x1", left)
        .attr("x2", width - right )
        .attr("y1", scale(mean - 40 )  )// TODO fix this line height
        .attr("y2", scale(mean - 40 )  )
        .attr("stroke", "red");

    chart.append("text")
        .attr("class", "yMeanText")
        .attr("x", left - 50) //TODO make left margin bigger
        .attr("y", scale(mean-40))
        .text("avg");
}
/**
 * Used for the first mean line not used to transition mean line
 */
function meanXLine(mean, chart, scale, left, top, bottom, height, hOffset){
    if(typeof mean !== 'undefined') {
        console.log("Mean x: " + mean.toString());
        chart.append("line")
            .attr("class", "xMean")
            .attr("x1", scale(mean) + left)
            .attr("x2", scale(mean) + left)
            .attr("y1", height - bottom)// TODO fix this line height
            .attr("y2", top)
            .attr("stroke", "red");

        chart.append("text")
            .attr("class", "xMeanText")
            .attr("x", scale(mean) + left - 10) //TODO make left margin bigger
            .attr("y", height - hOffset - 10)
            .text("avg");
    }

}

function searchClickedArrayM(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].carname === nameKey) {
            return i;
        }
    }
};

function searchClickedArrayB(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].brand === nameKey) {
            return i;
        }
    }
};



function genColorLabels(data){
    let colorLabels = [];
    for (let i = 0; i < data.length; i++){
        colorLabels.push(data[i].brand);
    }
    colorLabels = colorLabels.filter((v, i, a) => a.indexOf(v) === i);
    return colorLabels;
};

/**
 *
 * @param data the data you are currently working with
 * @param xax the name of the axis
 * @returns {number} this will be the maximum value in your data set.
 */
function setupAxis(data, xax){
    let max = Math.max.apply(Math, data.map(function(o){return o[xax]}));
    if(typeof max != "number"){
        max = data.length;
    }
    return max;
};

function scatterChart(id, dataOG, xax, yax, xtitle, ytitle, avg1, avg2 ) {
    let viewBox = document.getElementById(id).viewBox.baseVal;
    let totalWidth = viewBox.width;
    let totalHeight = viewBox.height;
    let innerWidth = totalWidth - margins.left - margins.right;
    let innerHeight = totalHeight - margins.top - margins.bottom;
    let xMeanOffset = 11;
    let yMeanOffset = 32;
    let yMeanOffset2 = 26;
    let curYOffset = yMeanOffset; // used when switching between views
    let curView = "car";
    let data = dataOG;
    let filteredModelData = [];
    var brandData = genBrandGroups(data);
    var colorLabels = genColorLabels(data);


    console.log(colorLabels)
    console.log(data);
    console.log(brandData);
    let blankCar = {
        accel: 10,
        body: "Sedan",
        brand: "Blank",
        car: "Blank",
        carname: "Blank",
        charge: 210,
        efficiency: 153,
        power: "FWD",
        price: 0,
        price_km: 0,
        pricek: 0,
        range: 0,
        seats: 0,
        time_charge: 0,
        topspeed: 0
    };

    //Constants for graphs
    var gasConst = {
        avgRange: 660,
        avgTrip: 160,
        avgAcceleration: 8.0,
        avgPrice: 33500,
        avgPriceK: 33.464
    };

    // color scale for dots
    // var dotColour = d3.scaleOrdinal() // TODO original color scale
    //     .domain(colorLabels)
    //     .range(d3.schemeCategory10) // schemeSet1 // schemeDark2
    // console.log(dotColour)

    // var dotColour = d3.scaleLinear().domain([1,103])
    //     .range(["green","red"]);

    var dotColour = d3.scaleLinear()
        .domain([25,15])
        .range(d3.schemeBuGn[3]) // schemeSet1 // schemeDark2
    console.log(dotColour)


    // Setup scales for axis
    // xax and yax are arguments to the function
    var maxX = setupAxis(data, xax);
    var maxY = setupAxis(data, yax);
    console.log("max x: " + maxX.toString());
    console.log("max y: " + maxY.toString());

    //Setup the x axis scale
    let xDomain = [0, maxX];
    let xRange = [0, innerWidth];
    let xScale = d3.scaleLinear()
        .domain(xDomain)
        .range(xRange)
        .nice();

    //Setup the y axis scale
    let yDomain = [0, maxY];
    let yRange = [innerHeight, 0];
    let yScale = d3.scaleLinear()
        .domain(yDomain)
        .range(yRange)
        .nice();
    console.log(yScale(160));
    // Setup values for lines
    var xAvg = gasConst[avg1];
    var yAvg = gasConst[avg2];

    //Initialize chart selection

    let chart = d3.select("#" + id); // chart is an svg container id need # for id's

    drawBackground(chart, margins.left, margins.top, innerWidth, innerHeight)


    this.filterData = function(body, power, seats){

        let newData = dataOG;
        if(curView !=="brand" ) {

            if (body === "none") {
                // use all the data
                console.log(newData);
            } else {
                // filter out cars with out this body style
                var temp1 = [];
                newData.forEach(function(d) {
                    if(d.body === body){
                        temp1.push(d);
                    }
                })
                newData = temp1;
                console.log(newData);
            }
            if (power === "none") {
                // use all the data
                console.log(newData);
            } else {
                // filter out cars with out this body style
                var temp2 = [];
                newData.forEach(function(d) {
                    console.log(d.power);
                    if(d.power === power){
                        temp2.push(d);
                    }
                })
               newData = temp2;
                console.log(newData);
            }
            if (seats === "none") {
                // use all the data
                console.log(newData);
            } else {
                // filter out cars with out this body style
                var temp3 = [];
                newData.forEach(function(d) {
                    console.log(d.seats);
                    if(d.seats === seats){
                        temp3.push(d);
                    }
                })
                newData = temp3;
                console.log(newData);
            }
        }
        if(newData.length === 0){
            newData = [blankCar];
        }
        data = newData;

        this.modelView();
    };




    this.draw = function(){


        // draw X axis
        var xAxis = d3.axisBottom()
            .scale(xScale);

        chart.append("g")
            .attr("transform", `translate(${margins.left},${innerHeight + margins.top})`) // back ticks not quotes
            .attr("class", "xAxis")
            .call(xAxis);

        chart.append("g")
            .attr("transform", `translate(${margins.left},${innerHeight + margins.top})`) // back ticks not quotes
            .attr("class", "xgrid")
            .call(d3.axisBottom(xScale)
                .tickFormat("")
                .tickSize(-innerHeight)

            );

        chart.append("text")
            .attr("text-anchor", "end")
            .attr("x", totalWidth / 3 + margins.left )
            .attr("y", innerHeight +  margins.top * 3.8 )
            .text(xtitle);


        // draw Y axis
        var yAxis = d3.axisLeft()
            .scale(yScale);

        chart.append("g")
            .attr("transform", `translate(${margins.left},${margins.top})`) // back ticks not quotes
            .attr("class", "yAxis")
            .call(yAxis);

        chart.append("g")
            .attr("transform", `translate(${margins.left},${margins.top})`) // back ticks not quotes
            .attr("class", "ygrid")

            .call(d3.axisLeft(yScale)
                .tickFormat("")
                .tickSize(-innerWidth)

            );

        chart.append("text")
            .attr("text-anchor", "end")
            .attr("x", -totalHeight/2 + margins.top*2)
            .attr("y", margins.left / 2 - 25)
            .attr("transform", "rotate(-90)")
            .text(ytitle);



        // Draw the mean lines
        meanYLine(yAvg, chart, yScale, margins.left, margins.right, totalWidth, yMeanOffset, margins.bottom);
        meanXLine(xAvg, chart, xScale, margins.left, margins.top, margins.bottom, totalHeight, xMeanOffset);

        let numItems = innerWidth / (data.length + 2);
        let radius = 4.7;

        console.log("Radius: " + radius.toString())
        let dotPadding = 40

        let dots = chart
            .append("g")
            .attr("class", "scatterPlot")
            .attr("transform", `translate(${margins.left},${margins.top})`)
            .selectAll('circle')
            .data(data);


        dots.enter().append("circle")
            .attr("cx", (d,i) => {
                console.log(typeof xScale(d[xax]))//TODO need to fix this
                if(typeof xScale(d[xax]) === "number"){
                    return xScale(d[xax]) - radius;
                }
                return numItems * i + 10;
            })
            .attr("cy", (d,i) => {
                // console.log(scale(d[yaxis]))
                // console.log(typeof scale(d[yaxis]))
                if(typeof yScale(d[yax]) === "number"){
                    return yScale(d[yax]) + radius;
                }
                return numItems * i + 20;
            })
            .attr("r", radius)
            .attr("fill", "#4fb30e")
            .attr("stroke", "black")
            .on("mouseover", function(event,d) {
                let newX =  parseFloat(d3.select(this).attr('cx')) + 25 ;
                let newY =  parseFloat(d3.select(this).attr('cy')) + 13;
                console.log(d.car)
                // console.log(d.value)
                tooltip
                    .attr('x', newX)
                    .attr('y', newY)
                    .text((d[curView]))
                    .transition().duration(200)
                    .style('opacity', 1);
            })
            .on("mouseout", function(){
                tooltip.transition().duration(500)
                    .style("opacity", 0);
            })
            .on("mousedown", function(event, d) {
                let currentFill = d3.select(this).attr("fill");

                if(currentFill !== "#8e1215"){
                    this.setAttribute("fill", "#8e1215");
                    // add this to the list
                    clickedCars.push(d);
                }
                else{
                    this.setAttribute("fill","#4fb308" )
                    // remove this from the list
                    let ind = searchClickedArrayM(d.carname, clickedCars);
                    clickedCars.splice(ind, 1);
                }
                console.log(clickedCars);
                console.log(curView);
                _radarChart1.updateRadarChart(clickedCars, curView);
            });

        var tooltip = chart.append("text")
            .attr("class", "tooltip")
            .style("opacity", 0);


        dots.exit().transition().duration(750)
            .attr("x", 0)
            .attr("y", 300)
            .attr("r", 0)
            .remove()


    };

    this.brandView = function (){
        // use brandData
        //SETUP SCALES AGAIN
        // get maxX and maxY
        console.log(brandData);
        curYOffset = yMeanOffset2;
        curView = "brand";
        clickedCars = [];
        _radarChart1.updateRadarChart(clickedCars, curView);
        maxX = setupAxis(brandData, xax);
        maxY = setupAxis(brandData, yax);


        // re-scale //TODO to get the new axis have you re-scale it
        xScale.domain([0, maxX]).nice();
        yScale.domain([0, maxY]).nice();

        // setup a new axis with the new scale
        var newXAxis = d3.axisBottom(xScale);

        chart.select(".xAxis")
            .transition()
            .duration(750)
            .call(newXAxis)

        // setup a new axis with the new scale
        var newYAxis = d3.axisLeft(yScale);
        chart.select(".yAxis")
            .transition()
            .duration(750)
            .call(newYAxis)


        // Draw the mean lines
        chart.select(".yMean")
            .transition()
            .duration(750)
            .attr("y1", yScale(yAvg - curYOffset))
            .attr("y2", yScale(yAvg - curYOffset))

        chart.select(".yMeanText")
            .attr("y", yScale(yAvg - curYOffset))


        chart.select(".xMean")
            .transition()
            .duration(750)
            .attr("x1", xScale(xAvg) + margins.left)
            .attr("x2", xScale(xAvg) + margins.left)

        chart.select(".xMeanText")
            .attr("x", xScale(xAvg) + margins.left + 10)


        // // drawDots(xax, yax, chart, yScale, xScale, brandData, dotColour, margins.left, margins.top, innerWidth);
        let dots = chart.select(".scatterPlot")
            .selectAll('circle')
            .data(brandData);

        dots.exit()
            .transition()
            .duration(1500)
            .attr("cx", margins.left)
            .attr("cy", innerWidth + margins.top)
            .remove()

        let radius = 13;


        dots.enter()
            .append("circle")
            .on("mouseover", function(event,d) {
                newX =  parseFloat(d3.select(this).attr('cx')) + 25 ;
                newY =  parseFloat(d3.select(this).attr('cy')) + 13;

                console.log(d)
                tooltip
                    .attr('x', newX)
                    .attr('y', newY)
                    .text((d[curView]))
                    .transition().duration(200)
                    .style('opacity', 1);
            })
            .on("mouseout", function(){
                tooltip.transition().duration(500)
                    .style("opacity", 0);
            })
            .on("mousedown", function(event, d) {
                let currentFill = d3.select(this).attr("fill");

                if(currentFill !== "#8e1215"){
                    this.setAttribute("fill", "#8e1215");
                    // add this to the list
                    clickedCars.push(d);
                }
                else{
                    this.setAttribute("fill","#4fb308" )
                    // remove this from the list
                    let ind = searchClickedArrayB(d.brand, clickedCars);
                    clickedCars.splice(ind, 1);
                }
                console.log(clickedCars);
                _radarChart1.updateRadarChart(clickedCars, curView);
            })
            .merge(dots)
            .transition()
            .duration(750)
            .attr("r", radius)
            .attr("cx", (d) => {
                return xScale(d[xax]);
            } )
            .attr("cy", (d) => {
                return yScale(d[yax]) + radius ;
            })
            .attr("fill", "#4fb30e")
            .attr("stroke", "black");

        var tooltip = chart.append("text")
            .attr("class", "tooltip")
            .style("opacity", 0);

        dots.transition()
            .duration(750)
            .attr("r", radius)
            .attr("cx", (d) => {
                return xScale(d[xax]);
            } )
            .attr("cy", (d,i) => {
                return yScale(d[yax]) - radius;
            })
            .attr("fill", "#4fb30e")
            .attr("stroke", "black");

        d3.selectAll(".ygrid").transition().duration(750)
            .call(d3.axisLeft(yScale)
            .tickFormat("")
            .tickSize(-innerWidth));

        d3.selectAll(".xgrid").transition().duration(750)
            .call(d3.axisBottom(xScale)
            .tickFormat("")
            .tickSize(-innerHeight));


    };

    this.modelView = function () {
        //SETUP SCALES AGAIN
        // get maxX and maxY
        curYOffset = yMeanOffset;
        curView = "carname";
        clickedCars = [];
        _radarChart1.updateRadarChart(clickedCars, curView);
        console.log(data)
        maxX = setupAxis(data, xax);
        maxY = setupAxis(data, yax);


        // re-scale //TODO to get the new axis have you re-scale it
        xScale.domain([0, maxX]).nice();
        yScale.domain([0, maxY]).nice();
        // setup a new axis with the new scale
        var newXAxis = d3.axisBottom(xScale);

        chart.select(".xAxis")
            .transition()
            .duration(750)
            .call(newXAxis)

        // setup a new axis with the new scale
        var newYAxis = d3.axisLeft(yScale);
        chart.select(".yAxis")
            .transition()
            .duration(750)
            .call(newYAxis)


        // Draw the mean lines
        chart.select(".yMean")
            .transition()
            .duration(750)
            .attr("y1", yScale(yAvg - curYOffset))
            .attr("y2", yScale(yAvg - curYOffset))

        chart.select(".yMeanText")
            .attr("y", yScale(yAvg - curYOffset))


        chart.select(".xMean")
            .transition()
            .duration(750)
            .attr("x1", xScale(xAvg) + margins.left)
            .attr("x2", xScale(xAvg) + margins.left)

        chart.select(".xMeanText")
            .attr("x", xScale(xAvg) + margins.left + 10)


        // // drawDots(xax, yax, chart, yScale, xScale, brandData, dotColour, margins.left, margins.top, innerWidth);
        let dots = chart.select(".scatterPlot")
            .selectAll('circle')
            .data(data);

        dots.exit()
            .remove()
            .attr("cx", margins.left)
            .attr("cy", innerWidth + margins.top)
            .transition()
            .duration(750)

        let radius = 4.7;
        dots.enter()
            .append('circle')
            .on("mouseover", function(event,d) {
                newX =  parseFloat(d3.select(this).attr('cx')) + 25 ;
                newY =  parseFloat(d3.select(this).attr('cy')) + 13;
                // console.log(d.value)
                tooltip
                    .attr('x', newX)
                    .attr('y', newY)
                    .text((d[curView]))
                    .transition().duration(200)
                    .style('opacity', 1);
            })
            .on("mouseout", function(){
                tooltip.transition().duration(500)
                    .style("opacity", 0);
            })
            .on("mousedown", function(event, d) {
                let currentFill = d3.select(this).attr("fill");

                if(currentFill !== "#8e1215"){
                    this.setAttribute("fill", "#8e1215");
                    // add this to the list
                    clickedCars.push(d);
                }
                else{
                    this.setAttribute("fill","#4fb308" )
                    // remove this from the list
                    let ind = searchClickedArrayM(d.carname, clickedCars);
                    clickedCars.splice(ind, 1);
                }
                console.log(clickedCars);
                _radarChart1.updateRadarChart(clickedCars, curView);
            })
            .merge(dots)
            .transition()
            .duration(750)
            .attr("r", radius)
            .attr("cx", (d) => {
                return xScale(d[xax]);
            } )
            .attr("cy", (d) => {
                return yScale(d[yax]) + radius ;
            })
            .attr("fill", "#4fb30e")
            .attr("stroke", "black");


        var tooltip = chart.append("text")
            .attr("class", "tooltip")
            .style("opacity", 0);

        d3.selectAll(".ygrid").transition().duration(750)
            .call(d3.axisLeft(yScale)
                .tickFormat("")
                .tickSize(-innerWidth));

        d3.selectAll(".xgrid").transition().duration(750)
            .call(d3.axisBottom(xScale)
                .tickFormat("")
                .tickSize(-innerHeight));

    };

    this.updateYMean = function(newY) {
        yAvg = newY;
        chart.select(".yMean")
            .transition()
            .duration(750)
            .attr("y1", yScale(yAvg - curYOffset))
            .attr("y2", yScale(yAvg - curYOffset))

        chart.select(".yMeanText")
            .attr("y", yScale(yAvg - curYOffset))

    };


    this.updateXMean = function(newX) {
        xAvg = newX;
        chart.select(".xMean")
            .transition()
            .duration(750)
            .attr("x1", xScale(xAvg) + margins.left)
            .attr("x2", xScale(xAvg) + margins.left)

        chart.select(".xMeanText")
            .attr("x", xScale(xAvg) + margins.left + 10)

    };



}


function switchDots(){
    text = document.getElementById("switchDots").innerHTML;

    if(text === "Switch to Brand View"){
        _scatChart.brandView();
        document.getElementById("switchDots").innerHTML = "Switch to Model View";
    }
    else{
        _scatChart.modelView();
        document.getElementById("switchDots").innerHTML = "Switch to Brand View";
    }
}

function makeToggled(id, xax, yax, xtitle, ytitle, avg1, avg2) {
    on = !on;


    let selection = d3.select("#toggled").selectAll("#bar");

    // if on show the model data
    if (on) {

        setupModel(id, xax, yax, xtitle, ytitle, avg1, avg2);

    }
    // if off then show the brand data
    else {
        setupBrand(id, xax, yax, xtitle, ytitle, avg1, avg2);
    }

}
var on = true;

// x average
function changePrice(){
    let input = document.getElementById("changePrice");
    var amount ='';
    if(input) {
        console.log(input.value)
        amount = input.value;
    }

    _scatChart.updateXMean(parseFloat(amount));
}
//y average
function changeRange(){
    let input = document.getElementById("changeRange");
    var amount='';
    if(input) {

        amount = input.value;
    }

    _scatChart.updateYMean(parseFloat(amount));
}

function filterData(){
    let body = document.getElementById("filterBody");
    let power = document.getElementById("filterPower");
    let seats = document.getElementById("filterSeats");

    if(body) {

        body = body.options[body.selectedIndex].value;
        console.log(body);
    }
    if(power) {

        power = power.options[power.selectedIndex].value;
        console.log(power);
    }
    if(seats) {

        seats = seats.options[seats.selectedIndex].value;
        console.log(seats);
    }

    _scatChart.filterData(body, power, seats);
};

