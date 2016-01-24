title: Chrome 49 is coming, with 92% ES2015 coverage!
date: 2016-01-21 21:53:35
tags:
    - V8
    - javascript
    - es2015
    - nodejs
    - crankshaft
categories:
- programming
- JavaScript
---

December 11, Chrome 49 landed on the Dev channel. This week, with already [two new releases of Chrome 49](https://googlechromereleases.blogspot.com) to the Dev channel, the process seems to intensify.

On Tuesday [Seth Thompson](http://seththompson.org), who works on V8, [wrote on HN](https://news.ycombinator.com/item?id=10932790) that "V8 now has 92% ES6 coverage in Chrome Canary (on track for shipping in Chrome M49)!"

kangax' awesome [ECMAScript compatibility table](http://kangax.github.io/compat-table/es6/#chrome49) is already up to date, and Chrome 49's column looks very green indeed.

Since I talked about both optimizing **rest parameters** in Babel ([#1][1], [#2][2]) and **[V8 bailout reasons](https://github.com/vhf/v8-bailout-reasons)** ([#3][3], [#1][1], [#2][2]) on this blog, I thought I would look into it again.

The upcoming version of V8 does support rest parameters, and that's awesome! But Crankshaft bails out when it encounters one of them ([#4][4]) instead of optimizing your function, and that's less awesome. But the engineer who introduced this bailout said ([#5][5]) they will be optimized by TurboFan instead, awesome again! (He even hinted that all currently "unsafe" usages of the `arguments` object will be optimized, and that's *very awesome*!)

In the meantime, before all of these ES2015 features land in Node, before TurboFan comes in handy, I guess I'll keep using Babel's `transform-es2015-parameters` for my Node code.

[1]: https://vhf.github.io/blog/2015/11/02/javascript-performance-with-babel-and-node-js/
[2]: https://vhf.github.io/blog/2015/12/17/making-babel-fast-with-rest-parameters/
[3]: https://vhf.github.io/blog/2016/01/15/one-simple-trick-for-javascript-performance-optimization/
[4]: https://chromium.googlesource.com/v8/v8/+/d3f074b23195a2426d14298dca30c4cf9183f203%5E%21/src/bailout-reason.h
[5]: https://codereview.chromium.org/1272673003
