Epsilon = 1e-9;

function VecLength(vec)
{
	return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

function NormalizeVec(vec)
{
	var length = VecLength(vec);

	return {x : vec.x / length, y : vec.y / length};
}

function PseudoscalarMult(a, b)
{
	return a.x * b.y - a.y * b.x;
}

function SortByPerpendicularDist(point, aLine, bLine)
{
	var aDist = PerpendicularDist(point, aLine),
		bDist = PerpendicularDist(point, bLine);

	if (aDist + Epsilon < bDist)
		return [aLine, bLine];

	return [bLine, aLine];
}

function PerpendicularDist(point, line)
{
	var AB = {x : line.end.x - line.start.x, y : line.end.y - line.start.y},
	 	CD = NormalizeVec({x : AB.y, y : -AB.x}),
		AC = {x : point.x - line.start.x, y : point.y - line.start.y},
		ACxAB = PseudoscalarMult(AC, AB),
		CDxAB = PseudoscalarMult(CD, AB),
		alpha = -ACxAB / CDxAB;

	return Math.abs(alpha);
}

function InMiddle(point, aLine, bLine)
{
	var a = {x : aLine.end.x - aLine.start.x, y : aLine.end.y - aLine.start.y},
		b = {x : bLine.end.x - bLine.start.x, y : bLine.end.y - bLine.start.y},
		pointAVec = {x : point.x - aLine.start.x, y : point.y - aLine.start.y},
		pointBVec = {x : point.x - bLine.start.x, y : point.y - bLine.start.y},
		res1 = PseudoscalarMult(pointAVec, a),
		res2 = PseudoscalarMult(pointBVec, b);

	if ((res1 > Epsilon) && (res2 < Epsilon) || (res1 < Epsilon) && (res2 > Epsilon))
		return true;

	return false;
}

function ShiftBy(point, dirVec, factor)
{
	return {x : point.x + factor * dirVec.x,
			y : point.y + factor * dirVec.y};
}

function ToScale(coords, targetSize)
{
	var scaleFactor = 0.5 * targetSize / Math.max(GetAbsMax(coords, "x"),
												  GetAbsMax(coords, "y"),
												  GetAbsMax(coords, "z")),
		coordsCnt = coords.length;

		for (i = 0; i < coordsCnt; ++i)
		{
			coords[i].pos.x *= scaleFactor;
			coords[i].pos.y *= scaleFactor;
			coords[i].pos.z *= scaleFactor;
		}

	return coords;
}

function GetAbsMax(arr, component)
{
	var maxVal = Math.abs(arr[0].pos[component]),
		arrLength = arr.length,
		i = 0;

	for (i = 0; i < arrLength; ++i)
	{
		maxVal = Math.max(maxVal, Math.abs(arr[i].pos[component]));
	}

	return maxVal;
}

function RotateByY(atoms, angle)
{
	var atomsCnt = atoms.length,
		i = 0,
		newX = 0.0,
		newZ = 0.0;

	for (i = 0; i < atomsCnt; ++i)
	{
		newX = atoms[i].pos.x * Math.cos(angle) - atoms[i].pos.z * Math.sin(angle);
		newZ = atoms[i].pos.x * Math.sin(angle) + atoms[i].pos.z * Math.cos(angle);
		atoms[i].pos.x = newX;
		atoms[i].pos.z = newZ;
	}
}

function RotateByX(atoms, angle)
{
	var atomsCnt = atoms.length,
		i = 0,
		newY = 0.0,
		newZ = 0.0;

	for (i = 0; i < atomsCnt; ++i)
	{
		newY = atoms[i].pos.y * Math.cos(angle) - atoms[i].pos.z * Math.sin(angle);
		newZ = atoms[i].pos.y * Math.sin(angle) + atoms[i].pos.z * Math.cos(angle);
		atoms[i].pos.y = newY;
		atoms[i].pos.z = newZ;
	}
}

//////////////////////////////////////////////////////
// Возвращает минимум по z
// a, b - трехэлементные массивы
function CompareByZ(a, b)
{
	if (a.pos.z + Epsilon < b.pos.z)
		return -1;

	if (b.pos.z + Epsilon < a.pos.z)
		return 1;

	if (a.id < b.id)
		return -1;

	return 1;
}
