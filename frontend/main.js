var ws = null,
	mouseDown = false,
	drawer = null,	
	redraw = true;	

function OnLoad()
{
	svgCtx = Snap(600, 600);

	var svgBoundary = document.getElementById("svg_boundary"),
		svgCtxEl = document.getElementsByTagName("svg")[0];

	svgBoundary.appendChild(svgCtxEl);

	svgCtxSize = svgCtxEl.getBoundingClientRect();
	svgCtxSize.correctedTop = svgCtxSize.top + pageYOffset;

	Connect();
}

function OnDrawClick()
{
	var selectObj = selectObj = document.getElementById("fileSelect");

	if (selectObj.value === "text box")
	{
		ProcessData(document.getElementById("mol2data").value);
	}
	else if (ws)
	{
		ws.send(selectObj.value);
	}
}

function OnSaveClick()
{
	var svgBoundary = document.getElementById("svg_boundary"),
		anchor = document.getElementById("save_anchor");

	anchor.setAttribute("href", "data:application/octet-stream," + encodeURIComponent(svgBoundary.innerHTML));
	anchor.setAttribute("download", "scene.svg");
}

function OnOpen()
{
	this.send('get_files_list');
	conn = true;

	console.log('Connected to server.');
}

function OnClose()
{
	console.log('Close connection.');
}

function OnError(err)
{
    if (err.data === undefined )
    {
        console.log('Cannot connect to server.');
    }
    else
    	console.log(err.data);
}

function OnMessage(msg)
{
	var msgData = JSON.parse(msg.data),
		selectObj = null,
		filesArray = [],
		i = 0,
		selectOption;

	if (msgData.type === 'files_list')
	{
		selectObj = document.getElementById("fileSelect");

		for (i = 0; i < msgData.files.length; ++i)
		{
			selectOption = document.createElement("option");
			selectOption.text = msgData.files[i];
			selectObj.add(selectOption);
		}
	}
	else
	{
		ProcessData(msgData.content);
	}
}

function Connect()
{
	ws = new WebSocket('ws://localhost:1024');

    if (ws === undefined)
		alert('WebSockets are not supported');

    ws.onopen      = OnOpen;
    ws.onclose     = OnClose;
    ws.onmessage   = OnMessage;
    ws.onerror     = OnError;
}

function ProcessData(content)
{
	var atomsBlock,
		bondsBlock;

	if (content)
	{
		atomsBlock = GetBlock("ATOM", content);
		bondsBlock = GetBlock("BOND", content);
		drawer = new Drawer(atomsBlock, bondsBlock);
		drawer.Draw();
	}
}

function MouseWorldPos(event)
{
	if (typeof svgCtxSize === 'undefined')
		return {x : 0, y : 0}

	return {x : event.pageX - svgCtxSize.left,
            y : svgCtxSize.height - (event.pageY - svgCtxSize.correctedTop)};
}

function OnMouseMove(event)
{
	if (mouseDown)
	{
    	currMousPos = MouseWorldPos(event);

    	if (typeof svgCtxSize !== 'undefined')
    	{
    		if (currMousPos.x <= 10 || currMousPos.x >= svgCtxSize.width ||
    			currMousPos.y <= 10 || currMousPos.y >= svgCtxSize.height)
    		{
				mouseDown = false;
			}
    	}
	}
}

function OnMouseDown(event)
{
	if (event.button === 0)
	{
	    if (event.preventDefault)
	    {
	        event.preventDefault();
	        event.stopPropagation();
	    }
	    else
	    {
	        event.returnValue = false;
	        event.cancelBubble = true;
	    }

	    mouseDown = true;
    	currMousPos = MouseWorldPos(event);
    	mousePrevPos = currMousPos;
	}
}

function OnMouseUp(event)
{
	if (event.button === 0)
	{
		mouseDown = false;
	}
}

function MainLoop()
{	
	if (drawer)
	{
		if (mouseDown)
		{
    		drawer.Rotate({x : currMousPos.x - mousePrevPos.x, y : currMousPos.y - mousePrevPos.y});
    		mousePrevPos = currMousPos;
    		redraw  = true;
    	}

    	if (redraw === true)
    	{
    		drawer.Draw();
    		redraw = false;
    	}
	}	
}

timerHandler = setInterval(MainLoop, 33);
prevTime = (new Date()).getTime();