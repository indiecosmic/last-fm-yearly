var LastFmApi = (function ($) {

    var baseUri = 'http://ws.audioscrobbler.com/2.0/';
    var api_key = '5decaa14cecb8f0cff16dce28af07b10';

    var module = {};
    module.getTopAlbums = function (username, page, callback) {
        $.ajax({

            url: baseUri,
            data: {
                'user': username,
                'method': 'user.gettopalbums',
                'period': '12month',
                'page': page,
                'api_key': api_key,
                'format': 'json'
            },
            dataType: 'jsonp'
        })
            .done(function (data) {
                if (typeof callback == "function")
                    callback(data);
            });
    };
    module.getAlbumInfo = function (mbid, callback) {
        if (mbid) {
            $.ajax({
                url: baseUri,
                data: {
                    'method': 'album.getinfo',
                    'mbid': mbid,
                    'api_key': api_key,
                    'format': 'json'
                },
                dataType: 'jsonp'
            })
                .done(function (data) {
                    if (typeof callback == "function")
                        callback(data);
                });
        }
    };
    module.getWeeklyAlbumChart = function (username, from, to, callback) {
        $.ajax({
            url: baseUri,
            data: {
                'method': 'user.getweeklyalbumchart',
                'user': username,
                'from': from,
                'to': to,
                'api_key': api_key,
                'format': 'json'
            }
        })
            .done(function (data) {
                if (typeof callback == "function")
                    callback(data);
            });
    };
    module.getWeeklyChartList = function (username, callback) {
        $.ajax({
            url: baseUri,
            data: {
                'method': 'user.getweeklychartlist',
                'user': username,
                'api_key': api_key,
                'format': 'json'
            }
        })
            .done(function (data) {
                if (typeof callback == "function")
                    callback(data);
            });
    };
    module.getUserInfo = function (username, callback) {

        var usernameRegex = /^[a-zA-Z0-9]+$/;
        if (username.match(usernameRegex) == null) {
            if (typeof callback == "function")
                callback({ message: "Invalid username" });
            return;
        }

        $.ajax({
            url: baseUri,
            data: {
                'method': 'user.getinfo',
                'user': username,
                'api_key': api_key,
                'format': 'json'
            }
        })
            .done(function (data) {
                if (typeof callback == "function")
                    callback(data);
            });
    }
    return module;
})(jQuery);