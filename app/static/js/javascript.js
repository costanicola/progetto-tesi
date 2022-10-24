$(document).ready(function() {

    // inizializzazione dei tooltip
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    // EVENTI BASE.HTML
    $("#navbar_toggler a, .navbar-toggler").mouseenter(function() {
        $(this).children().css("color", "blue");
    });

    $("#navbar_toggler a, .navbar-toggler").mouseleave(function() {
        $(this).children().css("color", "black");
    });

    // EVENTI ANALYSIS.HTML
    $(".file-area").hide();
    $("#upload_doc").prop("disabled", true);
    $("#text_button").addClass("border-primary bg-primary").children().css("color", "white");

    $("#text_button").click(function() {
        $("#text_area").show();
        $("#textarea").prop("disabled", false);
        $(".file-area").hide();
        $("#upload_doc").prop("disabled", true);
        $(this).addClass("border-primary bg-primary").children().css("color", "white");
        $("#file_button").removeClass("border-primary bg-primary").children().css("color", "black");
    });

    $("#file_button").click(function() {
        $(".file-area").show();
        $("#upload_doc").prop("disabled", false);
        $("#text_area").hide();
        $("#textarea").prop("disabled", true);
        $(this).addClass("border-primary bg-primary").children().css("color", "white");
        $("#text_button").removeClass("border-primary bg-primary").children().css("color", "black");
    });

    $("#erase_document_button").click(function() {
        $("#textarea").val("");
        $("#upload_doc").val(null);
    });

    $("#analyse_document_button").click(function(event) {
        //se file-area ha display none ==> hidden, allora ho selezionato la textarea
        if ($(".file-area").css("display") == "none") {
            //controllo textarea vuota
            if (!$.trim($("#textarea").val())) {
                event.preventDefault();
            }
        } else {
            //controllo file vuoto 
            if ($("#upload_doc")[0].files.length === 0) {
                event.preventDefault();
            }
        }
    });

    // EVENTI ANALYSIS_RESULT.HTML
    $("#analysis_result_back").click(function() {
        history.back()
    });

    $(".document-p").mouseover(function() {
        $(this).css("background", "#ccccff");
    });

    $(".document-p").mouseout(function() {
        $(this).css("background", "none");
    });

    // EVENTI DOCUMENT_ANALYSIS_DETAILS.HTML
    $(".bi-clipboard-check").hide();

    $(".copy-document").click(function() {
        $(".bi-clipboard").hide();
        $(".bi-clipboard-check").show();
        $(this).attr('data-bs-original-title', "Copiato!").tooltip('show');

        let copiedText = "";
        $("#document_text>li>p").each(function() {
            copiedText = [copiedText, $(this).text()].join(copiedText == "" ? "" : "\n\n");
        });
        navigator.clipboard.writeText(copiedText);

        //timer di 2 secondi dopo il click
        setTimeout(function() {
            $(".bi-clipboard-check").hide();
            $(".bi-clipboard").show();
            $(".copy-document").tooltip('hide').attr('data-bs-original-title', "Copia negli appunti");
        }, 2000);
    });


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
        darsenaPieTooltip.style("opacity", 1);
        d3.select(this).style("opacity", 1);
    };
    
    const darsenaPieMousemove = function(d) {
        darsenaPieTooltip.html("N° analisi con risultato " + d.data.key + ": " + d.value + " (<span class='fw-bold'>" + d3.format(".0%")(d.value / darsenaPieDataTotal) + "</span>)")
        .style("left", d3.event.pageX - 130 + "px").style("top", d3.event.pageY - 45 + "px");
    };
    
    const darsenaPieMouseleave = function(d) {
        darsenaPieTooltip.style("opacity", 0);
        d3.select(this).style("opacity", 0.8);
    };

    // LINECHART DARSENA
    const darsenaLineData = [
        {data: "2022-05-12", sentiment: "positivo", n: 4},
        {data: "2022-06-11", sentiment: "positivo", n: 5},
        {data: "2022-10-29", sentiment: "positivo", n: 2},
        {data: "2022-10-30", sentiment: "positivo", n: 0},
        {data: "2022-05-12", sentiment: "neutrale", n: 0},
        {data: "2022-06-11", sentiment: "neutrale", n: 2},
        {data: "2022-10-29", sentiment: "neutrale", n: 4},
        {data: "2022-10-30", sentiment: "neutrale", n: 14},
        {data: "2022-05-12", sentiment: "negativo", n: 1},
        {data: "2022-06-11", sentiment: "negativo", n: 6},
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

    const darsenaLineTooltipLine = darsenaLineSvg.append("line").style("opacity", 0);  // linea che si muove nel grafico
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
        .children().remove("g").remove("path").remove("rect").remove("text");

        const darsenaLineX = d3.scaleTime().domain(d3.extent(darsenaLineData, d => new Date(d.data))).range([0, darsenaLineWidth]);
        darsenaLineSvg.append("g").attr("transform", "translate(0," + darsenaLineHeight + ")").call(d3.axisBottom(darsenaLineX).tickFormat(d3.timeFormat("%Y-%m")));

        const darsenaLineY = d3.scaleLinear().domain([0, d3.max(darsenaLineData, d => d.n)]).range([darsenaLineHeight, 0]);
        darsenaLineSvg.append("g").call(d3.axisLeft(darsenaLineY));

        darsenaLineSvg.selectAll(".line").data(darsenaLineGroupData).enter().append("path")
        .attr("fill", "none").attr("stroke", d => darsenaLineColor(d.key)).attr("stroke-width", 2.5).attr("class", d => darsenaLineStyle(d.key))
        .attr("d", d => d3.line().x(d => darsenaLineX(new Date(d.data))).y(d => darsenaLineY(d.n))(d.values));

        //eventi tooltip linechart
        const drawLineTooltip = function() {
            const date = d3.timeFormat("%Y-%m-%d")(darsenaLineX.invert(d3.mouse(this)[0]));
            const bisect = d3.bisector(d => d.data).left;  //right, che mi servirebbe, non funziona!
            
            darsenaLineGroupData.forEach((d) => {
                darsenaLineTooltipLine.style("opacity", 1).attr("stroke", "gray")
                .attr("x1", darsenaLineX(new Date(d.values[bisect(d.values, date)].data)))
                .attr("x2", darsenaLineX(new Date(d.values[bisect(d.values, date)].data)))
                .attr("y1", 0).attr("y2", darsenaLineHeight);

                darsenaLineTooltip.html("<div class='fw-bold'>" + date + "</div>")
                .style("opacity", 1).style("left", d3.event.pageX + 16 + "px").style("top", d3.event.pageY - 45 + "px")
                .selectAll().data(darsenaLineGroupData).enter().append("div")
                .html(d.values[bisect(d.values, date)].data == date ? e => (e.key + ": " + e.values.find(h => h.data == date).n) : "")
            });
        };
        
        const removeLineTooltip = function() {
            darsenaLineTooltip.style("opacity", 0);
            darsenaLineTooltipLine.style("opacity", 0);
        };

        //si crea un rettangolo nel grafico su cui vengono mostrati il tooltip e la linea del tempo
        darsenaLineSvg.append("rect").attr("width", darsenaLineWidth).attr("height", darsenaLineHeight).attr("opacity", 0)
        .on("mousemove", drawLineTooltip).on("mouseout", removeLineTooltip);

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


        //legenda linechart
        /*const darsenaLineLegendPos = [];  // lista con tutte le posizioni dei label della legenda, cosi non si avranno sovrapposizioni

        darsenaLineSvg.selectAll(".legend-item").data(darsenaLineGroupData).enter().append("text")
        .attr("class", "legend-item").text(d => d.key).attr("fill", d => darsenaLineColor(d.key)).attr("font-size", 14).attr("font-weight", "bold")
        .attr("alignment-baseline", "middle").attr("x", darsenaLineWidth).attr("dx", "5px")
        .attr("y", function(d) {
            let yPos = darsenaLineY(d.values[d.values.length-1].n);
            
            while (darsenaLineLegendPos.includes(yPos)) {
                yPos -= 18;
            }
            
            darsenaLineLegendPos.push(yPos);
            return yPos;
        });*/

    }


    // PAROLE CHIAVE: DONUT CHART
    /*const keywords = {
        "polizia": {
            "positivo": {
                "social": {
                    "facebook": [
                        "2022-10-18"
                    ],
                    "instagram": []
                },
                "darsena": [
                    "2022-10-18",
                    "2022-10-19",
                    "2022-10-19"
                ]
            },
            "neutrale": {
                "social": {
                    "facebook": [],
                    "instagram": []
                },
                "darsena": []
            },
            "negativo": {
                "social": {
                    "facebook": [
                        "2022-10-18",
                        "2022-10-19",
                        "2022-10-19",
                        "2022-10-20",
                        "2022-10-20",
                        "2022-10-20"
                    ],
                    "instagram": [
                        "2022-10-19"
                    ]
                },
                "darsena": []
            }
        },
        "bicicletta": {
            "positivo": {
                "social": {
                    "facebook": [],
                    "instagram": []
                },
                "darsena": []
            },
            "neutrale": {
                "social": {
                    "facebook": [],
                    "instagram": [
                        "2022-09-30"
                    ]
                },
                "darsena": []
            },
            "negativo": {
                "social": {
                    "facebook": [],
                    "instagram": []
                },
                "darsena": [
                    "2022-10-10"
                ]
            }
        },
        "poddare": {
            "positivo": {
                "social": {
                    "facebook": [],
                    "instagram": []
                },
                "darsena": []
            },
            "neutrale": {
                "social": {
                    "facebook": [],
                    "instagram": []
                },
                "darsena": []
            },
            "negativo": {
                "social": {
                    "facebook": [],
                    "instagram": []
                },
                "darsena": []
            }
        }
    };

    //https://www.delftstack.com/howto/javascript/javascript-append-to-object/
    const keyWordCloudData = new Object();  // {"polizia": 12, "bicicletta": 6, ""}
    const keyDonutDat = new Object();
    const keySocialPieData = new Object();  //per un'eventuale suddivione tra facebook e social, smanettare nei for
    const keyDarsenaPieData = new Object();
    const keyLineData = new Object();

    for (const key in keywords) {  //polizia, bicicletta, poddare, ...

        $("#keywords_space").append(`
            <div class="col keyword-box border m-3">
                <div class="row">
                    <div class="col">
                        <div id="keyword_${key}"></div>
                    </div>
                </div>
            </div>
        `);

        for (const sentiment in keywords[key]) {  //positivo, neutrale, negativo
            
            for (const source in keywords[key][sentiment]) {  //social, darsena

                for (const i in keywords[key][sentiment][source]) {  //darsena -> indice degli elem dell'array (utile x il totale), social -> facebook, instagram

                    if (i === "facebook" || i === "instagram") {

                        for (const j in keywords[key][sentiment][source][i]) {
                            console.log(key + ", " + sentiment + ", " + source + ", " + i + ": " + j)
                            console.log(keywords[key][sentiment][source][i][j])
                        }

                    } else {

                    }
                    
                }

            }

        }
    }

    $("#keywords_space").append(`
        <div class="col keyword-box border m-3 d-flex align-items-center justify-content-center">
            bottone +
        </div>
    `);*/

});