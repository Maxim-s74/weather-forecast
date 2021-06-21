$(document).ready(function() {
  // $("#myInput").on("keyup", function() {
  //   var value = $(this).val().toLowerCase();
  //   $("#myTable tr").filter(function() {
  //     $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
  //   });
  // });
  function getWeatherCircle() { // Закачка текущей погоды для 4-х городов
    return new Promise(function(resolve, failureCallback) {
      let request;
      if (window.XMLHttpRequest) request = new XMLHttpRequest();
      let queryString = "http://api.openweathermap.org/data/2.5/find?lat=" + location.lat + "&lon=" + location.lon + "&cnt=5&APPID=b03a2cfad336d11bd9140ffd92074504&units=metric";
      request.open("get", queryString);
      request.onload = function() {
        if (request.status == 200) {
          cytiesFormFilling(JSON.parse(request.response));
          resolve();
        } else {
          errorPage();
          failureCallback();
        }
      }
      request.send();
    });
  }

  function cytiesFormFilling(weather) { //Заполнение карточки текущей погоды в 4-х городах
    let icon_size = 24;
    let i = 0;
    let selNode = $('.nearby_cards_wrap').children(); // Создаём массив. То же что и ".querySelector()";

    $(selNode).each(function() {
      $(this).empty().append("<div>" + weather.list[i + 1].name + "</div>",
        '<img src="http://openweathermap.org/img/w/' + weather.list[i + 1].weather[0].icon + '.png" width="' + icon_size * 2 + '" height="' + icon_size * 2 + '" alt="">',
        "<div>" + weather.list[i + 1].main.temp.toFixed() + "&deg;C</div>");
      $(this).children().css("margin", "auto 0").css("font-weight", "700");
      $(this).children().eq(0).css("width", "50%");
      i++;
    });
  }

  function dayFormFilling(selectedDay) {
    let icon_size = 24;
    let ms_scale = 1000;

    $($('#day_tab_head').children()).each(function() {
      $(this).empty();
    });
    $($('#day_tab_icon').children()).each(function() {
      $(this).empty();
    });
    $($('#day_tab_forecast').children()).each(function() {
      $(this).empty();
    });
    $($('#day_tab_temp').children()).each(function() {
      $(this).empty();
    });
    $($('#day_tab_realfeel').children()).each(function() {
      $(this).empty();
    });
    $($('#day_tab_wind').children()).each(function() {
      $(this).empty();
    });

    for (let i = 0; i < 40; i++) {
      let time = new Date(weather.list[i].dt * ms_scale);

      if (selectedDay == time.toLocaleString(langLoc, optDate)) {
        let j = 0;

        do {
          let selDate = new Date(weather.list[i].dt * ms_scale);
          if (selectedDay != selDate.toLocaleString(langLoc, optDate)) {
            break;
          }

          if (j == 0) {
            $('#day_tab_head').children().eq(j).append(selDate.toLocaleString(langLoc, optWeekday));
            $("#day_tab_icon").children().eq(j).append("");
            $("#day_tab_forecast").children().eq(j).append("Forecast");
            $("#day_tab_temp").children().eq(j).append("Temp (&deg;C)");
            $("#day_tab_realfeel").children().eq(j).append("RealFeel");
            $("#day_tab_wind").children().eq(j).append("Wind (km/h)");
            j++;
          } else {
            $('#day_tab_head').children().eq(j).append(selDate.toLocaleString(langLoc, optHour));
            $("#day_tab_icon").children().eq(j).append('<img src="http://openweathermap.org/img/w/' + weather.list[i].weather[0].icon + '.png" width="' + icon_size * 2 + '" height="' + icon_size * 2 + '" alt="">');
            $("#day_tab_forecast").children().eq(j).append(weather.list[i].weather[0].main);
            $("#day_tab_temp").children().eq(j).append(weather.list[i].main.temp.toFixed() + "&deg;C");
            $("#day_tab_realfeel").children().eq(j).append(weather.list[i].main.feels_like.toFixed() + "&deg;C");
            $("#day_tab_wind").children().eq(j).append((weather.list[i].wind.speed * 3.6).toFixed() + " " + RUMB[(weather.list[i].wind.deg / 11.25).toFixed()]);
            j++;
            i++;
          }
        } while (i < 40);
      }
    }

    $("#hourly_card").css("display", "block");
  }

  $(".day_list").children().click(function() {
    $(".day_list").children().css("background-color", "#ededed");
    $(this).css("background-color", "#f6f6f6");
    dayFormFilling($(this).children().eq(1).text());
  })

  $("#mycity").keypress(async function(event) {
    $("#error_tab").css("display", "none");

    if (event.which === 13) {
      $("#hourly_card").css("display", "none");
      $(".day_list").children().css("background-color", "#ededed");
      if ($("#mycity").val().length === 0) downloadingData();
      else {
        await findDataLocation(); // ОПРЕДЕЛЯЕТ НАЗВАНИЕ ГОРОДА ПО КООРДИНАТАМ И КООРДИНАТЫ ПО НАЗВАНИЮ
        await getFullData();
        await getWeatherCircle();
        getHourlyForecast();
        $("nav").children().eq(0).click();
      }
    } //  Нажат ENTER
  });

  $("nav").children().click(function() {
    if ($("#error_tab").css("display") == "none") {
      $(".tabs_block").css("display", "none");
      $(".point").css("border-bottom", "solid 1px #b3c9de");
      $(".point").css("font-weight", "400");
      let pointer = $(this).attr("href");
      $(pointer).css("display", "block");
      $(this).css("border-bottom", "solid 1px #009595");
      $(this).css("font-weight", "900");
    }
  });

});