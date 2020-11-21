
// set up global reference or scatterplot
// d3 = require("d3")
var _scatChart;

function setupModel(id, xax, yax, xtitle, ytitle, avg1, avg2){
    //Changed this to import the brands only
    d3.csv("evdata2.csv").then(function (d){
       drawScatter(id, d, xax, yax, xtitle, ytitle, avg1, avg2)
    });
}
function setupBrand(id, xax, yax, xtitle, ytitle, avg1, avg2){
    //Changed this to import the brands only
    d3.csv("brandAvg.csv").then(function (d){
        drawScatter(id, d, xax, yax, xtitle, ytitle, avg1, avg2)
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
function meanYLine(mean, chart, scale, cts) {
    // Draw the mean line
    console.log("Mean y: " + mean.toString());
    chart.append("line")
        .attr("class", "mean-line")
        .attr("x1", cts.margin.left)
        .attr("x2", cts.totalWidth - cts.margin.right)
        .attr("y1", scale(mean - cts.yMeanOffset))// TODO fix this line height
        .attr("y2", scale(mean - cts.yMeanOffset))
        .attr("stroke", "red");

    chart.append("text")
        .attr("x", cts.margin.left - 50) //TODO make left margin bigger
        .attr("y", scale(mean - cts.yMeanOffset ))
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

function domainMax(d, name){
    return Math.max.apply(Math, d.map(function(o){return o.name})); //TODO this didn't work
    // var maxRange = domainMax(data,"range"); called this way
}


function drawScatter(id, data, xax, yax, xtitle, ytitle, avg1, avg2 ) {
    let viewBox = document.getElementById(id).viewBox.baseVal;
    let totalWidth = viewBox.width;
    let totalHeight = viewBox.height;
    let margins = {top: 20, right: 30, bottom: 60, left: 60};
    let innerWidth = totalWidth - margins.left - margins.right;
    let innerHeight = totalHeight - margins.top - margins.bottom;

    //Setup color scale

    console.log(data)

    // var brandData = d3.rollups(data, v => {return {
    //         accel: d3.mean(v, function(d) { return d.accel; }),
    //         topspeed: d3.mean(v, function(d) { return d.topspeed; }),
    //         range: d3.mean(v, function(d) { return d.range; }),
    //         efficiency: d3.mean(v, function(d) { return d.efficiency; }),
    //         charge: d3.mean(v, function(d) { return d.charge; }),
    //         price: d3.mean(v, function(d) { return d.price; }),
    //         pricek: d3.mean(v, function(d) { return d.pricek; }),
    //         price_km: d3.mean(v, function(d) { return d.price_km; }),
    //         price_range: d3.mean(v, function(d) { return d.price_range; })
    //
    //     }; })
    //     .entries(data);
    // console.log(brandData)
    // var colorLabels = d3.map(data, function(d){return (d.brand)}).keys()
    var colorLabels = []
    for (var i = 0; i < data.length; i++){
        colorLabels.push(data[i].brand);
    }
    var unique = colorLabels.filter((v, i, a) => a.indexOf(v) === i);
    console.log(unique)

    var dotColour = d3.scaleOrdinal()
        .domain(unique)
        .range(d3.schemeTableau10)
    // schemeDark2
    // schemeSet1


    var chartConst = {
        totalWidth: totalWidth,
        totalHeight: totalHeight,
        innerWidth: innerWidth,
        margin: margins,
        color: dotColour,
        xMeanOffset: 11,
        yMeanOffset: 0.3
    };

    //Constants for graphs
    var gasConst = {
        avgRange: 660,
        avgTrip: 160,
        avgAcceleration: 8.0,
        avgPrice: 33464,
        avgPriceK: 33.464
    }
    var xAvg = gasConst[avg1];
    console.log(xAvg);
    var yAvg = gasConst[avg2];
    console.log(yAvg);
    //Initialize chart selection


    let chart = d3.select("#" + id); // chart is an svg container id need # for id's


    //Draw the background
    drawBackground(chart, margins.left, margins.top, innerWidth, innerHeight)


    var maxX = Math.max.apply(Math, data.map(function(o){return o[xax]}));
    var maxY = Math.max.apply(Math, data.map(function(o){return o[yax]}));


    //Make sure they are both numbers
    if(typeof maxX != "number"){
        maxX = data.length;
    }
    if(typeof maxY != "number"){
        maxY = data.length;
    }
    //Setup the x axis scale
    let xDomain = [0, maxX];
    let xRange = [0, innerWidth];
    let xScale = d3.scaleLinear(xDomain, xRange).nice();

    //Setup the y axis scale
    let yDomain = [0, maxY];
    let yRange = [innerHeight, 0];
    let yScale = d3.scaleLinear(yDomain, yRange).nice();


    drawYAxis(ytitle, chart, yScale, margins.left, margins.top, innerWidth, totalHeight);
    drawXAxis(xtitle, chart, xScale, margins.left, innerHeight + margins.top,
        innerHeight, totalWidth);
    // Draw the mean line
    // meanLineV(gasConst.avgTrip, chart, yScale, margins.left, margins.right, totalWidth, accelOffset);

    meanYLine(yAvg, chart, yScale, chartConst);



    if(typeof xAvg !== 'undefined'){
        meanXLine(xAvg, chart, xScale, margins.left, margins.top,
            margins.bottom, totalHeight, chartConst.xMeanOffset);
    }



    // drawDots(xax, yax, chart, yScale, xScale, data, dotColour, margins.left, margins.top, innerWidth);

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