OpenMagic = {};

//////////////////////////////////////////////////////////////////////////////////////////
//OpenMagic.GameLoop
//Controls GameLoop
//Dispatches Events on document object
//Events
//"Initialize" - Called once to initialize components
//"Update"     - Called every step.
//"Draw"       - Called after Update event dispatched
//////////////////////////////////////////////////////////////////////////////////////////
OpenMagic.GameLoop = {};
OpenMagic.GameLoop.frameStep = 25; //40HRz
OpenMagic.GameLoop.initialize = function()  //Dispatch "Initialize" Event on document
{
	document.dispatchEvent(new CustomEvent(  
    "Initialize",  
    {  
        detail: {},  
        bubbles: true,  
        cancelable: true  
    }  
	));
}
OpenMagic.GameLoop.update = function()  //Dispatch "Update" Event on document
{
	document.dispatchEvent(new CustomEvent(  
    "Update",  
    {  
        detail: {frameStep: this.frameStep},  
        bubbles: true,  
        cancelable: true  
    }  
	));
	OpenMagic.GameLoop.draw();
}
OpenMagic.GameLoop.draw = function()  //Dispatch "Draw" Event on document
{
	document.dispatchEvent(new CustomEvent(  
    "Draw",  
    {  
        detail: {frameStep: this.frameStep},  
        bubbles: true,  
        cancelable: true  
    }  
	));
}
OpenMagic.GameLoop.start = function()  //Start GameLoop at 40HRz
{
	this.initialize();
	this.interval = setInterval(this.update, this.frameStep);
}
OpenMagic.GameLoop.stop = function()  //Stop GameLoop
{
	clearInterval(interval);
	interval = null;
}

