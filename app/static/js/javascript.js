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
    $("#text_button").addClass("border-primary bg-primary");
    $("#text_button").children().css("color", "white");

    $("#text_button").click(function() {
        $("#text_area").show();
        $(".file-area").hide();
        $(this).addClass("border-primary bg-primary");
        $(this).children().css("color", "white");
        $("#file_button").removeClass("border-primary bg-primary");
        $("#file_button").children().css("color", "black");
    });

    $("#file_button").click(function() {
        $(".file-area").show();
        $("#text_area").hide();
        $(this).addClass("border-primary bg-primary");
        $(this).children().css("color", "white");
        $("#text_button").removeClass("border-primary bg-primary");
        $("#text_button").children().css("color", "black");
    });

    // EVENTI ANALYSIS_RESULT.HTML
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

        //timer di 2 secondi
        setTimeout(function() {
            $(".bi-clipboard-check").hide();
            $(".bi-clipboard").show();
            $(".copy-document").tooltip('hide');
            $(".copy-document").attr('data-bs-original-title', "Copia negli appunti");
        }, 2000);
    });

});