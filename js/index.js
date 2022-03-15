$(function () {
  var controller = new ScrollMagic.Controller({
    vertical: false,
  });

  var base = 6;
  var count = 5;
  var ratio = 1.02;
  var $centerEle = $(".card").eq(Math.floor($(".card").length / 2));
  $(".card").bind("mouseover", function (e) {
    cardAnimation($(this));
  });

  $(".card").bind("mouseleave", function (e) {
    cardAnimation($centerEle);
  });

  cardAnimation($centerEle);

  function cardAnimation($el) {
    var $nextEles = $el.nextAll();
    var $prevEles = $el.prevAll();
    $(".card-wrap").attr("style", "");
    $(".card").attr("style", "");

    $el.css({
      zIndex: 99,
    });

    TweenMax.to($el.find(".card-wrap"), 0.3, {
      transformOrigin: "center center",
      rotationY: 0,
      scaleX: 0.5,
    });

    $nextEles.each(function (idx, ele) {
      var $wrap = $(ele).find(".card-wrap");
      // const zIndex = $nextEles.length - idx;
      $(ele).css({
        zIndex: $nextEles.length - idx,
      });
      if (idx < count) {
        var tIndex = count - idx;
        TweenMax.to($wrap, 0.3, {
          transformOrigin: "right",
          rotationY: tIndex * base * ratio * -1,
          scaleX: 1,
        });
      } else {
        TweenMax.to($wrap, 0.3, {
          zIndex: idx,
          transformOrigin: "right",
          rotationY: base * -1,
          scaleX: 1,
        });
      }
    });

    $prevEles.each(function (idx, ele) {
      $(ele).css({
        zIndex: $prevEles.length - idx,
      });
      var $wrap = $(ele).find(".card-wrap");
      if (idx < count) {
        var tIndex = count - idx;
        TweenMax.to($wrap, 0.3, {
          transformOrigin: "left",
          rotationY: tIndex * base * ratio * 1,
          scaleX: 1,
        });
      } else {
        TweenMax.to($wrap, 0.3, {
          zIndex: idx,
          transformOrigin: "left",
          rotationY: base + "deg",
          scaleX: 1,
        });
      }
    });
  }
});

