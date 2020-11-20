// reference
//taken from
// http://bl.ocks.org/nbremer/21746a9668ffdf6d8242
// and updated to work with v6

function setupRadar(id){

    //Changed this to import the brands only
    d3.csv("brandAvg.csv").then(function (d){
        makeRadar(id, d)
    });

}

function genBrandArray(names, data) {
    var cars = []
    for (var i = 0; i < names.length; i++) {
        cars.push(data.get(names[i]))
    }
    console.log(cars)
    return cars
}

function genAxisJson(cars, cols) {

    var result = [];
    for (var i = 0; i < cars.length; i ++) {
        var second = []
        for(var j= 0; j< cols.length; j++){
            var feed = {axis: cols[j], value: cars[i][cols[j]]}
            second.push(feed)
        }
        result.push(second)
    }
    return result
}

function genModelRange(cars, cols) { //TODO make generic

    var result = [];
    var second = [];
    for (var i = 0; i < cars.length; i ++) {
        var feed = {axis: cols[i], value: cars[i].range}
        second.push(feed);
    }
    result.push(second);
    return result
}
function genModelRange2(cars, cols) { //TODO maybe use this for 3rd version

    var result = [];
    for (var i = 0; i < cars.length; i ++) {
        var second = []
        for(var j= 0; j< cols.length; j++){
            var feed = {axis: cols[j], value: cars[i].range}
            second.push(feed)
        }
        second.push({axis: "origin", value: 0})
        result.push(second)
    }
    return result
}
function genModelAccel2(cars, cols) { //TODO maybe use this for 3rd version

    var result = [];
    for (var i = 0; i < cars.length; i ++) {
        var second = []
        for(var j= 0; j< cols.length; j++){
            var feed = {axis: cols[j], value: cars[i].accel}
            second.push(feed)
        }
        second.push({axis: "origin", value: 0})
        result.push(second)
    }
    return result
}

function genModelAccel(cars, cols) {

    var result = [];
    var second = [];
    for (var i = 0; i < cars.length; i ++) {
        var feed = {axis: cols[i], value: cars[i].accel}
        second.push(feed);
    }
    result.push(second);
    return result
}

// This gets rid of columns that we don't want to use as axis
function removeColumns(arr){
    // removes brand accel efficiency charge price price_range
    var col1 = arr.slice(2,5),
        col2 = arr.slice(7,9),
        arr = col1.concat(col2);

    return arr;

}



function colorBlobDots() {
    // The blobs are drawn one at a time. Get all the points to be that blobs color
    // Increment the color after that blobs points are drawn, 8 points each
    countblobs += 1;
    if (countblobs <= 8){
        return imgOpts.color(0);
    }
    else if( countblobs <= 16){
        return imgOpts.color(1);
    }
    else{
        return imgOpts.color(2);
    }
    //TODO 3 colours and 7 axis
}

function genBrandList(d,names){
    var result = []
    for (var i = 0; i < d.length; i++){
        for(var j = 0; j < names.length; j++){
            if(names[j] === d[i].brand){
                result.push(d[i])
            }
        }
    }
    return result
}
function genCompareJson(d, names){
    var result = []


}


