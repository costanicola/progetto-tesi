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
    $(".back_button").click(function() {
        history.back()
    });

    $(".document-p").mouseover(function() {
        $(this).css("background", "#ccccff");
    });

    $(".document-p").mouseout(function() {
        $(this).css("background", "none");
    });

    // EVENTI ARCHIVE.HTML

    //ordinamento
    $("#sort_documents").change(function() {
        const documentsList = $(".documents-list li");
        const orderedListIds = [];

        for (let i = 0; i < documentsList.length; i++) {
            orderedListIds.push(parseInt(documentsList.eq(i).attr("id").match(/\d+/)[0]));
        }

        $("#sort_documents option:selected").val() == "asc" ? orderedListIds.sort() : orderedListIds.reverse();
        $(".documents-list li").remove();

        for (let i = 0; i < documentsList.length; i++) {
            $(".documents-list").append(documentsList.filter("#document_li_" + orderedListIds[i]));
        }

    });

    //filtro
    $("#filter_documents").change(function() {
        const documentsList = $(".documents-list li").show();
        const filter = $("#filter_documents option:selected").val();


        if (filter == "positivo" || filter == "neutrale" || filter == "negativo") {

            for (let i = 0; i < documentsList.length; i++) {
                $(".documents-list li:eq(" + i + ")").not(function() {
                    return $(".documents-list li:eq(" + i + ") span").text().includes(filter);
                }).hide();
            }

        } else if (filter != "no") {
            
            for (let i = 0; i < documentsList.length; i++) {
                $(".documents-list li:eq(" + i + ")").not(function() {
                    return $(".documents-list li:eq(" + i + ")").attr("user") == filter;
                }).hide();
            }

        }
    });

    // EVENTI DOCUMENT_ANALYSIS_DETAILS.HTML
    $(".bi-clipboard-check").hide();

    $(".copy-document").click(function() {
        $(".bi-clipboard").hide();
        $(".bi-clipboard-check").show();
        $(this).attr('data-bs-original-title', "Copiato!").tooltip('show');

        let copiedText = "";
        $("#document_text>li>p").each(function() {
            copiedText = [copiedText, $.trim($(this).text())].join(copiedText == "" ? "" : "\n\n");
        });
        navigator.clipboard.writeText(copiedText);

        //timer di 2 secondi dopo il click
        setTimeout(function() {
            $(".bi-clipboard-check").hide();
            $(".bi-clipboard").show();
            $(".copy-document").tooltip('hide').attr('data-bs-original-title', "Copia negli appunti");
        }, 2000);
    });

    // EVENTI DASHBOARD_KEYWORDS.HTML
    const similarKeywords = new Set();

    $("#add_keyword_similar_button").click(function() {
        const word = $.trim($("#keyword_similar").val()).toLowerCase();
        
        if (word.length > 2) {
            const wordId = word.replace(/[^a-zA-Z0-9]/g, "")

            if (!similarKeywords.has(word)) {

                $("#similar_keywords_list").prepend(`
                    <li class="list-group-item border-0 p-0" id="${wordId}_li">
                        <div class="row border-0 mx-3 border-bottom">
                            <div class="col-10 d-flex align-items-center">
                                ${word}
                            </div>
                            <div class="col-2 d-flex align-items-center">
                                <button type="button" class="bg-transparent border-0" id="${wordId}_x_button">
                                    <span class="add_keyword_similar_button_icon bi bi-x"></span>
                                </button>
                            </div>
                        </div>
                    </li>
                `);

                $("#" + wordId + "_x_button").click(function() {
                    $("#" + wordId + "_li").remove();
                    similarKeywords.delete(word);
                });

                $("#keyword_similar").val("");
            }

            similarKeywords.add(word);
        }
    });

    //controllo che nome della keyword da aggiungere non sia vuoto
    $("#add_new_keywords_button").click(function(event) {
        if (!$.trim($("#keyword_name").val())) {
            event.preventDefault();
        }
    });

    //da <li> a JSON a stringa nel input hidden 
    $("#add_keyword_form").submit(function(event) {
        let keywords_list = {};
        $("#add_keyword_form ul li").each(function(i) {
            keywords_list[i] = $.trim($(this).text());
        });
        $("#similar_keywords_list_hidden").val(JSON5.stringify(keywords_list));
    });

    //evento bottone filtro categorie
    $("#keywords_filter_category_button").click(function() {
        $("#keyword_filter_modal").modal("hide");
        $("#keywords_list_div > div:first ~ div").hide().last().show();

        $("#keyword_filter_modal input[role='switch']:checked").each(function() {
            $("#keywords_list_div > div").filter("#keywords_list_cat" + $(this).attr("name").match(/\d+/)[0]).show();  //con questo match prelevo l'id della categoria
            $("#keywords_list_div > div").filter("#keywords_list_cat" + $(this).attr("name").match(/\d+/)[0]).prev().show();
        });

    });

    // EVENTI BASE_SOCIAL_POST_DETAILS.HTML
    $(".comment_modify_sentiment_button").click(function() {
        const commentId = $(this).attr("comment-id");
        const url = $(this).attr("url");
        const newSentiment = $("#comment_sentiment_selector_" + commentId + " option:selected").text();
        
        //se si ha modificato il sentiment (prendo il sentiment originale e lo confronto con quello selezionato nel <select>)
        if ($("#sentiment_" + commentId).text() != newSentiment) {
            
            $.ajax({
                type: "POST",
                url: url,
                data: {
                    comment_id: commentId,
                    new_sentiment: newSentiment
                },
                success: function(response) {
                    $("#sentiment_" + commentId).text(response["sentiment"]);
                    $("#modify_comment_sentiment_modal_" + commentId).modal("hide");
                }
            });

        }
        
    });

    // EVENTI DASHBOARD_SOCIAL.HTML
    class PieChart {

        constructor(data, colorRange, svgPosition) {

            //piechart
            this.dataTotal = d3.sum(d3.values(data));
            this.color = d3.scaleOrdinal().domain(data).range(colorRange);
            this.pie = d3.pie().value(d => d.value);
            this.dataReady = this.pie(d3.entries(data));
            this.pieSvg = d3.select(svgPosition).append("svg").append("g");
            this.svg = d3.select(svgPosition + " svg");
            this.g = d3.select(svgPosition + " svg g");

            //tooltip
            const tooltip = d3.select(svgPosition).append("div").attr("class", "tooltip")
            .style("background-color", "white").style("border", "solid").style("border-width", "2px").style("border-radius", "5px").style("padding", "5px");

            this.pieMouseover = function(d) {
                $(".tooltip").show();
                tooltip.style("opacity", 1);
                d3.select(this).style("opacity", 1);
            };
            
            this.pieMousemove = function(d) {
                tooltip.html("N° analisi con risultato " + d.data.key + ": " + d.value + " (<span class='fw-bold'>" + d3.format(".0%")(d.value / d3.sum(d3.values(data))) + "</span>)")
                .style("left", d3.event.pageX - 130 + "px").style("top", d3.event.pageY - 45 + "px");
            };
            
            this.pieMouseleave = function(d) {
                $(".tooltip").hide();
                tooltip.style("opacity", 0);
                d3.select(this).style("opacity", 0.8);
            };

        }
    
        getDataTotal() {
            return this.dataTotal;
        }

        drawPieChart(dimension) {
            const radius = dimension / 2 - 10;  //10 -> un po' di margine
            const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);
                
            this.svg.attr("width", dimension).attr("height", dimension);
            this.g.attr("transform", "translate(" + dimension / 2 + "," + dimension / 2 + ")");
                
            this.pieSvg.selectAll("pieSlices").data(this.dataReady).enter().append("path")
            .attr("d", arcGenerator).attr("fill", d => this.color(d.data.key)).attr("stroke", "white").style("stroke-width", "3px").style("opacity", 0.8)
            .on("mouseover", this.pieMouseover).on("mousemove", this.pieMousemove).on("mouseleave", this.pieMouseleave);
        }
    
    }

    d = {"positivo":10,"neutrale":10,"negativo":10};
    const x = new PieChart(d, ["#1A85FF", "#ECE839", "#D41159"], "#fb_piechart");
    x.drawPieChart(300);

});