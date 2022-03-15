// eray tools
var md = new MobileDetect(window.navigator.userAgent);
var isMobile = md.mobile();


// ga事件
var trackEvent = window.trackEvent = function (category, label) {
    if ("gtag" in window && category && label) {
        console.log('%cGA:[' + category + '][' + label + ']', 'background: #c54e6e; color: white; font-size:18px');
        gtag('event', 'click', {
            'event_category': category,
            'event_label': label
        });
    }
};

function getSearchData(url) {
    if (!url) url = location.search;
    var query = url.substr(1);
    var result = {};
    query.split("&").forEach(function (part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}


$.extend({
    YT: {
        init: function () {
            var $d = $.Deferred();
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = function () {
                $d.resolve(true);
            }
            return $d.promise();
        }
    },
    FB: {
        getReady() {
            var $d = $.Deferred();
            var timer = setInterval(function () {
                if (window.FB) {
                    clearInterval(timer);
                    $d.resolve(true);
                }
            }, 100);
            return $d.promise();
        },
        init: function (FB_app_id) {
            var $d = $.Deferred();
            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s);
                js.id = id;
                js.src = "https://connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));

            var _this = this;

            _this.FB_app_id = FB_app_id;

            _this.getReady().then(function () {
                FB.init({
                    appId: FB_app_id,
                    cookie: true,
                    xfbml: true,
                    version: 'v10.0'
                });
                // FB.AppEvents.logPageView();

                _this.getLoginStatus().then(function (access_token) {
                    if (access_token) {
                        console.log('FB狀態：已登入');
                        _this.getUserInfo(access_token);
                    } else {
                        console.log('FB狀態：未登入');
                    }

                });

                $d.resolve(FB);
            });
            return $d.promise();
        },
        getLoginStatus: function () {
            var $d = $.Deferred();
            var _this = this;
            var searchData = getSearchData(window.location.hash.substring(0))
            var url_access_token = searchData.access_token || localStorage.getItem('access_token');

            if (isMobile && url_access_token) {
                window.location.hash = '';
                localStorage.setItem('access_token', url_access_token);
                $d.resolve(url_access_token);
            } else {
                FB.getLoginStatus(function (response) {
                    if (response.status === 'connected') {
                        var access_token = response.authResponse.accessToken;
                        $d.resolve(access_token);
                    } else if (response.status === 'not_authorized') {
                        $d.resolve(false);
                    } else {
                        $d.resolve(false);
                    }
                });
            }
            return $d.promise();
        },
        getUserInfo: function (access_token) {
            var _this = this;
            var $d = $.Deferred();

            var auth = {
                access_token: access_token
            }

            if (access_token) {
                FB.api('/me?fields=name,email', function (response) {
                    if (!response || response.error) {
                        localStorage.setItem('access_token', '');
                        console.log('error >>>>', response, access_token);
                        $d.resolve(false);
                    } else {
                        var FBData = Object.assign(auth, response);
                        _this.FBData = FBData;
                        console.log('FBData >>>>', FBData);
                        $d.resolve(FBData);
                    }
                }, {
                    access_token: access_token
                });
            } else {
                $d.resolve(false);
            }
            return $d.promise();
        },
        /**
         * FB Login method
         * @returns promise
         */
        login: function () {
            var $d = $.Deferred();
            var _this = this;
            if (_this.FBData) {
                $d.resolve(_this.FBData);
            } else {
                if (isMobile) {
                    $d.resolve('redirect');
                    setTimeout(function () {
                        _this.loginByUrl();
                    }, 1000)
                } else {
                    _this.loginByApi().then(function (FBData) {
                        $d.resolve(FBData);
                    });
                }
            }
            return $d.promise();
        },
        /**
         * FB login: use fb api to login
         * @returns promise
         */
        loginByApi: function () {
            var _this = this;
            var $d = $.Deferred();

            _this.getLoginStatus().then(function (token) {
                if (token) {
                    _this.getUserInfo(token).then(function (res) {
                        $d.resolve(res)
                    })
                } else {
                    console.log(token);
                    FB.login(function (response) {
                        if (response && response.status === 'connected') {
                            console.log('response >>>', response);
                            var access_token = response.authResponse.accessToken;
                            if (access_token) {
                                _this.getUserInfo(access_token).then(function (res) {
                                    $d.resolve(res)
                                })
                            }
                        } else {
                            $d.resolve(false);
                        }

                    }, {
                        scope: 'public_profile, email'
                    });
                }
            })
            return $d.promise();
        },
        /**
         * FB login use url
         * @returns promise
         */
        loginByUrl: function () {
            var _this = this;
            var href = "https://www.facebook.com/v10.0/dialog/oauth?client_id=" +
                _this.FB_app_id +
                '&response_type=token' +
                '&scope=public_profile,email' +
                // (clickedTag ? '&state=' + clickedTag : '') +
                "&redirect_uri=" + window.location.href.slice(0, window.location.href.lastIndexOf('/'));
            window.location.href = href;
        },
        /**
         * FB Share: 導頁分享
         * @param {*} data 
         * url: 要分享的網址
         * redirect_uri: 之後要導回的網址
         * hashtag: 要添加的#hashtag
         */
        shareByUrl: function (data) {
            var url = data.url;
            var baseHref = window.location.href.slice(0, window.location.href.lastIndexOf('/'));
            var redirect_uri = data.redirect_uri || baseHref;
            var hashtag = data.hashtag;
            var href = 'https://www.facebook.com/dialog/share?app_id=' +
                this.FB_app_id + '&display=popup' +
                '&href=' + encodeURIComponent(url) +
                (redirect_uri ? '&redirect_uri=' + encodeURIComponent(redirect_uri) : '') +
                (hashtag ? ('&hashtag=' + encodeURIComponent(hashtag)) : '')

            window.location.href = href;
        },
        getShareUrl: function (data) {
            var url = data.url;
            var hashtag = data.hashtag;
            var href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url) +
                (hashtag ? ('&hashtag=' + encodeURIComponent(hashtag)) : '')
            return href;
        },
        /**
         * FB Share: 用FB API 分享
         * @param {*} data 
         * url: 要分享的網址
         * redirect_uri: 之後要導回的網址
         * hashtag: 要添加的#hashtag
         */
        shareByApi: function (data) {
            var $d = $.Deferred();
            var url = data.url;
            var hashtag = data.hashtag || '';
            console.log(data, url);
            FB.ui({
                method: 'share',
                display: 'popup',
                hashtag: hashtag,
                href: url
            }, function (resp) {
                if (resp) {
                    $d.resolve(resp);
                } else {
                    $d.resolve(false);
                }
            });
            return $d.promise();
        },
        /**
         * FB Share: 用FB API 分享
         * @param {*} data 
         * url: 要分享的網址
         * redirect_uri: 之後要導回的網址
         * hashtag: 要添加的#hashtag
         */
        share: function (data) {
            if (isMobile) {
                this.shareByUrl(data);
            } else {
                this.shareByApi(data);
            }
        }
    },
    LINE: {
        share: function (data) {
            var url = data.url;
            window.open('https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(url))
        },
        getShareUrl: function (data) {
            var url = data.url;
            // var href = 'https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(url);
            var href = 'line://msg/text/' + encodeURIComponent(url);
            return href;
        },
    }
})



function initYtPlayer(el, option) {
    console.log(el, option);
    return new Promise(function (resolve, reject) {
        var $el = $(el);
        var defaultOption = {
            autoplay: 0,
            showinfo: 0,
            modestbranding: 1,
            mute: 0,
        };
        var opt = Object.assign(defaultOption, option || {});
        var videoId = opt.ytid || $el.attr("ytid");
        var div = document.createElement("div");
        var blur = document.createElement("div");

        console.log(videoId, opt);
        blur.className = "video-blur";
        $el.append(blur);
        $el.append(div);

        var STATE_MAPPING = {
            ENDED: YT.PlayerState.ENDED,
            PLAYING: YT.PlayerState.PLAYING,
            PAUSED: YT.PlayerState.PAUSED,
            BUFFERING: YT.PlayerState.BUFFERING,
            CUED: YT.PlayerState.CUED,
        };

        var player = new YT.Player(div, {
            videoId: videoId,
            playerVars: opt,
            events: {
                onReady: function () {
                    if (opt.mute) {
                        player.mute();
                    }
                    if (opt.onReady && typeof opt.onReady === "function") {
                        opt.onReady(player);
                    }
                    resolve(player);
                },
                onStateChange: function (event) {
                    switch (event.data) {
                        case STATE_MAPPING.CUED:
                            $el.addClass("yt-player-cued");
                            break;
                        case STATE_MAPPING.BUFFERING:
                            $el.addClass("yt-player-loading");
                            break;
                        case STATE_MAPPING.PAUSED:
                            $el.addClass("yt-player-pause");
                            break;
                        case STATE_MAPPING.PLAYING:
                            $el.addClass("yt-player-playing");
                            break;
                        case STATE_MAPPING.ENDED:
                            $el.addClass("yt-player-end");
                            if (opt.onEnd && typeof opt.onEnd === "function") {
                                opt.onEnd(event, player);
                            }
                            break;
                    }
                },
            },
        });
        $el.data({
            player: player,
        });
    });
}

$.fn.extend({
    ytPlayer: function (option) {
        var $elements = this;
        var pms = [];
        $elements.each(function (idx, el) {
            pms.push(initYtPlayer(el, option));
        });
        return new Promise(function (resolve, reject) {
            Promise.all(pms)
                .then(function () {
                    resolve(true);
                })
                .catch(function () {
                    console.log("init yt-player error", e);
                    reject(e);
                });
        });
    },
});

$.fn.extend({
    videoSwiper: function (swiperOption, ytOption) {
        $elment.each(function (idx, el) {
            var $el = $(el);

            var defaultSwiperOptions = {
                autoHeight: true,
                loop: true,
                nextButton: $elment.parent().find('.next')[0],
                prevButton: $elment.parent().find('.prev')[0],
                onSlideChangeEnd: function (swiper) {
                    playSwiperVideo();
                }
            }

            var swiperOpts = Object.assign(defaultSwiperOptions, swiperOption || {})
            var swiper = new Swiper($el, swiperOpts)

            function playSwiperVideo() {
                var $slides = $elment.find('.swiper-slide');
                var $activeSlide = $slides.filter(".swiper-slide-active");
                $slides.find('.yt-player').html('');
                var $ytPlayer = $activeSlide.find('.yt-player');
                if ($ytPlayer.length) {
                    $ytPlayer.ytPlayer(ytOption).then(function (player) {
                        if (player && player.playVideo) {
                            player.playVideo();
                        }
                    })
                }
            }

            function stopSwiperVideo() {
                var player = $elment.find('.swiper-slide-active .yt-player').data('player');
                if (player && player.stopVideo) {
                    player.stopVideo()
                }
            }
            $el.data({
                swiepr: swiper,
                playSwiperVideo: playSwiperVideo,
                stopSwiperVideo: stopSwiperVideo
            })

        })
    },
});


function startAni($item) {
    var ani_name = $item.attr('ani-name');
    var ani_delay = $item.attr('ani-delay') || '0s';
    var ani_dur = $item.attr('ani-dur') || '2s';
    // var ani_repeat = $item.attr('ani-repeat') || false;
    var ani_timing = $item.attr('ani-timing') || 'cubic-bezier(0.075, 0.82, 0.165, 1)';

    $item.addClass('show')
    $item.addClass(ani_name);
    $item.css({
        'animation-duration': ani_dur,
        'animation-timing-function': ani_timing,
        'animation-delay': ani_delay,
        'animation-fill-mode': 'both'
    });

    if (ani_delay) {
        var t = setTimeout(function () {
            $item.addClass('show')
            setTimeout(function () {
                $item.addClass('animated')
            }, parseFloat(ani_delay) * ani_dur)
        }, parseFloat(ani_delay) * 1000)

        $item.data('timer', t)
    }

}

function stopAni($item) {
    var ani_name = $item.attr('ani-name');
    var t = $item.data('timer')
    if (t) {
        $item.removeClass(ani_name)
        $item.removeClass('show')
        $item.removeClass('animated')
    }
}


$.fn.extend({
    startAni: function (option) {
        startAni($(this))
    },
    stopAni: function () {
        stopAni($(this))
    }
})




function loadTemplate(path, tag) {
    var $d = $.Deferred();
    var tag = tag || 'body';
    $.get(path, function (data) {
        // $(tag).append(data);
        var className = $(tag).attr('class');
        $(tag).replaceWith(data);
        $(tag).attr('class', className)
        $d.resolve(true)
    });
    return $d.promise();
}


$.fn.extend({
    horizontalSmoothScroll: function (option) {
        var ele = this[0];
        if (ele) {
            return new HorizontalSmoothScroll(ele, 50, 10)
        }
    },
})