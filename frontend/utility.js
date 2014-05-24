// First, checks if it isn't implemented yet.
	if (!String.prototype.format) {
	  String.prototype.format = function() {
	    var args = arguments;
	    return this.replace(/{(\d+)}/g, function(match, number) {
	      return typeof args[number] != 'undefined'
	        ? args[number]
	        : match
	      ;
	    });
	  };
	}

//////////////////////////////////////////
// Возвращает строковое представление массива массивов, если
// передан второй аргумент, то строка составляется только
// по этой компоненте
// arrOfArr - массив, который нужно перевести в строку
// component - нужная компонента
function ArrOfArrToStr(arrOfArr, component)
{
	if (!arrOfArr)
	{
		console.log("[ArrOfArrToStr]: undefined or null argument!");
		return "";
	}

	var resStr = "",
		i = 0,
		arrLength = arrOfArr.length;

	for (i = 0; i < arrLength; ++i)
	{
		if (component)
			resStr += arrOfArr[i].pos[component].toString() + "\n";
		else
			resStr += JSON.stringify(arrOfArr[i]) + "\n";
	}

	return resStr;
}