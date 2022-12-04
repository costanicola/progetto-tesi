class PieChart {

    constructor(data, colorRange, svgPosition) {

        //piechart
        this.dataTotal = d3.sum(d3.values(this.data));
        this.color = d3.scaleOrdinal().domain(data).range(colorRange);
        this.pie = d3.pie().value(d => d.value);
        this.dataReady = this.pie(d3.entries(data));
        this.pieSvg = d3.select(svgPosition).append("svg").append("g");
        this.svg = d3.select(svgPosition + " svg");
        this.g = d3.select(svgPosition + " svg g");

        //tooltip
        const tooltip = d3.select(svgPosition).append("div").attr("class", "tooltip")
        .style("opacity", 0).style("background-color", "white").style("border", "solid").style("border-width", "2px").style("border-radius", "5px").style("padding", "5px");

        this.pieMouseover = function(d) {
            $(".tooltip").show();
            tooltip.style("opacity", 1);
            d3.select(this).style("opacity", 1);
        };
        
        this.pieMousemove = function(d) {
            tooltip.html("N° analisi con risultato " + d.data.key + ": " + d.value + " (<span class='fw-bold'>" + d3.format(".0%")(d.value / d3.sum(d3.values(this.data))) + "</span>)")
            .style("left", d3.event.pageX - 130 + "px").style("top", d3.event.pageY - 45 + "px");
        };
        
        this.pieMouseleave = function(d) {
            $(".tooltip").hide();
            tooltip.style("opacity", 0);
            d3.select(this).style("opacity", 0.8);
        };

    }

    getDataTotal() {
        return this.dataTotal;
    }

    drawPieChart(dimension) {
        const radius = dimension / 2 - 10;  //10 -> un po' di margine
        const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);
            
        this.svg.attr("width", dimension).attr("height", dimension);
        this.g.attr("transform", "translate(" + dimension / 2 + "," + dimension / 2 + ")");
            
        this.pieSvg.selectAll("pieSlices").data(this.dataReady).enter().append("path")
        .attr("d", arcGenerator).attr("fill", d => this.color(d.data.key)).attr("stroke", "white").style("stroke-width", "3px").style("opacity", 0.8)
        .on("mouseover", this.pieMouseover).on("mousemove", this.pieMousemove).on("mouseleave", this.pieMouseleave);
    }

}

class LineChart {

    constructor(data, colorRange, svgPosition) {
        _
    }

    drawLineChart() {
        _
    }

}

/*class BarPlot {

    constructor(data, colorRange, svgPosition) {

        this.data = data;
        this.color = d3.scaleOrdinal().domain(data).range(colorRange);
        this.barSvg = d3.select(svgPosition).append("svg").append("g");
        this.svg = d3.select(svgPosition + " svg");
        this.g = d3.select(svgPosition + " svg g");

    }

    drawLineChart(height, width, margins) {
        
        this.svg.attr("width", width + margins.left + margins.right).attr("height", height + margins.top + margins.bottom);
        this.g.attr("transform", "translate(" + margins.left + "," + margins.top + ")");

        const xAxis = d3.scaleBand().range([0, width]).domain(this.data.map(d => d.social))
        .padding(0.2);
        svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

        // Add Y axis
        var y = d3.scaleLinear()
        .domain([0, 100])
        .range([ height, 0]);
        svg.append("g")
        .call(d3.axisLeft(y));

        // Bars
        svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.social); })
        .attr("y", function(d) { return y(d.nKeywords); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.nKeywords); })
        .attr("fill", "#69b3a2")

    }

}*/