var numberOfSteps = 1
var imageNumber = 0
var infoTable = []

$(function () {
    $('#vertex').click(function () {

        $.ajax({
            url: '/vertex/' + $('#numberOfVerticesInput').val(),
            type: 'POST',
            success: function (response) {
                console.log(response);
                console.log($('#numberOfVerticesInput').val());
            },
            error: function (error) {
                console.log(error);
            }
        });
    });
});

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

$(function () {
    $('#numberOfVerticesButton').on({
        'click': function () {
            $.ajax({
                url: '/vertices/' + $('#numberOfVerticesInput').val(),
                type: 'POST',
                success: function (response) {
                    console.log(response);
                    id = "neighbour_vertex_"
                    for (var i = 0; i < parseInt($('#numberOfVerticesInput').val()); i++) {
                        $("#adjacencyListTable").append('<tr><td>' + i + '</td><td id="' + id + i + '"></td></tr>')
                    }
                    $('#numberOfVerticesLabel').text($('#numberOfVerticesInput').val());
                    $('#beginning').attr('min', 0);
                    $('#end').attr('min', 0);
                    $('#beginning').attr('max', parseInt($('#numberOfVerticesInput').val()) - 1);
                    $('#end').attr('max', parseInt($('#numberOfVerticesInput').val()) - 1);
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

$(function () {
    $('#addEdgeButton').on({
        'click': function () {
            data_test = {
                beginning: $('#beginning').val(),
                end: $('#end').val(),
                weight: $('#weight').val()
            };
            console.log(data_test);
            $.ajax({
                url: '/edges/',
                type: 'GET',
                data: data_test,
                success: function (response) {
                    console.log(response);
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

$(function () {
    $('#randEdgeButton').on({
        'click': function () {
            max = parseInt($('#numberOfVerticesInput').val());
            beginning = randomInt(0, max);
            end = randomInt(0, max);
            weight = randomInt(0, 30);
            while(beginning == end){
                end = randomInt(0, max);
            }
            $('#beginning').val(beginning);
            $('#end').val(end);
            $('#weight').val(weight);
        }
    });
});



$(function () {
    $('#draw').on({
        'click': function () {
            $('#loadingSpinner').prop('hidden', false);
            $.ajax({
                url: '/draw/',
                type: 'GET',
                dataType: 'json',
                success: function (response) {
                    console.log(response);
                    infoTable = response
                    path = "../static/images/img_0.png?rand=" + Math.random();
                    $("#graph").attr("src", path);
                    $('#next').prop('disabled', false);
                    numberOfSteps = response.length;
                    imageNumber = 0;
                    $('#previous').prop('disabled', true);
                    $('#next').prop('disabled', false);
                    $('#info').text('Graf początkowy');
                    $('#infoLabel').prop('hidden', false);
                    $('#counter').text('Krok ' + (imageNumber+1) + ' / ' + (numberOfSteps+1));
                    showLegend();
                    $('#loadingSpinner').prop('hidden', true);
                },
                error: function (error) {
                    console.log(error);
                }
            });
        }
    });
});

$(function () {
    $('#reset').on({
        'click': function () {
            $.ajax({
                url: '/reset',
                type: 'DELETE',
                success: function (response) {
                    $("#graph").attr("src", "../static/images/img.png?rand=" + Math.random());
                    $("#graphProperties").prop("hidden", true);
                    $('#numberOfVerticesLabel').text("");
                    $("#adjacencyListTable").text("");
                    $('#counter').text('');
                    $('#info').text('');
                    $('#infoLabel').prop('hidden', true);
                    hideLegends();
                },
                error: function (error) {

                }
            });
        }
    });
});

$(function () {
    $('#addStartVertex').on({
        'click': function () {
            console.log($('#startVertex').val());
            $.ajax({
                url: '/startVertex',
                type: 'GET',
                data: {
                    startVertex: $('#startVertex').val()
                },
                success: function (response) {
                    $('#startVertexLabel').text($('#startVertex').val());
                    $('#drawGraphCollapse').collapse('show');
                },
                error: function (error) {

                }
            });
        }
    });
});

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
                    setGraphType();
                    $('#setNumberOfVerticesCollapse').collapse('show');
                },
                error: function (error) {

                }
            });
            if ($('input[type=radio][name=graphType]:checked').val() == 'Digraf prosty') {
                $('#kruskal').prop('disabled', true);
                $('#prim').prop('disabled', true);
            }
            else {
                $('#kruskal').prop('disabled', false);
                $('#prim').prop('disabled', false);
            }
        }
    });
});

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
                    setAlgorithm();
                    $('#startVertexCollapse').collapse('show');
                },
                error: function (error) {

                }
            });
        }
    });
});

$(function () {
    $('#setEdgesManuallyButton').on({
        'click': function () {
            $('#setEdgesManually').prop('hidden', false);
            $('#setClassOfGraph').prop('hidden', true);
            $('#adjacencyListTableRow').prop('hidden', false);
            $('#classOfGraphRow').prop('hidden', true);
        }
    });
});

$(function () {
    $('#setClassOfGraphButton').on({
        'click': function () {
            $('#setEdgesManually').prop('hidden', true);
            $('#setClassOfGraph').prop('hidden', false);
            $('#adjacencyListTableRow').prop('hidden', true);
            $('#classOfGraphRow').prop('hidden', false);
        }
    });
});

$(function () {
    $('#confirmClassOfGraphButton').on({
        'click': function () {
            console.log($('input[type=radio][name=classOfGraph]:checked').val())
            $.ajax({
                url: '/graphClass',
                type: 'GET',
                data: {
                    class: $('input[type=radio][name=classOfGraph]:checked').val()
                },
                success: function (response) {
                    $('#classOfGraphLabel').text($('input[type=radio][name=classOfGraph]:checked').val());
                    $('#setAlgorithmCollapse').collapse('show');
                },
                error: function (error) {

                }
            });
        }
    });
});


function setGraphType() {
    $("#graphTypeLabel").text($('input[type=radio][name=graphType]:checked').val());
}

function setAlgorithm() {
    $("#algorithmLabel").text($('input[type=radio][name=algorithmType]:checked').val());
}

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function hideLegends() {
    $('#searchLegend').prop('hidden', true);
    $('#mstLegend').prop('hidden', true);
    $('#dijkstraLegend').prop('hidden', true);
    $('#bellmanFordLegend').prop('hidden', true);
}

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