function makeRadar(id, data) {

    // Setup the data
    var features = data.columns;
    console.log(data);
    var carNames = ["Tesla", "Audi", "Volkswagen", "Smart"]; //TODO get the brands from the interactions

    // get the rows of data for the brand names in carNames
    var cars = genBrandList(data, carNames)
    // console.log(cars);


    // console.log(features);
    features = removeColumns(features);
    // console.log(features);
    var carsJ = genAxisJson(cars,features);
    console.log(carsJ);


    //Chart options
    var color = d3.scaleOrdinal(d3.schemeCategory10)
    // .range(["#EDC951","#CC333F","#00A0B0"])

    let viewBox = document.getElementById(id).viewBox.baseVal;
    let totalWidth = viewBox.width;
    let totalHeight = viewBox.height;
    let margins = {top: 70, right: 40, bottom: 70, left: 40};
    let innerWidth = totalWidth - margins.left - margins.right;
    let innerHeight = totalHeight - margins.top - margins.bottom;
    // set up image options to easily pass info to functions
    var imgOpts = {
        w: innerWidth,
        h: innerHeight,
        margin: margins, //TODO may have to get rid of margins and put it's data here
        maxValue: 550,
        levels: 5,
        roundStrokes: true,
        color: color,
        labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
        opacityArea: 0.35, 	//The opacity of the area of the blob
        dotRadius: 4, 			//The size of the colored circles of each blog
        opacityCircles: 0.1, 	//The opacity of the circles of each blob
        strokeWidth: 2, 		//The width of the stroke around each blob
    };

    var gasConst = {
        avgTopSpeed: 190,
        avgRange: 660,
        avgTrip: 160,
        avgAcceleration: 8.0,
        avgPrice: 33464,
        avgPriceK: 33.464
    }

    // setup axis and radius
    var allAxis = features,
        totalAxes = allAxis.length,
        radius = Math.min(imgOpts.w/2, imgOpts.h/2), 	//Radius of the outermost circle
        Format = d3.format('.2f'),			 	//Percentage formatting
        angleSlice = Math.PI * 2 / totalAxes;		//The width in radians of each "slice"

    console.log(allAxis)
    console.log("Total Axes: " + totalAxes.toString())
    console.log("Radius: "+ radius.toString())

    //Scale for the radius
    // imgOpts.maxValue = d3.max(carsJ, function(i){return d3.max(i.map(function(o){return o.value;}))});


    var rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, imgOpts.maxValue]);
    // .domain(d3.extent(cars))  // This did not work as wee need the axis value



    // Visualization rendering*************************************************************************************


    //Remove whatever chart with the same id/class was present before
    d3.select("#"+id).select("svg").remove(); //TODO This might have to be changed might not need "svg"

    let chart = d3.select("#" + id); // chart is an svg container id need # for id's

    chart.append("svg")
        .attr("width",  imgOpts.w + imgOpts.margin.left + imgOpts.margin.right)
        .attr("height", imgOpts.h + imgOpts.margin.top + imgOpts.margin.bottom)
        .attr("class", "radar"+id);

    var g = chart.append("g")
        .attr("transform", "translate(" + (imgOpts.w/2 + imgOpts.margin.left) + "," +
            (imgOpts.h/2 + imgOpts.margin.top) + ")");

    // Glow filter //TODO read about this glow filter

    var filter = g.append('defs').append('filter').attr('id','glow'),
        feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
        feMerge = filter.append('feMerge'),
        feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
        feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');


    //Grid rendering*************************************************************************************
    //Wrapper for the grid & axes
    var axisGrid = g.append("g").attr("class", "axisWrapper");

    //Draw the background circles
    axisGrid.selectAll(".levels")
        .data(d3.range(1,(imgOpts.levels+1)).reverse())
        .enter()
        .append("circle")
        .attr("class", "gridCircle")
        .attr("r", (d, i) => {return radius/imgOpts.levels*d;})
        .style("fill", "#CDCDCD")
        .style("stroke", "#CDCDCD")
        .style("fill-opacity", imgOpts.opacityCircles)
        .style("filter" , "url(#glow)");

    //Text indicating at what value each level is
    axisGrid.selectAll(".axisLabel")
        .data(d3.range(1,(imgOpts.levels+1)).reverse())
        .enter().append("text")
        .attr("class", "axisLabel")
        .attr("x", 4)
        .attr("y", (d) => {return -d*radius/imgOpts.levels;})
        .attr("dy", "0.4em")
        .style("font-size", "10px")
        .attr("fill", "#737373")
        .text((d,i) => { return Format(imgOpts.maxValue * d/imgOpts.levels); });//TODO no decimal places


    //Axes rendering
    //Create the straight lines radiating outward from the center
    var axis = axisGrid.selectAll(".axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");
    //Append the lines
    axis.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => {
            return rScale(imgOpts.maxValue*1.05) * Math.cos(angleSlice*i - Math.PI/2);
        })
        .attr("y2", (d, i) => {
            return rScale(imgOpts.maxValue*1.05) * Math.sin(angleSlice*i - Math.PI/2);
        })
        .attr("class", "line")
        .style("stroke", "white")
        .style("stroke-width", "2px");

    //Append the labels at each axis
    axis.append("text")
        .attr("class", "legend")
        .style("font-size", "11px")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", (d, i) => {
            return rScale(imgOpts.maxValue * imgOpts.labelFactor) * Math.cos(angleSlice*i - Math.PI/2);
        })
        .attr("y", (d, i) => {
            return rScale(imgOpts.maxValue * imgOpts.labelFactor) * Math.sin(angleSlice*i - Math.PI/2);
        })
        .text((d) => {return d})
        .call(wrap, imgOpts.wrapWidth);

    //Blobs rendering*************************************************************************************
    //The radial line function
    var radarLine = d3.lineRadial()

        .radius((d) => {return rScale(d.value);})
        .angle((d,i) => { return i*angleSlice; })
        .curve(d3.curveCardinalClosed)
    // .curve(d3.curveLinearClosed)

    //Create a wrapper for the blobs
    var blobWrapper = g.selectAll(".radarWrapper")
        .data(carsJ)
        .enter().append("g")
        .attr("class", "radarWrapper");

    //Append the backgrounds
    blobWrapper
        .append("path")
        .attr("class", "radarArea")
        .attr("d", (d,i) => { return radarLine(d); })
        .style("fill", (d,i) => { return imgOpts.color(i); })
        .style("fill-opacity", imgOpts.opacityArea)
        .on('mouseover', function (d,i) {
            //Dim all blobs
            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", 0.1);
            //Bring back the hovered over blob
            d3.select(this)
                .transition().duration(200)
                .style("fill-opacity", 0.7);
        })
        .on('mouseout', function(){
            //Bring back all blobs
            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", imgOpts.opacityArea);
        });

    //Create the outlines
    blobWrapper.append("path")

        .attr("class", "radarStroke")
        .attr("d", (d,i) => { return radarLine(d); })
        .style("stroke-width", imgOpts.strokeWidth + "px")
        .style("stroke", (d,i) => { return imgOpts.color(i); }) //TODO 3 colours and 3 blobs
        .style("fill", "none")
        .style("filter" , "url(#glow)");

    var colorIndex = -1,
        axisNumber = 0;
    //Append the circles
    blobWrapper.selectAll(".radarCircle")
        .data((d,i) => { return d; })
        // .data(radarData)
        .enter().append("circle")
        .attr("class", "radarCircle")
        .attr("r", imgOpts.dotRadius)
        .attr("cx", (d,i) =>{ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("cy", (d,i) =>{ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
        .style("fill", (d,i) => {
            if(axisNumber % totalAxes === 0){
                colorIndex +=1;
            }
            axisNumber +=1;
            return imgOpts.color(colorIndex)
        })
        .style("fill-opacity", 0.8);


    //Tool tips
    //Wrapper for the invisible circles on top
    var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
        .data(carsJ)
        .enter().append("g")
        .attr("class", "radarCircleWrapper");

    //Append a set of invisible circles on top for the mouseover pop-up
    blobCircleWrapper.selectAll(".radarInvisibleCircle")
        .data( function (d,i) { return d; })
        .enter().append("circle")
        .attr("class", "radarInvisibleCircle")
        .attr("r", imgOpts.dotRadius*1.5)
        .attr("cx", (d,i) => {
            // console.log(rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2))
            return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2);
        })
        .attr("cy", function (d,i) { return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function (d,i) {
            newX =  parseFloat(d3.select(this).attr('cx')) - 10;
            newY =  parseFloat(d3.select(this).attr('cy')) - 10;
            console.log(d.value)// TODO this is undefined
            tooltip
                .attr('x', newX)
                .attr('y', newY)
                .text(Format(d.value))  //TODO get tool tip to work
                .transition().duration(200)
                .style('opacity', 1);
        })
        .on("mouseout", function(){
            tooltip.transition().duration(200)
                .style("opacity", 0);
        });

    //Set up the small tooltip for when you hover over a circle
    var tooltip = g.append("text")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Helper functions
    //Taken from http://bl.ocks.org/mbostock/7555321
    //Wraps SVG text
    function wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.4, // ems
                y = text.attr("y"),
                x = text.attr("x"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

}

function makeRadarCompare(id, data){
    //generate data to compare 1 gas car to 1 or 2 electric

    var axis = ['topseed', 'range', 'pricek', 'cost/year', 'cost/100km']

}