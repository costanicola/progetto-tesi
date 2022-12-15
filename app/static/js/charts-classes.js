class PieChart {

    constructor(data, svgPosition) {

        this.dataTotal = d3.sum(d3.values(data));
        this.pie = d3.pie().value(d => d.value);
        this.dataReady = this.pie(d3.entries(data));

        d3.select(svgPosition).append("svg").append("g");
        this.svg = d3.select(svgPosition + " svg");
        this.g = d3.select(svgPosition + " svg g");

        //effetti colori area degli spicchi
        const linearGradient = this.svg.append("linearGradient").attr("id", "gradient_positive").attr("spreadMethod", "repeat")
        .attr("x1", "6%").attr("y1", "8%").attr("x2", "12%").attr("y2", "12%");
        linearGradient.append("stop").attr("offset", "50%").attr("stop-color", "#0000FF");
        linearGradient.append("stop").attr("offset", "50%").attr("stop-color", "#1A85FF");

        const pattern = this.svg.append("pattern").attr("id", "pattern_neutral").attr("width", 10).attr("height", 10)
        .attr("patternUnits", "userSpaceOnUse");
        pattern.append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").style("stroke", "none").style("fill", "#ECE839");

        //tooltip
        const tooltip = d3.select(svgPosition).append("div").attr("class", "tooltip")
        .style("opacity", 0).style("background-color", "white").style("border", "solid").style("border-width", "2px").style("border-radius", "5px").style("padding", "5px");

        this.pieMouseover = function(d) {
            $(".tooltip").show();
            tooltip.style("opacity", 1);
            d3.select(this).style("opacity", 1);
        };
        
        this.pieMousemove = function(d) {
            tooltip.html("N° analisi con risultato " + d.data.key + ": " + d.value + " (<span class='fw-bold'>" + d3.format(".0%")(d.value / d3.sum(d3.values(data))) + "</span>)")
            .style("left", d3.event.pageX - 130 + "px").style("top", d3.event.pageY - 45 + "px");
        };
        
        this.pieMouseleave = function(d) {
            $(".tooltip").hide();
            tooltip.style("opacity", 0);
            d3.select(this).style("opacity", 0.8);
        };

        this.sentimentColor = function(sentiment) {
            return sentiment == "positivo" ? "url(#gradient_positive)" : sentiment == "neutrale" ? "url(#pattern_neutral)" : "#D41159";
        }

    }

    getDataTotal() {
        return this.dataTotal;
    }

    drawPieChartLegendHorizontal(svgPosition) {

        const pieLegendSvg = d3.select(svgPosition).append("svg").attr("width", 275).attr("height", 30).append("g").attr("transform", "translate(0,0)");

        //quadratini legenda
        pieLegendSvg.selectAll("pieDesc").data(this.dataReady).enter().append("rect")
        .attr("x", d => d.index * 94).attr("width", 14).attr("height", 14).attr("fill", d => this.sentimentColor(d.data.key));

        //testo della legenda
        pieLegendSvg.selectAll("pieDesc").data(this.dataReady).enter().append("text")
        .text(d => d.data.key).attr("x", d => 18 + (d.index * 94)).attr("y", 12)
        .style("font-family", "system-ui").style("font-size", "16px");

    }

    drawPieChartLegendVertical(svgPosition) {

        const pieLegendSvg = d3.select(svgPosition).append("svg").attr("width", 100).attr("height", 100).append("g").attr("transform", "translate(10,20)");

        //quadratini legenda
        pieLegendSvg.selectAll("pieDesc").data(this.dataReady).enter().append("rect")
       .attr("y", (d, i) => (i * 35) - 11).attr("width", 15).attr("height", 15).attr("fill", d => this.sentimentColor(d.data.key));

        //testo della legenda
        pieLegendSvg.selectAll("pieDesc").data(this.dataReady).enter().append("text")
        .text(d => d.data.key).attr("x", 20).attr("y", (d, i) => i * 35)
        .style("font-family", "system-ui").style("font-size", "16px");

    }

    drawPieChart(dimension) {

        const radius = dimension / 2 - 5;  //5 -> un po' di margine attorno al pie
        const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);
            
        this.svg.attr("width", dimension).attr("height", dimension);
        this.g.attr("transform", "translate(" + dimension / 2 + "," + dimension / 2 + ")");
        this.g.selectAll("*").remove();
            
        this.g.selectAll("pieSlices").data(this.dataReady).enter().append("path")
        .attr("d", arcGenerator).attr("fill", d => this.sentimentColor(d.data.key)).attr("stroke", "white").style("stroke-width", "3px").style("opacity", 0.8)
        .on("mouseover", this.pieMouseover).on("mousemove", this.pieMousemove).on("mouseleave", this.pieMouseleave);

    }

}


class LineChart {

    constructor(data, chartSvgPosition, legendSvgPosition) {

        this.data = data;
        this.groupData = d3.nest().key(d => d.sentiment).entries(data);

        d3.select(chartSvgPosition).append("svg").append("g");
        this.svg = d3.select(chartSvgPosition + " svg");
        this.g = d3.select(chartSvgPosition + " svg g");
        
        this.tooltip = d3.select(chartSvgPosition).append("div").attr("class", "tooltip")
        .style("opacity", 0).style("background-color", "white").style("border", "solid").style("border-width", "2px").style("border-radius", "5px").style("padding", "5px");
        
        d3.select(legendSvgPosition).append("svg").append("g");
        this.legendSvg = d3.select(legendSvgPosition + " svg");
        this.legendG = d3.select(legendSvgPosition + " svg g");

        this.sentimentColor = sentiment => sentiment == "positivo" ? "#1A85FF" : sentiment == "neutrale" ? "#ECE839" : "#D41159";

    }

