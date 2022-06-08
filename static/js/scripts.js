var numberOfSteps = 1
var imageNumber = 0

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
            // $.ajax({
            //     url: '/image/1',
            //     type: 'POST',
            //     success: function (response) {
            //         console.log(response);
            //         path = "../static/images/img_" + response + ".png?rand=" + Math.random();
            //         $("#graph").attr("src", path);
            //         if (response == numberOfSteps) {
            //             $('#next').prop('disabled', true);
            //         }
            //         $('#previous').prop('disabled', false);
            //     },
            //     error: function (error) {
            //         console.log(error);
            //     }
            // });
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
            // $.ajax({
            //     url: '/image/-1',
            //     type: 'POST',
            //     success: function (response) {
            //         console.log(response);
            //         path = "../static/images/img_" + response + ".png?rand=" + Math.random();
            //         $("#graph").attr("src", path);
            //         if (response == 1) {
            //             $('#previous').prop('disabled', true);
            //         }
            //         $('#next').prop('disabled', false);
            //     },
            //     error: function (error) {
            //         console.log(error);
            //     }
            // });
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
                    $('#collapseThree').collapse('show');
                    $('#graphProperties').prop('hidden', false);

                    //setGraphType();

                    //setAlgorithm();
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
                    $("#neighbour_vertex_" + $('#end').val()).append(" " + $('#beginning').val() + "(" + $('#weight').val() + ")");
                },
                error: function (error) {
                    console.log(error);
                }
            });
        }
    });
});

$(function () {
    $('#draw').on({
        'click': function () {
            $.ajax({
                url: '/draw/',
                type: 'GET',
                success: function (response) {
                    console.log(response);
                    path = "../static/images/img_0.png?rand=" + Math.random();
                    $("#graph").attr("src", path);
                    $('#next').prop('disabled', false);
                    numberOfSteps = response;
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
                    $('#collapseSix').collapse('show');
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
                    $('#collapseTwo').collapse('show');
                },
                error: function (error) {

                }
            });

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
                    $('#collapseFive').collapse('show');
                }
            });
            
        }
    });
});


function setGraphType() {
    $("#graphTypeLabel").text($('input[type=radio][name=graphType]:checked').val());
    // if(graphType == 'simpleGraph') {
    //     $("#graphTypeLabel").text("Graf prosty");
    // }
    // else if(graphType == 'directedGraph') {
    //     $("#graphTypeLabel").text("Digraf prosty");
    // }
}

function setAlgorithm() {
    $("#algorithmLabel").text($('input[type=radio][name=algorithmType]:checked').val());
    // if(algorithmType == 'bfs') {
    //     $("#algorithmLabel").text("Przeszukiwanie wszerz (BFS)");
    // }
    // else if(algorithmType == 'dfs') {
    //     $("#algorithmLabel").text("Przeszukiwanie w głąb (DFS)");
    // }
    // else if(algorithmType == 'kruskal') {
    //     $("#algorithmLabel").text("Algorytm Kruskala");
    // }
    // else if(algorithmType == 'dijkstra') {
    //     $("#algorithmLabel").text("Algorytm Dijkstry");
    // }
    // else if(algorithmType == 'prim') {
    //     $("#algorithmLabel").text("Algorytm Prima");
    // }
    // else if(algorithmType == 'bellmanFord') {
    //     $("#algorithmLabel").text("Algorytm Bellmana-Forda");
    // }
}