(function docReady($) {
  var $sidenav = $('.side-nav');

  $('#mobile-menu').click(function openMobileMenu(e) {
    e.stopPropagation();
    $sidenav.css('left', 0);
  });
  $('#mobile-menu-close').click(function closeMobileMenu() {
    $sidenav.css('left', '-105%');
  });

  // Share
  $('body').on('click', function closeShareBox() {
    $('.article-share-box.article-share-box-opened').removeClass('article-share-box-opened');
  }).on('click', '.article-share-link', function openShareBox(e) {
    var $this = $(this);
    var url = $this.attr('data-url');
    var encodedUrl = encodeURIComponent(url);
    var id = 'article-share-box' + $this.attr('data-id');
    var offset = $this.offset();
    var box;
    var html;

    e.stopPropagation();

    if ($('#' + id).length) {
      box = $('#' + id);
      if (box.hasClass('article-share-box-opened')) {
        box.removeClass('article-share-box-opened');
        return;
      }
    } else {
      html = [
        '<div id="' + id + '" class="article-share-box">',
        '<input class="article-share-input" value="' + url + '">',
        '<div class="article-share-links">',
        '<a href="https://twitter.com/intent/tweet?url=' + encodedUrl + '" class="article-share-twitter" target="_blank" title="Twitter"></a>',
        '<a href="https://www.facebook.com/sharer.php?u=' + encodedUrl + '" class="article-share-facebook" target="_blank" title="Facebook"></a>',
        '<a href="http://pinterest.com/pin/create/button/?url=' + encodedUrl + '" class="article-share-pinterest" target="_blank" title="Pinterest"></a>',
        '<a href="https://plus.google.com/share?url=' + encodedUrl + '" class="article-share-google" target="_blank" title="Google+"></a>',
        '</div>',
        '</div>',
      ].join('');

      box = $(html);

      $('body').append(box);
    }

    $('.article-share-box.article-share-box-opened').hide();

    box.css({
      top: offset.top + 25,
      left: offset.left,
    }).addClass('article-share-box-opened');
  }).on('click', '.article-share-box', function dontMove(e) {
    e.stopPropagation();
  }).on('click', '.article-share-input', function shareURLClick() {
    $(this).select();
  }).on('click', '.article-share-links > a', function shareSocialClick(e) {
    e.preventDefault();
    e.stopPropagation();

    window.open(this.href, 'article-share-window-' + Date.now(), 'width=500,height=450');
  });
})(jQuery);