//////////////////////////////////////////////////////////////////////////////////////////
//OpenMagic.View
//<canvas> tag interface
//OpenMagic.View.context for direct access to canvas
//////////////////////////////////////////////////////////////////////////////////////////
OpenMagic.View = {};
OpenMagic.View.init = function()					//Initialize Canvas.
{
	this.width = window.innerWidth;					//Get Window Dimensions
	this.height = window.innerHeight;
	this.canvas = document.getElementById("view");	//Get Canvas Tag by id="view"
	this.canvas.width = OpenMagic.View.width;					//Fill Page with Canvas
	this.canvas.height = OpenMagic.View.height;
	this.context = OpenMagic.View.canvas.getContext("2d");	//Get 2d canvas
}
document.addEventListener("Initialize", function(){OpenMagic.View.init();}, false);
OpenMagic.View.clear = function(color)						//Fills entire canvas with one color. safe.
{
	temp = OpenMagic.View.context.fillStyle;
	OpenMagic.View.context.fillStyle = color;
	OpenMagic.View.context.fillRect(0,0,view.width,view.height);
	OpenMagic.View.context.fillStyle = temp;
}
OpenMagic.View.drawImage = function(image, srcx, srcy, srcwidth, srcheight, x, y, width, height)		//Draws an image on the canvas. safe.
{
	if(arguments.length == 3)
	{
		this.context.drawImage(image, srcx, srcy);
	}
	else if(arguments.length == 5)
	{
		this.context.drawImage(image, srcx, srcy, srcwidth, srcheight);
	}
	else
	{
		this.context.drawImage(image, srcx, srcy, srcwidth, srcheight, x, y, width, height);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////
//OpenMagic.Content
//Manages Loading and Storing of Content(Images, etc)
//////////////////////////////////////////////////////////////////////////////////////////
OpenMagic.Content = {};
OpenMagic.Content.images = {};  //Repository for images, access with indexer "[index]"
OpenMagic.Content.loadImage = function(name, url, callback)		//Loads an image and calls callback function when loading is finished
{
	this.images[name] = new Image();
	this.images[name].onload = callback;
	this.images[name].src = url;
	return this.images[name];
}
OpenMagic.Content.getImage = function(name)
{
	return this.images[name];
}

//////////////////////////////////////////////////////////////////////////////////////////
//OpenMagic.Input
//Controls Input
//////////////////////////////////////////////////////////////////////////////////////////
OpenMagic.Input = {};
OpenMagic.Input.Mouse = {};
OpenMagic.Input.Mouse.init = function()
{
	this.X = 0;
	this.Y = 0;
	OpenMagic.View.canvas.addEventListener('mousemove', function(e){OpenMagic.Input.Mouse.mousemove(e);}, false);
}
document.addEventListener("Initialize", function(){OpenMagic.Input.Mouse.init();}, false);
OpenMagic.Input.Mouse.mousemove = function(event)
{
	this.X = event.clientX;
	this.Y = event.clientY;
}
//////////////////////////////////////////////////////////////////////////////////////////
//OpenMagic.HTTP
//HTTP request tools
//////////////////////////////////////////////////////////////////////////////////////////
OpenMagic.HTTP = {};
OpenMagic.HTTP.syncRequest = function(url)
{
	try{
		request = new XMLHttpRequest();
	}
	catch(error){}
	request.open("GET", url, false);
	request.send();
	return request;
}
OpenMagic.HTTP.asyncRequest = function(url, callback)
{
	try{
		request = new XMLHttpRequest();
	}
	catch(error){}
	request.onreadystatechange = callback;
	request.open("GET", url, true);
	request.send();
	return request;
}

//////////////////////////////////////////////////////////////////////////////////////////
//OpenMagic.Gatherer
//Interface for loading content from gatherer.wizards.com
//////////////////////////////////////////////////////////////////////////////////////////
OpenMagic.Gatherer = {};
OpenMagic.Gatherer.loadCardImage = function(uid, callback/*optional*/)
{
	if(arguments.length == 2)
	{
		return OpenMagic.Content.loadImage(uid, "http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid="
		+ uid + 
		"&type=card", callback);
	}
	else
	{
		return OpenMagic.Content.loadImage(uid, "http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid="
		+ uid + 
		"&type=card", null);
	}
}
OpenMagic.Gatherer.loadCardData = function(uid)
{
	return OpenMagic.HTTP.syncRequest("loadCardData.php?uid=" + uid).responseText;
}

//////////////////////////////////////////////////////////////////////////////////////////
//OpenMagic.Rules
//Handles Rules
//////////////////////////////////////////////////////////////////////////////////////////
OpenMagic.Rules = {};

//////////////////////////////////////////////////////////////////////////////////////////
//OpenMagic.Rules.Card
// -LandCard
// -SpellCard
//   -CreatureCard
//   -PlaneswalkerCard
//////////////////////////////////////////////////////////////////////////////////////////
OpenMagic.Rules.Card = function(uid, name, types, subtypes, text, flavortext, artist)  //Basic Card Constructor
{
	this.uid = uid;
	this.name = name;
	this.types = types;
	this.subtypes = subtypes;
	this.text = text;
	this.flavortext = flavortext;
	this.artist = artist;
	this.image = null;
}
OpenMagic.Rules.LandCard = function(uid, name, types, subtypes, text, flavortext, artist)  //Land Card Constructor
{
	this.__proto__ = new OpenMagic.Rules.Card(uid, name, types, subtypes, text, flavortext, artist);
}
OpenMagic.Rules.SpellCard = function(uid, name, cost, convertedcost, types, subtypes, text, flavortext, artist)  //Spell Card Constructor
{
	this.__proto__ = new OpenMagic.Rules.Card(uid, name, types, subtypes, text, flavortext, artist);
	this.cost = cost;
	this.convertedcost = convertedcost;
}
OpenMagic.Rules.CreatureCard = function(uid, name, cost, convertedcost, types, subtypes, power, toughness, text, flavortext, artist)  //Spell Card Constructor
{
	this.__proto__ = new OpenMagic.Rules.SpellCard(uid, name, cost, convertedcost, types, subtypes, text, flavortext, artist);
	this.power = power;
	this.toughness = toughness;
}
OpenMagic.Rules.PlaneswalkerCard = function(uid, name, cost, convertedcost, types, subtypes, loyalty, text, flavortext, artist)  //Spell Card Constructor
{
	this.__proto__ = new OpenMagic.Rules.SpellCard(uid, name, cost, convertedcost, types, subtypes, text, flavortext, artist);
	this.loyalty = loyalty;
}
OpenMagic.Rules.Card.createFromGatherer = function(uid)
{
	json = OpenMagic.Gatherer.loadCardData(uid);
	cardData = eval('(' + json + ')');
	if(cardData.types.contains("Land"))
	{
		return new OpenMagic.Rules.LandCard(uid, cardData.name, cardData.types, cardData.subtypes, cardData.text, cardData.flavortext, cardData.artist);
	}
	else if(cardData.types.contains("Creature"))
	{
		return new OpenMagic.Rules.CreatureCard(uid, cardData.name, cardData.cost, cardData.cmc, cardData.types, cardData.subtypes, cardData.power, cardData.toughness, cardData.text, cardData.flavortext, cardData.artist);
	}
	else if(cardData.types.contains("Planeswalker"))
	{
		return new OpenMagic.Rules.PlaneswalkerCard(uid, cardData.name, cardData.cost, cardData.cmc, cardData.types, cardData.subtypes, cardData.loyalty, cardData.text, cardData.flavortext, cardData.artist);
	}
	else
	{
		return new OpenMagic.Rules.SpellCard(uid, cardData.name, cardData.cost, cardData.cmc, cardData.types, cardData.subtypes, cardData.text, cardData.flavortext, cardData.artist);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////
//OpenMagic.Cards(Array)
//Manages Cards stored by UID
//////////////////////////////////////////////////////////////////////////////////////////
OpenMagic.Cards = [];
OpenMagic.addCard = function(card)
{
	OpenMagic.Cards[card.uid] = card;
	card.image = OpenMagic.Gatherer.loadCardImage(card.uid);
}