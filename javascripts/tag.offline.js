(function($, window, undefined) {
  
  var LOCAL_STORAGE_KEY;
  
  function getData() {
    var parser = (JSON && JSON.parse) ? JSON.parse : $.parseJSON;
    
    data = localStorage.getItem(LOCAL_STORAGE_KEY);
    
    if (!data) {
      data = '{}';
    }
    
    try {
      return parser(data);
    } catch (e) {}
  }
  
  function setData(hiddenId, text) {
    var data = getData();
    data[hiddenId] = text;

    data = JSON.stringify(data);
    localStorage.setItem(LOCAL_STORAGE_KEY, data);
  }

  var Offline = function(tag, localStorageKey, shouldNotSaveToHidden) {
    var data;
    var value;
            
    if (!localStorage || !JSON.stringify) {
      return;
    }
    
    this.shouldNotSaveToHidden = shouldNotSaveToHidden || false;
    
    LOCAL_STORAGE_KEY = localStorageKey;
    
    data = getData();
    
    data = data || {};
    
    this.namespace = tag.namespace;
    this.$wrapper = tag.$wrapper;
    this.tag = tag;
    
    value  = data[this.namespace+"-hidden"];
    
    if (value) {
      this.value = value;
      this.populateFields();
    }
    
    this.addEvents();
  };
  
  Offline.prototype.addEvents = function() {
    $(window).bind("tag:changed:"+this.namespace, function(e) {
      var hiddenId = e.id, text = e.text;
            
      setData(hiddenId, text);
    });
  };

  Offline.prototype.populateFields = function() {
    var tag = this.tag,
        length = this.value.length,
        array,
        i = 0;
        
    //tag.$hiddenField.val(this.value);
    
  
    if (this.value.lastIndexOf(",") === length-1) {
      this.value = this.value.slice(0, length -1);
    }
    
    array = this.value.split(",");
    length = array.length;
    
    while (i < length) {
      tag.addTag(array[i]);
      i++;
    }
  };

  if (typeof define !== "undefined") {
    define([], function() {
      return Offline;
    });
  } else {
    window.Tag = window.Tag || {};
    window.Tag.Offline = Offline;
  }

})(jQuery, window);