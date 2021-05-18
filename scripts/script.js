$(document).ready(function() {
  // Загрузка текущей погоды по координатам ===============

  let today = new Date();
  current_data.innerHTML = today.getDate() + "." + (today.getMonth() < 9 ? "0" : "") + (today.getMonth() + 1) + "." + today.getFullYear();

  function errorPage(err) {
    // console.warn(`ERROR(${err.code}): ${err.message}`);
  };

  if ($("#mycity").val().length === 0) {
    // Геолокация доступна
    function success(pos) {
      let crd = pos.coords;
      let queryString = "http://api.openweathermap.org/data/2.5/weather?lat=" + crd.latitude + "&lon=" + crd.longitude + "&APPID=b03a2cfad336d11bd9140ffd92074504&units=metric";
      getWeatherCurrent(queryString);
    };
    navigator.geolocation.getCurrentPosition(success, errorPage);
  } else {
    let myCity = $("#mycity").val().split(",");
    let queryString = "http://api.openweathermap.org/data/2.5/weather?q=" + myCity[0] + "&APPID=b03a2cfad336d11bd9140ffd92074504&units=metric";
    getWeatherCurrent(queryString);
  };

  $("#mycity").keypress(function(event) {
    if (event.which === 13) { //  Нажат ENTER
      if ($("#mycity").val().length === 0) {
        function success(pos) {
          let crd = pos.coords;
          let queryString = "http://api.openweathermap.org/data/2.5/weather?lat=" + crd.latitude + "&lon=" + crd.longitude + "&APPID=b03a2cfad336d11bd9140ffd92074504&units=metric";
          getWeatherCurrent(queryString);
        };
        navigator.geolocation.getCurrentPosition(success, errorPage);
      } else {
        let myCity = $("#mycity").val().replace(/,\s/g, ',');
        let queryString = "http://api.openweathermap.org/data/2.5/weather?q=" + myCity + "&APPID=b03a2cfad336d11bd9140ffd92074504&units=metric";
        console.log(queryString);
        getWeatherCurrent(queryString);
      };
    }
  });

  function getWeatherCurrent(queryString) { // Загрузка данных по координатам
    let request;
    if (window.XMLHttpRequest) {
      request = new XMLHttpRequest();
    }
    request.open("get", queryString);
    request.onload = function() {
      if (request.status == 200) currentFormFilling(JSON.parse(request.response));
      else errorPage();
    }
    request.send();
  }

  function currentFormFilling(weather) {
    $("#mycity").val(weather.name + ", " + weather.sys.country);
    let icon_size = 70;
    icon_current.style.height = icon_size + "px";
    icon_current.style.width = icon_size + "px";
    icon_current.innerHTML = '<img src="http://openweathermap.org/img/w/' + weather.weather[0].icon + '.png" width="' + icon_size * 1.5 + '" height="' + icon_size * 1.5 + '" alt="">'; // иконка;
    icon_current.style.position = "relative";
    icon_current.firstChild.style.position = "absolute";
    icon_current.firstChild.style.top = "50%";
    icon_current.firstChild.style.left = "50%";
    icon_current.firstChild.style.transform = "translate(-50%,-50%)";
    main_current.innerHTML = weather.weather[0].main;
    current_temperature.innerHTML = weather.main.temp.toFixed() + "&deg;C";
    feels_like.innerHTML = weather.main.feels_like.toFixed() + "&deg;C";
    let ms_scale = 1000;
    let dsunrise = new Date(weather.sys.sunrise * ms_scale);
    let dsunset = new Date(weather.sys.sunset * ms_scale);
    let tduration = dsunset - dsunrise;
    let options = {
      hour: 'numeric',
      minute: 'numeric',
    };
    sunrise.innerHTML = dsunrise.toLocaleString("en-US", options);
    sunset.innerHTML = dsunset.toLocaleString("en-US", options);
    let hDuration = (tduration / 3600 / ms_scale).toFixed();
    let mDuration = ((tduration % (3600 * ms_scale)) / 60 / ms_scale).toFixed()
    duration.innerHTML = hDuration + ":" + mDuration + " hr";
  }
})




// Закачка почасового прогноза
// function getWeatherHourly() {
//   let request;
//   if (window.XMLHttpRequest) {
//     request = new XMLHttpRequest();
//   }
//   myCity = document.getElementById("mycity").value;
//   request.open("get", "http://api.openweathermap.org/snapshot/daily_16.json.gz&APPID=b03a2cfad336d11bd9140ffd92074504&units=metric");
// request.onload = function() {
//   if (request.status == 200) {
//     // alert(request.response);
//     result = request.response;
//     weather = JSON.parse(result);
//     // city.innerHTML = weather.name;
//     icon_current.innerHTML = '<img src="http://openweathermap.org/img/w/' + weather.weather.icon + '.png" width="50" height="50" alt="">'; // наша иконка;
//     main_current.innerHTML = weather.weather[0].main;
//     current_temperature.innerHTML = weather.main.temp.toFixed() + "&deg;C";
//     feels_like.innerHTML = weather.main.feels_like.toFixed() + "&deg;C";
//   }
// }
// request.send();
// }