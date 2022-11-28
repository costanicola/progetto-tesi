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