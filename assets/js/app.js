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
    function GetTopAlbumsTask(page, callback) {
        this.page = page;
        this.callback = callback;

        this.run = function () {
            lastFmApi.getTopAlbums(user, this.page, this.callback);
        };
    }

    function SpotifySearchTask(artist, album, rank, callback) {
        this.rank = rank;
        this.artist = artist;
        this.album = album;
        this.callback = callback;

        this.run = function () {
            spotifyApi.searchAlbums('artist:' + this.artist + ' album:' + this.album, {market: 'SE', year: 2014})
                .then(function (data) {
                    callback(data, rank);
                }, function (err) {
                    console.log(err);
                });
        };
    }

    function SpotifyLookupTask(id, rank, callback) {
        this.rank = rank;
        this.id = id;
        this.callback = callback;

        this.run = function () {
            spotifyApi.getAlbum(this.id)
                .then(function (data) {
                    callback(data, rank);
                }, function (err) {
                    console.log(err);
                });
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
            requestQueue.push(new SpotifySearchTask(album.artist.name, album.name, album['@attr'].rank, onAlbumSearched));

            $("#status").text("Filtering albums released in 2014.");
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

    function onAlbumSearched(data, rank) {
        if (data.albums.total == 1) {
            if (data.albums.items[0].album_type == "album")
                requestQueue.unshift(new SpotifyLookupTask(data.albums.items[0].id, rank, onAlbumLookedup));
        } else if (data.albums.total > 1) {
            var task = null;
            for (var i = 0; i < data.albums.items.length; i++) {
                if (data.albums.items[i].album_type == "album") {
                    task = new SpotifyLookupTask(data.albums.items[i].id, rank, onAlbumLookedup);
                    break;
                }
            }
            if (task) {
                requestQueue.unshift(task);
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

    function onAlbumLookedup(data, rank) {
        var releaseDate = new Date(data.release_date);
        if (releaseDate.getFullYear() == 2014 && data.album_type == "album") {

            if (albums.length < albumCount) {
                albums.push(data);
                onProgressUpdate(albums.length);
                onAlbumAdded(data.name, data.artists[0].name);
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

    function onAlbumAdded(name, artist) {
        var $albumTag = $('<li />');
        $albumTag.attr('data-artist', artist);
        $albumTag.attr('data-album', name);
        $albumTag.text(artist + " - " + name);

        $("#analysis ul").append($albumTag);
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

            $("#status").text("Finding top albums for " + username + ".");

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
                    $("button").addClass('hidden');
                    $("input").addClass('hidden');

                    app.getTopAlbums(username, 20, function (result) {

                        var $results = $("#results");
                        $results.addClass('in');
                        $results.find("h1").text("Top 20 albums for " + user);

                        $.each(result, function (index, album) {
                            $results.find("ol").append('<li>' + album.artists[0].name + ' - ' + album.name + '</li>');
                        });

                        $("form").addClass('hidden');
                        $("#analysis").addClass('hidden');

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

}

(window.app = window.app || {}, jQuery)
)
;

