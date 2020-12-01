// reference
//taken from
// http://bl.ocks.org/nbremer/21746a9668ffdf6d8242
// and updated to work with v6

var _radarChart1;
function setupRadar1(id){
    let carNames = ["Tesla", "Audi", "Volkswagen", "Smart"];
    let axis = ["range", "efficiency", "topspeed", "pricek", "price_km"]
    //Changed this to import the brands only
    d3.csv("evdata2.csv").then(function (d){
        _radarChart1 = new radarChart(id, d, axis, 550, "Electric Car Comparison", carNames);
        _radarChart1.draw();
    });



};

// function setupRadarVS(id){
//     let axis = [];
//     let carNames = ["Avg Gas Car"];
//     //Changed this to import the brands only
//     d3.csv("evdata2.csv").then(function (d){
//         _radarChartVS = new radarChart(id, d, axis, 200,
//             "Selected Electric Car Compared to Gasoline Car", carNames )
//         _radarChartVS.draw();
//     });
//
// };


/**
 *
 * @param cars the array of objects you want to change
 * @param cols which columns from the cars array you want to use
 * @returns {[]} array of objects that can be used to populate the radar chart
 */
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


// generate brand data from model data
function genBrandData(data){
    var array = []


    data = d3.groups(data, d => d.brand);

    for(var i = 0; i < data.length; i++){

        array.push( { "brand": data[i][0],
            "accel": d3.mean(data[i][1], d => d.accel), // gives you the mean acceleration
            "topspeed": d3.mean(data[i][1], d => d.topspeed),
            "range": d3.mean(data[i][1], d => d.range),
            "efficiency": d3.mean(data[i][1], d => d.efficiency),
            "charge": d3.mean(data[i][1], d => d.charge),
            "power": d3.mean(data[i][1], d => d.power),
            "body": d3.mean(data[i][1], d => d.body),
            "seats": d3.mean(data[i][1], d => d.seats),
            "price" : d3.mean(data[i][1], d => d.price),
            "pricek": d3.mean(data[i][1], d => d.pricek),
            "price_km": d3.mean(data[i][1], d => d.price_km),
            "price_range": d3.mean(data[i][1], d => d.price_range) })
    }
    return array
}


// shape the data to compare the brands.
function filterSpecificBrands(data,names){ // TODO figure out if I need to do this for models
    var result = []
    for (var i = 0; i < data.length; i++){
        for(var j = 0; j < names.length; j++){
            if(names[j] === data[i].brand){
                result.push(data[i])
            }
        }
    }
    console.log(result);
    return result
}



