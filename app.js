function final(){
    var filePath="honeyproduction.csv";
    vis1(filePath);
    vis2(filePath);
    vis3(filePath);
    vis4(filePath);
    vis5(filePath);
    vis6(filePath);
}

//Visualization 1
var vis1=function(filePath){
    var rowConverter = function(d){
        return {
            numcol: parseFloat(d.numcol),
            totalprod: parseFloat(d.totalprod),
            state: d.state,
            year: parseFloat(d.year)
        };
    }
    const honey = d3.csv(filePath, rowConverter);
    honey.then(function(d) {
        // setup
        var width = 600;
        var height = 600;
        var margin = 60;

        var svg_v1 = d3.select("#v1_plot").append("svg")
            .attr("width", width)
            .attr("height", height);
        
        // implement scaling
        var xScale = d3.scaleLinear()
            .domain([
                d3.min(d, function(d) {return d.numcol}), 
                d3.max(d, function(d) {return d.numcol})
                ])
            .range([1.5 * margin, width - margin]);
        var yScale = d3.scaleLinear()
            .domain([
                d3.min(d, function(d) {return d.totalprod}), 
                d3.max(d, function(d) {return d.totalprod})
                ])
            .range([height - margin, margin]);

        // title of plot
        svg_v1.append("text")
            .attr("x", (width / 2))             
            .attr("y", 16)
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .text("Total Production versus Number of Colonies");

        // append axes
        svg_v1.append("g")
            .attr('transform',`translate(${0},${height - margin})`)
            .call(d3.axisBottom().scale(xScale))
            .selectAll('text')
            .attr('text-anchor', 'end')
            .attr('transform', 'rotate(-45)')
        svg_v1.append("g")
            .attr('transform',`translate(${1.5 * margin},${0})`)
            .call(d3.axisLeft().scale(yScale))
            .append('text')
            .attr('text-anchor', 'end');

        // tooltip
        var Tooltip = d3.select('#v1_plot').append('div')
            .style('opacity', 0)
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('background', 'white')
            .style('border', 'solid');

        // plot
        svg_v1.append('g').selectAll(".circle")
            .data(d).enter().append("circle").attr("class", "circle")
            .attr("cx", d => xScale(d.numcol))
            .attr("cy", d => yScale(d.totalprod))
            .attr("r", 3)
            .attr("opacity", 0.7)
            .style('fill', '#FFBD31')
            .on("mouseover", function(e, d) {
                Tooltip.style('opacity', 1)
            })
            .on("mousemove", function(e, d) {
                Tooltip
                    .html(('State: ' + d.state + 
                        '<br>Year: ' + d.year + 
                        '<br>Number of Colonies: ' + d.numcol + 
                        '<br>Total Production: ' + d.totalprod
                        ))
                    .style("left", (e.pageX+20) +"px")
                    .style("top", e.pageY +"px");
            })
            .on("mouseleave", function(d) {
                Tooltip.style('opacity', 0)
                    .style('left', 0)
                    .style('top', 0);
            })

        // labels
        svg_v1.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width - 3 * margin)
            .attr("y", width)
            .attr("font-size", 14)
            .text("Number of colonies");

        svg_v1.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("x", -150)
            .attr("y", 0)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .attr("font-size", 14)
            .text("Total production");
    });
}

