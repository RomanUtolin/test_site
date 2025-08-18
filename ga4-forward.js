(function () {
    'use strict';

    const endpoint = 'http://127.0.0.1:8888/events/event';

    function postPayload(payload) {
        let str_payload = JSON.stringify(payload)
        console.log(str_payload)

        try {
            fetch(endpoint, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: str_payload, keepalive: true,
            }).catch(function (err) {
                console.log(err);
            });
        } catch (err) {
            console.log(err);
        }
    }

    function handleDataLayerItem(item) {
        // Отправляем как есть. Если это не объект — завернём в объект с полем value.
        let payload = (item && typeof item === 'object') ? item : {value: item};
        postPayload(payload);
    }

    let dl = (function ensureDataLayer() {
        if (typeof window === 'undefined') return [];
        window.dataLayer = window.dataLayer || [];
        return window.dataLayer;
    })();

    //Перехватчик
    try {
        let originalPush = dl.push;
        dl.push = function () {
            let args = Array.prototype.slice.call(arguments);
            for (let i = 0; i < args.length; i++) {
                console.log("###############")
                console.log("use dl.push");
                console.log(args)
                console.log(args[i])
                console.log("###############")
                handleDataLayerItem(args[i]);
            }
            return originalPush.apply(dl, args);
        };
    } catch (err) {
        console.log(err)
    }

    //Перехватчик
    try {
        let originalGtag = window.gtag;
        window.gtag = function () {
            let args = Array.prototype.slice.call(arguments);

            if (args[0] === 'event') {
                let eventName = args[1];
                let params = args[2] || {};
                console.log("use window.gtag");
                handleDataLayerItem(Object.assign({event: eventName}, params));
            }
            if (typeof originalGtag === 'function') {
                return originalGtag.apply(this, arguments);
            }
        };
    } catch (err) {
        console.log(err)
    }

})();
