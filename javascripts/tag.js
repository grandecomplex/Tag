
(function() {
  var SEPARATOR = ",";
  
  var currentIndex = -1;
  
  var listItemLength;
  
  var isListShowing = false;
  
  var LIST_ITEM_HEIGHT;
  
  var ITEMS_VISIBLE_COUNT;
  
  var listScrollPosition = 0;
  
  var maxVisibleItem, minVisibleItem = 0;
  
  function setHeight($parent, $items) {
    var height; 
    
    numberOfItems = 5;
    
    ITEMS_VISIBLE_COUNT = numberOfItems;
    resetMaxMinVisibleItems();
    
    LIST_ITEM_HEIGHT = $items.outerHeight();
    
    $parent.height(LIST_ITEM_HEIGHT*numberOfItems);
  }

  var Tag = function(namespace, options) {
    namespace = "#"+namespace+"-";

    this.$inputField = $(namespace+"text");
    this.$list = $(namespace+"list");
    this.$tags = $(namespace+"tags");
    this.$hiddenField = $(namespace+"hidden");
    
    this.$items = this.$list.find("li");
    
    setHeight(this.$list, this.$items);
    
    listItemLength = this.$items.length;

    this.quicksearch = this.$inputField.quicksearch(namespace+"list li");

    this.addEvents();
  };

  Tag.prototype.addEvents = function() {
    var that = this;
    var leaveTimer = 0;
    var scrollTimer = 0;

    this.$list.find("li").mousedown(function() {
      var text = $(this).text();
      that.addTag(text);
    });
    
    this.$list.keydown(function(e) {
      e.preventDefault();
    });
    
    this.$list.scroll(function() {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function() {
        that.setMinMaxItemIndexes();
      }, 500);
    });
    
    this.$inputField.keyup(function() {
      var lastItem;
      setTimeout(function() {
        if (that.quicksearch.matchedResultsCount === 1) {
          lastItem = that.$list.find("li:visible");
          lastItem.addClass("highlighted");
          currentIndex = lastItem.index();
        }

        that.$list.find(".highlighted:hidden").removeClass("highlighted");
      }, 200);
    });
    
    this.$inputField.parent(".tag-wrapper").mouseleave(function() {
      leaveTimer = setTimeout(function() {
        that.hideList();
      }, 400);
    }).mouseenter(function() {
      clearTimeout(leaveTimer);
    });

    this.$inputField.click(function() {
      that.showList();
    })
    .keydown(function (e){
      var keyCode = e.keyCode;
      that.keyAction(e);

      if(keyCode === 13) {
        e.preventDefault();
        var highlighted = that.$list.find(".highlighted");
        if (highlighted.length) {
          that.addTag(highlighted.text());
        }
        this.blur();
      }
      
      that.setMinMaxItemIndexes();
    });
    
    this.$items.live("hover", function() {
      that.$items.eq(currentIndex).removeClass("highlighted");
      currentIndex = $(this).index();
      $(this).addClass("highlighted");
    });
  };
  
  Tag.prototype.setMinMaxItemIndexes = function() {
    var listHeight = this.quicksearch.matchedResultsCount * LIST_ITEM_HEIGHT;
    var scrollTop = this.$list.scrollTop();
    listScrollPosition = scrollTop - (scrollTop % LIST_ITEM_HEIGHT);
    minVisibleItem = parseInt( ( listHeight - (listHeight-listScrollPosition) ) / LIST_ITEM_HEIGHT, 10 );
    maxVisibleItem = minVisibleItem + 5;
  };
  
  function resetMaxMinVisibleItems() {
    maxVisibleItem = ITEMS_VISIBLE_COUNT;
    minVisibleItem = 0;
  }

  Tag.prototype.hideList = function() {
    this.$list.removeClass("showing-list");
    isListShowing = false;
    currentIndex = -1;
    resetMaxMinVisibleItems();
    listScrollPosition = 0;
  };
  
  Tag.prototype.showList = function() {
    this.$list.addClass("showing-list");
    this.$list.find("li").css("display", "block");
    isListShowing = true;
    currentIndex = -1;
    this.$list.find(".highlighted").removeClass("highlighted");
    this.$list.scrollTop(0);
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
    if (currentIndex+1 > maxVisibleItem || currentIndex < minVisibleItem) {
      return true;
    }
    return false;
  };
  
  Tag.prototype.scroll = function (direction) {
    var scrollAmount;
    
    if (direction === "up") {
      maxVisibleItem--;
      minVisibleItem--;
      scrollAmount = -LIST_ITEM_HEIGHT;
    } else {
      maxVisibleItem++;
      minVisibleItem++;
      scrollAmount = LIST_ITEM_HEIGHT;
    }
    
    listScrollPosition += scrollAmount;
        
    this.$list.scrollTop(listScrollPosition);
  };

  Tag.prototype.selectItem = function(direction) {
    if ( !isListShowing && direction !== "down" && direction !== "up" ) {
      return;
    }
    
    this.$items.eq(currentIndex).removeClass("highlighted");
    
    if (direction === "down") {
      if (listItemLength <= currentIndex+1) {
        this.$items.eq(currentIndex).addClass("highlighted");
        
        return;
      }
      
      currentIndex++;
      this.$items.eq(currentIndex).addClass("highlighted");
      
    } else if (direction === "up") {
      
      if (currentIndex > 0) {

        currentIndex--;
        this.$items.eq(currentIndex).addClass("highlighted");
        
      } else if (currentIndex === 0) {
        currentIndex = -1;
      }
    }
    
    if (this.needsScroll()) {
      this.scroll(direction);
    }
  };

  Tag.prototype.keyAction = function(e) {
    switch(e.keyCode) {
      case 40:
        if (!isListShowing) {
          this.showList();
        }
        this.selectItem("down");
        break;
      case 27:
        this.hideList();
        break;
      case 38:
        this.selectItem("up");
      break;
      case 13:
        this.addTag(e.target.value);
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
