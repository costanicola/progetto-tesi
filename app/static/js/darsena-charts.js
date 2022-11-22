$(document).ready(function() {

    // PIECHART DARSENA
    const darsenaPieData = JSON.parse($("#darsena_piechart").attr("data"));
    const darsenaPieDataTotal = d3.sum(d3.values(darsenaPieData));

    //se non ci sono dati non mostro legenda e pie
    darsenaPieDataTotal === 0 ? $("#darsena_piechart, #darsena_piechart_legend, #darsena_linechart, #darsena_linechart_legend").hide() : $(".no-data-display").hide();

    const darsenaPieColor = d3.scaleOrdinal().domain(darsenaPieData).range(["#1A85FF", "#ECE839", "#D41159"]);
    const darsenaPie = d3.pie().value(d => d.value);
    const darsenaPieDataReady = darsenaPie(d3.entries(darsenaPieData));
    const darsenaPieSvg = d3.select("#darsena_piechart").append("svg").attr("id", "darsena_pie_svg").append("g").attr("id", "darsena_pie_g");

    //legenda piechart
    const darsenaPieLegendSvg = d3.select("#darsena_piechart_legend").append("svg").attr("width", 275).attr("height", 30).append("g").attr("transform", "translate(0,0)");

    //quadratini legenda
    darsenaPieLegendSvg.selectAll("pieDesc").data(darsenaPieDataReady).enter().append("rect")
    .attr("x", d => d.index * 94).attr("width", 14).attr("height", 14).attr("fill", d => darsenaPieColor(d.index));

    //testo della legenda
    darsenaPieLegendSvg.selectAll("pieDesc").data(darsenaPieDataReady).enter().append("text")
    .text(d => d.data.key).attr("x", d => 18 + (d.index * 94)).attr("y", 12)
    .style("font-family", "system-ui").style("font-size", "16px");

    //tooltip ed eventi del grafico
    const darsenaPieTooltip = d3.select("#darsena_piechart").append("div")
    .style("opacity", 0).attr("class", "tooltip").style("background-color", "white")
    .style("border", "solid").style("border-width", "2px").style("border-radius", "5px").style("padding", "5px");

    const darsenaPieMouseover = function(d) {
        $(".tooltip").show();
        darsenaPieTooltip.style("opacity", 1);
        d3.select(this).style("opacity", 1);
    };
    
    const darsenaPieMousemove = function(d) {
        darsenaPieTooltip.html("N° analisi con risultato " + d.data.key + ": " + d.value + " (<span class='fw-bold'>" + d3.format(".0%")(d.value / darsenaPieDataTotal) + "</span>)")
        .style("left", d3.event.pageX - 130 + "px").style("top", d3.event.pageY - 45 + "px");
    };
    
    const darsenaPieMouseleave = function(d) {
        $(".tooltip").hide();
        darsenaPieTooltip.style("opacity", 0);
        d3.select(this).style("opacity", 0.8);
    };


    // LINECHART DARSENA
    const darsenaLineData = [
        {data: "2022-05-12", sentiment: "positivo", n: 4},
        {data: "2022-06-11", sentiment: "positivo", n: 5},
        {data: "2022-08-12", sentiment: "positivo", n: 8},
        {data: "2022-08-27", sentiment: "positivo", n: 2},
        {data: "2022-09-29", sentiment: "positivo", n: 8},
        {data: "2022-10-29", sentiment: "positivo", n: 2},
        {data: "2022-10-30", sentiment: "positivo", n: 0},
        {data: "2022-05-12", sentiment: "neutrale", n: 0},
        {data: "2022-06-11", sentiment: "neutrale", n: 2},
        {data: "2022-08-12", sentiment: "neutrale", n: 8},
        {data: "2022-08-27", sentiment: "neutrale", n: 0},
        {data: "2022-09-29", sentiment: "neutrale", n: 0},
        {data: "2022-10-29", sentiment: "neutrale", n: 4},
        {data: "2022-10-30", sentiment: "neutrale", n: 14},
        {data: "2022-05-12", sentiment: "negativo", n: 1},
        {data: "2022-06-11", sentiment: "negativo", n: 6},
        {data: "2022-08-12", sentiment: "negativo", n: 3},
        {data: "2022-08-27", sentiment: "negativo", n: 11},
        {data: "2022-09-29", sentiment: "negativo", n: 10},
        {data: "2022-10-29", sentiment: "negativo", n: 0},
        {data: "2022-10-30", sentiment: "negativo", n: 0}
    ];

    const darsenaLineMargin = {top: 10, right: 10, bottom: 20, left: 30};
    const darsenaLineSvg = d3.select("#darsena_linechart").append("svg").attr("id", "darsena_line_svg").append("g").attr("id", "darsena_line_g");
    const darsenaLineGroupData = d3.nest().key(d => d.sentiment).entries(darsenaLineData);
    
    const darsenaLineColor = d3.scaleOrdinal().domain(darsenaLineGroupData.map(d => d.key)).range(["#1A85FF", "#ECE839", "#D41159"]);
    const darsenaLineStyle = d3.scaleOrdinal().domain(darsenaLineGroupData.map(d => d.key)).range(["solid", "dashed", "dotted"]);
    
    const darsenaLineTooltip = d3.select("#darsena_linechart").append("div")
    .style("opacity", 0).attr("class", "tooltip").style("background-color", "white")
    .style("border", "solid").style("border-width", "2px").style("border-radius", "5px").style("padding", "5px");

    const darsenaLineLegendSvg = d3.select("#darsena_linechart_legend").append("svg").attr("id", "linechart_legend_svg").append("g").attr("id", "linechart_legend_g");


    adaptDarsenaCharts();

    $(window).resize(function() {
        adaptDarsenaCharts();
    });

    function adaptDarsenaCharts() {

        // PIECHART
        let containerWidth = Math.floor($("#darsena_piechart").width());
        const currentDimension = containerWidth <= 380 ? containerWidth : 380;  //380 -> grandezza default del grafico
        const darsenaPieRadius = currentDimension / 2 - 10;  //10 -> un po' di margine
        const darsenaPieArcGenerator = d3.arc().innerRadius(0).outerRadius(darsenaPieRadius);

        //sistemo le dimensioni del pie chart
        $("#darsena_pie_svg").attr("width", currentDimension).attr("height", currentDimension);
        $("#darsena_pie_g").attr("transform", "translate(" + currentDimension / 2 + "," + currentDimension / 2 + ")")
        .children().remove("path").remove("text");

        //aggiungo il piechart
        darsenaPieSvg.selectAll("pieSlices").data(darsenaPieDataReady).enter().append("path")
        .attr("d", darsenaPieArcGenerator).attr("fill", d => darsenaPieColor(d.data.key)).attr("stroke", "black")
        .style("stroke-width", "2px").style("opacity", 0.8)
        .on("mouseover", darsenaPieMouseover).on("mousemove", darsenaPieMousemove).on("mouseleave", darsenaPieMouseleave);

        //aggiungo i label (emoji)
        darsenaPieSvg.selectAll("pieSlices").data(darsenaPieDataReady).enter().append("text")
        .text(function(d) {
            if (d.data.key == "positivo" && d.value != 0) {
                return "\uF327";
            } else if (d.data.key == "neutrale" && d.value != 0) {
                return "\uF323";
            } else if (d.data.key == "negativo" && d.value != 0) {
                return "\uF31D";
            }
        })
        .attr("transform", d => "translate(" + darsenaPieArcGenerator.centroid(d) + ")")
        .style("text-anchor", "middle").style("font-size", 29)
        .on("mouseover", darsenaPieMouseover).on("mousemove", darsenaPieMousemove).on("mouseleave", darsenaPieMouseleave);


        // LINECHART
        containerWidth = Math.floor($("#darsena_linechart").width()) - (darsenaLineMargin.left + darsenaLineMargin.right);
        const darsenaLineWidth = containerWidth <= 750 ? containerWidth : 750;
        const darsenaLineHeight = currentDimension - (darsenaLineMargin.top + darsenaLineMargin.bottom);

        $("#darsena_line_svg").attr("width", darsenaLineWidth + darsenaLineMargin.left + darsenaLineMargin.right).attr("height", darsenaLineHeight + darsenaLineMargin.top + darsenaLineMargin.bottom);
        $("#darsena_line_g").attr("transform", "translate(" + darsenaLineMargin.left + "," + darsenaLineMargin.top + ")")
        .children().remove("g").remove("path");

        const darsenaLineX = d3.scaleTime().domain(d3.extent(darsenaLineData, d => new Date(d.data))).range([0, darsenaLineWidth]);
        darsenaLineSvg.append("g").attr("transform", "translate(0," + darsenaLineHeight + ")").call(d3.axisBottom(darsenaLineX).tickFormat(d3.timeFormat("%Y-%m")));

        const darsenaLineY = d3.scaleLinear().domain([0, d3.max(darsenaLineData, d => d.n)]).range([darsenaLineHeight, 0]);
        darsenaLineSvg.append("g").call(d3.axisLeft(darsenaLineY));

        darsenaLineSvg.selectAll(".line").data(darsenaLineGroupData).enter().append("path")
        .attr("fill", "none").attr("stroke", d => darsenaLineColor(d.key)).attr("stroke-width", 2.5).attr("class", d => darsenaLineStyle(d.key))
        .attr("d", d => d3.line().x(d => darsenaLineX(new Date(d.data))).y(d => darsenaLineY(d.n))(d.values));

        //eventi tooltip linechart
        const darsenaLineMouseover = function() {
            $(".tooltip").show();
            d3.select(".mouse-line").style("opacity", "1");
            d3.selectAll(".mouse-per-line circle").style("opacity", "1");
        }

        const darsenaLineMousemove = function() {
            const date = d3.timeFormat("%Y-%m-%d")(darsenaLineX.invert(d3.mouse(this)[0]));
            const bisect = d3.bisector(d => d.data).left;
            
            d3.selectAll(".mouse-per-line").attr("transform", function(d) {

                d3.select(".mouse-line")
                .attr("x1", darsenaLineX(new Date(d.values[bisect(d.values, date)].data)))
                .attr("x2", darsenaLineX(new Date(d.values[bisect(d.values, date)].data)))
                .attr("y1", 0).attr("y2", darsenaLineHeight);

                darsenaLineTooltip.html("<div class='fw-bold'>" + date + "</div>")
                .style("opacity", 1).style("left", d3.event.pageX + 16 + "px").style("top", d3.event.pageY - 45 + "px")
                .selectAll().data(darsenaLineGroupData).enter().append("div")
                .html(d.values[bisect(d.values, date)].data == date ? e => (e.key + ": " + e.values.find(h => h.data == date).n) : "");

                return "translate(" + darsenaLineX(new Date(d.values[bisect(d.values, date)].data)) + "," + darsenaLineY(new Date(d.values[bisect(d.values, date)].n)) +")";
            
            });
        };
        
        const darsenaLineMouseout = function() {
            $(".tooltip").hide();
            darsenaLineTooltip.style("opacity", 0);
            d3.select(".mouse-line").style("opacity", 0);
            d3.selectAll(".mouse-per-line circle").style("opacity", 0);
        };

        //si crea un rettangolo nel grafico su cui vengono mostrati il tooltip, la linea del tempo e i cerchietti delle coordinate
        const darsenaLineMouseSpace = darsenaLineSvg.append("g");

        darsenaLineMouseSpace.append("line").attr("class", "mouse-line").style("stroke", "#BFBFBF").style("stroke-width", "2px").style("opacity", "0");

        darsenaLineMouseSpace.selectAll(".mouse-per-line").data(darsenaLineGroupData).enter().append("g").attr("class", "mouse-per-line")
        .append("circle").attr("r", 4).style("stroke", d => darsenaLineColor(d.key)).style("fill", "none").style("stroke-width", "2px").style("opacity", "0");

        darsenaLineMouseSpace.append("rect").attr("width", darsenaLineWidth + 4).attr("height", darsenaLineHeight).attr("fill", "none")
        .attr("pointer-events", "all").on("mouseover", darsenaLineMouseover).on("mousemove", darsenaLineMousemove).on("mouseout", darsenaLineMouseout);

        //legenda linechart
        const darsenaLineLegendWidth = containerWidth <= 450 ? 130 : 450;
        const darsenaLineLegendHeight = darsenaLineLegendWidth === 450 ? 30 : 75;

        $("#linechart_legend_svg").attr("width", darsenaLineLegendWidth).attr("height", darsenaLineLegendHeight);
        $("#linechart_legend_g").children().remove("line").remove("text");

        //lineette legenda
        darsenaLineLegendSvg.selectAll("lineDesc").data(darsenaLineGroupData).enter().append("line")
        .style("stroke", d => darsenaPieColor(d.key)).style("stroke-width", 4).attr("class", d => darsenaLineStyle(d.key))
        .attr("x1", (d, i) => darsenaLineLegendWidth === 450 ?  i * 150 : 0)
        .attr("y1", (d, i) => darsenaLineLegendHeight === 30 ? 9 : 9 + (i * 25))
        .attr("x2", (d, i) => darsenaLineLegendWidth === 450 ? (i * 150) + 60 : 60)
        .attr("y2", (d, i) => darsenaLineLegendHeight === 30 ? 9 : 9 + (i * 25));

        //testo della legenda
        darsenaLineLegendSvg.selectAll("pieDesc").data(darsenaLineGroupData).enter().append("text")
        .text(d => d.key).style("font-family", "system-ui").style("font-size", "16px")
        .attr("x", (d, i) => darsenaLineLegendWidth === 450 ? 64 + (i * 150) : 64)
        .attr("y", (d, i) => darsenaLineLegendHeight === 30 ? 12 : 12 + (i * 25));


        //legenda linechart -> aggiungere ai remove -> .remove("text")
        //const darsenaLineLegendPos = [];  // lista con tutte le posizioni dei label della legenda, cosi non si avranno sovrapposizioni
        //
        //darsenaLineSvg.selectAll(".legend-item").data(darsenaLineGroupData).enter().append("text")
        //.attr("class", "legend-item").text(d => d.key).attr("fill", d => darsenaLineColor(d.key)).attr("font-size", 14).attr("font-weight", "bold")
        //.attr("alignment-baseline", "middle").attr("x", darsenaLineWidth).attr("dx", "5px")
        //.attr("y", function(d) {
        //    let yPos = darsenaLineY(d.values[d.values.length-1].n);
        //    
        //    while (darsenaLineLegendPos.includes(yPos)) {
        //        yPos -= 18;
        //    }
        //    
        //    darsenaLineLegendPos.push(yPos);
        //    return yPos;
        //});

    }

});