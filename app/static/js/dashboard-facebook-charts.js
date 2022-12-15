$(document).ready(function() {

    // PIECHART
    const pieData = JSON5.parse($("#fb_piechart").attr("data"));
    const pieChart = new PieChart(pieData, "#fb_piechart");

    pieChart.drawPieChartLegendHorizontal("#fb_piechart_legend");

    // LINECHART
    const lineData = JSON5.parse($("#fb_linechart").attr("data"));
    const lineChart = new LineChart(lineData, "#fb_linechart", "#fb_linechart_legend");
    const lineMargin = {top: 10, right: 10, bottom: 20, left: 45};

    pieChart.getDataTotal() == 0 ? $("#fb_piechart, #fb_piechart_legend, #fb_linechart, #fb_linechart_legend").hide() : $("#fb_piechart_no_data_display, #fb_linechart_no_data_display").hide();


    adaptFacebookCharts();

    $(window).resize(function() {
        adaptFacebookCharts();
    });


    function adaptFacebookCharts() {

        // PIECHART
        let containerWidth = Math.floor($("#fb_piechart").width());
        const currentDimension = containerWidth <= 300 ? containerWidth : 300;
        pieChart.drawPieChart(currentDimension);

        // LINECHART
        containerWidth = Math.floor($("#fb_linechart").width()) - (lineMargin.left + lineMargin.right);
        let lineWidth = containerWidth <= 750 ? containerWidth : 750;
        let lineHeight = currentDimension - (lineMargin.top + lineMargin.bottom);

        lineChart.drawLineChart(lineWidth, lineHeight, lineMargin);

        //legenda linechart
        const lineLegendWidth = containerWidth <= 450 ? 130 : 450;
        const lineLegendHeight = lineLegendWidth == 450 ? 30 : 75;

        lineChart.drawLineChartResponsiveLegend(lineLegendWidth, lineLegendHeight);

    }

});