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
                    if(response == 4) {
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
                end: $('#end').val()
            };
            console.log(data_test);
            $.ajax({
                url: '/edges/',
                type: 'GET',
                data: data_test,
                success: function(response) {
                    console.log(response);
                    $("#neighbour_vertex_" + $('#beginning').val()).append(" " + $('#end').val());
                    $("#neighbour_vertex_" + $('#end').val()).append(" " + $('#beginning').val());
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