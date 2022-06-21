var numberOfSteps = 1
var imageNumber = 0
var infoTable = []

// Obsluga przycisku pozwalajacego na przejscie do kolejnego kroku algorytmu
$(function () {
    $('#next').on({
        'click': function () {
            imageNumber += 1;
            path = "../static/images/img_" + imageNumber + ".png?rand=" + Math.random();
            $("#graph").attr("src", path);
            if (imageNumber == numberOfSteps) {
                $('#next').prop('disabled', true);
            }
            $('#previous').prop('disabled', false);
            $('#info').text(infoTable[imageNumber-1]);
            $('#counter').text('Krok ' + (imageNumber+1) + ' / ' + (numberOfSteps+1));
        }
    });
});

// Obsluga przycisku pozwalajacego na przejscie do poprzedniego kroku algorytmu
$(function () {
    $('#previous').on({
        'click': function () {
            imageNumber -= 1;
            path = "../static/images/img_" + imageNumber + ".png?rand=" + Math.random();
            $("#graph").attr("src", path);
            if (imageNumber == 0) {
                $('#previous').prop('disabled', true);
            }
            $('#next').prop('disabled', false);
            $('#info').text(infoTable[imageNumber-1]);
            $('#counter').text('Krok ' + (imageNumber+1) + ' / ' + (numberOfSteps+1));
        }
    });
});

// Obsluga przycisku do ustalania liczby wierzcholkow w grafie
$(function () {
    $('#numberOfVerticesButton').on({
        'click': function () {
            $.ajax({
                url: '/vertices/' + $('#numberOfVerticesInput').val(),
                type: 'POST',
                success: function (response) {
                    id = "neighbour_vertex_"
                    for (var i = 0; i < parseInt($('#numberOfVerticesInput').val()); i++) {
                        $("#adjacencyListTable").append('<tr><td>' + i + '</td><td id="' + id + i + '"></td></tr>')
                    }
                    
                    // Wpisanie ustalonej liczby wierzcholkow do wlasciwosci grafu
                    $('#numberOfVerticesLabel').text($('#numberOfVerticesInput').val());

                    // Ustalenie ograniczen dotyczacych zakresu numerow wierzcholkow przy wprowadzaniu krawedzi
                    $('#beginning').attr('min', 0);
                    $('#end').attr('min', 0);
                    $('#beginning').attr('max', parseInt($('#numberOfVerticesInput').val()) - 1);
                    $('#end').attr('max', parseInt($('#numberOfVerticesInput').val()) - 1);

                    // Otwarcie kolejnego kroku na liscie rozwijanej (akordeonie)
                    $('#setEdgesCollapse').collapse('show');
                    $('#graphProperties').prop('hidden', false);
                },
                error: function (error) {
                    console.log(error);
                }
            });
        }
    });
});

// Obsluga przycisku do wprowadzenia krawedzi do grafu
$(function () {
    $('#addEdgeButton').on({
        'click': function () {
            data_test = {
                beginning: $('#beginning').val(),
                end: $('#end').val(),
                weight: $('#weight').val()
            };
            $.ajax({
                url: '/edges/',
                type: 'GET',
                data: data_test,
                success: function (response) {
                    // Wpisanie krawedzi do tabeli w postaci list sasiedztwa
                    $("#neighbour_vertex_" + $('#beginning').val()).append(" " + $('#end').val() + "(" + $('#weight').val() + ")");
                    if($('input[type=radio][name=graphType]:checked').val() == 'Graf prosty'){
                        $("#neighbour_vertex_" + $('#end').val()).append(" " + $('#beginning').val() + "(" + $('#weight').val() + ")");
                    }
                    
                },
                error: function (error) {
                    console.log(error);
                }
            });
        }
    });
});

// Obsluga przycisku do losowania krawedzi (przy wprowadzaniu krawedzi recznie)
$(function () {
    $('#randEdgeButton').on({
        'click': function () {
            // Losowanie wartosci krawedzi i wagi
            max = parseInt($('#numberOfVerticesInput').val());
            beginning = randomInt(0, max);
            end = randomInt(0, max);
            weight = (randomInt(0, 30)+1);
            while(beginning == end){
                end = randomInt(0, max);
            }

            // Wprowadzenie wartosci do odpowiednich pol
            $('#beginning').val(beginning);
            $('#end').val(end);
            $('#weight').val(weight);
        }
    });
});

