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

    // EVENTI DASHBOARD_KEYWORDS.HTML
    const similarKeywords = new Set();

    $("#add_keyword_similar_button").click(function() {
        const word = $.trim($("#keyword_similar").val()).toLowerCase();
        
        if (word.length > 2) {

            if (!similarKeywords.has(word)) {
                const wordId = word.replace(" ", "_")

                $("#similar_keyword_list").prepend(`
                    <li class="list-group-item border-0 p-0" id="${wordId}_li">
                        <div class="row border-0 mx-3 border-bottom">
                            <div class="col-10 d-flex align-items-center">
                                ${word}
                            </div>
                            <div class="col-2 d-flex align-items-center">
                                <button class="bg-transparent border-0" id="${wordId}_x_button">
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

    // EVENTI DASHBOARD_SOCIAL.HTML
    

    
    // PAROLE CHIAVE
    const keywords = {
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
        },
        "abcde": {
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
        },
        "INTERGENERAZIONALITÀ": {
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
        },
        "IMPRESE CULTURALI CREATIVE": {   // !! ATTENZIONE CON LE PAROLE COMPOSTE: GLI SPAZI NON FANNO ATTIVARE GLI ID DI HTML !!
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
            <div class="modal fade" id="keyword_${key}_modal" tabindex="-1" aria-labelledby="${key}_title" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-xl">
                    <div class="modal-content border">
                        <div class="row justify-content-center">
                            <div class="col-11 text-center">
                                <div class="row mt-3">
                                    <div class="col-12">
                                        <p class="fw-bold mb-0 fs-5 text-uppercase" id="${key}_title">${key}</p>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-12">
                                        <p class="mb-0 text-secondary"><span class="fst-italic">Parole simili attribuite a questa:</span> blabla, dinoinciwec, wenwucne, ejcnen ecweewfefwfdsa.</p>
                                    </div>
                                </div>
                                <div class="row mt-4">
                                    <!--tabella-->
                                    <div class="col-12 col-lg-6">
                                        ciao, tabella
                                    </div>
                                    <!--linechart-->
                                    <div class="col-12 col-lg-6" id="${key}_linechart"></div>
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
                        <p class="m-0 text-uppercase fw-bold fs-5">${key}</p>
                    </div>
                </div>
                <div class="row mt-1">
                    <div class="col">
                        <a class="text-decoration-none text-secondary" href="#keyword_${key}_modal" data-bs-toggle="modal" data-bs-target="#keyword_${key}_modal">vedi dettagli ></a>
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

    

});