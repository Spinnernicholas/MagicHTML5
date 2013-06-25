Array.prototype.contains = function(obj)
{
	for(i=0;i<this.length;i+=1)
	{
		if(this[i] === obj)
		{
			return true;
		}
	}
	return false;
}