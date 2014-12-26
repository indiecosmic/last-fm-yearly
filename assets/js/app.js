(function (app, $) {

    var lastFmApi = LastFmApi;
    var spotifyApi = new SpotifyWebApi();
    var user = '';
    var albums = [];
    var albumCount = 20;
    var page = 1;
    var pageLimit = 15;

    var onComplete;
    var onProgressUpdate;
    var requestQueue = [];

    // Tasks
    function GetAlbumInfoTask(mbid, callback) {
        this.taskname = 'GetAlbumInfoTask';
        this.mbid = mbid;
        this.callback = callback;

        this.run = function () {
            lastFmApi.getAlbumInfo(this.mbid, this.callback);
        }
    }

    function GetTopAlbumsTask(page, callback) {
        this.taskname = 'GetTopAlbumsTask';
        this.page = page;
        this.callback = callback;

        this.run = function () {
            lastFmApi.getTopAlbums(user, this.page, this.callback);
        };
    }

    function SpotifySearchTask(artist, album, callback) {
        this.taskname = 'SpotifySearchTask';
        this.artist = artist;
        this.album = album;
        this.callback = callback;

        this.run = function () {
            spotifyApi.searchAlbums('artist:' + this.artist + ' album:' + this.album, {market: 'SE', year: 2014})
                .then(this.callback);
        };
    }

    function SpotifyLookupTask(id, callback) {
        this.taskname = 'SpotifyLookupTask';
        this.id = id;
        this.callback = callback;

        this.run = function () {
            spotifyApi.getAlbum(this.id)
                .then(this.callback);
        }
    }

    function runQueue() {
        window.setTimeout(function () {
            var task = requestQueue.shift();
            task.run();
        }, 1000);
    }

    // /Tasks

    // Callbacks
    function onPageFetched(data) {
        page++;
        $.each(data.topalbums.album, function (index, album) {
            requestQueue.push(new SpotifySearchTask(album.artist.name, album.name, onAlbumSearched));
            //else
            //    requestQueue.push(new GetAlbumInfoTask(album.mbid, onAlbumFetched));
        });

        if (albums.length == 20) {
            onComplete(albums);
            return;
        }

        if (requestQueue.length == 0 && page < pageLimit) {
            requestQueue.push(new GetTopAlbumsTask(page, onPageFetched));
        }

        if (requestQueue.length > 0) {
            runQueue();
            return;
        }

        if (page == pageLimit) {
            onComplete(albums);
            return;
        }
    }

    function onAlbumFetched(data) {
        var date = new Date(data.album.releasedate);

        if (date.getFullYear() == 2014) {
            if (albums.length < albumCount) {
                albums.push(data.album);
                onProgressUpdate(albums.length);
            }
        }

        if (albums.length == 20) {
            onComplete(albums);
            return;
        }

        if (requestQueue.length == 0 && page < pageLimit) {
            requestQueue.push(new GetTopAlbumsTask(page, onPageFetched));
        }

        if (requestQueue.length > 0) {
            runQueue();
            return;
        }

        if (page == pageLimit) {
            onComplete(albums);
            return;
        }
    }

    function onAlbumSearched(data) {
        if (data.albums.total == 1) {
            requestQueue.unshift(new SpotifyLookupTask(data.albums.items[0].id, onAlbumLookedup));
        } else if (data.albums.total > 1) {
            console.log("Warning: Found more than one match.");
            console.log(data.albums);
            requestQueue.unshift(new SpotifyLookupTask(data.albums.items[0].id, onAlbumLookedup));
        }

        if (albums.length == 20) {
            onComplete(albums);
            return;
        }

        if (requestQueue.length == 0 && page < pageLimit) {
            requestQueue.push(new GetTopAlbumsTask(page, onPageFetched));
        }

        if (requestQueue.length > 0) {
            runQueue();
            return;
        }

        if (page == pageLimit) {
            onComplete(albums);
            return;
        }
    }

    function onAlbumLookedup(data) {
        var releaseDate = new Date(data.release_date);
        if (releaseDate.getFullYear() == 2014 && data.album_type == "album") {

            if (albums.length < albumCount) {
                albums.push(data);
                onProgressUpdate(albums.length);
            }
        }

        if (albums.length == 20) {
            onComplete(albums);
            return;
        }

        if (requestQueue.length == 0 && page < pageLimit) {
            requestQueue.push(new GetTopAlbumsTask(page, onPageFetched));
        }

        if (requestQueue.length > 0) {
            runQueue();
            return;
        }

        if (page == pageLimit) {
            onComplete(albums);
            return;
        }
    }

    function saveResults(username, albums) {

    }

    app.getTopAlbums = function (username, count, callback, update) {
        if (typeof callback == "function") {
            onComplete = callback;
            onProgressUpdate = update;
        } else {
            return;
        }

        albumCount = count;
        page = 1;

        if (albums.length < albumCount || username != user) {
            user = username;
            albums = [];

            lastFmApi.getTopAlbums(user, page, onPageFetched);
        } else {
            onComplete(albums);
        }
    };

    $(document).ready(function () {
        $("form").submit(function (event) {
            event.preventDefault();

            var username = $("input").val();

            lastFmApi.getUserInfo(username, function (data) {

                if (data.user) {
                    $("div.alert").removeClass('in');
                    $("div.alert").addClass('hidden');
                    $(".progress").removeClass('hidden');
                    $("input").prop('disabled', true);
                    $("button").prop('disabled', true);
                    $("button").text("Please wait...");

                    app.getTopAlbums(username, 20, function (result) {

                        var $results = $("#results");
                        $results.addClass('in');
                        $results.find("h1").text("Top 20 albums for " + user);

                        $.each(result, function (index, album) {
                            $results.find("ol").append('<li>' + album.artists[0].name + ' - ' + album.name + '</li>');
                        });

                        $("form").addClass('hidden');

                    }, function (progress) {
                        $(".progress-bar").attr('style', 'width:' + (progress / 20) * 100 + '%;');
                    });

                } else {
                    $("div.alert").text(data.message);
                    $("div.alert").removeClass('hidden');
                    $("div.alert").addClass('in');
                }

            });
        });
    });

}(window.app = window.app || {}, jQuery));

