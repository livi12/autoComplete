define(function(require, exports, module) {
	var $ = require('jquery');
	var _ = require('underscore');
	var http = require('common/base/http');
	var utils = require('utils');

	require('./skin/default/ui-autocomplete.css');

	var KeyCode = {
		ENTER: 13,
		ESCAPE: 27,
		PAGE_UP: 33,
		PAGE_DOWN: 34,
		UP: 38,
		DOWN: 40,
		NUMPAD_ENTER: 108
	};

	function AutoComplete(element, options) {
		var self = this;
		var ops = self.options = _.extend({}, options);
		self.item = null;
		self.text = '';
		self.active = false;

		var $ipt = self.$ipt = $(element);
		$ipt.val('');

		$ipt.wrap('<div class="m-autocomplete">');

		var $el = self.$el = $ipt.parent('.m-autocomplete');
		$el.width($ipt.width());

		self.$doc = $(document);

		self._bindEvents();
	}

	AutoComplete.prototype._bindEvents = function() {
		var self = this;
		var $ipt = self.$ipt;
		$ipt.on('input.autocomplete', function(evt) {
			self._text($ipt.val());
		});
		$ipt.on('propertychange.autocomplete', function(evt) {
			if (evt.propertyName === 'value') {
				self._text($ipt.val());
			}
		});
		$ipt.on('keydown.autocomplete', function(evt) {
			switch( evt.keyCode ) {
			case KeyCode.ENTER:
			case KeyCode.NUMPAD_ENTER:
				self._select();
				return false;
			case KeyCode.ESCAPE:
				self._item(null, true);
				return false;
			case KeyCode.PAGE_UP:
				self.toPrevPage();
				return false;
			case KeyCode.PAGE_DOWN:
				self.toNextPage();
				return false;
			case KeyCode.UP:
				self._markPrev();
				return false;
			case KeyCode.DOWN:
				self._markNext();
				return false;
			default:
				break;
			}
		});

		var $el = self.$el;
		$el.on('click.autocomplete', 'li', function(evt) {
			self._mark($(evt.target));
		});

		$el.on('dblclick.autocomplete', 'li', function(evt) {
			self._mark($(evt.target));
			self._select();
		});

		$el.on('click.autocomplete', '.left', function() {
			self.toPrevPage();
		});

		$el.on('click.autocomplete', '.right', function(evt) {
			self.toNextPage();
		});

		self.$doc.on('click.autocomplete', function(evt) {
			var isInEl = $.contains(self.$el.get(0), evt.target);
			if(!isInEl && self.active) {
				self._select();
			}
			self.active = isInEl;
		});
	};


	AutoComplete.prototype._text = _.debounce(function(newText) {
		var self = this;
		self.active = true;

		var text = self.text;
		if(newText !== text) {
			self.text = newText;
			self._item(null, false);

			if(newText) {
				self._request(1);
			}
		}
	}, 400);


	AutoComplete.prototype._request = function(curPage) {
		var self = this, ops = self.options;
		var query = {};
		var text = self.text;
		query[ops.nameKey] = text;
		query.curPage = curPage;
		query.pageSize = ops.pageSize;

		http.get(ops.url, query).then(function(datas) {
			self._response(datas, text);
		}, function() {
			utils.Notice.alert('候选项获取失败!');
		});
	};

	AutoComplete.prototype._response = function(datas, text) {
		var self = this, ops = self.options;

		var $d = $('<div class="drop">');

		var items = ops.itemsFn.call(self, datas);
		if(!items || !items.length) {
			$d.text('当前没有匹配数据!').appendTo(self.$el);
			return false;
		}

		var $ul = $('<ul class="list">').appendTo($d);
		var nameKey = ops.nameKey;
		$.each(items, function(i, item) {
			$('<li class="item">').text(item[nameKey]).data('item', item).appendTo($ul);
		});
		if(items.length === 1) {
			$ul.children().first().addClass('cur');
		}

		var page = ops.pageFn.call(self, datas);
		if(page && page.totalPage > 1) {
			$('<div class="page"><span class="left">&lt;</span><span class="right">&gt;</span></div></div>')
				.data('page', page).appendTo($d);
		}

		self.$el.find('.drop').remove();

		if(text === self.text && self.active) {
			$d.appendTo(self.$el);
		}
	};

	AutoComplete.prototype.toPrevPage = function() {
		var self = this;
		var $page = self.$el.find('.page');
		if($page.length) {
			var page = $page.data('page');
			if(page.curPage > 1) {
				self._request(page.curPage - 1);
			}
		}
	};

	AutoComplete.prototype.toNextPage = function() {
		var self = this;
		var $page = self.$el.find('.page');
		if($page.length) {
			var page = $page.data('page');
			if(page.curPage < page.totalPage) {
				self._request(page.curPage + 1);
			}
		}
	};

	AutoComplete.prototype._mark = function($li) {
		$li.addClass('cur').siblings('.cur').removeClass('cur');
	};

	AutoComplete.prototype._markPrev = function() {
		var self = this, $el = self.$el;

		var $lis = $el.find('li');
		if(!$lis.length) {
			return false;
		}

		var $cur = $lis.filter('.cur');
		if($cur.length) {
			var $prev = $cur.prev();
			if($prev.length) {
				self._mark($prev);
			}
		} else {
			self._mark($lis.last());
		}
	};

	AutoComplete.prototype._markNext = function() {
		var self = this, $el = self.$el;

		var $lis = $el.find('li');
		if(!$lis.length) {
			return false;
		}

		var $cur = $lis.filter('.cur');
		if($cur.length) {
			var $next = $cur.next();
			if($next.length) {
				self._mark($next);
			}
		} else {
			self._mark($lis.first());
		}
	};

	AutoComplete.prototype._text4item = function(item) {
		return item && item[this.options.nameKey] || '';;
	};

	AutoComplete.prototype._select = function() {
		var self = this;

		// 查看文本和已选中项是否一致
		var itemText = self._text4item(self.item);
		if(itemText === self.text) {
			self.$el.find('.drop').remove();
			return false;
		}

		// 进行变更
		var $cur = self.$el.find('li.cur');
		var item = $cur.length ? $cur.data('item') : null;
		self._item(item, true);
	};

	AutoComplete.prototype._item = function(item, updateText) {
		var self = this, ops = self.options;

		self.$el.find('.drop').remove();

		self.item = item;
		if(updateText) {
			var text = self._text4item(item);
			self.text = text;
			self.$ipt.val(text);
		}

		ops.onChange.call(self, item);
	};

	AutoComplete.prototype.destroy = function() {
		var self = this;
		self.$el.find('.drop').remove();
		self.$ipt.off('.autocomplete');
		self.$el.off('.autocomplete');
		self.$doc.off('.autocomplete');

		self.$ipt.unwrap();
	};

	$.fn.autocomplete = function(option) {
		var args = [].slice.call(arguments, 1);
		return this.each(function () {
			var $this = $(this);
			if (!$this.is(':text')){
				return false;
			}

			var data = $this.data('leke.autocomplete');
			var options = $.extend({}, $.fn.autocomplete.defaults, typeof option == 'object' && option);

			if (!data){
				data = new AutoComplete(this, options);
				$this.data('leke.autocomplete', data);
			}

			if(typeof option == 'string') {
				data[option].apply(data, args);

				if(option === 'destroy') {
					$this.removeData('leke.autocomplete');
				}
			}
		});
	};
	$.fn.autocomplete.Constructor = AutoComplete;
	$.fn.autocomplete.defaults = {
		url: '',
		onChange: function(item) {
			console && console.log(item);
		},
		nameKey: 'name',
		itemsFn: function(datas) {
			return datas.items;
		},
		pageSize: 10,
		pageFn: function(datas) {
			return datas.page;
		}
	};
});