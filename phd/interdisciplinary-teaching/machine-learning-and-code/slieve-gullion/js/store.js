window.ZineStore = (function () {
  function emptyState() {
    return {
      meta: { title: '', author: '', mode: 'fork' },
      grammar: { origin: [], noun_anchor: [], noun_room: [], adjective_state: [], verb_fails: [] },
      images: [],
      pages: [{ id: 'page_001', elements: [] }]
    };
  }

  var _state = emptyState();
  var _seedGrammar = null;
  var _dominantHexes = [];
  var _subscribers = [];

  function _notify() {
    _subscribers.forEach(function (fn) { fn(_state); });
  }

  return {
    get state() { return _state; },
    get dominantHexes() { return _dominantHexes; },

    load: function (url) {
      return fetch(url)
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        })
        .then(function (data) {
          _state = data;
          _seedGrammar = JSON.parse(JSON.stringify(data.grammar));
          _notify();
        })
        .catch(function () {
          _state = emptyState();
          _notify();
        });
    },

    importFile: function (file) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function (e) {
          try {
            _state = JSON.parse(e.target.result);
            _seedGrammar = JSON.parse(JSON.stringify(_state.grammar));
            _dominantHexes = [];
            _notify();
            resolve();
          } catch (err) { reject(err); }
        };
        reader.onerror = function () { reject(reader.error); };
        reader.readAsText(file);
      });
    },

    exportJSON: function () {
      var blob = new Blob([JSON.stringify(_state, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'grammar.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    },

    update: function (patch) {
      Object.assign(_state, patch);
      _notify();
    },

    subscribe: function (fn) {
      _subscribers.push(fn);
    },

    getSeedGrammar: function () {
      return _seedGrammar ? JSON.parse(JSON.stringify(_seedGrammar)) : null;
    },

    saveDominantHexes: function (hexes) {
      _dominantHexes = hexes;
      _notify();
    }
  };
})();
