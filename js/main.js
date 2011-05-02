$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "xml/RouteList.xml",
        dataType: "xml",
        success: function(xml) {
            $(xml).find("route").each(function() {
                $("#root-matrix tbody").append('<tr>');
                $(this).find("vertex").each(function() {
                    $("#root-matrix tbody").append('<td>' + $(this).attr("id") + '</td>');
                });
                $("#root-matrix tbody").append('</tr>');
            });

            $(xml).find("route").each(function() {

            });
        }
    });

    $.ajax({
        type: "GET",
        url: "xml/TestCases.xml",
        dataType: "xml",
        success: function(xml) {
            var i;
            var t = 7;
            var q = 5;
            var onFailure = "Остаться на текущей вершине";
            var averageSolvingTime = 10;

            i = 0;
            $(xml).find("case").each(function() {
                $("div.main").append('<div class="container" id="container' + (i + 1) + '">' +
                        '<h2>Тест №' + (i + 1) + '</h2>' +
                        '<div class="input-data" id="input-data' + (i + 1) + '">' +
                        '<table>' +
                        '<tbody>' +
                        '<tr>' +
                        '<td>t</td><td>q</td><td>При ошибке</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td>' + t + '</td><td>' + q + '</td><td>' + onFailure + '</td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>' +
                        '<table id="selection-probability' + (i + 1) + '"><tbody></tbody></table>' +
                        '</div>' +
                        '<h3>Среднее время выполнения подтем</h3>' +
                        '<table id="subtopic-average' + (i + 1) + '"><tbody></tbody></table>' +
                        '<h3>Среднее время решения задачи</h3>' +
                        '<p>' + averageSolvingTime + '</p>' +
                        '<h3>Гистограмма для времени решения задачи</h3>' +
                        '<div class="chart" id="chart' + (i + 1) + '"></div>' +
                        '</div>');
                i++;
            });
        }
    });

    //$("h1").html("<b>sdgfdfsggfdsg</b>");
});