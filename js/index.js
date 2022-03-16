var isPC = function () {
  return $(window).width() > 768;
};
var isMd = $(window).width() <= 768;

$(function () {
  function cardAnimation($el) {
    var $nextEles = $el.nextAll();
    var $prevEles = $el.prevAll();
    $(".card-wrap").attr("style", "");
    $(".card").attr("style", "");

    $el.css({
      zIndex: 99,
    });

    if (isPC()) {
      var base = 6;
      var count = 5;
      var ratio = 1.02;
      TweenMax.to($el.find(".card-wrap"), 0.3, {
        transformOrigin: "center center",
        rotationY: 0,
        rotationX: 0,
        scaleX: 0.5,
        scaleY: 1,
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
            rotationX: 0,
            scaleX: 1,
          });
        } else {
          TweenMax.to($wrap, 0.3, {
            zIndex: idx,
            transformOrigin: "left",
            rotationY: base + "deg",
            rotationX: 0,
            scaleX: 1,
          });
        }
      });

      $nextEles.each(function (idx, ele) {
        var $wrap = $(ele).find(".card-wrap");
        $(ele).css({
          zIndex: $nextEles.length - idx,
        });
        if (idx < count) {
          var tIndex = count - idx;
          TweenMax.to($wrap, 0.3, {
            transformOrigin: "right",
            rotationY: tIndex * base * ratio * -1,
            rotationX: 0,
            scaleX: 1,
          });
        } else {
          TweenMax.to($wrap, 0.3, {
            zIndex: idx,
            transformOrigin: "right",
            rotationY: base * -1,
            rotationX: 0,
            scaleX: 1,
          });
        }
      });
    } else {
      var base = 24;
      var count = 3;
      var ratio = 0.8;
      // Mobile
      TweenMax.to($el.find(".card-wrap"), 0.3, {
        transformOrigin: "center center",
        rotationX: 0,
        scaleY: 0.4,
        scaleX: 1,
      });
      $prevEles.each(function (idx, ele) {
        $(ele).css({
          zIndex: $prevEles.length - idx,
        });
        var $wrap = $(ele).find(".card-wrap");
        if (idx < count) {
          var tIndex = count - idx;
          TweenMax.to($wrap, 0.3, {
            transformOrigin: "bottom",
            rotationX: tIndex * base * ratio * -1,
            rotationY: 0,
            scaleX: 1,
          });
        } else {
          TweenMax.to($wrap, 0.3, {
            zIndex: idx,
            transformOrigin: "bottom",
            rotationX: base * -1,
            rotationY: 0,
            scaleX: 1,
          });
        }
      });
      $nextEles.each(function (idx, ele) {
        var $wrap = $(ele).find(".card-wrap");
        $(ele).css({
          zIndex: $nextEles.length - idx,
        });
        if (idx < count) {
          var tIndex = count - idx;
          TweenMax.to($wrap, 0.3, {
            transformOrigin: "bottom",
            rotationX: tIndex * base * ratio,
            rotationY: 0,
            scaleY: 1,
          });
        } else {
          TweenMax.to($wrap, 0.3, {
            zIndex: idx,
            transformOrigin: "bottom",
            rotationX: base,
            rotationY: 0,
            scaleY: 1,
          });
        }
      });
    }
  }
  function bindCard() {
    $(".card-container").each(function (idx, obj) {
      var $cards = $(obj).find(".card");
      var $centerEle = $cards.eq(Math.floor($cards.length / 2));
      $cards.bind("mouseover", function (e) {
        cardAnimation($(this));
      });
      $cards.bind("mouseleave", function (e) {
        cardAnimation($centerEle);
      });
      cardAnimation($centerEle);
    });
  }

  $(window).bind("resize", bindCard).trigger("resize");
});

