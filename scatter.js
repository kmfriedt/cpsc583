
// set up global reference or scatterplot
// d3 = require("d3")
var _scatChart;

var _brandChart;

const margins = {top: 20, right: 400, bottom: 60, left: 80};

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
// attempts at data manipulation
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

function drawYAxis(text, chart, scale, left, top, width, height){



    chart.append("g")
        .attr("transform", `translate(${left},${top})`) // back ticks not quotes
        .transition().duration(2000)
        .call(d3.axisLeft(scale));

    chart.append("g")
        .attr("transform", `translate(${left},${top})`) // back ticks not quotes
        .attr("class", "grid")
        .call(d3.axisLeft(scale)
            .tickFormat("")
            .tickSize(-width)

        );

    chart.append("text")
        .attr("text-anchor", "end")
        .attr("x", -height/2 + top*2)
        .attr("y", left - 40 )
        .attr("transform", "rotate(-90)")
        .text(text);



}

function drawXAxis(text, chart, scale, left, bottom, height, width){


    chart.append("g")
        .attr("transform", `translate(${left},${bottom})`) // back ticks not quotes
        .call(d3.axisBottom(scale));

    chart.append("g")
        .attr("transform", `translate(${left},${bottom})`) // back ticks not quotes
        .attr("class", "grid")
        .call(d3.axisBottom(scale)
            .tickFormat("")
            .tickSize(-height)

        );

    chart.append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2 + left)
        .attr("y", bottom + 45 )
        .text(text);

}

// function meanLineV(mean, chart, scale, left, right, width, vertOffset)
function meanYLine(mean, chart, scale, left, right, width, yoffset, bottom ) {
    // Draw the mean line
    console.log("Mean y: " + mean.toString());

    chart.append("line")
        .attr("class", "yMean")
        .attr("x1", left)
        .attr("x2", width - right )
        .attr("y1", scale(mean-yoffset) )// TODO fix this line height
        .attr("y2", scale(mean-yoffset) )
        .attr("stroke", "red");

    chart.append("text")
        .attr("class", "yMeanText")
        .attr("x", left - 50) //TODO make left margin bigger
        .attr("y", scale(mean - yoffset ))
        .text("avg");
}

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

function drawDots(xaxis, yaxis, chart, scale, scaleB, data, color, left, top, width){
    let numItems = width / (data.length + 2);
    let radius = width / data.length / 2
    console.log("Radius: " + radius.toString())
    let dotPadding = 10

    let dots = chart
        .append("g")
        .attr("class", "scatterPlot")
        .attr("transform", `translate(${left},${top})`)
        .selectAll('circle')
        .data(data);


    dots.enter().append("circle")
        .attr("cx", (d,i) => {
            console.log(typeof scaleB(d[xaxis]))//TODO need to fix this
            if(typeof scaleB(d[xaxis]) === "number"){
                return scaleB(d[xaxis]) - radius;
            }
            return numItems * i + 10;
        })
        .attr("cy", (d,i) => {
            // console.log(scale(d[yaxis]))
            // console.log(typeof scale(d[yaxis]))
            if(typeof scale(d[yaxis]) === "number"){
                return scale(d[yaxis]) - radius;
            }
            return numItems * i + 20;
        })
        .attr("r", radius)
        .style("fill", (d) => {return color(d.brand)});

    dots.exit().transition().duration(750)
        .attr("x", 0)
        .attr("y", 300)
        .attr("r", 0)
        .remove()
}


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

