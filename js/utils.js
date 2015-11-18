define(function(require, exports, module) {

	var $ = require('jquery');

	var Utils = {};

	Utils.Notice = {
		/**
		 * 消息提示通用接口
		 * @param msg 显示的消息
		 * @param timeout 动画时间
		 */
		alert: function(msg, time) {
			var win = window, $doc = $(win.document);  // window.top改为window，放在dialog iframe里alert

			var $tpl = $('.m-tipbox', $doc);
			if(!$tpl.length) {
				$tpl = $('<div class="m-tipbox"><i class="iconfont icon">&#xf0142; </i><div class="msg"></div>');
				$tpl.appendTo($doc.find('body'));
			}
			$tpl.find('.msg').html(msg);

			var t = $doc.scrollTop() + ($(win).height() - $tpl.height()) / 2;
			var l = ($(win).width() - $tpl.width()) / 2;

			$tpl.stop().css({
				top: t,
				left: l
			}).show().fadeOut(time || 2000);

			return $tpl;
		}
	};

	Utils.MessageFormat = {
		format : function(source, params) {
			if (arguments.length == 1)
				return function() {
					var args = $.makeArray(arguments);
					args.unshift(source);
					return utils.MessageFormat.format(source, args);
				};
			if (arguments.length > 2
					&& (!params || params.constructor != Array)) {
				params = $.makeArray(arguments).slice(1);
			}
			if (params.constructor != Array) {
				params = [ params ];
			}
			$.each(params, function(i, n) {
				source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
			});
			return source;
		}
	};

	Utils.Dom = {
		/**
		 * 通用获取表单元素val的方法
		 * 使用例子：dom.getValue('id_num','checkbox');
		 */
		getValue : function(controlID, controltype){
			var objValue = "";
			if('' == controlID || null == controlID || undefined == controlID){
				return objValue;
			}
			switch (controltype) {
				case 'text': //文本输入框
					objValue = $.trim($("#" + controlID + "").attr("value"));
					break;
				case 'textarea': //长文本输入框
					objValue = $.trim($("#" + controlID + "").val());
					break;
				case 'radio': //单选框
					objValue = $("input[name='" + controlID + "']:checked").attr("value");
					break;
				case 'select': //下拉列表
					objValue = $("#" + controlID + "").val();
					break;
				case 'checkbox': //多选框
					$("input[name='" + controlID + "']:checked").each(function () {
						objValue += $(this).val() + ",";
					});
					objValue = objValue.substring(0, objValue.length-1);
					break;
				default:
					objValue = $.trim($("#" + controlID + "").attr("value"));
					break;
			}
			return null == objValue?"":objValue;
		},

		/**
		 * 输入框绑定输入内容提示的方法
		 * 使用例子：<input type="text" defval="输入姓名后添加好友" value="输入姓名后添加好友" class="ui-fontSty-black-6"/>
		 */
		initInputDefaultVal:function(){
	        var inputTextVal = '';
	        $('body').on('focusin', '[defval]', function() {
	            var fieldEl = $(this);
	            var val = fieldEl.val(),
	                emptyTip = fieldEl.attr('defval');
	            if (val == emptyTip) {
	                fieldEl.val('');
	            }
				fieldEl.removeClass("ui-fontSty-black-6");

	        }).on('focusout', '[defval]', function() {
	            var fieldEl = $(this);
	            var val = fieldEl.val(),
	                emptyTip = fieldEl.attr('defval');
	            if (val.length == 0) {
	                fieldEl.val(emptyTip);
	            }
				if(fieldEl.val()==emptyTip){
					fieldEl.addClass("ui-fontSty-black-6");
				}
	        });
		},

		/**
		 * 根据条件给 DOM 元素切换 class。
		 * @param $el 指定 DOM 元素
		 * @param cond 切换条件
		 * @param trueClass 条件为真时需添加、为假时需移除的 class
		 * @param falseClass 条件为假时需添加、为真时需移除的 class
		 */
		biCondClass: function(el, cond, trueClass, falseClass) {
			var ac = cond ? trueClass : falseClass;
			var bc = cond ? falseClass : trueClass;
			$(el).addClass(ac).removeClass(bc);
		},

		/**
		 * 根据条件隐藏或显示一组元素
		 * @param cond 切换条件
		 * @param trueDoms 条件为真时需显示、为假时需隐藏的 DOM 元素
		 * @param falseDoms 条件为假时需显示、为真时需隐藏的 DOM 元素
		 */
		biCondShow: function(cond, trueDoms, falseDoms) {
			var ad = cond ? trueDoms : falseDoms;
			var bd = cond ? falseDoms : trueDoms;
			$.each(ad, function(i, el) {
				$(el).show();
			});
			$.each(bd, function(i, el) {
				$(el).hide();
			});
		}
	};

	Utils.Number = {
		/**
		 * 将Number四舍五入为指定小数位数的数字。<br>
		 * 注意：Number.toFixed为五舍六入。
		 * @param num 数值
		 * @param digit 位数
		 */
		toFixed : function(num, digit) {
			var _num = parseFloat(num);
			if (isNaN(_num)) {
				return num;
			}
			digit = digit || 0;
			if (digit < 1) {
				return Math.round(_num);
			}
			var dd = Math.pow(10, digit);
			return Math.round(_num * dd) / dd;
		},

		/**
		 * 将数值格式化。<br>
		 * 示例：
		 * 	LekeNum.format(2356, '$#,##0.##') ==>  $2,356
		 * 	LekeNum.format(2356, '$#,##0.00') ==>  $2,356.00
		 * 	LekeNum.format(2356.125, '$#,##0.00')  ==>  $2,356.13
		 * @param value 数值
		 * @param pattern 格式
		 */
		format : function(value, pattern) {
			if (value === undefined || value === null || value === '' || isNaN(+value) || !pattern) {
				return value; // return as it is.
			}
			var isNegative, result, decimal, group, posLeadZero, posTrailZero, posSeparator, part, szSep, integer,

			len = pattern.length, start = pattern.search(/[0-9\-\+#]/),
			// find prefix
			prefix = start > 0 ? pattern.substring(0, start) : '',
			// reverse string: not an ideal method if there are surrogate pairs
			str = pattern.split('').reverse().join(''),

			end = str.search(/[0-9\-\+#]/), offset = len - end, indx = offset
					+ ((pattern.charAt(offset) === '.') ? 1 : 0),
			// find suffix
			suffix = end > 0 ? pattern.substring(indx, len) : '';
			// pattern with prefix & suffix removed
			pattern = pattern.substring(start, indx);
			// convert any string to number according to formation sign.
			value = pattern.charAt(0) === '-' ? -value : +value;
			isNegative = value < 0 ? value = -value : 0; // process only abs(), and turn on flag.

			// search for separator for grp & decimal, anything not digit, not +/- sign, not #.
			result = pattern.match(/[^\d\-\+#]/g);
			decimal = (result && result[result.length - 1]) || '.'; // treat the right most symbol as decimal
			group = (result && result[1] && result[0]) || ','; // treat the left most symbol as group separator

			// split the decimal for the format string if any.
			pattern = pattern.split(decimal);
			// Fix the decimal first, toFixed will auto fill trailing zero.
			value = value.toFixed(pattern[1] && pattern[1].length);
			value = +(value) + ''; // convert number to string to trim off *all* trailing decimal zero(es)

			// fill back any trailing zero according to format
			posTrailZero = pattern[1] && pattern[1].lastIndexOf('0'); // look for last zero in format
			part = value.split('.');
			// integer will get !part[1]
			if (!part[1] || (part[1] && part[1].length <= posTrailZero)) {
				value = (+value).toFixed(posTrailZero + 1);
			}
			szSep = pattern[0].split(group); // look for separator
			pattern[0] = szSep.join(''); // join back without separator for counting the pos of any leading 0.

			posLeadZero = pattern[0] && pattern[0].indexOf('0');
			if (posLeadZero > -1) {
				while (part[0].length < (pattern[0].length - posLeadZero)) {
					part[0] = '0' + part[0];
				}
			} else if (+part[0] === 0) {
				part[0] = '';
			}

			value = value.split('.');
			value[0] = part[0];

			// process the first group separator from decimal (.) only, the rest ignore.
			// get the length of the last slice of split result.
			posSeparator = (szSep[1] && szSep[szSep.length - 1].length);
			if (posSeparator) {
				integer = value[0];
				str = '';
				offset = integer.length % posSeparator;
				len = integer.length;
				for (indx = 0; indx < len; indx++) {
					str += integer.charAt(indx); // ie6 only support charAt for sz.
					// -posSeparator so that won't trail separator on full length
					/*jshint -W018 */
					if (!((indx - offset + 1) % posSeparator) && indx < len - posSeparator) {
						str += group;
					}
				}
				value[0] = str;
			}
			value[1] = (pattern[1] && value[1]) ? decimal + value[1] : '';

			// remove negative sign if result is zero
			result = value.join('');
			if (result === '0' || result === '') {
				// remove negative sign if result is zero
				isNegative = false;
			}

			// put back any negation, combine integer and fraction, and add back prefix & suffix
			return prefix + ((isNegative ? '-' : '') + result) + suffix;
		}
	};

	Utils.HtmlComments = {
		extract: function(content, prefix, multi) {
			content = content || '';
			var reg = new RegExp('<!--\\s+' + prefix + '\\s*:\\s*(\\S+)\\s*-->', multi ? 'g' : '');
			var mat = null;
			if(multi) {
				var result = [];
				while((mat = reg.exec(content)) != null) {
					result.push(mat[1]);
				}
				return result;
			} else {
				mat = reg.exec(content);
				return mat ? mat[1] : null;
			}
		},
		wrap: function(content, prefix) {
			return content ? '<!-- ' + prefix + ': ' + content + ' -->' : '';
		},
		remove: function(content) {
			return content ? $.trim(content.replace(/<!--[\s\S]*?-->/g, '')) : '';
		}
	};

	module.exports = Utils;
});