// Obsluga przycisku rozpoczynajacego proces tworzenia wizualizacji dzialania algorytmu grafowego
$(function () {
    $('#draw').on({
        'click': function () {
            $('#loadingSpinner').prop('hidden', false);
            $.ajax({
                url: '/draw/',
                type: 'GET',
                dataType: 'json',
                success: function (response) {

                    // Wyswietlenie informacji o aktualnym kroku
                    infoTable = response
                    $('#info').text('Graf początkowy');
                    $('#infoLabel').prop('hidden', false);
                    showLegend();
                    
                    // Wyswietlenie numeru aktualnego kroku
                    imageNumber = 0;
                    numberOfSteps = response.length;
                    $('#counter').text('Krok ' + (imageNumber+1) + ' / ' + (numberOfSteps+1));

                    // Wyswietlenie obrazka przedstawiajacego graf wyjsciowy
                    path = "../static/images/img_0.png?rand=" + Math.random();
                    $("#graph").attr("src", path);
                    
                    // Aktywacja przyciskow do nawigacji miedzy kolejnymi krokami
                    $('#previous').prop('disabled', true);
                    $('#next').prop('disabled', false);

                    // Ukrycie loading spinnera
                    $('#loadingSpinner').prop('hidden', true);
                },
                error: function (error) {
                    console.log(error);
                }
            });
        }
    });
});

// Obsluga przycisku do resetowania wlasciwosci grafu
$(function () {
    $('#reset').on({
        'click': function () {
            $.ajax({
                url: '/reset',
                type: 'DELETE',
                success: function (response) {
                    // Wyswietlenie pustego obrazka
                    $("#graph").attr("src", "../static/images/img.png?rand=" + Math.random());

                    // Wyzerowanie etykiet z wlasciwosciami grafu
                    $("#graphProperties").prop("hidden", true);
                    $('#numberOfVerticesLabel').text("");
                    $("#adjacencyListTable").text("");

                    // Wyzerowanie licznika krokow oraz informacji o aktualnym kroku
                    $('#counter').text('');
                    $('#info').text('');
                    $('#infoLabel').prop('hidden', true);

                    // Powrot do pierwszego kroku
                    $('#setTypeOfGraphCollapse').collapse('show');

                    hideLegends();
                },
                error: function (error) {
                    console.log(error)
                }
            });
        }
    });
});

// Obsluga przycisku do wyboru wierzcholka starowego
$(function () {
    $('#addStartVertex').on({
        'click': function () {
            $.ajax({
                url: '/startVertex',
                type: 'GET',
                data: {
                    startVertex: $('#startVertex').val()
                },
                success: function (response) {
                    // Ustalenie etykiety dotyczacej wierzcholka startowego
                    $('#startVertexLabel').text($('#startVertex').val());

                    // Przejscie do kolejnego kroku na liscie rozwijanej (akordeonie) 
                    $('#drawGraphCollapse').collapse('show');
                },
                error: function (error) {
                    console.log(error)
                }
            });
        }
    });
});

// Obsluga przycisku do wyboru typu grafu
$(function () {
    $('#graphTypeButton').on({
        'click': function () {
            $.ajax({
                url: '/graphType',
                type: 'GET',
                data: {
                    graphType: $('input[type=radio][name=graphType]:checked').val()
                },
                success: function (response) {
                    // Ustalenie etykiety dotyczacej wybranego typu grafu
                    setGraphType();

                    // Przejscie do kolejnego kroku na liscie rozwijanej (akordeonie) 
                    $('#setNumberOfVerticesCollapse').collapse('show');
                },
                error: function (error) {
                    console.log(error)
                }
            });

            // Jesli wybrano digraf prosty, wybor algorytmu Kruskala i Prima jest zablokowany
            if ($('input[type=radio][name=graphType]:checked').val() == 'Digraf prosty') {
                $('#kruskal').prop('disabled', true);
                $('#prim').prop('disabled', true);
            }

            // Jesli wybrano graf prosty, wybor algorytmu Kruskala i Prima jest odblokowany
            else {
                $('#kruskal').prop('disabled', false);
                $('#prim').prop('disabled', false);
            }
        }
    });
});