//Visualization 2
var vis2=function(filePath){
    // grab rows needed and convert dtypes
    var rowConverter = function(d){
        return {
            numcoloines: parseFloat(d.numcol),
            price: parseFloat(d.priceperlb),
            state: d.state,
            totalproduced: parseFloat(d.totalprod),
            year: parseFloat(d.year),
            yieldpercolony: parseFloat(d.yieldpercol)
        };
    }

    const honey = d3.csv(filePath, rowConverter);
    honey.then(function(data) {
        // barchart of total amount produced by year (in millions)
        // group by year, sum of total amount
        // 1998 - 2012
        // interactivity: button for sorting by increasing and decreasing values

        var yearSum = d3.rollups(data, v => d3.sum(v, d => (d.totalproduced/1000000)), d => d.year);

        var all_data = [];

        function pushToData(rollups, arr) {
            for (let i = 0; i < rollups.length; i++) {
                arr.push({
                    year: rollups[i][0],
                    totalproduced: rollups[i][1]
                })
            }
        }

        pushToData(yearSum, all_data);

        const margin = {top: 40, right: 30, bottom: 80, left: 60},
        svgwidth = 700 - margin.left - margin.right,
        svgheight = 700 - margin.top - margin.bottom;

        var svg = d3.select('#v2_plot').append('svg')
        .attr('width', svgwidth + margin.left + margin.right)
        .attr('height', svgheight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // title of plot
        svg.append("text")
            .attr("x", (svgwidth / 2))             
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .text("Total Production of Honey Per Year");

        // x label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", (svgwidth / 2))
            .attr("y", svgheight + (margin.bottom / 2))
            .text("Year");

        // y label
        svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x",0 - (svgheight / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Total Production of Honey In Millions of Pounds");

        var x = d3.scaleBand()
                .range([0, svgwidth])
                .domain(all_data.map(function(d) { return d.year}))
                .padding(0.2);

        svg.append("g")
            .attr('class', 'xAxis')
            .attr("transform", "translate(0," + svgheight + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-30)")
            .style("text-anchor", "end");

        max = d3.max(all_data, d => d.totalproduced)
        var y = d3.scaleLinear()
                    .domain([0, max])
                    .range([svgheight, 0])
        svg.append("g")
            .call(d3.axisLeft(y));

        svg.selectAll(".bar")
            .data(all_data)
            .enter().append("rect")
            .attr('class', 'bar')
            .attr("x", function(d) { return x(d.year)})
            .attr("y", d => y(d.totalproduced))
            .attr("width", x.bandwidth())
            .attr("height", d => svgheight - y(d.totalproduced))
            .style('fill', '#FFBD31')

        descending = false;
        var update = function() {
            if (descending) {
                sorted = all_data.sort(function(a,b) {
                    return d3.ascending(a.totalproduced, b.totalproduced);
                })
                descending = false;
            }
            else {
                sorted = all_data.sort(function(a,b) {
                    return d3.descending(a.totalproduced, b.totalproduced);
                })
                descending = true;
            }

            var u = svg.selectAll('.bar').data(sorted);    
            u.merge(u)
              .transition()
              .duration(1000)
              .attr('y', d => y(d.totalproduced))
              .attr("height", d => svgheight - y(d.totalproduced))

            new_x = d3.scaleBand()
                .range([0, svgwidth])
                .domain(sorted.map(function(d) { return d.year}))
                .padding(0.2);
            
            svg.select('.xAxis').remove()
            svg.append("g")
                .attr('class', 'xAxis')
                .attr("transform", "translate(0," + svgheight + ")")
                .call(d3.axisBottom(new_x))
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-30)")
                .style("text-anchor", "end");

        }
        
        d3.select("#sort_button")
        .on("click", function(){ 
            update(); 
        });

    })
}

