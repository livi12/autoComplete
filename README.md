#autoComplete 输入框自动补全插件

[实例链接](http://192.168.20.21/static/widget/ui-autoComplete/page/)

##params

```javascript
ipt = $(document).find('.j-school-select');
/*可选参数*/
ipt.autocomplete({

	url: '../json/object.json',		/*数据请求的地址*/
	nameKey: 'schoolName',	/*要显示在下拉列表中的字符串，datas.items[i].nameKey   */
	pageSize:5, 	/*一页显示多少条数据*/
	itemsFn:function(datas){
		/*datas为服务器传回的数据，可复写该函数，获得一次请求获得的学校的列表*/
		/*函数正文写在这里……*/
	},
	pageFn:function(datas){
		/*datas为服务器传回的数据，可复写该函数,获得一次请求页面的信息*/
		/*函数正文写在这里……*/
	},
	onChange:function(item){
		/*item为获取的每一项的学校的信息，可复写该方法获取所需要的数据*/
		/*函数正文写在这里……*/
	},
	textFn:function(item){
		/*item为获取的每一项的学校的信息，可复写该方法获取所需要的数据*/
		/*函数正文写在这里……*/
	}
});

```

##html格式
```html
<input type="text" name="school" class="u-ipt u-ipt-nm j-school-select" placeholder="请输入学校关键字">
```

##对上述参数中的函数`itemsFn` `pageFn` `onChange`解释
若后台返回的数据格式 datas如下

```javascript
{
	"page":{
		"curPage": 1,
		"endPage": 3,
		"limit": 10,
		"offset": 0,
		"pageCount": 10,
		"pageSize": 10,
		"startPage": 1,
		"totalPage": 3,
		"totalSize": 6
	},
	"items":[
		{
			"schoolId": 130,
			"schoolName": "zyf测试学校0",
			"schoolNature": 0
		},
		{
			"schoolId": 131,
			"schoolName": "zyf测试学校1",
			"schoolNature": 1
		}
	]
}
```

	`itemsFn` 用于获取上面hson的items数组
	`pageFn` 用于获取上面json的page object对象
	`onChange` 用于对当前选中item数据的进行操作，可以复写该方法以你想要的结果
	`textFn` 选择某项时，可以复写该方法，将所需要的文字显示到输入框中。

例如：返回该选中项的 schoolId ，诸如此类

```javascript
onChange:function(item){
	return item.schoolId
}
```

~~~ sh
本例子中的引用的是autoComplete.js插件，未调用http.js 和utils.js文件
乐课网中的引用的是本例中的autoComplete.js插件，用sea.js进行封装了的，需要引用http.js 和utils.js文件
~~~
