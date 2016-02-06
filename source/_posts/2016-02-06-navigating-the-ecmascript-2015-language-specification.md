title: Navigating the ECMAScript® 2015 Language Specification
description: Finding answers to your JavaScript questions with the help of the official ECMAScript specification. Here's how.
date: 2016-02-06 12:12:12
tags:
- javascript
- es2015
categories:
- programming
- JavaScript
---

Reading a language specification is not an easy thing. I thought it would be interesting to show how you can use it to explain some JavaScript questions.

Here is one I encountered a few minutes ago on IRC:

> why can't we access an array property as `xs.0` `xs.1` `xs.2`?

Well, explaining the reason why &mdash; the design decisions which led to this "limitation" is not so easy. Finding what the specification says, on the other hand, is not so hard.

We'll start here: http://ecma-international.org/ecma-262/6.0/ and we're looking for the part which talks about accessing properties (accessing any properties, in fact).

If you don't know where to look, quickly find the [corresponding MDN page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators#Left-hand-side_expressions) and see that it's called a "property accessor" and that it's a left-hand-side expression.

Back to the ECMAScript specification, find the index at the beginning of the page. `12.3 Left-Hand-Side Expressions`, good. [`12.3.2 Property Accessors`](http://www.ecma-international.org/ecma-262/6.0/#sec-property-accessors), perfect!

Now, we want to know what can be used as `name` in the following syntax: `object.name`, right? It's pretty clear:

`MemberExpression . IdentifierName`.

But what is an `IdentifierName`? A quick search in the page brings us to the following section: [`11.6.1 Identifier Names`](http://www.ecma-international.org/ecma-262/6.0/#sec-identifier-names).

    IdentifierName ::
        IdentifierStart
        IdentifierName IdentifierPart

We now know that an `IdentifierName` has to start with an `IdentifierStart`, let's look for `IdentifierStart` in the page...

    IdentifierStart ::
        UnicodeIDStart
        $
        _
        \ UnicodeEscapeSequence

    [...]

    UnicodeIDStart ::
        any Unicode code point with the Unicode property “ID_Start”

An `IdentifierStart` is either a Unicode code point with the Unicode property "ID\_Start" or `$` or `_` or a Unicode escape sequence.

Back to the original question: why can't we do `xs.0`?

Here, `'0'` is our `IdentifierName` and its `IdentifierStart` is `0`. Since `0` is not `$`, `_` or a Unicode escape sequence, it has to be a `UnicodeIDStart` to be a valid property accessor when used with the dot notation.

`0` is the Unicode code point `U+0030`. Let's see what's in there using [codepoints.net](https://codepoints.net/U+0030):

> ID Start?   ✘

There it is. `0` does not have the property "ID\_Start". No ID\_Start ⇒ not a valid `IdentifierStart` ⇒ not a valid `IdentifierName` ⇒ not a valid property accessor using the dot notation.

*I'm [@_vhf](https://twitter.com/_vhf) on Twitter, feel free to follow me there.*