//Visualization 3
var vis3=function(filePath){
    // grab rows needed and convert dtypes
    var rowConverter = function(d){
        return {
            numcoloines: parseFloat(d.numcol),
            price: parseFloat(d.priceperlb),
            state: d.state,
            totalproduced: parseFloat(d.totalprod),
            year: parseFloat(d.year),
            yieldpercolony: parseFloat(d.yieldpercol)
        };
    }

    const honey = d3.csv(filePath, rowConverter);
    honey.then(function(data) {
        var newData = data.filter(function(row) {
            return row['year'] == 1998 || row['year'] == 2005 || row['year'] == 2012;
        })

        // sample: {'state': WA, '1998': 136, '2005': 52, '2012': 67}
        prodSum = d3.rollups(newData, v => d3.sum(v, d=> d.totalproduced), d=> d.state, d=> d.year);
        // create for loop and add year as key to dictionary, add nested array values into dictionary 
        // as well as new keys.
        // sample: {'state': WA, '1998': 136, '2005': 52, '2012': 67}
        
        // If MD or OK -> add into array 2005: 0 and 2012: 0
        // this has to be done manually
        prodSum[16] = ["MD", [[1998, 30800], [2005, 0], [2012, 0]]]
        prodSum[23] = ['NV', [[1998, 460000], [2005, 552000], [2012, 0]]]
        prodSum[30] = ['OK', [[1998, 204000], [2005, 0], [2012, 0]]]


        // plan: create array, populate with dictionaries with initial year keys.
        var dataset = [];
        var elements = {};
        // turn rollups into a dictionary to use for stack
        for (var i = 0; i < prodSum.length; i++) {
            elements['state'] = prodSum[i][0];
            // now iterate through nested arrays and find which ones have gold/silver/bronze in them
            for (var j = 0; j < 3; j++) {
                if (prodSum[i][1][j].includes(1998)) {
                    elements['1998'] = prodSum[i][1][j][1];
                }
                else if (prodSum[i][1][j].includes(2005)) {
                    elements['2005'] = prodSum[i][1][j][1];
                }
                else if (prodSum[i][1][j].includes(2012)) {
                    elements['2012'] = prodSum[i][1][j][1];
                }
            }
            dataset.push(elements); // push elements into array, clear dict to issue in new Year
            elements = {};
        }

        var colors = function(i){
			colorarray = ["steelblue", "lightsalmon", "#C3B1E1"];
			return colorarray[i];
		}

        var stack = d3.stack().keys(["1998", "2005", "2012"]);
		var series = stack(dataset);

        const margin = {top: 50, right: 50, bottom: 70, left: 90},
        svgwidth = 960 - margin.left - margin.right,
        svgheight = 900 - margin.top - margin.bottom;

        var svg = d3.select("#v3_plot").append("svg")
        .attr("height", svgheight + margin.top + margin.bottom)
        .attr("width", svgwidth + margin.left + margin.right)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

        var xScale = d3.scaleBand()
            .domain(d3.range(dataset.length))
            .range([0, svgwidth])
            .padding([0.2])
        
        // ------------------------------------------------
        
        var xAxisGenerator = d3.axisBottom(xScale)
        var tickLabels = ['AL', 'AZ', 'AR', 'CA', 'CO', 'FL', 'GA', 'HI', 'ID', 
        'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MI', 'MN', 'MS', 'MO', 
        'MT', 'NE', 'NV', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']
        var xAxis = svg.append("g").attr("transform", `translate(0, ${svgheight})`).call(xAxisGenerator.tickFormat((d, i) => tickLabels[i]))

        // --------------------------------------------------
        // svg.append("g")
        //     .attr("transform", `translate(0, ${svgheight})`)
        //     .call(d3.axisBottom(xScale).tickSizeOuter(0));
        
        // title of plot
        svg.append("text")
            .attr("x", (svgwidth / 2))             
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .text("Total Production of Honey By State, Stacked by Years");
    
    
            // x labels
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", (svgwidth / 2))
            .attr("y", svgheight + (margin.bottom / 2))
            .text("U.S. State");
    
            // y label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (svgheight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Total Production of Honey");



        var yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, function(d){ 
                return d["1998"] + d["2005"] + d["2012"];
            })])
            .range([svgheight, 0]);

        svg.append("g").call(d3.axisLeft().scale(yScale))
            .attr("class", "yAxis")
            .attr("transform", "translate(0, 0)");

        var groups = svg.selectAll("rect")
            .data(series).enter().append("g")
            .attr("class", "gbars")
            .attr("fill", function(d, i){
                return colors(i);
            })

        var rects = groups.selectAll("rect")
            .data(function(d){
                return d;
            }).enter().append("rect")
            .attr("x", function(d, i){
                return xScale(i);
            })
            .attr("y", function (d) {
                return yScale(d[1]);
            })
            .attr("width", function(d){
                return xScale.bandwidth();
            })
            .attr("height", function(d){
                return yScale(d[0])-yScale(d[1]);
            })

        svg.append("circle").attr("cx", 700).attr("cy", 130).attr("r", 6).style("fill", "#C3B1E1")
        svg.append("circle").attr("cx", 700).attr("cy", 160).attr("r", 6).style("fill", "salmon")
        svg.append("circle").attr("cx", 700).attr("cy", 190).attr("r", 6).style("fill", "steelblue")
        svg.append("text").attr("x", 720).attr("y", 130).text("2012").style("font-size", "15px").attr("alignment-baseline","middle")
        svg.append("text").attr("x", 720).attr("y", 160).text("2005").style("font-size", "15px").attr("alignment-baseline","middle")
        svg.append("text").attr("x", 720).attr("y", 190).text("1998").style("font-size", "15px").attr("alignment-baseline","middle")

        // change the x axis to actual names of states

    });


}

