$(document).ready(function() {
  // Загрузка текущей погоды по координатам ===============

  $(".tabs_block").css("display", "none");

  let today = new Date();
  $("#current_data").empty().append(today.getDate() + "." + (today.getMonth() < 9 ? "0" : "") + (today.getMonth() + 1) + "." + today.getFullYear());

  //=== КООРДИНАТЫ НАСЕЛЁННОГО ПУНКТА ===
  let location = {
    lat: 0,
    lon: 0
  };

  let langLoc = "en-US";
  // Опции вывода даты и времени
  let options = {
    // era: 'long',
    // year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
  };
  let optDate = {
    month: 'long',
    day: 'numeric',
  };
  let optWeekday = {
    weekday: 'long',
  };
  let optTime = {
    hour: 'numeric',
    minute: 'numeric',
  };
  let optHour = {
    hour: 'numeric'
  };
  //=== НАПРАВЛЕНИЕ ВЕТРА ============================
  let RUMB = ["N", "NNE", "NNE", "NE", "NE", "ENE", "ENE", "E", "E", "ESE", "ESE", "SE", "SE", "SSE", "SSE", "S", "S", "SSW", "SSW", "SW", "SW", "WSW", "WSW", "W", "W", "WNW", "WNW", "NW", "NW", "NNW", "NNW", "N", "N"]

  let weather = new Object();

  function getPosition() {
    // Simple wrapper
    return new Promise((res, errorPage) => {
      navigator.geolocation.getCurrentPosition(res, errorPage);
    });
  }

  async function downloadingData() {
    let position = await getPosition(); // дождитесь завершения GetPosition
    location.lat = position.coords.latitude.toFixed(4);
    location.lon = position.coords.longitude.toFixed(4);
    await findDataLocation(); // ОПРЕДЕЛЯЕТ НАЗВАНИЕ ГОРОДА ПО КООРДИНАТАМ И КООРДИНАТЫ ПО НАЗВАНИЮ
    await getFullData();
    await getWeatherCircle();
    await getHourlyForecast();
    $("nav").children().eq(0).click();
  }

  downloadingData();

  function findDataLocation() { // ОПРЕДЕЛЯЕТ НАЗВАНИЕ ГОРОДА ПО КООРДИНАТАМ И КООРДИНАТЫ ПО НАЗВАНИЮ
    return new Promise(function(resolve, failureCallback) {
      let request;
      let queryTypeString = $("#mycity").val().length === 0 ? "lat=" + location.lat + "&lon=" + location.lon : "q=" + $("#mycity").val();
      if (window.XMLHttpRequest) request = new XMLHttpRequest();
      let queryString = "http://api.openweathermap.org/data/2.5/weather?" + (($("#mycity").val().length === 0) ? ("lat=" + location.lat + "&lon=" + location.lon) : ("q=" + $("#mycity").val())) + "&APPID=b03a2cfad336d11bd9140ffd92074504&units=metric";
      request.open("get", queryString);

      request.onload = function() {
        if (request.status == 200) {
          let weather = JSON.parse(request.response);
          location.lon = weather.coord.lon.toFixed(4);
          location.lat = weather.coord.lat.toFixed(4);
          $("#mycity").val(weather.name + ", " + weather.sys.country);
          resolve();
        } else {
          errorPage();
          failureCallback();
        }
      }

      request.send();
    });
  }

  function errorPage(err) {
    $(".tabs_block").css("display", "none");
    $("#error_tab").css("display", "block");
  };

  function getFullData() {
    return new Promise(function(resolve, failureCallback) {
      let request;
      if (window.XMLHttpRequest) request = new XMLHttpRequest();
      let queryString = "https://api.openweathermap.org/data/2.5/onecall?lat=" + location.lat + "&lon=" + location.lon + "&exclude=minutely,alerts&appid=b03a2cfad336d11bd9140ffd92074504&units=metric";
      request.open("get", queryString);

      request.onload = function() {
        if (request.status == 200) {
          let weather = JSON.parse(request.response);
          currentFormFilling(weather);
          hourlyFormFilling(weather);
          resolve();
        } else {
          errorPage();
          failureCallback();
        }
      }

      request.send()
    });
  }

  function getHourlyForecast() {
    return new Promise(function(resolve, failureCallback) {
      let request;
      if (window.XMLHttpRequest) request = new XMLHttpRequest();
      let queryString = "https://api.openweathermap.org/data/2.5/forecast?lat=" + location.lat + "&lon=" + location.lon + "&exclude=minutely,alerts&appid=b03a2cfad336d11bd9140ffd92074504&units=metric";
      request.open("get", queryString);

      request.onload = function() {
        if (request.status == 200) {
          weather = JSON.parse(request.response);
          resolve();
        } else {
          errorPage();
          failureCallback();
        }
      }

      request.send()
    });
  }

  function currentFormFilling(weather) { //Заполнение карточки текущей погоды
    let icon_size = 70;
    $("#icon_current").css("height", icon_size + "px");
    $("#icon_current").css("width", icon_size + "px");
    $("#icon_current").empty().append('<img src="http://openweathermap.org/img/w/' + weather.current.weather[0].icon + '.png" width="' + icon_size * 1.5 + '" height="' + icon_size * 1.5 + '" alt="">'); // иконка;
    $("#icon_current").css("position", "relative");
    $("#icon_current").children().eq(0).css("position", "absolute");
    $("#icon_current").children().eq(0).css("top", "50%");
    $("#icon_current").children().eq(0).css("left", "50%");
    $("#icon_current").children().eq(0).css("transform", "translate(-50%,-50%)");
    $("#main_current").empty().append(weather.current.weather[0].main);
    $("#current_temperature").empty().append(weather.current.temp.toFixed() + "&deg;C");
    $("#feels_like").empty().append("Real Feel " + weather.current.feels_like.toFixed() + "&deg;C");
    let ms_scale = 1000;
    let dsunrise = new Date(weather.current.sunrise * ms_scale);
    let dsunset = new Date(weather.current.sunset * ms_scale);
    let tduration = dsunset - dsunrise;
    $("#sunrise").empty().append(dsunrise.toLocaleString(langLoc, optTime));
    $("#sunset").empty().append(dsunset.toLocaleString(langLoc, optTime));
    let hDuration = (tduration / 3600 / ms_scale).toFixed();
    let mDuration = ((tduration % (3600 * ms_scale)) / 60 / ms_scale).toFixed()
    $("#duration").empty().append(hDuration + ":" + mDuration + " hr");
  }

  function hourlyFormFilling(weather) {
    let icon_size = 24;

    for (let i = 1; i < 7; i++) {
      let ms_scale = 1000;
      let time = new Date(weather.hourly[i].dt * ms_scale);
      $('#hourly_tab_head').children().eq(i).empty().append(time.toLocaleString(langLoc, optHour));
      $("#hourly_tab_icon").children().eq(i).empty().append('<img src="http://openweathermap.org/img/w/' + weather.hourly[i].weather[0].icon + '.png" width="' + icon_size * 2 + '" height="' + icon_size * 2 + '" alt="">');
      $("#hourly_tab_forecast").children().eq(i).empty().append(weather.hourly[i].weather[0].main);
      $("#hourly_tab_temp").children().eq(i).empty().append(weather.hourly[i].temp.toFixed() + "&deg;C");
      $("#hourly_tab_realfeel").children().eq(i).empty().append(weather.hourly[i].feels_like.toFixed() + "&deg;C");
      $("#hourly_tab_wind").children().eq(i).empty().append((weather.hourly[i].wind_speed * 3.6).toFixed() + " " + RUMB[(weather.hourly[i].wind_deg / 11.25).toFixed()]);
    }

    for (let i = 0; i < 5; i++) {
      let ms_scale = 1000;
      let icon_size = 105;
      let date = new Date(weather.daily[i].dt * ms_scale);
      $(".day_list").children().eq(i).children().eq(0).empty().append(i == 0 ? "TONIGHT" : date.toLocaleString(langLoc, optWeekday));
      $(".day_list").children().eq(i).children().eq(1).empty().append(date.toLocaleString(langLoc, optDate));
      $(".day_list").children().eq(i).children().eq(2).empty().append('<img src="http://openweathermap.org/img/w/' + weather.daily[i].weather[0].icon + '.png" width="' + icon_size + '" height="' + icon_size + '" alt="">');
      $(".day_list").children().eq(i).children().eq(3).empty().append((i == 0 ? weather.daily[i].temp.night.toFixed() : weather.daily[i].temp.day.toFixed()) + "&deg;C");
      $(".day_list").children().eq(i).children().eq(4).empty().append(weather.daily[i].weather[0].main + ", " + weather.daily[i].weather[0].description);
    }
  }

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