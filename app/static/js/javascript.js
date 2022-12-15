$(document).ready(function() {

    // inizializzazione dei tooltip
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    //inizializzazione dei toast
    const toastElList = [].slice.call(document.querySelectorAll(".toast"));
    const toastList = toastElList.map(toastEl => new bootstrap.Toast(toastEl));
    
    $(".back_button").click(function() {
        history.back()
    });

    // EVENTI LOGIN.HTML
    $("#login_message_toast").toast("show");

    // EVENTI REGISTRATION.HTML
    $("#registration_message_toast").toast("show");

    // EVENTI BASE.HTML
    $("#navbar_toggler a, .navbar-toggler").mouseenter(function() {
        $(this).children().css("color", "blue");
    });

    $("#navbar_toggler a, .navbar-toggler").mouseleave(function() {
        $(this).children().css("color", "black");
    });

    // EVENTI ANALYSIS.HTML
    $("#analysis_message_toast").toast("show");
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

    $("#analyse_document_form").submit(function() {
        $("#analyse_document_button").val("Processo avviato...").attr("disabled", "disabled");
    });

    // EVENTI ANALYSIS_RESULT.HTML
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

    //evento copia del testo
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

    //modifica: controllo sentiment e visualizzazione emotion selezionati non siano uguali ai vecchi e invio
    $("#modify_document_sentiment_button").click(function(event) {
        const newSentiment = $("#document_sentiment_selector option:selected").val();
        const url = $(this).attr("url");
        const data = {};
        console.log("ciao")
        if (!(~$("#document_sentiment").text().indexOf(newSentiment))) {
            data["new_sentiment"] = newSentiment;
        }
        
        if (typeof $("#document_feel_checkbox").val() != "undefined") {
            const emotionHiding = $("#document_feel_checkbox").attr("hide");
            
            if ($("#document_feel_checkbox").is(":checked") == emotionHiding) {
                data["set_emotion_hiding"] = emotionHiding;
            }
        }
        
        if (Object.keys(data).length > 0) {

            $.ajax({
                type: "POST",
                url: url,
                data: data,
                success: function(response) {
                    window.location.href = response["success"];
                }
            });

        } else {
            event.preventDefault();
        }
        
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
                    $("#sentiment_" + commentId).next().text("(modificato in data " + new Date(response["date"]).toLocaleDateString() + ")");
                    $("#modify_comment_sentiment_modal_" + commentId).modal("hide");
                }
            });
        }
    });

});