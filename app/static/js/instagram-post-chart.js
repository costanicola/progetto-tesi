$(document).ready(function() {

    // PIECHART
    const pieData = JSON5.parse($("#ig_post_comment_piechart").attr("data"));
    const pieChart = new PieChart(pieData, "#ig_post_comment_piechart");

    if (pieChart.getDataTotal() != 0) {
        $("#post_comments_piechart_no_data_display").hide();
        pieChart.drawPieChart(250);
        pieChart.drawPieChartLegendVertical("#ig_post_comment_piechart_legend");
    } else {
        $("#ig_post_comment_piechart, #ig_post_comment_piechart_legend").remove()
    }

});