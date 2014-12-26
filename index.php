<?php ?>
<!DOCTYPE html>
<html lang="en" ng-app="lastFmChart">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-COMPATIBLE" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Last.fm Yearly Chart</title>

    <link rel="stylesheet" type="text/css" href="bower_components/bootstrap/dist/css/bootstrap.css"/>
    <link rel="stylesheet" type="text/css" href="bower_components/font-awesome/css/font-awesome.css"/>
    <link rel="stylesheet" type="text/css" href="assets/css/site.css">

    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>
<body>

<div class="site-wrapper">

    <div class="site-wrapper-inner">

        <div class="cover-container">

            <div class="inner cover">


                <form name="usernameForm">

                    <h1 class="cover-heading">2014 Top 20 Albums</h1>

                    <p class="lead">
                        <input type="text" class="form-control" placeholder="Last.fm username"/>
                        <div class="alert alert-danger fade hidden" role="alert">
                        </div>
                    </p>

                    <p class="lead">

                    <div class="progress hidden">
                        <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="0"
                             aria-valuemax="100" style="width: 0%;"></div>
                    </div>

                    </p>

                    <p class="lead">
                        <button id="submit-button" type="submit" class="btn btn-primary">Submit</button>
                    </p>
                </form>

                <div id="results" class="fade">
                    <h1 class="cover-heading"></h1>
                    <ol></ol>
                </div>

            </div>

            <div class="mastfoot">
                <div class="inner">
                    <p>Powered by <span class="fa fa-lastfm fa-2x" title="Last.fm"></span> <span
                            class="fa fa-spotify fa-2x" title="Spotify"></span></p>

                    <p>Put together by <a href="https://twitter.com/indiecosmic" target="_blank">@indiecosmic</a></p>
                </div>
            </div>

        </div>

    </div>

</div>

<script type="text/javascript" src="bower_components/jquery/dist/jquery.js"></script>
<script type="text/javascript" src="bower_components/bootstrap/dist/js/bootstrap.js"></script>
<script type="text/javascript" src="bower_components/spotify-web-api-js/src/spotify-web-api.js"></script>
<script type="text/javascript" src="assets/js/last-fm-api.js"></script>
<script type="text/javascript" src="assets/js/app.js"></script>
</body>
</html>