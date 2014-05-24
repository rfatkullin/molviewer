function Drawer(atoms, bonds)
{
	var MolMinRad = 10,
		MolMaxRad = 30,
		MolRadDelta = MolMaxRad - MolMinRad,
		Border = 50;

	this.Init = function(atoms, bonds)
	{
		DrawWidth = svgCtxSize.width - 2 * Border;

		this.atoms = ToScale(atoms, DrawWidth);
		this.edgesMap = GetEdgesMap(atoms, bonds);
	}

	function GetEdgesMap(atoms, bonds)
	{
		var atomsCnt = atoms.length,
			bondsCnt = bonds.length,
			i = 0,
			j = 0,
			adjAtomId = -1,
			edgesMap = {};

		for (i = 0; i < atomsCnt; ++i)
		{
			edgesMap[atoms[i].id] = {pos : atoms[i].pos, edges : []};
		}

  		for (j = 0; j < bondsCnt; ++j)
  		{
  			edgesMap[bonds[j][0]].edges.push(bonds[j][1]);
			edgesMap[bonds[j][1]].edges.push(bonds[j][0]);
  		}

		return edgesMap;
	}

	this.Draw = function()
	{
		var atomsCnt = this.atoms.length,
			i = 0,
			j = 0,
			edges = [],
			edgesCnt = 0,
			atomId = -1,
			atomPos = {},
			atomRad = -1,
			adjAtomPos = {};

		atoms.sort(CompareByZ);

		this.minZ = atoms[0].pos.z;
		this.maxZ = atoms[atomsCnt - 1].pos.z;
		this.widthZ = this.maxZ - this.minZ;

		//Если все точки лежат в одной плоскости по Z
		if (Math.abs(this.widthZ) < Epsilon)
			this.widthZ = 0.1;

		svgCtx.clear();

		DrawContextRect();

		this.isDrawn = {};

		for (i = 0; i < atomsCnt; ++i)
		{
			atomPos = OffsetToDrawCanvas(this.atoms[i].pos);
			atomRad = this.GetMoleculeRad(atomPos.z);
			DrawMolecule(atomPos, atomRad, this.atoms[i].id);

			edges = this.edgesMap[this.atoms[i].id].edges;
			edgesCnt = edges.length;
			for (j = 0; j < edgesCnt; ++j)
			{
				adjAtomPos = this.edgesMap[edges[j]].pos;

				if (atomPos.z + Epsilon < adjAtomPos.z)
				{
					this.DrawEdge(atomPos, atomRad, OffsetToDrawCanvas(adjAtomPos));
				}
				else if (Math.abs(atomPos.z - adjAtomPos.z) < Epsilon && this.IsDrawn(this.atoms[i].id, edges[j]) === false)
				{
					this.DrawEdge(atomPos, atomRad, OffsetToDrawCanvas(adjAtomPos));
					this.SetDrawn(this.atoms[i].id, edges[j]);
				}
			}
		}		
	}

	this.IsDrawn = function(id1, id2)
	{
		if (this.isDrawn[id1] === undefined)
			return false;

		if (this.isDrawn[id1][id2] === undefined)
			return false;

		return true;
	}

	this.SetDrawn = function(id1, id2)
	{
		if (this.isDrawn[id1] === undefined)
			this.isDrawn[id1] = {};

		this.isDrawn[id1][id2] = true;

		if (this.isDrawn[id2] === undefined)
			this.isDrawn[id2] = {};

		this.isDrawn[id2][id1] = true;
	}

	function OffsetToDrawCanvas(pos)
	{
		return {x : pos.x + DrawWidth / 2 + Border,
				y : pos.y + DrawWidth / 2 + Border,
				z : pos.z};
	}

	this.Rotate = function(rotateVec)
	{
		RotateByY(atoms, -rotateVec.x * 0.01);
		RotateByX(atoms, rotateVec.y * 0.01);
	}

	function Arc(startPos, endPos, clockWise)
	{
		var length = VecLength({x : endPos.x - startPos.x, y : endPos.y - startPos.y});
		var rad = length / 2.0;
		var pathStrPattern = "M {0} {1} A {2} {2} 0 1 {3} {4} {5}";


		var pathStr = pathStrPattern.format(startPos.x, startPos.y, rad, clockWise ? 0 : 1, endPos.x, endPos.y);

		var c = svgCtx.path(pathStr).attr({fill : "none", stroke : "black", strokeWidth : "1"});
	}

	function DrawContextRect()
	{
		svgCtx.rect(0, 0, svgCtxSize.width, svgCtxSize.height, 5, 5).attr({ stroke: "black", strokeWidth: "1", fill : "white", "fill-opacity": "1.0" });
	}

	this.DrawEdge = function(startPos, startRad, endPos)
	{
		var endRad = this.GetMoleculeRad(endPos.z),
			startFactor = 0.2 * startRad,
			endFactor = 0.2 * endRad,
			dirVec = {x : endPos.x - startPos.x, y : endPos.y - startPos.y},
			normVec = NormalizeVec({x : -dirVec.y, y : dirVec.x}),
			shiftedStart = ShiftBy(startPos, NormalizeVec(dirVec), 0.5 * startRad),
			startTop = {x : shiftedStart.x - normVec.x,
					    y : shiftedStart.y - normVec.y,
						xDelta : -(startFactor - 1) * normVec.x,
						yDelta : -(startFactor - 1) * normVec.y},
	   		startBot = {x : shiftedStart.x + normVec.x,
					   	y : shiftedStart.y + normVec.y,
					   	xDelta : (startFactor - 1) * normVec.x,
						yDelta : (startFactor - 1) * normVec.y},
			endTop = {x : endPos.x - normVec.x,
				   	  y : endPos.y - normVec.y,
				   	  xDelta : -(endFactor - 1) * normVec.x,
				   	  yDelta : -(endFactor - 1) * normVec.y},
			endBot = {x : endPos.x + normVec.x,
					  y : endPos.y + normVec.y,
					  xDelta : (endFactor - 1) * normVec.x,
					  yDelta : (endFactor - 1) * normVec.y},
			i = 0;

		edgeLines = SortByPerpendicularDist({x : 0, y : 0}, {start: startBot, end : endBot}, {start: startTop, end : endTop});

		for (i = 0; i < edgeLines.length; ++i)
		{
			edgeLines[i].start.x += edgeLines[i].start.xDelta;
			edgeLines[i].start.y += edgeLines[i].start.yDelta;

			edgeLines[i].end.x += edgeLines[i].end.xDelta;
			edgeLines[i].end.y += edgeLines[i].end.yDelta;
		}

		svgCtx.polyline([	startTop.x, startTop.y,
						   	endTop.x, endTop.y,

					   	   	endBot.x, endBot.y,
							startBot.x, startBot.y,

							startBot.x, startBot.y,
							startTop.x, startTop.y]).attr({strokeWidth : "0", stroke : "black", fill : "white"});



		svgCtx.line(edgeLines[0].start.x, edgeLines[0].start.y,
				  		edgeLines[0].end.x, edgeLines[0].end.y).attr({strokeWidth : "1", stroke : "black", fill : "black"});

		var color = "black",
			width = "1";

		if (!InMiddle({x : 0, y : 0}, edgeLines[0], edgeLines[1]))
		{
			color = "gray";
			width = "3";
		}

		svgCtx.line(edgeLines[1].start.x, edgeLines[1].start.y,
  					edgeLines[1].end.x, edgeLines[1].end.y).attr({strokeWidth : width, stroke : color, fill : "black"});

		Arc(startTop, startBot, true);
		Arc(endTop, endBot, false);
	}

	this.GetMoleculeRad = function(zCompVal)
	{
		return MolMinRad + MolRadDelta * Math.abs(zCompVal - this.minZ) / this.widthZ;
	}

	function DrawMolecule(pos, rad, molId)
	{
		var bigCircle = svgCtx.circle(pos.x, pos.y, rad);

		bigCircle.attr({
		    fill: "gray"
		});

		var smallCircle = svgCtx.circle(pos.x - 0.2 * rad, pos.y - 0.2 * rad, rad);
		smallCircle.attr({
		    fill: "white"
		});

		var bigCircleStroke = svgCtx.circle(pos.x, pos.y, rad);

		bigCircleStroke.attr({
		    fill: "gray",
		    "fill-opacity" : "0.0",
		    stroke : "black",
		    strokeWidth : "1"
		});

		var masker = svgCtx.group(svgCtx.circle(pos.x, pos.y, rad));

		masker.attr({fill: "#fff"});

		smallCircle.attr({mask: masker});

		//svgCtx.text(pos.x, pos.y, molId.toString());
	}

	this.Init(atoms, bonds);
} //Drawer