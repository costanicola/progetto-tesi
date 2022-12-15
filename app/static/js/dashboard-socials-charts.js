$(document).ready(function() {

    // PIECHART
    const pieData = JSON5.parse($("#social_piechart").attr("data"));
    const pieChart = new PieChart(pieData, "#social_piechart");

    pieChart.drawPieChartLegendHorizontal("#social_piechart_legend");

    pieChart.getDataTotal() == 0 ? $("#social_piechart, #social_piechart_legend").hide() : $("#social_piechart_no_data_display").hide();

    // BARPLOT
    const barData = JSON5.parse($("#social_barplot").attr("data"));
    const barMargin = {top: 25, right: 35, bottom: 30, left: 35};
    const barColor = d3.scaleOrdinal().domain(barData).range(["#BC2A8D", "#4267B2"]);
    const barSvg = d3.select("#social_barplot").append("svg").attr("id", "social_barplot_svg").append("g").attr("id", "social_barplot_g");

    if (barData.length != 0) {
        $("#social_barplot_no_data_display").hide();
        adaptDashboardSocialCharts();
    } else {
        $("#social_barplot").hide();
    }

    $(window).resize(function() {
        if (barData.length != 0 && pieChart.getDataTotal() != 0) {
            adaptDashboardSocialCharts();
        }
    });

    function adaptDashboardSocialCharts() {

        // PIECHART
        const pieContainerWidth = Math.floor($("#social_piechart").width());
        const currentDimension = pieContainerWidth <= 250 ? pieContainerWidth : 250;
        pieChart.drawPieChart(currentDimension);

        // BARPLOT
        const barContainerWidth = Math.floor($("#social_barplot").width()) - (barMargin.left + barMargin.right);
        const barWidth = barContainerWidth <= 350 ? barContainerWidth : 350;
        const barHeight = 270 - (barMargin.top + barMargin.bottom);

        $("#social_barplot_svg").attr("width", barWidth + barMargin.left + barMargin.right).attr("height", barHeight + barMargin.top + barMargin.bottom);
        $("#social_barplot_g").attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")")
        .children().remove("rect").remove("g").remove("text");

        const barX = d3.scaleBand().range([0, barWidth]).domain(barData.map(d => d.socialName)).padding(0.4);
        barSvg.append("g").attr("transform", "translate(0," + barHeight + ")")
        .call(d3.axisBottom(barX)).selectAll("text").attr("transform", "translate(0, 0)")
        .style("text-anchor", "middle").style("text-transform", "uppercase").style("font-size", 12);

        const barY = d3.scaleLinear().domain([0, (1.1 * d3.max(barData.map(d => d.nKeywords)))]).range([barHeight, 0]);

        barSvg.selectAll("mybar").data(barData).enter().append("text")
        .text(d => d.nKeywords).attr("transform", d => "translate(" + (barX(d.socialName) + (barX.bandwidth() / 2)) + "," + (barY(d.nKeywords) - 10) + ")")
        .attr("text-anchor", "middle").style("font-size", 15);

        barSvg.selectAll("mybar").data(barData).enter().append("rect")
        .attr("x", d => barX(d.socialName)).attr("y", d => barY(d.nKeywords))
        .attr("width", barX.bandwidth()).attr("height", d => barHeight - barY(d.nKeywords)).attr("fill", d => barColor(d.socialName));

    }

});