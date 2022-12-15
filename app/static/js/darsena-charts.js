$(document).ready(function() {

    // PIECHART DARSENA
    const darsenaPieData = JSON5.parse($("#darsena_piechart").attr("data"));
    const pieChart = new PieChart(darsenaPieData, "#darsena_piechart");

    pieChart.drawPieChartLegendHorizontal("#darsena_piechart_legend");

    //se non ci sono dati non mostro legenda e pie
    pieChart.getDataTotal() == 0 ? $("#darsena_piechart, #darsena_piechart_legend, #darsena_linechart, #darsena_linechart_legend").hide() : $(".no-data-display").hide();
    
    // LINECHART DARSENA
    const darsenaLineData = JSON5.parse($("#darsena_linechart").attr("data"));
    const lineChart = new LineChart(darsenaLineData, "#darsena_linechart", "#darsena_linechart_legend");
    const darsenaLineMargin = {top: 10, right: 10, bottom: 20, left: 45};
    

    adaptDarsenaCharts();

    $(window).resize(function() {
        adaptDarsenaCharts();
    });

    function adaptDarsenaCharts() {

        // PIECHART
        let containerWidth = Math.floor($("#darsena_piechart").width());
        const currentDimension = containerWidth <= 380 ? containerWidth : 380;  //380 -> grandezza default del grafico
        pieChart.drawPieChart(currentDimension);

        // LINECHART
        containerWidth = Math.floor($("#darsena_linechart").width()) - (darsenaLineMargin.left + darsenaLineMargin.right);
        let darsenaLineWidth = containerWidth <= 750 ? containerWidth : 750;
        let darsenaLineHeight = currentDimension - (darsenaLineMargin.top + darsenaLineMargin.bottom);

        lineChart.drawLineChart(darsenaLineWidth, darsenaLineHeight, darsenaLineMargin);

        //legenda linechart
        const lineLegendWidth = containerWidth <= 450 ? 130 : 450;
        const legendHeight = lineLegendWidth === 450 ? 30 : 75;

        lineChart.drawLineChartResponsiveLegend(lineLegendWidth, legendHeight);

    }

});