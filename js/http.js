define(function(require, exports, module) {
	var $ = require('jquery');
	var JSON = require('json');
	var _ = require('./helper');
	var session = require('./session');

	var Http = {
		ajax: function(options) {
			var ops = $.extend({
				dataType: 'json'
			}, options);
			var dfd = $.Deferred();
			$.ajax(ops).then(function(resp, textStatus, xhr) {
				if(resp && resp.success) {
					dfd.resolve(resp.datas);
				} else {
					dfd.reject(resp && resp.message);
				}
			}, function(xhr, textStatus, err) {
				dfd.reject(err);
			});
			return dfd.promise();
		},
		get: function(url, data) {
			return this.ajax({
				type: 'get',
				url: url,
				data: data
			});
		},
		cacheGet: function(url, data) {
			var cacheUrl = url;
			if(data) {
				if(!_.isString(data)) {
					data = $.param(data);
				}
				cacheUrl += ( /\?/.test( cacheUrl ) ? "&" : "?" ) + data;
			}
			var cachedValue = session.get(cacheUrl);
			var dfd = $.Deferred();
			if(cachedValue) {
				dfd.resolve(cachedValue);
			} else {
				this.get(url, data).then(function(datas) {
					session.set(cacheUrl, datas);
					dfd.resolve(datas);
				}, function(msg) {
					dfd.reject(msg);
				});
			}
			return dfd.promise();
		},
		uncacheGet: function(url, data) {
			return this.get(url, _.extend({
				_t: new Date().getTime()
			}, data));
		},
		post: function(url, data) {
			return this.ajax({
				type: 'post',
				url: url,
				data: data
			});
		},
		postJSON: function(url, data) {
			return this.post(url, {
				dataJson: _.isString(data) ? data : JSON.stringify(data || {})
			});
		},
		jsonp: function(url, data) {
			var dfd = $.Deferred();
			var valid = /=\?/.test(url);
			var actUrl = valid ? url : (url + ( /\?/.test( url ) ? "&" : "?" ) + 'callback=?');
			var req = $.getJSON(actUrl, data, function(resp) {
				if(resp && resp.success) {
					dfd.resolve(resp.datas);
				} else {
					dfd.reject(resp && resp.message);
				}
			});
			return dfd.promise();
		}
	};
	module.exports = Http;
});