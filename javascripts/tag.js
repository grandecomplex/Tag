(function($, window, undefined) {
  var SEPARATOR = ",",
      currentIndex = -1,
      listItemLength,
      isListShowing = false,
      itemsVisible = 5,
      listScrollPosition = 0,
      maxVisibleItem, 
      minVisibleItem = 0,
      currentElement;

  var Tag = function(namespace, options) {
    this.namespace = namespace;
    namespace = "#"+namespace+"-";
    
    options = options || {};
    
    itemsVisible = options.itemsVisible || 5;

    this.$inputField = $(namespace+"text");
    this.$wrapper = this.$inputField.parent();
    this.$list = $(namespace+"list");
    this.$tags = $(namespace+"tags");
    this.$hiddenField = $(namespace+"hidden");
    
    this.$items = this.$list.find("li");
    
    this.setHeight(this.$list, this.$items);
    
    listItemLength = this.$items.length;

    this.quicksearch = this.$inputField.quicksearch(namespace+"list li");

    this.addEvents();
  };
  
  Tag.prototype.setHeight = function($parent, $items) {
    resetMaxMinVisibleItems();
    this.LIST_ITEM_HEIGHT = 24;
    
    $parent.height(this.LIST_ITEM_HEIGHT*itemsVisible);
  };

  Tag.prototype.addEvents = function() {
    var that = this;
    var leaveTimer = 0;
    var scrollTimer = 0;

    this.$list.find("li").mousedown(function() {
      var $this = $(this);
      var text = $this.text();
            
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
    
    this.$wrapper.mouseleave(function() {
      if ($(this).find("input:focus").length === 0) {
        leaveTimer = setTimeout(function() {
          that.hideList();
        }, 200);
      }
    }).mouseenter(function() {
      clearTimeout(leaveTimer);
    });

    this.$inputField.click(function() {
      that.showList();
    })
    .keydown(function (e){
      var keyCode = e.keyCode;
      that.keyAction(e);

      $("body").bind("quicksearch:matchedResultsSet", function() {
        that.setMinMaxItemIndexes();
      });
    })
    .blur(function() {
      that.hideList();
    });
    
    this.$items.live("hover", function() {
      that.$items.eq(currentIndex).removeClass("highlighted");
      currentIndex = $(this).index();
      $(this).addClass("highlighted");
    });
  };
  
  Tag.prototype.setMinMaxItemIndexes = function() {
    var listHeight = this.quicksearch.matchedResultsCount * this.LIST_ITEM_HEIGHT;
    var scrollTop = this.$list.scrollTop();
    listScrollPosition = scrollTop - (scrollTop % this.LIST_ITEM_HEIGHT);
    minVisibleItem = parseInt( ( listHeight - (listHeight-listScrollPosition) ) / this.LIST_ITEM_HEIGHT, 10 );
    maxVisibleItem = minVisibleItem + 5;
  };
  
  function resetMaxMinVisibleItems() {
    maxVisibleItem = itemsVisible;
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
    $(".tag-list").removeClass("showing-list");
    
    this.$list.addClass("showing-list");
        
    this.$list.find("li").css("display", "block");
    isListShowing = true;
    currentIndex = -1;
    this.$list.find(".highlighted").removeClass("highlighted");
    this.$list.scrollTop(0);
  };

  Tag.prototype.addTag = function(text) {
    var tag, btnRemove, that = this;

    if (text === "") {
      return;
    }

    tag = document.createElement("div");
    btnRemove = document.createElement("a");
    
    this.saveTag(text);

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
  
  Tag.prototype.saveTag = function(text) {
    var currentTags = this.$hiddenField.val();
    var event = $.Event("tag:changed:"+this.namespace);
    var tagsText = currentTags+text+SEPARATOR;
    
    this.$hiddenField.val(tagsText);
    
    event.id = this.$hiddenField.attr("id");
    event.text = tagsText;
    $(window).trigger(event);
  };

  Tag.prototype.removeTag = function(tag, btnRemove) {
    var text = this.$hiddenField.val();
    text = text.replace(tag.innerText+SEPARATOR, "");
    
    var event = $.Event("tag:changed:"+this.namespace);
    event.id = this.$hiddenField.attr("id");
    event.text = text;    
    
    this.$hiddenField.val(text);
    
    $(window).trigger(event);
    
    $(btnRemove).unbind("click");
    $(tag).remove();
  };

  function needsScroll() {
    var visibleItems = this.quicksearch.visibleItems;
    
    if (typeof visibleItems === "undefined" || visibleItems < 5) {
      return false;
    }
    
    if (currentIndex === visibleItems[maxVisibleItem] || currentIndex === visibleItems[minVisibleItem-1]) {
      return true;
    }
    return false;
  }
  
  Tag.prototype.scroll = function (direction) {
    var scrollAmount;
    
    if (direction === "up") {
      maxVisibleItem--;
      minVisibleItem--;
      scrollAmount = -this.LIST_ITEM_HEIGHT;
    } else {
      maxVisibleItem++;
      minVisibleItem++;
      scrollAmount = this.LIST_ITEM_HEIGHT;
    }
    
    listScrollPosition += scrollAmount;
        
    this.$list.scrollTop(listScrollPosition);
  };

  Tag.prototype.selectItem = function(direction) {
    var $currentHighlighted, lastVisibleIndex, highlightedIndex, $nextItem, $prevItem;
    
    if ( !isListShowing && direction !== "down" && direction !== "up" ) {
      return;
    }
    
    $currentHighlighted = this.$list.find(".highlighted");
    
    lastVisibleIndex = this.$list.find(":visible:last").index();
    highlightedIndex = $currentHighlighted.index();
    
    if (direction === "down") {
      if (!$currentHighlighted.length) {
        return this.$list.find(":visible").first().addClass("highlighted");
      }
      
      if (lastVisibleIndex === highlightedIndex) {
        return;
      }
      
      $nextItem = $currentHighlighted.nextAll(":visible").first();
      $nextItem.addClass("highlighted");      
      currentIndex = $nextItem.index();
      
    } else if (direction === "up") {
      
      if (currentIndex > 0) {
        $prevItem = $currentHighlighted.prevAll(":visible").first();
        currentIndex = $prevItem.index();
        $prevItem.addClass("highlighted");
      } else if (currentIndex === 0) {
        currentIndex = -1;
      }
    }
    
    $currentHighlighted.removeClass("highlighted");
    
    if (needsScroll.call(this)) {
      this.scroll(direction);
    }
  };

  Tag.prototype.keyAction = function(e) {
    var highlighted;
    
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
        e.preventDefault();
      
        if (this.quicksearch.matchedResultsCount === 0) {
          return this.addTag(e.target.value);
        }
        
        highlighted = this.$list.find(".highlighted");
        
        if (highlighted.length) {
          this.addTag(highlighted.text());
        }
        
        this.$inputField.blur();
        
        break;
      case 9:
        this.hideList();
        break;
    }
  };
  

  if (typeof define !== "undefined") {
    define([], function() {
      return Tag;
    });
  } else {
    window.Tag = Tag;
  }
})($, window);