title: One Simple Trick for JavaScript Performance Optimization
description: My attempt at clickbait. Also, an interesting (who said "useless") JS performance tip.
date: 2016-01-15 01:20:12
tags:
- javascript
- v8
- crankshaft
- nodejs
categories:
- programming
- JavaScript
---

Sorry for the clickbait. It's so omnipresent these days, I *had* to try it. 90% of my daily Medium digest and 90% of my Pocket recommendations are like this. Note to self: write some kind of clickbait filtering software. Obtaining a huge training set should **not** be an issue. (We could even crowdsource these! How fun!)

Anyway. If you follow my blog (and I'm not sure you should), you might have guessed that I'm currently having fun with V8's optimizing compiler, an awesome piece of software romantically called Crankshaft. Basically, it's what makes JavaScript fast on Chrome/nodejs.

Most of the time Crankshaft is able to optimize JavaScript functions. They then run really fast.

In some cases, Crankshaft doesn't optimize a function. It simply gets to a function and bails out instead of trying to optimize it. Whenever this happens, it invokes a **bailout reason**.

Documentation on these bailout reasons are very scarce, so Wednesday I decided to list them all and try to reproduce each of them, documenting why it occurs, giving advice on how to avoid the bailout, and give real-life examples of where it can be spotted.

As of the writing of this post, I was only able to partially document 8 of them. I have more material but need more research/more time.

If you'd like to see what I got and to contribute your awesome V8 knowledge, please see **[V8 bailout reasons](https://github.com/vhf/v8-bailout-reasons)** on GitHub.

But I didn't make you read all this for nothing. In the title of this post I made a promise I intend to fulfill, so here is...

### One Simple Trick for JavaScript Performance Optimization

Don't use more than ~~65535~~ 512 parameters in a single JavaScript function. Otherwise, Crankshaft will bail out with the following informative message: "Too many parameters."

#### How can I fix my JavaScript code to make it run blazingly fast?

Stick to 511 parameters (or less).

- 511 is a good-looking number. In unicode, it looks really really good: &#511;
- A function with 511 parameters always looks better than a function with 512 parameters. (I have discovered a truly remarkable proof which this margin is too small to contain.)

*Note: I originally wrote this article with 65535 instead of 512. I did not pay enough attention while reading V8 source code. It was 65535 bits, i.e. 512 bytes, or 512 parameters. Not 65535 parameters. [Review the diff](https://github.com/vhf/concise-notes/commit/88fc535cbe23a567ddd3e65f8f64c6590936a51b).*