$(function () {
  $("body").bind("wheel", function (e) {
    var distance = e.originalEvent.wheelDeltaY * -1 * 4;
    var scrollLeft = $("body").scrollLeft();

    TweenMax.to(
      $("body")[0],
      1.2,
      {
        scrollLeft: scrollLeft + distance,
      },
      0
    );
  });

  function onScroll() {
    var scrollLeft = $("body").scrollLeft();
    var prefix = 20;
    var titleList = $(".vertical-title").get();
    var stackLeft = 0;
    var stackRight = 0;

    var arr = [];
    var leftArr = [];
    var otherArr = [];

    titleList.forEach(function (ele, idx) {
      var $ele = $(ele);
      var $wrap = $ele.find(".title-wrap");
      var w = $ele.width();
      var elemLeft = scrollLeft + $ele.offset().left;
      var fixedLeft = stackLeft + $(".index-header").width();
      var viewLeft = scrollLeft + fixedLeft;
      if (elemLeft <= viewLeft) {
        leftArr.push($ele);
        stackLeft += w - prefix;
        arr.push({
          el: $wrap,
          pos: "left",
          left: fixedLeft,
          isMask: idx === 0,
        });
      } else {
        otherArr.unshift($ele);
      }
    });

    otherArr.forEach(function (ele, i) {
      var $ele = $(ele);
      var $wrap = $ele.find(".title-wrap");
      var w = $ele.width();

      var elemLeft = scrollLeft + $ele.offset().left;
      var eleRight = elemLeft + w;
      var fixedRight = $(window).width() - stackRight;
      var viewRight = scrollLeft + fixedRight;

      if (eleRight >= viewRight + 1) {
        arr.push({
          el: $wrap,
          pos: "left",
          left: $(window).width() - stackRight - w,
        });
        stackRight += w - prefix;
      } else {
        arr.push({
          el: $wrap,
          pos: "none",
          right: stackRight,
        });
      }
    });

    arr.forEach(function (o, i) {
      var $el = $(o.el);
      if (!$el.length) return;
      if (o.isMask) {
        $el.addClass("is-mask");
      }
      if (o.pos === "left") {
        $el.addClass("fixed-left");
        $el.css({ position: "fixed", left: o.left, zIndex: 3 });
      } else if (o.pos === "right") {
        $el.addClass("fixed-right");
        $el.css({ position: "fixed", right: o.right, zIndex: 3 });
      } else {
        $el.removeClass("fixed-left fixed-right is-mask");
        $el.css({ position: "relative", right: "", left: "", zIndex: 1 });
      }
    });
  }

  $("body").bind("scroll resize", onScroll).trigger("scroll");
  $(window).bind("resize", onScroll).trigger("resize");

  $(".title-wrap").click(function () {
    var scrollLeft = $("body").scrollLeft();
    var elemLeft =
      scrollLeft +
      $(this).parents(".vertical-title").eq(0).offset().left +
      $(".vertical-scroll")[0].scrollLeft;

    $("body").stop().animate(
      {
        scrollLeft: elemLeft,
      },
      1000
    );
  });

  $("body")
    .bind("scroll", function (e) {
      var scrollLeft = $("body").scrollLeft();
      var scrollTop = $("body").scrollTop();
      var $wow = $(".wow");
      $wow.each(function (i, el) {
        var $el = $(el);
        if (isPC()) {
          var viewLeft = scrollLeft;
          var viewRight = scrollLeft + $(window).width() * 0.8;

          var left = scrollLeft + $el.offset().left;
          var right = left + $el.width();

          if (right >= viewLeft && left <= viewRight) {
            $el.addClass("animated");
          } else {
            $el.removeClass("animated");
          }
        } else {
          var viewTop = scrollTop;
          var viewBottom = scrollTop + $(window).height();
          var top = scrollTop + $el.offset().top;
          var bottom = top + $el.width();
          if (bottom >= viewTop && top <= viewBottom) {
            $el.addClass("animated");
          } else {
            $el.removeClass("animated");
          }
        }
      });
    })
    .trigger("scroll");

  $("body")
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

        if (isPC()) {
          var left = scrollLeft + $el.offset().left;
          var right = left + $el.width();
          if (scrollLeft > left - trigger && right > scrollLeft) {
            $el.addClass("animated");
          } else {
            $el.removeClass("animated");
          }
        } else {
          var top = scrollTop + $el.offset().top;
          var bottom = top + $el.height();

          if (scrollTop >= top - trigger && bottom > scrollTop) {
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
