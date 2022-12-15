$(document).ready(function() {

    // PIECHART
    const pieData = JSON5.parse($("#ig_piechart").attr("data"));
    const pieChart = new PieChart(pieData, "#ig_piechart");

    pieChart.drawPieChartLegendHorizontal("#ig_piechart_legend");

    // LINECHART
    const lineData = JSON5.parse($("#ig_linechart").attr("data"));
    const lineChart = new LineChart(lineData, "#ig_linechart", "#ig_linechart_legend");
    const lineMargin = {top: 10, right: 10, bottom: 20, left: 45};

    pieChart.getDataTotal() == 0 ? $("#ig_piechart, #ig_piechart_legend, #ig_linechart, #ig_linechart_legend").hide() : $("#ig_piechart_no_data_display, #ig_linechart_no_data_display").hide();

    adaptFacebookCharts();

    $(window).resize(function() {
        adaptFacebookCharts();
    });


    function adaptFacebookCharts() {

        // PIECHART
        const pieContainerWidth = Math.floor($("#ig_piechart").width());
        const currentDimension = pieContainerWidth <= 300 ? pieContainerWidth : 300;
        pieChart.drawPieChart(currentDimension);

        // LINECHART
        containerWidth = Math.floor($("#ig_linechart").width()) - (lineMargin.left + lineMargin.right);
        let lineWidth = containerWidth <= 750 ? containerWidth : 750;
        let lineHeight = currentDimension - (lineMargin.top + lineMargin.bottom);

        lineChart.drawLineChart(lineWidth, lineHeight, lineMargin);

        //legenda linechart
        const lineLegendWidth = containerWidth <= 450 ? 130 : 450;
        const lineLegendHeight = lineLegendWidth == 450 ? 30 : 75;

        lineChart.drawLineChartResponsiveLegend(lineLegendWidth, lineLegendHeight);

    }

});