//Visualization 4
var vis4=function(filePath){
    var rowConverter = function(d){
        return {
            numcol: parseFloat(d.numcol),
            // price: parseFloat(d.priceperlb),
            // state: d.state,
            totalprod: parseFloat(d.totalprod),
            year: parseFloat(d.year),
            // yieldpercolony: parseFloat(d.yieldpercol)
        };
    }

    const honey = d3.csv(filePath, rowConverter);
    honey.then(function(d) {
        // bin colonies
        const numcol_bins = [
            '0-50', '50-100', '100-150', '150-200', '200-250', '250-300', '300-350', '350-400', '400-450', 
            '450-500', '>500'
        ];
        
        // use if you want all years
        // const years = Object.values(
        //     d3.range(
        //         d3.min(d, d => d.year), 
        //         d3.max(d, d => d.year) + 1
        //     )
        // )

        // use if you want selected years
        const years = [1998, 2001, 2004, 2007, 2010];

        // when height is calculated by a sum of totals

        // initialize dictionary
        var temp = {};
        for (var i = 0; i < numcol_bins.length; i += 1) {
            temp[numcol_bins[i]] = {};
            for (var j = 0; j < years.length; j += 1) {
                temp[numcol_bins[i]][years[j]] = 0;
            }
        }

        // collect totals
        for (var i = 0; i < d.length; i += 1) {
            var lower = Math.floor(d[i].numcol / 50_000) * 50_000;
            lower /= 1000;
            if (lower + 50 <= 500) {
                temp[`${lower}-${lower + 50}`][d[i].year] += d[i].totalprod;
            }
            else {
                temp['>500'][d[i].year] += d[i].totalprod;
            }
        }

        // finalize data structure
        var dataset = [];
        for (var i = 0; i < numcol_bins.length; i += 1) {
            bin = numcol_bins[i];
            // comment out key-value pairs for the years you don't want to include
            dataset.push({
                'bin': bin,
                '1998': temp[bin][1998],
                // '1999': temp[bin][1999],
                // '2000': temp[bin][2000],
                '2001': temp[bin][2001],
                // '2002': temp[bin][2002],
                // '2003': temp[bin][2003],
                '2004': temp[bin][2004],
                // '2005': temp[bin][2005],
                // '2006': temp[bin][2006],
                '2007': temp[bin][2007],
                // '2008': temp[bin][2008],
                // '2009': temp[bin][2009],
                '2010': temp[bin][2010] // ,
                // '2011': temp[bin][2011],
                // '2012': temp[bin][2012]
            });
        }

        // colors
        var colors = function(i){
            const colors = [
                "#6e40aa","#6f40aa","#7140ab","#723fac","#743fac","#753fad","#773fad","#783fae","#7a3fae",
                "#7c3faf","#7d3faf","#7f3faf","#803eb0","#823eb0","#833eb0","#853eb1","#873eb1","#883eb1",
                "#8a3eb2","#8b3eb2","#8d3eb2","#8f3db2","#903db2","#923db3","#943db3","#953db3","#973db3",
                "#983db3","#9a3db3","#9c3db3","#9d3db3","#9f3db3","#a13db3","#a23db3","#a43db3","#a63cb3",
                "#a73cb3","#a93cb3","#aa3cb2","#ac3cb2","#ae3cb2","#af3cb2","#b13cb2","#b23cb1","#b43cb1",
                "#b63cb1","#b73cb0","#b93cb0","#ba3cb0","#bc3caf","#be3caf","#bf3caf","#c13dae","#c23dae",
                "#c43dad","#c53dad","#c73dac","#c83dac","#ca3dab","#cb3daa","#cd3daa","#ce3da9","#d03ea9",
                "#d13ea8","#d33ea7","#d43ea7","#d53ea6","#d73ea5","#d83fa4","#da3fa4","#db3fa3","#dc3fa2",
                "#de3fa1","#df40a0","#e040a0","#e2409f","#e3409e","#e4419d","#e5419c","#e7419b","#e8429a",
                "#e94299","#ea4298","#eb4397","#ed4396","#ee4395","#ef4494","#f04493","#f14592","#f24591",
                "#f34590","#f4468f","#f5468e","#f6478d","#f7478c","#f8488b","#f9488a","#fa4988","#fb4987",
                "#fc4a86","#fd4a85","#fe4b84","#fe4b83","#ff4c81","#ff4d80","#ff4d7f","#ff4e7e","#ff4e7d",
                "#ff4f7b","#ff507a","#ff5079","#ff5178","#ff5276","#ff5275","#ff5374","#ff5473","#ff5572",
                "#ff5570","#ff566f","#ff576e","#ff586d","#ff586b","#ff596a","#ff5a69","#ff5b68","#ff5c66",
                "#ff5d65","#ff5d64","#ff5e63","#ff5f61","#ff6060","#ff615f","#ff625e","#ff635d","#ff645b",
                "#ff655a","#ff6659","#ff6758","#ff6857","#ff6956","#ff6a54","#ff6b53","#ff6c52","#ff6d51",
                "#ff6e50","#ff6f4f","#ff704e","#ff714d","#ff724c","#ff734b","#ff744a","#ff7549","#ff7648",
                "#ff7847","#ff7946","#ff7a45","#ff7b44","#ff7c43","#ff7d42","#ff7e41","#ff8040","#ff813f",
                "#ff823e","#ff833d","#ff843d","#ff863c","#ff873b","#ff883a","#ff893a","#ff8a39","#ff8c38",
                "#ff8d37","#ff8e37","#ff8f36","#fe9136","#fd9235","#fd9334","#fc9534","#fb9633","#fa9733",
                "#f99832","#f99a32","#f89b32","#f79c31","#f69d31","#f59f30","#f4a030","#f3a130","#f2a32f",
                "#f1a42f","#f0a52f","#efa62f","#eea82f","#eda92e","#ecaa2e","#ebac2e","#eaad2e","#e9ae2e",
                "#e8b02e","#e7b12e","#e6b22e","#e5b32e","#e4b52e","#e3b62e","#e2b72f","#e1b92f","#e0ba2f",
                "#dfbb2f","#debc30","#ddbe30","#dbbf30","#dac030","#d9c131","#d8c331","#d7c432","#d6c532",
                "#d5c633","#d4c833","#d3c934","#d2ca34","#d1cb35","#cfcc36","#cece36","#cdcf37","#ccd038",
                "#cbd138","#cad239","#c9d33a","#c8d53b","#c7d63c","#c6d73c","#c5d83d","#c4d93e","#c3da3f",
                "#c2db40","#c1dc41","#c0dd42","#bfdf43","#bee044","#bde146","#bce247","#bbe348","#bae449",
                "#b9e54a","#b8e64b","#b7e74d","#b6e84e","#b6e94f","#b5ea51","#b4ea52","#b3eb53","#b2ec55",
                "#b1ed56","#b1ee58","#b0ef59","#aff05b"
            ];
            const scale = Math.floor(colors.length / years.length);
            return colors[scale * i];
        }
        
        // setup
        var stack = d3.stack().keys(years);
        var series = stack(dataset);

        var svgheight = 600;
        var svgwidth = 600;
        var padding = 50;

        var svg = d3.select("#v4_plot").append("svg")
            .attr("height", svgheight)
            .attr("width", svgwidth);

        // title of plot
        svg.append("text")
            .attr("x", (svgwidth / 2))             
            .attr("y", 16)
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .text("Total Production grouped by Number of Colonies, stacked by Year");

        // axes
        var xScale = d3.scaleBand()
            .domain(numcol_bins)
            .range([2* padding + 3, svgwidth - padding])
            .paddingInner(0.05);

        var yScale = d3.scaleLinear()
            .domain([0, 175_000_000])
            .range([svgheight - 2 * padding, padding]);

        svg.append("g")
            .attr("transform", "translate(" + 0 * padding + ", " + (svgheight - 2 * padding) + ")")
            .call(d3.axisBottom(xScale))
            .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end")
                .attr("font-size", 9);
        svg.append("g")
            .attr("transform", "translate(" + (2 * padding) + ", 0)")
            .call(d3.axisLeft(yScale))
            .selectAll("text")
                .attr("font-size", 9);

        // labels
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", svgwidth - 2.5 * padding)
            .attr("y", svgheight - padding)
            .attr("font-size", 14)
            .text("Number of colonies, in thousands");

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("x", -150)
            .attr("y", 0.5 * padding)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .attr("font-size", 14)
            .text("Total production");

        // bars
        var groups = svg.selectAll(".gbars")
            .data(series).enter().append("g")
            .attr("class", "gbars")
            .attr("fill", function(d, i){return colors(i);})

        var rects = groups.selectAll("rect")
            .data(function(d){
                return d;
            }).enter().append("rect")
            .attr("x", function(d, i){
                return xScale(numcol_bins[i])
            })
            .attr("y", function(d) {
                return yScale(d[1]); // UUHHHHH
            })
            .attr("width", function(d) {
                return xScale.bandwidth();
            })
            .attr("height", function(d){
                return yScale(d[0]) - yScale(d[1]);
            })

        // legend
        var size = 20
        svg.selectAll("gbars")
            .data(years).enter().append("rect")
            .attr("x", 400)
            .attr("y", function(d, i){ return 100 + i * (size + 5)})
            .attr("width", size)
            .attr("height", size)
            .style("fill", function(d, i) { return colors(i)})

        svg.selectAll("gbars")
            .data(years).enter().append("text")
            .attr("x", 400 + size * 1.2)
            .attr("y", function(d, i) {return 100 + i * (size + 5) + (size / 2)})
            .style("fill", function(d, i) {return colors(i)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")

    });
}

//Visualization 5
var vis5=function(filePath){
    // grab rows needed and convert dtypes
    var rowConverter = function(d){
        return {
            numcoloines: parseFloat(d.numcol),
            price: parseFloat(d.priceperlb),
            state: d.state,
            totalproduced: parseFloat(d.totalprod),
            year: parseFloat(d.year),
            yieldpercolony: parseFloat(d.yieldpercol)
        };
    }

    const honey = d3.csv(filePath, rowConverter);
    honey.then(function(data) {
        // data needs to be sorted for quantile to work
        // figured I would do that at beginning
        data = data.sort(d3.ascending);

        // group data by state
        var grouped = d3.group(data, d => d.state);

        // set up svg
        width = 400;
        height = 500;
        center = width / 2;
        plot_width = width / 4;
        padding = 50

        var svg = d3.select("#v5_plot").append("svg")
            .attr("width", width)
            .attr("height", height);

        // set scale based on overall data
        max = d3.max(data, d => d.price);
        min = d3.min(data, d => d.price);

        // add dropdown options
        var state_button = d3.select("#state_button").append('select');
        state_button.selectAll('options')
                .data(grouped.keys()).enter()
                .append('option')
                .text(d => d)
                .attr('value', d => d);

        // title of plot
        svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 16)
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .text("Boxplot of Price");

        // create y-axis
        var yScale = d3.scaleLinear()
            .domain([0, max])
            .range([height-padding, padding]);

        // add y-axis
        svg.append('g')
            .attr("transform", "translate(" + (padding) + ",0)")
            .call( d3.axisLeft(yScale).tickFormat(d3.format('$.2f')));

        // add y-label
        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("x", -height/2)
            .attr("y", 0)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Price");

        // add range line
        svg.append('line')
            .attr('class', 'range')
        
        // add the box
        svg.append('rect')
            .attr('class', 'box')
            
        // add line marks after box so show on top
        svg.selectAll('.marks').data([1, 2, 3]).enter()
            .append('line').attr('class', 'marks')

        // plot within a function in order to use drop down menu
        plot_box = function(state) {
            state_data = grouped.get(state);

            // quantile needs it as an array
            price_array = state_data.map(d => d.price);

            // collect all values needed for box plot
            max = d3.max(state_data, d => d.price);
            min = d3.min(state_data, d => d.price);
            median = d3.median(state_data, d => d.price);
            q1 = d3.quantile(price_array, 0.25);
            q3 = d3.quantile(price_array, 0.75);

            svg.selectAll('.range')
                .transition()
                .attr('x1', center) 
                .attr('x2', center)
                .attr('y1', yScale(min))
                .attr('y2', yScale(max))
                .attr('stroke', 'black');

            svg.selectAll('.box')
                .transition()
                .attr('x', center - plot_width/2)
                .attr('y', yScale(q3))
                .attr('height', yScale(q1) - yScale(q3))
                .attr('width', plot_width)
                .attr('stroke', 'black')
                .style('fill', '#FFBD31');

            // add line marks after box so show on top
            svg.selectAll('.marks').data([min, max, median])
                .transition()
                .attr('class', 'marks')
                .attr('x1', center + plot_width/2)
                .attr('x2', center - plot_width/2)
                .attr('y1', d => yScale(d))
                .attr('y2', d => yScale(d))
                .attr('stroke', 'black');
        }

        // detect button change
        state_button.on('change', function(d) {
            state = d3.select(this).property('value');
            plot_box(state);
        });

        //default call to Alabama since that's selected
        plot_box('AL');
    });    
}

//Visualization 6 (Geomap)
var vis6=function(filePath){
    // grab rows needed and convert dtypes
    var rowConverter = function(d){
        return {
            numcoloines: parseFloat(d.numcol),
            price: parseFloat(d.priceperlb),
            state: d.state,
            totalproduced: parseFloat(d.totalprod),
            year: parseFloat(d.year),
            yieldpercolony: parseFloat(d.yieldpercol)
        };
    }

    const honey = d3.csv(filePath, rowConverter);
    honey.then(function(data) {
        // manually found coords for each state on the map
        var state_coords = {
            AL: {x:565, y:411},
            AK: {x:119, y:473},
            AZ: {x:200, y:368},
            AR: {x:483, y:381},
            CA: {x:96, y:304},
            CO: {x:297, y:298},
            CT: {x:734, y:220},
            DE: {x:709, y:274},
            FL: {x:651, y:472},
            GA: {x:617, y:406},
            HI: {x:289, y:530},
            ID: {x:197, y:188},
            IL: {x:523, y:284},
            IN: {x:563, y:279},
            IA: {x:464, y:247},
            KS: {x:398, y:311},
            KY: {x:579, y:321},
            LA: {x:486, y:442},
            ME: {x:759, y:142},
            MD: {x:692, y:275},
            MA: {x:743, y:203},
            MI: {x:574, y:213},
            MN: {x:448, y:175},
            MS: {x:524, y:414},
            MO: {x:479, y:316},
            MT: {x:266, y:150},
            NE: {x:379, y:259},
            NH: {x:741, y:184},
            NV: {x:148, y:264},
            NJ: {x:720, y:252},
            NM: {x:280, y:380},
            NY: {x:695, y:206},
            NC: {x:671, y:344},
            ND: {x:375, y:152},
            OH: {x:607, y:269},
            OK: {x:409, y:366},
            OR: {x:117, y:176},
            PA: {x:670, y:247},
            RI: {x:749, y:215},
            SC: {x:652, y:380},
            SD: {x:374, y:207},
            TN: {x:562, y:354},
            TX: {x:376, y:436},
            UT: {x:217, y:283},
            VT: {x:725, y:180},
            VA: {x:671, y:306},
            WA: {x:134, y:119},
            WV: {x:638, y:294},
            WI: {x:505, y:201},
            WY: {x:282, y:224}
        };
        
        var grouped = d3.group(data, d => d.year);
        // add dropdown options
        var year_button = d3.select("#year_button").append('select');
        year_button.selectAll('options')
                .data(grouped.keys()).enter()
                .append('option')
                .text(d => d)
                .attr('value', d => d);

        // set up svg
        width = 800;
        height = 600;
        padding = 50;

        var svg = d3.select("#v6_plot").append("svg")
            .attr("width", width)
            .attr("height", height);

        // add the map image
        svg.append('image')
            .attr('xlink:href', 'map.jpg') 
            .attr('width', width)
            .attr('height', height)

        // title of plot
        svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 16)
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .text("Total Production of Honey");
       
        // // code for getting coords of a state  
        // svg.on("click", function(e, d) {
        //     x = e.offsetX;
        //     y = e.offsetY;
        //     console.log(('{x:' + x + ', y:' + y + '}'))
        // })

        plot_dots = function(key) {
            filtered = data.filter(d => d.year == key);

            // find the max of selected year
            max = d3.max(filtered, d => d.totalproduced);
            min = d3.min(filtered, d => d.totalproduced);
            var rScale = d3.scaleLinear()
                .domain([min, max])
                .range([5, 30]);

            // add/update the state dots
            var u = svg.selectAll('.statedot').data(filtered);    
            u.enter()
                .append("circle")
                .merge(u)
                .attr("class", "statedot")
                .attr('cx', d => state_coords[d.state].x)
                .attr('cy', d => state_coords[d.state].y)
                .attr('r', d => rScale(d.totalproduced))
                .style('fill', '#FFBD31')
                .attr("opacity", 0.9);  
        }


        // detect button change
        year_button.on('change', function(d) {
            year = d3.select(this).property('value');
            plot_dots(year);
        });

        // default call to 1998
        plot_dots(1998);

    });
}