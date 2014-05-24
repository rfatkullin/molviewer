function GetBlock(blockName, content)
{
	var tiposBlock = "@<TRIPOS>",
		nameWithPrefix = tiposBlock + blockName,
		inBlock = false,
		i = 0,
		resArray = [],
		contentArray = content.split("\n"),
		currLine = "",
		currLineArray = [];

	for (i = 0; i < contentArray.length; ++i)
	{
		currLine = contentArray[i];

		if (currLine === nameWithPrefix)
			inBlock = true;
		else if (inBlock)
		{
			currLineArray = currLine.replace(/\s+/g, " ").split(" ");

			if ((currLine.indexOf(tiposBlock) == 0) || currLineArray.length < 3)
				break;

			if (blockName === "ATOM")
				resArray.push({id : parseInt(currLineArray[1]), pos : {x : parseFloat(currLineArray[3]), y : parseFloat(currLineArray[4]), z : parseFloat(currLineArray[5])}});
			else if (blockName === "BOND")
				resArray.push([parseInt(currLineArray[2]), parseInt(currLineArray[3]), currLineArray[4]]);

		}
	}

	return resArray;
}
