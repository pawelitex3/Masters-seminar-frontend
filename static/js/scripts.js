var numberOfSteps = 4


$(function() {
    $('#vertex').click(function() {

        $.ajax({
            url: '/vertex/' + $('#number_of_vertices').val(),
            type: 'POST',
            success: function(response) {
                console.log(response);
                console.log($('#number_of_vertices').val());
            },
            error: function(error) {
                console.log(error);
            }
        });
    });
});

$(function() {
    $('#next').on({
        'click': function(){
            $.ajax({
                url: '/image/1',
                type: 'POST',
                success: function(response) {
                    console.log(response);
                    path = "../static/images/img_" + response + ".png?rand=" + Math.random();
                    $("#graph").attr("src", path);
                    if(response == numberOfSteps) {
                        $('#next').prop('disabled', true);
                    }
                    $('#previous').prop('disabled', false);
                },
                error: function(error) {
                    console.log(error);
                }
            });
        }
    });
});



$(function() {
    $('#previous').on({
        'click': function(){
            $.ajax({
                url: '/image/-1',
                type: 'POST',
                success: function(response) {
                    console.log(response);
                    path = "../static/images/img_" + response + ".png?rand=" + Math.random();
                    $("#graph").attr("src", path);
                    if(response == 1) {
                        $('#previous').prop('disabled', true);
                    }
                    $('#next').prop('disabled', false);
                },
                error: function(error) {
                    console.log(error);
                }
            });
        }
    });
});

$(function() {
    $('#add_no_vertices').on({
        'click': function() {
            $.ajax({
                url: '/vertices/' + $('#number_of_vertices').val(),
                type: 'POST',
                success: function(response) {
                    console.log(response);
                    id = "neighbour_vertex_"
                    for (var i = 0; i < parseInt($('#number_of_vertices').val()); i++) {
                        $("#adjacency_list").append('<tr><td>' + i + '</td><td id="' + id + i + '"></td></tr>')
                    }
                    $('#no_vertices').text($('#number_of_vertices').val());
                    $('#beginning').attr('min', 0);
                    $('#end').attr('min', 0);
                    $('#beginning').attr('max', parseInt($('#number_of_vertices').val())-1);
                    $('#end').attr('max', parseInt($('#number_of_vertices').val())-1);
                    $('#collapseTwo').collapse();
                    $('#graphProperties').prop('hidden', false);
                    
                    setGraphType();

                    setAlgorithm();
                },
                error: function(error) {
                    console.log(error);
                }
            });
        }
    });
});

$(function() {
    $('#add_edge').on({
        'click': function() {
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
                success: function(response) {
                    console.log(response);
                    $("#neighbour_vertex_" + $('#beginning').val()).append(" " + $('#end').val() + "(" + $('#weight').val() + ")");
                    $("#neighbour_vertex_" + $('#end').val()).append(" " + $('#beginning').val() + "(" + $('#weight').val() + ")");
                },
                error: function(error) {
                    console.log(error);
                }
            });
        }
    });
});

$(function() {
    $('#draw').on({
        'click': function() {
            $.ajax({
                url: '/draw/',
                type: 'GET',
                success: function(response) {
                    console.log(response);
                    path = "../static/images/img_1.png?rand=" + Math.random();
                    $("#graph").attr("src", path);
                    $('#next').prop('disabled', false);
                },
                error: function(error) {
                    console.log(error);
                }
            });
        }
    });
});

$(function() {
    $('input[type=radio][name=graphType]').change(function() {
        setGraphType();
    });
});

$(function() {
    $('input[type=radio][name=algorithmType]').change(function() {
        setAlgorithm();
    });
});

$(function() {
    $('#reset').on({
        'click': function() {
            $("#graphProperties").text("");
            $.ajax({
                url: '/reset'
            });
        }
    });
});

function setGraphType() {
    if($('input[type=radio][name=graphType]:checked').val() == 'simpleGraph') {
        $("#graphTypeLabel").text("Graf prosty");
    }
    else if($('input[type=radio][name=graphType]:checked').val() == 'directedGraph') {
        $("#graphTypeLabel").text("Digraf prosty");
    }
}

function setAlgorithm() {
    if($('input[type=radio][name=algorithmType]:checked').val() == 'bfs') {
        $("#algorithmLabel").text("Przeszukiwanie wszerz (BFS)");
    }
    else if($('input[type=radio][name=algorithmType]:checked').val() == 'dfs') {
        $("#algorithmLabel").text("Przeszukiwanie w głąb (DFS)");
    }
    else if($('input[type=radio][name=algorithmType]:checked').val() == 'kruskal') {
        $("#algorithmLabel").text("Algorytm Kruskala");
    }
    else if($('input[type=radio][name=algorithmType]:checked').val() == 'dijkstra') {
        $("#algorithmLabel").text("Algorytm Dijkstry");
    }
    else if($('input[type=radio][name=algorithmType]:checked').val() == 'prim') {
        $("#algorithmLabel").text("Algorytm Prima");
    }
    else if($('input[type=radio][name=algorithmType]:checked').val() == 'bellmanFord') {
        $("#algorithmLabel").text("Algorytm Bellmana-Forda");
    }
}