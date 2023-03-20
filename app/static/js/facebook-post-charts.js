$(document).ready(function() {

    // PIECHART SENTIMENT COMMENTI
    const commentsPieData = JSON5.parse($("#fb_post_comment_piechart").attr("data"));
    const commentsPieChart = new PieChart(commentsPieData, "#fb_post_comment_piechart");

    if (commentsPieChart.getDataTotal() != 0) {
        $("#post_comments_piechart_no_data_display").hide();
        commentsPieChart.drawPieChart(250);
        commentsPieChart.drawPieChartLegendVertical("#fb_post_comment_piechart_legend");
    } else {
        $("#fb_post_comment_piechart, #fb_post_comment_piechart_legend").remove()
    }

    // BARPLOT REAZIONI
    const reactionsBarData = JSON5.parse($("#fb_post_reaction_barchart").attr("data"));
    const reactionsBarMargin = {top: 25, right: 15, bottom: 30, left: 15};
    //const reactionsBarColor = d3.scaleOrdinal(d3.schemeCategory10);
    const reactionsBarSvg = d3.select("#fb_post_reaction_barchart").append("svg").attr("id", "fb_post_barplot_svg").append("g").attr("id", "fb_post_barplot_g");
    
    if (d3.sum(reactionsBarData.map(d => d.n)) != 0) {
        $("#fb_reactions_barplot_no_data_display").hide();
        adaptBarPlot();
    } else {
        $("#fb_post_reaction_barchart").remove();
    }

    $(window).resize(function() {
        if (reactionsBarData.length != 0) {
            adaptBarPlot();
        }
    });

    function adaptBarPlot() {
        
        // BARPLOT
        const barContainerWidth = Math.floor($("#fb_post_reaction_barchart").width()) - (reactionsBarMargin.left + reactionsBarMargin.right);
        const barWidth = barContainerWidth <= 450 ? barContainerWidth : 450;
        const barHeight = 250 - (reactionsBarMargin.top + reactionsBarMargin.bottom);

        $("#fb_post_barplot_svg").attr("width", barWidth + reactionsBarMargin.left + reactionsBarMargin.right).attr("height", barHeight + reactionsBarMargin.top + reactionsBarMargin.bottom);
        $("#fb_post_barplot_g").attr("transform", "translate(" + reactionsBarMargin.left + "," + reactionsBarMargin.top + ")")
        .children().remove("rect").remove("g").remove("text");

        const barX = d3.scaleBand().range([0, barWidth]).domain(reactionsBarData.map(d => d.reaction)).padding(0.4);
        reactionsBarSvg.append("g").attr("transform", "translate(0," + barHeight + ")")
        .call(d3.axisBottom(barX)).selectAll("text").attr("transform", "translate(0, 0)")
        .style("text-anchor", "middle").style("text-transform", "uppercase").style("font-size", 12);
        
        const barY = d3.scaleLinear().domain([0, (1.1 * d3.max(reactionsBarData.map(d => d.n)))]).range([barHeight, 0]);
        
        reactionsBarSvg.selectAll("mybar").data(reactionsBarData).enter().append("text")
        .text(d => d.n).attr("transform", d => "translate(" + (barX(d.reaction) + (barX.bandwidth() / 2)) + "," + (barY(d.n) - 10) + ")")
        .attr("text-anchor", "middle").style("font-size", 15);

        reactionsBarSvg.selectAll("mybar").data(reactionsBarData).enter().append("rect")
        .attr("x", d => barX(d.reaction)).attr("y", d => barY(d.n))
        .attr("width", barX.bandwidth()).attr("height", d => barHeight - barY(d.n));//.attr("fill", d => reactionsBarColor(d.reaction));

    }

});