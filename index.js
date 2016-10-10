'use strict';


module.exports = function codepen_plugin(md, options) {
 
  md.renderer.rules.codepen = codepen_temp_render;
  md.inline.ruler.before('emphasis', 'codepen', embedcodepen);


  function codepen_temp_render(tokens, idx) {
      return '<div class="' + tokens[idx].codepenId + ' code_pen_temp"></div>';
  };

  function embedcodepen(state, silent) {
    var CODEPAN_LINK_REGEX = /^\[[^\]]+\]\(((?:http|https):\/\/codepen.io\/(\w+)\/pen\/(\w+))\)/,
        CODEPAN_INLINE_REGEX = /^((?:http|https):\/\/codepen.io\/(\w+)\/pen\/(\w+))/;

    var linkParser = CODEPAN_LINK_REGEX.exec(state.src) || CODEPAN_INLINE_REGEX.exec(state.src);
    if (!linkParser) {
        return false;
    }

    var userId = linkParser[2],
        codepenId = linkParser[3];

    state.pos = state.pos + state.src.length - 1;

    var tokens = [], token = [];
    if (!silent) {
        state.pending = null;

        var newState = new state.md.inline.State('codepen', state.md, state.env);
        token = state.push('codepen', '');
        token.userId = userId;
        token.codepenId = codepenId;
        token.url = 'https://codepen.io/api/oembed?url=' + linkParser[1] + '&format=js&callback=coolDude';
        $.ajax({
            url: token.url,
            type: 'GET',
            dataType: 'jsonp',
            success: function (result) {
                $('.' + token.codepenId).html(result.html);
            }
        });
    }
    state.pos = state.pos + state.src.length - 1;
    state.posMax = state.tokens.length;

    return true;
  }
};