$(function () {
  $("body").bind("wheel", function (e) {
    var distance = e.originalEvent.wheelDeltaY * -1 * 3;
    var scrollLeft = $("body").scrollLeft();
    TweenMax.to(
      $("body")[0],
      0.9,
      {
        scrollLeft: scrollLeft + distance,
      },
      0
    );
  });

  $(window)
    .bind("scroll", function (e) {
      var scrollLeft = $("body").scrollLeft();

      var $titles = $(".vertical-title");

      function getTotalLeft() {
        var arr = [];
        var pos = [];
        var nowLeft = $(".index-header").width() + 4;
        var $temp = $titles.get();
        $temp.forEach(function (ele, idx) {
          var $ele = $(ele);
          var $wrap = $ele.find(".title-wrap");
          var w = $ele.width();
          var elemLeft = $ele.offset().left;
          var viewLeft = scrollLeft + nowLeft;
          if (elemLeft <= viewLeft) {
            arr.push({
              idx: idx,
              el: $wrap,
            });
            pos.push(nowLeft);
            nowLeft += w - 20;
          }
        });
        var list = arr.map(function (o, idx) {
          return {
            pos: "left",
            idx: o.idx,
            el: o.el,
            left: pos[idx],
            isLast: idx === 0,
          };
        });
        return {
          totalRight: nowLeft,
          list: list,
        };
      }

      function getTotalRight() {
        var arr = [];
        var pos = [];
        var nowRight = 0;
        var $temp = $titles.get().reverse();
        $temp.forEach(function (ele, idx) {
          var $ele = $(ele);
          var $wrap = $ele.find(".title-wrap");
          var w = $ele.width();
          var left = $ele.offset().left;
          var eleRight = left + w;
          var viewRight = scrollLeft + $(window).width() - nowRight;
          if (eleRight >= viewRight) {
            arr.push({
              idx: $temp.length - idx - 1,
              el: $wrap,
            });
            pos.push(nowRight);
            nowRight += w - 20;
          }
        });
        var list = arr.map(function (o, idx) {
          return {
            pos: "right",
            idx: o.idx,
            el: o.el,
            right: pos[idx],
            isLast: idx > 0 && idx === arr.length - 1,
          };
        });
        return {
          totalRight: nowRight,
          list: list,
        };
      }

      var listLeft = getTotalLeft().list;
      var listRight = getTotalRight().list;

      var list = [...listLeft, ...listRight];
      $titles.each(function (idx, ele) {
        var $el = $(ele).find(".title-wrap");
        var obj = list.find((o) => o.idx === idx);
        if (obj) {
          if (obj.pos === "left") {
            $el.addClass("fixed-left");
            $el.css({
              // position: "fixed",
              left: obj.left,
              right: "",
            });
          } else if (obj.pos === "right") {
            $el.addClass("fixed-right");
            $el.css({
              // position: "fixed",
              right: "",
              left: "",
            });
          }
          if (obj.isLast) {
            $el.addClass("is-last");
          }
        } else {
          $el.removeClass("fixed-left fixed-right is-last");
          $el.css({
            left: "",
            right: "",
          });
        }
      });
    })
    .trigger("scroll");

  $(".title-wrap").click(function () {
    var pos =
      $(this).parents(".vertical-title").eq(0).offset().left +
      $(".vertical-scroll")[0].scrollLeft;
    $("body").stop().animate(
      {
        scrollLeft: pos,
      },
      1000
    );
  });

  $(window)
    .bind("scroll", function (e) {
      var scrollLeft = $("body").scrollLeft();
      var scrollTop = $("body").scrollTop();
      var $wow = $(".wow");
      $wow.each(function (i, el) {
        var $el = $(el);
        if ($(window).width() <= 768) {
          var viewTop = scrollTop;
          var viewBottom = scrollTop + $(window).height();
          var top = $el.offset().top;
          var bottom = $el.offset().left + $el.width();
          if (bottom >= viewTop && top <= viewBottom) {
            $el.addClass("animated");
          } else {
            $el.removeClass("animated");
          }
        } else {
          var viewLeft = scrollLeft;
          var viewRight = scrollLeft + $(window).width() * 0.8;

          var left = $el.offset().left;
          var right = $el.offset().left + $el.width();

          if (right >= viewLeft && left <= viewRight) {
            $el.addClass("animated");
          } else {
            $el.removeClass("animated");
          }
        }
      });
    })
    .trigger("scroll");

  $(window)
    .bind("scroll", function (e) {
      var scrollLeft = $("body").scrollLeft();
      var scrollTop = $("body").scrollTop() + $(".index-header").height();
      var $wow = $(".wow-keep");
      $wow.each(function (i, el) {
        var $el = $(el);
        var triggerText = $el.attr("trigger") || "0.6";
        var trigger = triggerText
          ? triggerText.indexOf("px") > -1
            ? parseInt(triggerText)
            : $(window).width() * parseFloat(triggerText)
          : 0;

        if ($(window).width() <= 768) {
          var top = $el.offset().top;
          var bottom = top + $el.height();
          if ($el.parents(".wrapper-m").eq(0).length) {
            console.log("i", scrollTop, "top", top);
          }

          if (scrollTop >= top - trigger && bottom > scrollTop) {
            $el.addClass("animated");
          } else {
            $el.removeClass("animated");
          }
        } else {
          var left = $el.offset().left;
          var right = left + $el.width();
          if (scrollLeft > left - trigger && right > scrollLeft) {
            $el.addClass("animated");
          } else {
            $el.removeClass("animated");
          }
        }
      });
    })
    .trigger("scroll");

  $(".top_btn").click(function (event) {
    event.preventDefault();
    $("html,body").animate(
      {
        scrollTop: 0,
      },
      700
    );
  });

  $(".scroll-down").click(function (event) {
    event.preventDefault();
    $("html,body").animate(
      {
        scrollTop: $("#about").offset().top - $(".index-header").height(),
      },
      700
    );
  });

  var $topEl = $(".top_btn");
  var oriTopElBottom = parseInt($topEl.css("bottom"), 10);

  $(".drop-down-title").on("click", function () {
    $(this).toggleClass("active");
    $(".drop-down-content").toggleClass("open");
  });
  $(".drop-down-title-m").on("click", function () {
    $(this).toggleClass("active");
    $(".drop-down-content-m").toggleClass("open");
  });

  $(".hamburger-btn-l").on("click", function () {
    $(".hamburger-menu").toggleClass("animate");
    $(".index-menu").toggleClass("active");
  });

  $(".menu-close-btn").on("click", function () {
    $(".hamburger-menu").removeClass("animate");
    $(".index-menu").removeClass("active");
  });

  $(".scroll-m").click(function (e) {
    e.preventDefault();
    var target = $(this).attr("href");
    var targetPos = $(target).offset().top - 75;
    $("html, body").animate(
      {
        scrollTop: targetPos,
      },
      1000
    );
    $(".hamburger-menu").removeClass("animate");
    $(".index-menu").removeClass("active");
  });

  // 手機版

  $(".hamburger-btn").on("click", function () {
    $(".work-menu").toggleClass("active");
  });
  $(".work-menu-close-btn").on("click", function () {
    $(".work-menu").removeClass("active");
  });

  $(".footer-hamburger-btn").on("click", function () {
    $(".work-menu").toggleClass("active");
  });
});
$(function () {
  setTimeout(function () {
    $(".first_page").addClass("active");
  }, 3000);
});

var base = 24;
var count = 3;
var ratio = 0.8;
var $centerEle = $(".bar").eq(Math.floor($(".bar").length / 2));
barAnimation($centerEle);

function barAnimation($el) {
  var $nextEles = $el.nextAll();
  var $prevEles = $el.prevAll();
  $(".bar-wrap").attr("style", "");
  $(".bar").attr("style", "");

  $el.css({
    zIndex: 99,
  });

  TweenMax.to($el.find(".bar-wrap"), 0.3, {
    transformOrigin: "center center",
    rotationX: 0,
    scaleY: 0.4,
  });
  $prevEles.each(function (idx, ele) {
    $(ele).css({
      zIndex: $prevEles.length - idx,
    });
    var $wrap = $(ele).find(".bar-wrap");
    if (idx < count) {
      var tIndex = count - idx;
      TweenMax.to($wrap, 0.3, {
        transformOrigin: "bottom",
        rotationX: tIndex * base * ratio * -1,
        scaleX: 1,
      });
    } else {
      TweenMax.to($wrap, 0.3, {
        zIndex: idx,
        transformOrigin: "bottom",
        rotationX: base * -1,
        scaleX: 1,
      });
    }
  });
  $nextEles.each(function (idx, ele) {
    var $wrap = $(ele).find(".bar-wrap");
    // const zIndex = $nextEles.length - idx;
    $(ele).css({
      zIndex: $nextEles.length - idx,
    });
    if (idx < count) {
      var tIndex = count - idx;
      TweenMax.to($wrap, 0.3, {
        transformOrigin: "bottom",
        rotationX: tIndex * base * ratio,
        scaleY: 1,
      });
    } else {
      TweenMax.to($wrap, 0.3, {
        zIndex: idx,
        transformOrigin: "bottom",
        rotationX: base,
        scaleY: 1,
      });
    }
  });
}
