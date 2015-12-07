输入框输入文本，自动补全文本
autoComlete.js api文档说明

ipt.autocomplete({
			/*数据请求的地址*/
			url: '../json/object.json',
			nameKey: 'schoolName',	/*要显示在下拉列表中的字符串，datas.items[i].nameKey   */
			pageSize:5,/*一页显示多少条数据*/
			itemsFn:function(datas){
				/*datas为服务器传回的数据，复写该函数，获得一次请求获得的学校的列表*/
				/*函数正文写在这里……*/
			},
			pageFn:function(datas){
				/*datas为服务器传回的数据，复写该函数,
				获得一次请求页面的信息*/
				/*函数正文写在这里……*/
			},
			onChange:function(item){
				/*item为获取的每一项的学校的信息*/
				/*函数正文写在这里……*/
			}

		});
		


该插件只实现了鼠标放在input输入框时，上下移动，前后翻页的效果，当单击某一项后，上下切换元素，前后翻页均未绑定事情，这样做似乎是合理的。