    drawLineChartResponsiveLegend(width, height) {

        this.legendSvg.attr("width", width).attr("height", height);
        this.legendG.selectAll("*").remove();

        //lineette legenda
        this.legendG.selectAll("lineDesc").data(this.groupData).enter().append("line")
        .style("stroke", d => this.sentimentColor(d.key)).style("stroke-width", 4).attr("class", d => (d.key == "positivo" ? "solid" : d.key == "neutrale" ? "dashed" : "dotted"))
        .attr("x1", (d, i) => width === 450 ?  i * 150 : 0)
        .attr("y1", (d, i) => height === 30 ? 9 : 9 + (i * 25))
        .attr("x2", (d, i) => width === 450 ? (i * 150) + 60 : 60)
        .attr("y2", (d, i) => height === 30 ? 9 : 9 + (i * 25));

        //testo della legenda
        this.legendG.selectAll("pieDesc").data(this.groupData).enter().append("text")
        .text(d => d.key).style("font-family", "system-ui").style("font-size", "16px")
        .attr("x", (d, i) => width === 450 ? 64 + (i * 150) : 64)
        .attr("y", (d, i) => height === 30 ? 12 : 12 + (i * 25));

    }

    drawLineChart(width, height, margins) {

        this.svg.attr("width", width + margins.left + margins.right).attr("height", height + margins.top + margins.bottom);
        this.g.attr("transform", "translate(" + margins.left + "," + margins.top + ")");
        this.g.selectAll("*").remove();

        const lineX = d3.scaleTime().domain(d3.extent(this.data, d => new Date(d.addedDate))).range([0, width]);
        this.g.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(lineX).tickFormat(d3.timeFormat("%Y-%m")).ticks(6));

        const lineY = d3.scaleLinear().domain([0, d3.max(this.data, d => d.n)]).range([height, 0]);
        const lineYTicks = lineY.ticks().filter(tick => Number.isInteger(tick));
        this.g.append("g").call(d3.axisLeft(lineY).tickValues(lineYTicks).tickFormat(d3.format('d')))
        .append("text").attr("transform", "rotate(-90)").attr("y", -35)  //intestazione asse y
        .style("text-anchor", "end").style("font-size", "12px").attr("fill", "black").text("N° ANALISI");

        this.g.selectAll(".line").data(this.groupData).enter().append("path")
        .attr("fill", "none").attr("stroke", d => this.sentimentColor(d.key)).attr("stroke-width", 2.5)
        .attr("class", d => (d.key == "positivo" ? "solid" : d.key == "neutrale" ? "dashed" : "dotted"))
        .attr("d", d => d3.line().x(d => lineX(new Date(d.addedDate))).y(d => lineY(d.n))(d.values));

        //eventi per tooltip, i rif servono perchè this. non funziona all'interno delle function
        const rifTooltip = this.tooltip;
        const rifGroupData = this.groupData

        const lineMouseover = function() {
            $(".tooltip").show();
            d3.select(".mouse-line").style("opacity", "1");
            d3.selectAll(".mouse-per-line circle").style("opacity", "1");
        }

        const lineMousemove = function() {
            const date = d3.timeFormat("%Y-%m-%d")(lineX.invert(d3.mouse(this)[0]));
            const bisect = d3.bisector(d => d.addedDate).left;
            
            d3.selectAll(".mouse-per-line").attr("transform", function(d) {

                d3.select(".mouse-line")
                .attr("x1", lineX(new Date(d.values[bisect(d.values, date)].addedDate)))
                .attr("x2", lineX(new Date(d.values[bisect(d.values, date)].addedDate)))
                .attr("y1", 0).attr("y2", height);

                rifTooltip.html("<div class='fw-bold'>" + date + "</div>")
                .style("opacity", 1).style("left", d3.event.pageX + 16 + "px").style("top", d3.event.pageY - 45 + "px")
                .selectAll().data(rifGroupData).enter().append("div")
                .html(d.values[bisect(d.values, date)].addedDate == date ? e => (e.key + ": " + e.values.find(h => h.addedDate == date).n) : "");

                return "translate(" + lineX(new Date(d.values[bisect(d.values, date)].addedDate)) + "," + lineY(new Date(d.values[bisect(d.values, date)].n)) + ")";
            
            });
        };
        
        const lineMouseout = function() {
            $(".tooltip").hide();
            rifTooltip.style("opacity", 0);
            d3.select(".mouse-line").style("opacity", 0);
            d3.selectAll(".mouse-per-line circle").style("opacity", 0);
        };

        //si crea un rettangolo nel grafico su cui vengono mostrati il tooltip, la linea del tempo e i cerchietti delle coordinate
        const mouseSpace = this.g.append("g");

        mouseSpace.append("line").attr("class", "mouse-line").style("stroke", "#BFBFBF").style("stroke-width", "2px").style("opacity", "0");

        mouseSpace.selectAll(".mouse-per-line").data(this.groupData).enter().append("g").attr("class", "mouse-per-line")
        .append("circle").attr("r", 4).style("stroke", d => this.sentimentColor(d.key)).style("fill", "none").style("stroke-width", "2px").style("opacity", "0");

        mouseSpace.append("rect").attr("width", width + 4).attr("height", height).attr("fill", "none")  //senza il +4 non sarebbe visibile il tooltip nell'ultimo punto
        .attr("pointer-events", "all").on("mouseover", lineMouseover).on("mousemove", lineMousemove).on("mouseout", lineMouseout);

    }

}