// Obsluga przycisku do wyboru algorytmu, dla ktorego ma zostac stworzona wizualizacja
$(function () {
    $('#algorithmTypeButton').on({
        'click': function () {
            $.ajax({
                url: '/algorithm',
                type: 'GET',
                data: {
                    algorithm: $('input[type=radio][name=algorithmType]:checked').val()
                },
                success: function (response) {
                    // Ustalenie etykiety dotyczacej wybranego algorytmu
                    setAlgorithm();

                    // Przejscie do kolejnego kroku na liscie rozwijanej (akordeonie) 
                    $('#startVertexCollapse').collapse('show');
                },
                error: function (error) {
                    console.log(error);
                }
            });
        }
    });
});

// Obsluga przyciskow do wyboru metody wprowadzania krawedzi - reczne wprowadzenie krawedzi
$(function () {
    $('#setEdgesManuallyButton').on({
        'click': function () {
            $('#setEdgesManually').prop('hidden', false);
            $('#adjacencyListTableRow').prop('hidden', false);
            $('#setClassOfGraph').prop('hidden', true);
            $('#classOfGraphRow').prop('hidden', true);
        }
    });
});

// Obsluga przyciskow do wyboru metody wprowadzania krawedzi - poprzez wybor klasy grafu
$(function () {
    $('#setClassOfGraphButton').on({
        'click': function () {
            $('#setEdgesManually').prop('hidden', true);
            $('#adjacencyListTableRow').prop('hidden', true);
            $('#setClassOfGraph').prop('hidden', false);
            $('#classOfGraphRow').prop('hidden', false);
        }
    });
});

// Obsluga przycisku do wyboru klasy grafu
$(function () {
    $('#confirmClassOfGraphButton').on({
        'click': function () {
            $.ajax({
                url: '/graphClass',
                type: 'GET',
                data: {
                    class: $('input[type=radio][name=classOfGraph]:checked').val()
                },
                success: function (response) {
                    // Ustawienie etykiety dotyczacej wybranej klasy grafu
                    $('#classOfGraphLabel').text($('input[type=radio][name=classOfGraph]:checked').val());

                    // Przejscie do kolejnego kroku na liscie rozwijanej (akordeonie)
                    $('#setAlgorithmCollapse').collapse('show');
                },
                error: function (error) {
                    console.log(error);
                }
            });
        }
    });
});

// Ustawienie etykiety dotyczacej wybranego typu grafu
function setGraphType() {
    $("#graphTypeLabel").text($('input[type=radio][name=graphType]:checked').val());
}

// Ustawienie etykiety dotyczacej wybranego algorytmu
function setAlgorithm() {
    $("#algorithmLabel").text($('input[type=radio][name=algorithmType]:checked').val());
}

// Losowanie liczby calkowitej z przedzialu od min do max
function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

// Ukrywanie wszystkich legend pod rysunkami
function hideLegends() {
    $('#searchLegend').prop('hidden', true);
    $('#mstLegend').prop('hidden', true);
    $('#dijkstraLegend').prop('hidden', true);
    $('#bellmanFordLegend').prop('hidden', true);
}

// Odsloniecie odpowiedniej legendy pod obrazkiem w zaleznosci od wybranego algorytmu
function showLegend() {
    hideLegends();
    algorithm = $('input[type=radio][name=algorithmType]:checked').val()
    if(algorithm == 'Przeszukiwanie wszerz (BFS)'){
        $('#searchLegend').prop('hidden', false);
    }
    else if(algorithm == 'Przeszukiwanie w głąb (DFS)'){
        $('#searchLegend').prop('hidden', false);
    }
    else if(algorithm == 'Algorytm Dijkstry'){
        $('#dijkstraLegend').prop('hidden', false);
    }
    else if(algorithm == 'Algorytm Bellmana-Forda'){
        $('#bellmanFordLegend').prop('hidden', false);
    }
    else if(algorithm == 'Algorytm Kruskala'){
        $('#mstLegend').prop('hidden', false);
    }
    else if(algorithm == 'Algorytm Prima'){
        $('#mstLegend').prop('hidden', false);
    }
        
}