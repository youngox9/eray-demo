window.dataLayer = window.dataLayer || [];

function gtag() {
    dataLayer.push(arguments);
}
gtag('js', new Date());

gtag('config', '');


window.dataLayer = window.dataLayer || [];

function gtag() {
    dataLayer.push(arguments);
}
gtag('js', new Date());

gtag('config', 'UA-');




//追蹤事件
window.trackEvent = function (category, label) {
    if ("gtag" in window && category && label) {
        console.log('%cGA:[' + category + '][' + label + ']', 'background: #c54e6e; color: white; font-size:18px');
        gtag('event', 'click', {
            'event_category': category,
            'event_label': label
        });
    }
};

//虛擬頁面
// window.trackPage = function (page) {
//     if ("gtag" in window && page) {
//         console.log('%cPAGE:[' + page + ']', 'background: #6bb8c8; color: white; font-size:32px');
//         gtag('config', 'UA-156186955-1', {
//             'page_title': page,
//             'page_path': page
//         });
//     }
// };