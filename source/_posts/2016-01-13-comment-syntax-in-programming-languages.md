title: Comment Syntax in Programming Languages (and the Eye of Osiris)
description: Wadler's law is bikeshedding applied to programming languages design.
date: 2016-01-13 19:19:19
tags:
- programming language design
categories:
- programming
---

I witnessed an uncommon debate the other day. Someone was asking why programming languages don't agree on a common syntax for comments.

Besides the usual indifferent answers such as "why would they", "why should they", and "it doesn't matter in the least", a couple of points where made:

1. When designing a programming language, discussing the comment syntax is the ultimate form of [bikeshedding](https://en.wikipedia.org/wiki/Bikeshedding).
2. An interesting corollary of *Parkinson's law of triviality* is [Wadler's law of language design](https://wiki.haskell.org/Wadler's_Law), stating that when designing a programming language "twice as much time is spent discussing syntax than semantics, twice as much time is spent discussing lexical syntax than syntax, and twice as much time is spent discussing syntax of comments than lexical syntax."

In conclusion, why not just rip off [Sketchy JS](https://vimeo.com/111122950)' "Eye of Osiris" operator syntax introduced by James Mickens?

<p class="pre-fake">{[~æ
this is a comment
*$€<img src="/blog/images/beyonce.jpg" alt="Beyonce" style="margin: none !important; display: inline-block; height: 37px; width: 39px; vertical-align: text-top;"></p>

(A curly brace, a square brace, a squiggle, and the combined AE character. Place your comment after the first part of the Eye of Osiris and close the Eye of Osiris using an asterisk, a dollar sign, a euro sign, and a tiny picture of Beyonce.)