function radarChart(id, data, axis, tempMaxValue, chartTitle, carNames) {

// TODO set up the data like I did in the scatter.js file

// Setup the data
    let viewBox = document.getElementById(id).viewBox.baseVal;
    let totalWidth = viewBox.width;
    let totalHeight = viewBox.height;
    let margins = {top: 100, right: 100, bottom: 70, left: 60};
    let innerWidth = totalWidth - margins.left - margins.right;
    let innerHeight = totalHeight - margins.top - margins.bottom;

    //Setup the Chart Options
    let color = d3.scaleOrdinal(d3.schemeCategory10)

    // set up image options to easily pass info to functions
    var imgOpts = {
        w: innerWidth,
        h: innerHeight,
        margin: margins, //TODO may have to get rid of margins and put it's data here
        maxValue: 700,
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

    //TODO get rid of this when you fix filtering
    imgOpts.maxValue = tempMaxValue;

    var gasConst = {
        avgTopSpeed: 190,
        avgRange: 660,
        avgTrip: 160,
        avgAcceleration: 8.0,
        avgPrice: 33464,
        avgPriceK: 33.464
    };

    var gasCar = [
        {   "brand": "Gasoline Car",
            "carname": "Gasoline Car",
            "accel": gasConst.avgAcceleration,
            "topspeed": gasConst.avgTopSpeed,
            "range": gasConst.avgRange,
            "efficiency": 0,
            "pricek": gasConst.avgPriceK,
            "price_km": 51}];

    // used for the example just show specific brands.
    // var carNames = ["Tesla", "Audi", "Volkswagen", "Smart"]; //TODO get the brands from the interactions

    // TODO setup any filtering of the data that needs to take place???? Here????

    // get brand data from the model data
    brandData = genBrandData(data);
    console.log(brandData);

    console.log(carNames);
    // get the rows of data for the brand names in carNames
    var cars = filterSpecificBrands(brandData, carNames)
    console.log(cars);
    let carsRadar =[];
    let gasCarsRadar = genAxisJson(gasCar, axis);
    if(axis.length === 0){
        axis = ["accel", "topspeed", "range", "efficiency", "pricek", "price_km"];
        carsRadar = genAxisJson(gasCar, axis);
    }
    else{
        carsRadar = genAxisJson(cars,axis);
        // carsRadar.push(genAxisJson(gasCar, axis)[0]); // This was for adding gascars to the first radar
    }

    console.log(carsRadar);
    console.log(gasCarsRadar);
    // carsRadar.push(gasCarsRadar[0]);
    // console.log(carsRadar);
    // TODO use this to put the gasCarsRadar into the cars

    //carsRadar.push(gasCarsRadar[0]);

    // setup axis and radius
    var allAxis = axis,
        totalAxes = allAxis.length,
        radius = Math.min(imgOpts.w/2, imgOpts.h/2), 	//Radius of the outermost circle
        Format = d3.format('.2f'),			 	//Percentage formatting
        angleSlice = Math.PI * 2 / totalAxes;		//The width in radians of each "slice"

    console.log(allAxis)

    //Scale for the radius
    // var max = d3.max(carsRadar, function(d,i){return d3.max(i.map(function(o){return o.value;}))});
    // console.log(max) //TODO fix this so max value isn't hard coded


    var rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, imgOpts.maxValue]);
    // .domain(d3.extent(cars))  // This did not work as wee need the axis value



    // Visualization rendering*************************************************************************************




    this.draw = function(){
        // //Remove whatever chart with the same id/class was present before
        // d3.select("#"+id).remove(); //TODO This might have to be changed might not need "svg"

        var chart = d3.select("#" + id); // chart is an svg container id need # for id's
        chart.append("svg")
            .attr("id", "radar")
            .attr("width",  imgOpts.w + imgOpts.margin.left + imgOpts.margin.right)
            .attr("height", imgOpts.h + imgOpts.margin.top + imgOpts.margin.bottom)
            .attr("class", "radar"+id);

        var g = chart.append("g")
            .attr("transform", "translate(" + (imgOpts.w/2 ) + "," +
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
            .attr("r", (d) => {return radius/imgOpts.levels*d;})
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
            .data(carsRadar)
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
        //Append the circles //TODO maybe make text here based on the circle positions make it opaque unless mouse over
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
            .data(carsRadar)
            .enter().append("g")
            .attr("class", "radarCircleWrapper");

        //Append a set of invisible circles on top for the mouseover pop-up
        blobCircleWrapper.selectAll(".radarInvisibleCircle")
            .data( (d,i) => {
                // console.log(d)
                // console.log(d[2].value)

                return d;
            })
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
            .on("mouseover", function (event, d) {
                newX =  parseFloat(d3.select(this).attr('cx')) - 10;
                newY =  parseFloat(d3.select(this).attr('cy')) - 10;
                // console.log(d)
                // console.log(d.value)
                tooltip
                    .attr('x', newX)
                    .attr('y', newY)
                    .text(Format(d.value))
                    .transition().duration(200)
                    .style('opacity', 1);
            })
            .on("mouseout", function(){
                tooltip.transition().duration(500)
                    .style("opacity", 0);
            });

        //Set up the small tooltip for when you hover over a circle
        var tooltip = g.append("text")
            .attr("class", "tooltip")
            .style("opacity", 0);


        // Title
       chart.append("text")
           .attr("x", function() {
               console.log(chartTitle.length)
              return innerWidth/2+85 + chartTitle.length;
           })
           .attr("y", 10)
           .attr("dy", ".45em")
           .style("text-anchor","end")
           .text(chartTitle);

        // Legend use chartTitle as the text
        var legend = chart.append("g")
            .attr("class", "legend-group").selectAll(".legend")
            .data(imgOpts.color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform" , function (d,i) {
                return "translate(-100," + (i+1) * 20 + ")";
            });

        // draw legend colored rectangles

        legend.append("rect")
            .attr("x", innerWidth + 200)
            .attr("width", 18)
            .attr("height", 9)
            .style("fill", (d,i)=> imgOpts.color(d));

        // draw legend text
        legend.append("text")
            .data(carsRadar)
            .attr("x", innerWidth+185)
            .attr("y", 5)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d, i) { // TODO wanted to add the brand but it's not in here.
                return "- "+carNames[i];
            });
        // put title on the legend
        chart.select("g.legend-group")
            .append("g")
            .attr("class", "legend")
            .attr("transform", "translate(-100,0)")
            .append("text")
            .attr("x", innerWidth+160)
            .attr("y", -3)
            .attr("dy", "1.5em")
            .style("text-anchor", "end")
            .text("Cars");

    };

    this.updateRadarChart = function(newData, legendCategory) {
        console.log(newData);
        carsRadar = genAxisJson(newData,axis);
        console.log(carsRadar);

        var chart = d3.select("#" + id)
        chart.selectAll('*').remove()
        // reset scale and max value
        let newMax = getMaxRange(newData);
        rScale.domain([0, newMax]);
        imgOpts.maxValue = newMax;

        //reset the names for the legends
        let newCarNames = getCarNames(newData, legendCategory);
        carNames = newCarNames;
        imgOpts.color = d3.scaleOrdinal(d3.schemeCategory10)
        this.draw();


    }
    // Helper functions

    function getCarNames(arr, col){
        let result = [];
        for(let i = 0; i < arr.length; i++){
            result.push(arr[i][col]);
        }
        return result;
    }

    function getMaxRange(arr){
        let newMax = 0;
        for(let i = 0; i< arr.length; i++){
            if(arr[i]["range"] > newMax){
                newMax = arr[i]["range"]
            }
            if(arr[i]["price_km"] > newMax){
                newMax = arr[i]["price_km"]
            }
        }
        return newMax;
    }

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

};
