
// set up global reference or scatterplot
// d3 = require("d3")
var _scatChart;

var _brandChart;

const margins = {top: 20, right: 30, bottom: 60, left: 60};

function setupModel(id, xax, yax, xtitle, ytitle, avg1, avg2){
    //Changed this to import the brands only
    d3.csv("evdata2.csv").then(function (d){

       _scatChart = new scatterChart(id, d, xax, yax, xtitle, ytitle, avg1, avg2)
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
    var brand;

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
function meanYLine(mean, chart, scale, left, right, width, yoffset ) {
    // Draw the mean line
    console.log("Mean y: " + mean.toString());
    chart.append("line")
        .attr("class", "mean-line")
        .attr("x1", left)
        .attr("x2", width - right)
        .attr("y1", scale(mean - yoffset))// TODO fix this line height
        .attr("y2", scale(mean - yoffset))
        .attr("stroke", "red");

    chart.append("text")
        .attr("x", left - 50) //TODO make left margin bigger
        .attr("y", scale(mean - yoffset ))
        .text("avg");
}

function meanXLine(mean, chart, scale, left, top, bottom, height, hOffset){
    // Draw the mean line
    console.log("Mean x: " + mean.toString());
    chart.append("line")
        .attr("class", "mean-lineh")
        .attr("x1", scale(mean) + left)
        .attr("x2", scale(mean) + left)
        .attr("y1", height - bottom)// TODO fix this line height
        .attr("y2", top)
        .attr("stroke", "red");

    chart.append("text")
        .attr("x", scale(mean) + left - 10 ) //TODO make left margin bigger
        .attr("y", height - hOffset - 10)
        .text("avg");

}

function drawDots(xaxis, yaxis, chart, scale, scaleB, data, color, left, top, width){
    let numItems = width / (data.length + 2);
    let radius = width / data.length / 2
    console.log("Radius: " + radius.toString())
    let dotPadding = 10

    let dots = chart
        .append("g")
        .attr("transform", `translate(${left},${top})`)
        .selectAll(".dots").data(data);

    dots.enter().append("circle")
        .attr("class", "dots")
        .merge(dots)
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
    let yMeanOffset = 0.3;

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
        avgPrice: 33464,
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

    //Setup the x axis scale
    let xDomain = [0, maxX];
    let xRange = [0, innerWidth];
    let xScale = d3.scaleLinear(xDomain, xRange).nice();

    //Setup the y axis scale
    let yDomain = [0, maxY];
    let yRange = [innerHeight, 0];
    let yScale = d3.scaleLinear(yDomain, yRange).nice();

    // Setup values for lines
    var xAvg = gasConst[avg1];
    var yAvg = gasConst[avg2];





    //Initialize chart selection

    let chart = d3.select("#" + id); // chart is an svg container id need # for id's


    //Draw the background
    drawBackground(chart, margins.left, margins.top, innerWidth, innerHeight)

    drawYAxis(ytitle, chart, yScale, margins.left, margins.top, innerWidth, totalHeight);
    drawXAxis(xtitle, chart, xScale, margins.left, innerHeight + margins.top,
        innerHeight, totalWidth);
    // Draw the mean line
    // meanLineV(gasConst.avgTrip, chart, yScale, margins.left, margins.right, totalWidth, accelOffset);

    meanYLine(yAvg, chart, yScale, margins.left, margins.right, innerWidth, yMeanOffset);



    if(typeof xAvg !== 'undefined'){
        meanXLine(xAvg, chart, xScale, margins.left, margins.top,
            margins.bottom, totalHeight, xMeanOffset);
    }



    drawDots(xax, yax, chart, yScale, xScale, data, dotColour, margins.left, margins.top, innerWidth);

    let numItems = innerWidth / (data.length + 2);
    let radius = innerWidth / data.length / 2
    console.log("Radius: " + radius.toString())
    let dotPadding = 10

    let dots = chart
        .append("g")
        .attr("transform", `translate(${margins.left},${margins.top})`)
        .selectAll(".dots").data(data);

    dots.enter().append("circle")
        .attr("class", "dots")
        .merge(dots)
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
                return yScale(d[yax]) - radius;
            }
            return numItems * i + 20;
        })
        .attr("r", radius)
        .style("fill", (d) => {return dotColour(d.brand)});

    dots.exit().transition().duration(750)
        .attr("x", 0)
        .attr("y", 300)
        .attr("r", 0)
        .remove()


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

function linplot(){
    let amount = document.getElementById("inlin").value;

}