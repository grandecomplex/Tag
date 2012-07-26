
(function() {
  
  
  var SEPARATOR = ",";
  
  var currentIndex = -1;
  
  var listLength;

  var Tag = function(namespace) {
    namespace = "#"+namespace+"-";

    this.$inputField = $(namespace+"text");
    this.$list = $(namespace+"list");
    this.$tags = $(namespace+"tags");
    this.$hiddenField = $(namespace+"hidden");
    
    this.$items = this.$list.find("li");
    
    listLength = this.$items.length;

    this.$inputField.quicksearch(namespace+"list li");

    this.addEvents();
  };

  Tag.prototype.addEvents = function() {
    var that = this;

    this.$list.find("li").click(function() {
      var text = $(this).text();
      that.addTag(text);
    });

    this.$inputField.focus(function() {
      this.$list.addClass("showing-list");
    }.bind(this))
    .keydown(function (e){
      var keyCode = e.keyCode;

      that.keyAction(keyCode);

      if(keyCode === 13) {
        e.preventDefault();
        this.blur();
      }
    });
  };

  Tag.prototype.hideList = function() {
    this.$list.removeClass("showing-list");

  };

  Tag.prototype.addTag = function(text) {
    var tag, btnRemove, currentTags, that = this;

    if (text === "") {
      return;
    }

    tag = document.createElement("div");
    btnRemove = document.createElement("a");
    currentTags = this.$hiddenField.val();

    this.$hiddenField.val(currentTags+text+SEPARATOR);

    text = document.createTextNode(text);

    tag.appendChild(text);
    tag.appendChild(btnRemove);

    this.$tags.append(tag);
    this.$inputField.val("");

    $(btnRemove).click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      that.removeTag(tag, this);
    });

    this.hideList();
  };

  Tag.prototype.removeTag = function(tag, btnRemove) {
    var text = this.$hiddenField.val();
    text = text.replace(tag.innerText+SEPARATOR, "");
    this.$hiddenField.val(text);

    $(btnRemove).unbind("click");
    $(tag).remove();
  };

  Tag.prototype.needsScroll = function() {

  };

  Tag.prototype.scrollToNextItem = function() {
    if (listLength === currentIndex) {
      return
    }
  };

  Tag.prototype.selectItem = function(direction) {
    if (direction === "down") {
      if (listLength === currentIndex) {
        return;
      }
      
      this.$items.eq(currentIndex).removeClass("highlighted");
      currentIndex++
      this.$items.eq(currentIndex).addClass("highlighted");
      
    } else if (direction === "up") {
      if (currentIndex === 0) {
        this.hideList();
      } else {
        
        this.$items.eq(currentIndex).removeClass("highlighted");
        currentIndex--
        this.$items.eq(currentIndex).addClass("highlighted");
        
      }
    }
  };

  Tag.prototype.keyAction = function(key) {
    switch(key) {
      case 40:
        this.selectItem("down");
        break;
      case 39:
        this.addTag();
        break;
      case 38:
        this.selectItem("up");
      break;
      case 13:
        this.addTag();
        break;
      case 9:
        this.hideList();
        break;
    }
  };

  if (typeof define !== "undefined") {
    define("Tag", [], Tag);
  } else {
    window.Tag = Tag;
  }



})();
