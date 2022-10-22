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
    darsenaPieDataTotal === 0 ? $("#darsena_piechart, #darsena_piechart_legend").hide() : $(".no-data-display").hide();

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

    const mouseover = function(d) {
        darsenaPieTooltip.style("opacity", 1);
        d3.select(this).style("opacity", 1);
    };
    
    const mousemove = function(d) {
        darsenaPieTooltip.html("N° analisi con risultato " + d.data.key + ": " + d.value + " (<span class='fw-bold'>" + d3.format(".0%")(d.value / darsenaPieDataTotal) + "</span>)")
        .style("left", d3.event.pageX + 16 + "px").style("top", d3.event.pageY - 32 + "px");
    };
    
    const mouseleave = function(d) {
        darsenaPieTooltip.style("opacity", 0);
        d3.select(this).style("opacity", 0.8);
    };

    adaptDarsenaPie();

    $(window).resize(function() {
        adaptDarsenaPie();
    });

    function adaptDarsenaPie() {
        const containerWidth = Math.floor($("#darsena_piechart").width());
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
        .on("mouseover", mouseover).on("mousemove", mousemove).on("mouseleave", mouseleave);

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
        .style("text-anchor", "middle").style("font-size", 30)
        .on("mouseover", mouseover).on("mousemove", mousemove).on("mouseleave", mouseleave);

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