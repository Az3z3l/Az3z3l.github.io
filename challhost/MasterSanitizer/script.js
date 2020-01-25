$(function() {

    var YOU_WON = [
        '__     ______  _    _  __          ______  _   _ ',
        '\\ \\   / / __ \\| |  | | \\ \\        / / __ \\| \\ | |',
        ' \\ \\_/ / |  | | |  | |  \\ \\  /\\  / / |  | |  \\| |',
        '  \\   /| |  | | |  | |   \\ \\/  \\/ /| |  | | . ` |',
        '   | | | |__| | |__| |    \\  /\\  / | |__| | |\\  |',
        '   |_|  \\____/ \\____/      \\/  \\/   \\____/|_| \\_|'
    ].join('\n');

    var isWon = false;
    var originSource;

    $(window).on('message', function(e) {
        if (e.originalEvent.origin !== 'http://sandbox.prompt.ml' && e.originalEvent.origin !== 'https://sandbox.prompt.ml') {
            return false;
        }
        var data = e.originalEvent.data;
        if (!isWon && data.passed) {
            isWon = true;
            originSource = $('pre.source-code').text();
            $('pre.source-code').text(YOU_WON);
            $.post(location.href + '/verify', {
                name: localStorage.name,
                code: data.code
            });
        }
    });

    $('pre.source-code').text(
        $('#unsafe-script').text()
                           .replace(/^\n|\n$/g, '')
                           .replace(/<\\\/script>/g, '</script> ')
    );

    var sandbox = new Sandbox('//sandbox.prompt.ml');

    $('#sandbox-frame').append(sandbox.getFrame());

    $('#name').on('input', function(e) {
        var name = $(this).val();
        localStorage.name = name;
    }).val(localStorage.name);

    // $('#input').on('input', function(e) {
    //     var input = $(this).val();
    //     var html = escape(input);

    //     $('#input-character-count').text(input.length);
    //     $('#injected-html').text(html);
    //     sandbox.inject(JSON.stringify({input: input, html: html}));
    // });

    $('#toggleView').on('click', function() {
        $('#sandbox-frame > iframe').toggleClass('viewable');
        $(this).toggleClass('toggle-active');
    });

    $('#refresh').on('click', function() {
        if (isWon) {
            isWon = false;
            $('pre.source-code').text(originSource);
        }
    });

});

////////////////////////////////////////////////////////////////////////////////

function Sandbox(src) {
    var self = this;
    self.script = '';

    this.frame = $('<iframe>').attr({
        'scrolling': "no"
    }).on('load', function(e) {
        try {
            this.contentWindow.name; // IE
            this.contentWindow.name = self.script;
            this.contentWindow.location = src;
        } catch (e) {}
    });
}

Sandbox.prototype.getFrame = function() {
    return this.frame;
};

Sandbox.prototype.inject = function(script) {
    var frame = this.frame[0];

    this.script = script;
    frame.contentWindow.location = 'about:blank';
};