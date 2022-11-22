$(document).ready(function() {

    const keywordData = JSON5.parse($("#keywords_wordcloud").attr("data"));
    
    // WORDCLOUD PAROLE CHIAVE
    const wordcloudMargin = {top: 10, right: 10, bottom: 10, left: 10};
    const wordcloudSvg = d3.select("#keywords_wordcloud").append("svg").attr("id", "wordcloud_svg").append("g").attr("id", "wordcloud_g");
    const wordcloudFillColor = d3.scaleOrdinal(d3.schemeCategory10);
    const wordcloudScaleValue = d3.scaleLinear().domain([0, d3.max(keywordData, d => (d.totalPositives + d.totalNeutrals + d.totalNegatives))]).range([12, 73]);

    //tooltip
    const wordcloudTooltip = d3.select("#keywords_wordcloud").append("div")
    .style("opacity", 0).attr("class", "tooltip").style("background-color", "white")
    .style("border", "solid").style("border-width", "2px").style("border-radius", "5px").style("padding", "5px");

    const wordcloudMouseover = function(d) {
        $(".tooltip").show();
        wordcloudTooltip.style("opacity", 1);
        d3.select(this).style("opacity", 1);
    };
    
    const wordcloudMousemove = function(d) {
        let sum = d.npos + d.nneu + d.nneg;
        wordcloudTooltip.html(`
            <div class="text-uppercase fw-bold fs-5 mx-2">${d.text}</div>
            <div class="my-1 mx-2">Totale occorrenze nelle analisi: <span class="fw-bold">${sum}</span></div>
            <ul class="mb-1">
                <li>Di cui positive: <span class="fw-bold">${d.npos} (${sum !== 0 ? d3.format(".0%")(d.npos / sum) : 0})</span></li>
                <li>Di cui neutrali: <span class="fw-bold">${d.nneu} (${sum !== 0 ? d3.format(".0%")(d.nneu / sum) : 0})</span></li>
                <li>Di cui negative: <span class="fw-bold">${d.nneg} (${sum !== 0 ? d3.format(".0%")(d.nneg / sum) : 0})</span></li>
            </ul>
        `).style("left", d3.event.pageX + 75 + "px").style("top", d3.event.pageY - 75 + "px");
    };
    
    const wordcloudMouseleave = function(d) {
        $(".tooltip").hide();
        wordcloudTooltip.style("opacity", 0);
        d3.select(this).style("opacity", 0.8);
    };


    adaptWordcloudChart();

    $(window).resize(function() {
        adaptWordcloudChart();
    });

    function adaptWordcloudChart() {

        const currentWidth = Math.floor($("#keywords_wordcloud").width());
        const currentHeight = 450;

        $("#wordcloud_svg").attr("width", currentWidth).attr("height", currentHeight);
        $("#wordcloud_g").attr("transform", "translate(" + wordcloudMargin.left + "," + wordcloudMargin.top + ")").children().remove("g");

        const wordcloudLayout = d3.layout.cloud().size([currentWidth, currentHeight])
        .words(keywordData.map(function(d) {
            return {text: d.keywordName, size: (d.totalPositives + d.totalNeutrals + d.totalNegatives), npos: d.totalPositives, nneu: d.totalNeutrals, nneg: d.totalNegatives};
        }))
        .padding(25).spiral("rectangular").rotate(0).fontSize(d => wordcloudScaleValue(d.size)).on("end", drawWordcloud);

        wordcloudLayout.start();

        function drawWordcloud(words) {
            wordcloudSvg.append("g").attr("transform", "translate(" + wordcloudLayout.size()[0] / 2 + "," + wordcloudLayout.size()[1] / 2 + ")")
            .selectAll("text").data(words).enter().append("text").style("font-size", d => d.size).style("fill", (d, i) => wordcloudFillColor(i))
            .style("opacity", 0.8).attr("text-anchor", "middle").style("font-family", "Impact")
            .attr("transform", d => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")").text(d => d.text)
            .on("mouseover", wordcloudMouseover).on("mousemove", wordcloudMousemove).on("mouseleave", wordcloudMouseleave);
        }

    }


    // LISTA DELLE PAROLE CHIAVE
    for (const k in keywordData) {

        if (keywordData.hasOwnProperty(k)) {
            const categoryId = keywordData[k]["categoryId"];
            const categoryName = keywordData[k]["categoryName"];
            const keywordId = keywordData[k]["keywordId"];
            const keywordName = keywordData[k]["keywordName"];

            //ogni parola chiave ha un "vedi dettaglio" cliccabile. al click si apre un modal con piechart (cambiabile con una tabella) e un linechart
            $("#keywords_list_cat" + categoryId).append(`
                <div class="modal fade" id="keyword_${keywordId}_modal" tabindex="-1" aria-labelledby="${keywordId}_title" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-xl">
                        <div class="modal-content border">
                            <div class="row justify-content-center">
                                <div class="col-11 text-center">
                                    <div class="row mt-3">
                                        <div class="col-12">
                                            <p class="fw-bold mb-0 fs-5 text-uppercase" id="${keywordId}_title">${keywordName}</p>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-12">
                                            <p class="mb-0 text-secondary text-uppercase">${categoryName}</p>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-12">
                                            <p class="mb-0 mt-2 text-secondary fst-italic" id="keyword_${keywordId}_synonyms_list"></p>
                                        </div>
                                    </div>
                                    <hr class="mx-3 my-4" />
                                    <div class="row mt-3">
                                        <!--piechart/tabella-->
                                        <div class="col-12 col-lg-6">
                                            <div class="row">
                                                <div class="col-12">
                                                    <div class="form-check form-check-inline pe-2">
                                                        <input class="form-check-input" type="radio" name="keyword_${keywordId}_chart_table" id="keyword_${keywordId}_chart_radio" value="keyword_${keywordId}_chart_radio" checked />
                                                        <label class="form-check-label" for="keyword_${keywordId}_chart_radio">Grafico</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input" type="radio" name="keyword_${keywordId}_chart_table" id="keyword_${keywordId}_table_radio" value="keyword_${keywordId}_table_radio" />
                                                        <label class="form-check-label" for="keyword_${keywordId}_table_radio">Tabella</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row mt-4" id="keyword_${keywordId}_pie_viz">
                                                <div class="col-12">
                                                    <div class="row">
                                                        <div class="col-12" id="keyword_${keywordId}_piechart_legend"></div>

                                                        <div class="col-12" id="keyword_${keywordId}_piechart"></div>
                    
                                                        <div class="fst-italic text-secondary" id="keyword_${keywordId}_piechart_no_data_dispay">
                                                            Ancora nessun dato da visualizzare...
                                                        </div>
                                                    </div>
                                                    <div class="row mt-4 justify-content-center">
                                                        <div class="col-6">
                                                            <select name="keyword_${keywordId}_piechart_selector" id="keyword_${keywordId}_piechart_selector" class="form-select text-uppercase py-1">
                                                                <option value="total">totale</option>
                                                                <option value="facebook">facebook</option>
                                                                <option value="instagram">instagram</option>
                                                                <option value="document">documenti darsena</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row mt-4 justify-content-center" id="keyword_${keywordId}_table_viz">
                                                <div class="col-10">
                                                    <table class="table table-sm align-middle">
                                                        <thead>
                                                            <tr>
                                                                <th id="keyword_${keywordId}_table_th" scope="col"></th>
                                                                <th id="keyword_${keywordId}_table_pos" scope="col">N° positivi</th>
                                                                <th id="keyword_${keywordId}_table_neu" scope="col">N° neutrali</th>
                                                                <th id="keyword_${keywordId}_table_neg" scope="col">N° negativi</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <th id="keyword_${keywordId}_table_facebook" headers="keyword_${keywordId}_table_th" scope="row">Facebook</th>
                                                                <td headers="keyword_${keywordId}_table_pos keyword_${keywordId}_table_facebook"></td>
                                                                <td headers="keyword_${keywordId}_table_neu keyword_${keywordId}_table_facebook"></td>
                                                                <td headers="keyword_${keywordId}_table_neg keyword_${keywordId}_table_facebook"></td>
                                                            </tr>
                                                            <tr>
                                                                <th id="keyword_${keywordId}_table_instagram" headers="keyword_${keywordId}_table_th" scope="row">Instagram</th>
                                                                <td headers="keyword_${keywordId}_table_pos keyword_${keywordId}_table_instagram"></td>
                                                                <td headers="keyword_${keywordId}_table_neu keyword_${keywordId}_table_instagram"></td>
                                                                <td headers="keyword_${keywordId}_table_neg keyword_${keywordId}_table_instagram"></td>
                                                            </tr>
                                                            <tr>
                                                                <th id="keyword_${keywordId}_table_document" headers="keyword_${keywordId}_table_th" scope="row">Documenti</th>
                                                                <td headers="keyword_${keywordId}_table_pos keyword_${keywordId}_table_document"></td>
                                                                <td headers="keyword_${keywordId}_table_neu keyword_${keywordId}_table_document"></td>
                                                                <td headers="keyword_${keywordId}_table_neg keyword_${keywordId}_table_document"></td>
                                                            </tr>
                                                        </tbody>
                                                        <tfoot>
                                                            <tr>
                                                                <th id="keyword_${keywordId}_table_total" headers="keyword_${keywordId}_table_th" scope="row">Totale</th>
                                                                <td headers="keyword_${keywordId}_table_pos keyword_${keywordId}_table_total" class="fw-bold"></td>
                                                                <td headers="keyword_${keywordId}_table_neu keyword_${keywordId}_table_total" class="fw-bold"></td>
                                                                <td headers="keyword_${keywordId}_table_neg keyword_${keywordId}_table_total" class="fw-bold"></td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        <hr class="d-lg-none mt-5 mb-3" />
                                        <!--linechart-->
                                        <div class="col-12 col-lg-6">
                                            <div class="row mt-4">
                                                <div class="col-12" id="keyword_${keywordId}_linechart_legend"></div>

                                                <div class="col-12 p-0" id="keyword_${keywordId}_linechart"></div>
        
                                                <div class="fst-italic text-secondary" id="keyword_${keywordId}_linechart_no_data_dispay">
                                                    Ancora nessun dato da visualizzare...
                                                </div>
                                            </div>
                                            <div class="row mt-4 justify-content-center">
                                                <div class="col-6">
                                                    <select name="keyword_${keywordId}_linechart_selector" id="keyword_${keywordId}_linechart_selector" class="form-select text-uppercase py-1">
                                                        <option value="grouped">raggruppato</option>
                                                        <option value="single">suddiviso</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row my-4">
                                        <div class="col-12 text-end">
                                            <button class="btn btn-outline-dark me-3" data-bs-dismiss="modal">Chiudi</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col keyword-box m-3 mx-4 d-flex align-content-center flex-wrap flex-column justify-content-center">
                    <div class="row">
                        <div class="col">
                            <p class="m-0 text-uppercase fw-bold fs-5">${keywordName}</p>
                        </div>
                    </div>
                    <div class="row mt-1">
                        <div class="col">
                            <a class="text-decoration-none text-secondary" href="#keyword_${keywordId}_modal" data-bs-toggle="modal" data-bs-target="#keyword_${keywordId}_modal" id="keyword_${keywordId}_detail_link">vedi dettagli ></a>
                        </div>
                    </div>
                </div>
            `);

            // EVENTO DEL RADIOBUTTON GRAFICO <=> TABELLA
            const pieViz = $("#keyword_" + keywordId + "_pie_viz").show();
            const tableViz = $("#keyword_" + keywordId + "_table_viz").hide();
            $(`input[name="keyword_${keywordId}_chart_table"]`).change(function() {
                if ($(this).attr("value").indexOf("table") != -1) {
                    pieViz.hide();
                    tableViz.show();
                } else {
                    pieViz.show();
                    tableViz.hide();
                }
            });

            //ajax con cui si prelevano i dati e si disegnano i grafici
            $("#keyword_" + keywordId + "_detail_link").click(function() {
                $.ajax({
                    type: "POST",
                    url: "/dashboard-keywords/keyword-" + keywordId,
                    data: {},
                    success: function(response) {
                        const totalPieData = response["total_piechart"];  //dati per il piechart totale
                        const facebookPieData = response["facebook_piechart"];  //dati per il piechart solo di facebook
                        const instagramPieData = response["instagram_piechart"];  //dati per il piechart solo di instagram
                        const documentPieData = response["document_piechart"];  //dati per il piechart solo dei documenti
                        const dividedLineData = response["single_linechart"];  //dati per il linechart suddiviso nei 3 sentiment
                        const totalLineData = response["total_linechart"];  //dati per il linechart con i 3 sentiment riuniti
                        const keywordSynonyms = response["synonyms"];  //lista di sinonimi della parola chiave
                        
                        // SINONIMI PAROLA CHIAVE
                        if (keywordSynonyms.length != 0) {
                            let synonyms = "";
                        
                            for (ks in keywordSynonyms) {
                                if (keywordSynonyms.hasOwnProperty(ks)) {
                                    synonyms += keywordSynonyms[ks] + (ks != (keywordSynonyms.length - 1) ? ", " : "");
                                }
                            }
                            $("#keyword_" + keywordId + "_synonyms_list").html(`Parole simili considerate nella ricerca: <span class="fw-bold">${synonyms}</span>`);
                        }

                        // PIECHART PAROLA CHIAVE
                        $("#keyword_" + keywordId + "_piechart").children().remove();
                        $("#keyword_" + keywordId + "_piechart_legend").children().remove();

                        //dimensioni, colori e svg piechart
                        const pieDimensions = 240;
                        const pieRadius = pieDimensions / 2 - 10;  //10 -> un po' di margine
                        const pieArcGenerator = d3.arc().innerRadius(0).outerRadius(pieRadius);
                        const pieColor = d3.scaleOrdinal().range(["#D41159", "#ECE839", "#1A85FF"]);
                        const pieSvg = d3.select("#keyword_" + keywordId + "_piechart").append("svg").attr("width", pieDimensions).attr("height", pieDimensions)
                        .append("g").attr("transform", "translate(" + pieDimensions / 2 + "," + pieDimensions / 2 + ")").attr("id", "keyword_" + keywordId + "_pie_g");
                        
                        //legenda piechart
                        const pieLegendSvg = d3.select("#keyword_" + keywordId + "_piechart_legend").append("svg").attr("width", 275).attr("height", 30).append("g").attr("transform", "translate(0,0)").attr("id", "keyword_" + keywordId + "_piechart_legend_g");

                        updatePie(getPieSelectedData());

                        $("#keyword_" + keywordId + "_piechart_selector").change(function() {
                            updatePie(getPieSelectedData());
                        });


                        function getPieSelectedData() {
                            const selectedData = $("#keyword_" + keywordId + "_piechart_selector option:selected").val();
                            return selectedData === "total" ? totalPieData : selectedData === "facebook" ? facebookPieData : selectedData === "instagram" ? instagramPieData : documentPieData;
                        }

                        function updatePie(data) {
                            $("#keyword_" + keywordId + "_piechart, #keyword_" + keywordId + "_piechart_legend").show();
                            $("#keyword_" + keywordId + "_piechart_no_data_dispay").show();

                            if (data != null) {
                                const totalPieDataTotal = d3.sum(d3.values(data));

                                if (totalPieDataTotal != 0) {
                                    $("#keyword_" + keywordId + "_piechart_no_data_dispay").hide();
                                    $("#keyword_" + keywordId + "_pie_g").children().remove();
                                    $("#keyword_" + keywordId + "_piechart_legend_g").children().remove();

                                    const pie = d3.pie().value(d => d.value);
                                    const pieDataReady = pie(d3.entries(data));

                                    //aggiungo il piechart
                                    pieSvg.selectAll("pieSlices").data(pieDataReady).enter().append("path")
                                    .attr("d", pieArcGenerator).attr("fill", d => pieColor(d.data.key)).attr("stroke", "black").style("stroke-width", "2px").style("opacity", 0.8);

                                    //testo degli spicchi
                                    pieSvg.selectAll("pieSlices").data(pieDataReady).enter().append("text")
                                    .text(function(d) {
                                        if (d.data.key == "positivi" && d.value != 0) {
                                            return d3.format(".0%")(d.value / totalPieDataTotal);
                                        } else if (d.data.key == "neutrali" && d.value != 0) {
                                            return d3.format(".0%")(d.value / totalPieDataTotal);
                                        } else if (d.data.key == "negativi" && d.value != 0) {
                                            return d3.format(".0%")(d.value / totalPieDataTotal);
                                        }
                                    })
                                    .attr("transform", d => "translate(" + pieArcGenerator.centroid(d) + ")")
                                    .style("text-anchor", "middle").style("font-size", 17);

                                    //quadratini legenda
                                    pieLegendSvg.selectAll("pieDesc").data(pieDataReady).enter().append("rect")
                                    .attr("x", d => d.index * 94).attr("width", 14).attr("height", 14).attr("fill", d => pieColor(d.index));

                                    //testo della legenda
                                    pieLegendSvg.selectAll("pieDesc").data(pieDataReady).enter().append("text")
                                    .text(d => d.data.key).attr("x", d => 18 + (d.index * 94)).attr("y", 12)
                                    .style("font-family", "system-ui").style("font-size", "16px");

                                } else {
                                    $("#keyword_" + keywordId + "_piechart, #keyword_" + keywordId + "_piechart_legend").hide();
                                }

                            } else {
                                $("#keyword_" + keywordId + "_piechart, #keyword_" + keywordId + "_piechart_legend").hide();
                            }
                            
                        }

                        // RIEMPIMENTO TABELLA
                        $(`td[headers="keyword_${keywordId}_table_pos keyword_${keywordId}_table_facebook"]`).text(() => facebookPieData == null ? 0 : facebookPieData["positivi"]);
                        $(`td[headers="keyword_${keywordId}_table_neu keyword_${keywordId}_table_facebook"]`).text(() => facebookPieData == null ? 0 : facebookPieData["neutrali"]);
                        $(`td[headers="keyword_${keywordId}_table_neg keyword_${keywordId}_table_facebook"]`).text(() => facebookPieData == null ? 0 : facebookPieData["negativi"]);

                        $(`td[headers="keyword_${keywordId}_table_pos keyword_${keywordId}_table_instagram"]`).text(() => instagramPieData == null ? 0 : instagramPieData["positivi"]);
                        $(`td[headers="keyword_${keywordId}_table_neu keyword_${keywordId}_table_instagram"]`).text(() => instagramPieData == null ? 0 : instagramPieData["neutrali"]);
                        $(`td[headers="keyword_${keywordId}_table_neg keyword_${keywordId}_table_instagram"]`).text(() => instagramPieData == null ? 0 : instagramPieData["negativi"]);

                        $(`td[headers="keyword_${keywordId}_table_pos keyword_${keywordId}_table_document"]`).text(() => documentPieData == null ? 0 : documentPieData["positivi"]);
                        $(`td[headers="keyword_${keywordId}_table_neu keyword_${keywordId}_table_document"]`).text(() => documentPieData == null ? 0 : documentPieData["neutrali"]);
                        $(`td[headers="keyword_${keywordId}_table_neg keyword_${keywordId}_table_document"]`).text(() => documentPieData == null ? 0 : documentPieData["negativi"]);

                        $(`td[headers="keyword_${keywordId}_table_pos keyword_${keywordId}_table_total"]`).text(() => totalPieData == null ? 0 : totalPieData["positivi"]);
                        $(`td[headers="keyword_${keywordId}_table_neu keyword_${keywordId}_table_total"]`).text(() =>  totalPieData == null ? 0 : totalPieData["neutrali"]);
                        $(`td[headers="keyword_${keywordId}_table_neg keyword_${keywordId}_table_total"]`).text(() =>  totalPieData == null ? 0 : totalPieData["negativi"]);

                        // LINECHART PAROLA CHIAVE
                        $("#keyword_" + keywordId + "_linechart").children().remove();
                        $("#keyword_" + keywordId + "_linechart_legend").children().remove();

                        const lineMargin = {top: 10, right: 10, bottom: 20, left: 30};
                        const lineWidth = 310;
                        const lineHeight = pieDimensions;
                        const lineSvg = d3.select("#keyword_" + keywordId +"_linechart").append("svg").attr("width", lineWidth + (lineMargin.left + lineMargin.right)).attr("height", lineHeight + (lineMargin.top + lineMargin.bottom))
                        .append("g").attr("transform", "translate(" + lineMargin.left + "," + lineMargin.top + ")").attr("id", "keyword_" + keywordId + "_line_g");

                        const lineLegendSvg = d3.select("#keyword_" + keywordId + "_linechart_legend").append("svg").attr("width", 310).attr("height", 30)
                        .append("g").attr("id", "keyword_" + keywordId + "_linechart_legend_g");

                        updateLine(getLineSelectedData());

                        $("#keyword_" + keywordId + "_linechart_selector").change(function() {
                            updateLine(getLineSelectedData());
                        });


                        function getLineSelectedData() {
                            return $("#keyword_" + keywordId + "_linechart_selector option:selected").val();
                        }

                        function updateLine(selectedData) {
                            $("#keyword_" + keywordId + "_linechart, #keyword_" + keywordId + "_linechart_legend").show();
                            $("#keyword_" + keywordId + "_linechart_no_data_dispay").show();

                            if (totalLineData.length > 1) {
                                $("#keyword_" + keywordId + "_linechart_no_data_dispay").hide();
                                $("#keyword_" + keywordId + "_line_g").children().remove();
                                $("#keyword_" + keywordId + "_linechart_legend_g").children().remove();

                                if (selectedData == "grouped") {
                                    const lineGroupData = d3.nest().key(d => d.sentiment).entries(totalLineData);
    
                                    const lineX = d3.scaleTime().domain(d3.extent(totalLineData, d => new Date(d.date))).range([0, lineWidth]);
                                    lineSvg.append("g").attr("transform", "translate(0," + lineHeight + ")").call(d3.axisBottom(lineX).tickFormat(d3.timeFormat("%Y-%m-%d")).ticks(3));
    
                                    const lineY = d3.scaleLinear().domain([0, d3.max(totalLineData, d => d.n)]).range([lineHeight, 0]);
                                    lineSvg.append("g").call(d3.axisLeft(lineY));
    
                                    lineSvg.append("path").data(lineGroupData).attr("fill", "none").attr("stroke", "green").attr("stroke-width", 2.5)
                                    .attr("d", d => d3.line().x(d => lineX(new Date(d.date))).y(d => lineY(d.n))(d.values));
    
                                    lineLegendSvg.append("line").style("stroke","green").style("stroke-width", 3)
                                    .attr("x1", 25).attr("y1", 9).attr("x2", 85).attr("y2", 9);
    
                                    lineLegendSvg.append("text").text("Trend della parola chiave")
                                    .style("font-family", "system-ui").style("font-size", "16px").attr("x", 90).attr("y", 12);

                                } else {
                                    const lineGroupData = d3.nest().key(d => d.sentiment).entries(dividedLineData);
                                    const lineColor = d3.scaleOrdinal().domain(lineGroupData.map(d => d.key)).range(["#1A85FF", "#ECE839", "#D41159"]);
                                    const lineStyle = d3.scaleOrdinal().domain(lineGroupData.map(d => d.key)).range(["solid", "dashed", "dotted"]);
    
                                    const lineX = d3.scaleTime().domain(d3.extent(dividedLineData, d => new Date(d.date))).range([0, lineWidth]);
                                    lineSvg.append("g").attr("transform", "translate(0," + lineHeight + ")").call(d3.axisBottom(lineX).tickFormat(d3.timeFormat("%Y-%m-%d")).ticks(3));
    
                                    const lineY = d3.scaleLinear().domain([0, d3.max(dividedLineData, d => d.n)]).range([lineHeight, 0]);
                                    lineSvg.append("g").call(d3.axisLeft(lineY));
    
                                    lineSvg.selectAll(".line").data(lineGroupData).enter().append("path")
                                    .attr("fill", "none").attr("stroke", d => lineColor(d.key)).attr("stroke-width", 2.5).attr("class", d => lineStyle(d.key))
                                    .attr("d", d => d3.line().x(d => lineX(new Date(d.date))).y(d => lineY(d.n))(d.values));
    
                                    //lineette legenda
                                    lineLegendSvg.selectAll("lineDesc").data(lineGroupData).enter().append("line")
                                    .style("stroke", d => lineColor(d.key)).style("stroke-width", 3).attr("class", d => lineStyle(d.key))
                                    .attr("x1", (d, i) => i * 105).attr("y1", 9).attr("x2", (d, i) => (i * 105) + 30).attr("y2", 9);
    
                                    //testo della legenda
                                    lineLegendSvg.selectAll("pieDesc").data(lineGroupData).enter().append("text")
                                    .text(d => d.key).style("font-family", "system-ui").style("font-size", "16px")
                                    .attr("x", (d, i) => 34 + (i * 105)).attr("y", 12);

                                }
    
                            } else {
                                $("#keyword_" + keywordId + "_linechart, #keyword_" + keywordId + "_linechart_legend").hide();
                            }

                        }

                    }
                });
            });

        }

    }


});