function scatterChart(id, data, xax, yax, xtitle, ytitle, avg1, avg2 ) {
    let viewBox = document.getElementById(id).viewBox.baseVal;
    let totalWidth = viewBox.width;
    let totalHeight = viewBox.height;
    let innerWidth = totalWidth - margins.left - margins.right;
    let innerHeight = totalHeight - margins.top - margins.bottom;
    let xMeanOffset = 11;
    let yMeanOffset = 40;
    let yMeanOffset2 = 20;
    let yMeanMultiple = 0.80;

    var brandData = genBrandGroups(data);
    var colorLabels = genColorLabels(data);
    var filteredModelData; // For when we want to filter the data, keep original full data available
    // filterData(); // TODO finish this function
    console.log(colorLabels)
    console.log(data);
    console.log(brandData);


    //Constants for graphs
    var gasConst = {
        avgRange: 660,
        avgTrip: 160,
        avgAcceleration: 8.0,
        avgPrice: 33500,
        avgPriceK: 33.464
    };

    // color scale for dots
    var dotColour = d3.scaleOrdinal()
        .domain(colorLabels)
        .range(d3.schemeTableau10) // schemeSet1 // schemeDark2
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
    xScale = d3.scaleLinear()
        .domain(xDomain)
        .range(xRange)
        .nice();

    //Setup the y axis scale
    let yDomain = [0, maxY];
    let yRange = [innerHeight, 0];
    yScale = d3.scaleLinear()
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
    //Draw the background

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
            .attr("class", "grid")
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
            .attr("class", "grid")
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

        drawDots(xax, yax, chart, yScale, xScale, data, dotColour, margins.left, margins.top, innerWidth);

    };

    this.brandView = function (){
        // use brandData
        //SETUP SCALES AGAIN
        // get maxX and maxY
        maxX = setupAxis(brandData, xax);
        maxY = setupAxis(brandData, yax);
        console.log("max x: " + maxX.toString());
        console.log("max y: " + maxY.toString());

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


        console.log(yScale(160))

        // Draw the mean lines
        chart.select(".yMean")
            .transition()
            .duration(750)
            .attr("y1", yScale(yAvg - yMeanOffset2))
            .attr("y2", yScale(yAvg - yMeanOffset2))

        chart.select(".yMeanText")
            .attr("y", yScale(yAvg - yMeanOffset))


        chart.select(".xMean")
            .transition()
            .duration(750)
            .attr("x1", xScale(xAvg) + margins.left)
            .attr("x2", xScale(xAvg) + margins.left)

        chart.select(".xMeanText")
            .attr("x", xScale(xAvg) + margins.left + 10)


        // // drawDots(xax, yax, chart, yScale, xScale, brandData, dotColour, margins.left, margins.top, innerWidth);
        dots = chart.select(".scatterPlot")
            .selectAll('circle')
            .data(brandData);

        dots.exit()
            .transition()
            .duration(1500)
            .attr("cx", margins.left)
            .attr("cy", innerWidth + margins.top)
            .remove()

        let radius = innerWidth /  brandData.length / 2

        dots.transition()
            .duration(750)
            .attr("r", radius)
            .attr("cx", (d) => {
                return xScale(d[xax]);
            } )
            .attr("cy", (d,i) => {
                return yScale(d[yax]) - radius;
            })
            .style("fill", (d) => {
                return dotColour(d.brand);
            })


    };

    this.modelView = function () {
        //SETUP SCALES AGAIN
        // get maxX and maxY
        console.log(data)
        maxX = setupAxis(data, xax);
        maxY = setupAxis(data, yax);
        console.log("max x: " + maxX.toString());
        console.log("max y: " + maxY.toString());

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
            .attr("y1", yScale(yAvg - yMeanOffset))
            .attr("y2", yScale(yAvg - yMeanOffset))

        chart.select(".yMeanText")
            .attr("y", yScale(yAvg - yMeanOffset))


        chart.select(".xMean")
            .transition()
            .duration(750)
            .attr("x1", xScale(xAvg) + margins.left)
            .attr("x2", xScale(xAvg) + margins.left)

        chart.select(".xMeanText")
            .attr("x", xScale(xAvg) + margins.left + 10)


        // // drawDots(xax, yax, chart, yScale, xScale, brandData, dotColour, margins.left, margins.top, innerWidth);
        dots = chart.select(".scatterPlot")
            .selectAll('circle')
            .data(data);

        dots.exit()
            .remove()
        // .transition()
        // .duration(750)

        let radius = innerWidth /  data.length / 2
        dots.enter()
            .append('circle')
            .merge(dots)
            .transition()
            .duration(750)
            .attr("r", radius)
            .attr("cx", (d) => {
                return xScale(d[xax]);
            } )
            .attr("cy", (d) => {
                return yScale(d[yax]) - radius;
            })
            .style("fill", (d) => {
                return dotColour(d.brand);
            })

    };

    this.updateYMean = function(newY) {
        yAvg = newY;
        chart.select(".yMean")
            .transition()
            .duration(750)
            .attr("y1", yScale(yAvg - yMeanOffset))
            .attr("y2", yScale(yAvg - yMeanOffset))

        chart.select(".yMeanText")
            .attr("y", yScale(yAvg - yMeanOffset))

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