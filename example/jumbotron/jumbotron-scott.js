//This is the junkyard jumbotron example

//On the Server
var ws = new Workspace(8080);	//open server on port 8080
ws.setClientLimit(-1); 			//no limit
ws.setPixelDimensions(2000,2000);		//this is a value to be used when desciding how to lay things out

//workspace objects are html code, including canvas objects (?) 
//or maybe the workspace is a canvas so the constructor is a function that draws something...
//chose the first for now, so main thing is a 
var monaLisa = new WorkspaceObject('<img id="mona_lisa" src="mona_lisa.jpg" style="height: '+ws.getHeight()+'; width: "'+ws.getWidth()+';" />');
ws.addObject(monaLisa,0,0);	//the object and where to position this object in the space

//use the function below for laying out clients when clients connect or disconnect
ws.setNewClientHandler(layoutFunc);
ws.setNewDisconnectHandler(layoutFunc);

//set up user interactions -> zoom and pan
ws.setPinchHandler(pinchFunc);
ws.setDragHandler(dragFunc);

var pinchFunc = function(ws, target, event)
{
	event.... get the distance moved
	var scale = .... translate into scale factor

	var wsObjs = ws.getAllObjects();
	
	for (var obj in wsObjs)
	{
		//scale ws objects one by one, by giving them new heights and widths
		//in this case there will only be the one object
		//optionally, since pinching and zooming will be so common
		//it might be good just to have an option that will allow
		//zooming to happen automatically, including resizing all objects
	}	
}

var dragFunc = function(ws, target, event)
{
	event... get distance moved
	xMovement = //calculate xMovment
	yMovement = //calculate yMovment

	//could check the type of object here if we wanted to only allow
	//movement on drags of the image, and not the canvas
	if (typeof target is WorkspaceObject)
	{
		target.setXPos(target.getXPos()+xMovement);
		target.setYPos(target.getYPos()+yMovement);
	}
}

//this function is called when a new client connects
//it will layout update the position of all clients as they are added 
//clients will try to be added if they fit within the preferred width otherwise they
//will be added below. Not exactly the jumbotron behaviour, but a simple approach
var layoutFunc = function(ws, client)	//ws is an object representing the workspace, client is an object representing the new client
{
	//track position
	var width = 0;		//width of the current row
	var height =0;		//height of the workspace

	ws.removeAllClients();	//remove all clients as then readd them

	//figure out the display position of other screens
	for (var otherClient in ws.clients)
	{
		if (width + otherClient.getWidth() <= ws.getPixelWidth())
		{
			client.setXPos(width);
			client.setYPos(height);
			width += otherClients.getWidth();
		}

		else
		{
			//must find the min height of the current 'row'
			var minHeight = 1000000000;

			for (var tempClient in ws.clients)
			{
				//only clients on the current 'row'
				if (tempClient.getYPos() == height)
				{
					if (tempClient.getHeight() < minHeight)
						minHeight = tempClient.getHeight();
				}
			}

			width = 0;
			height += minHeight;

			otherClient.setXPos(width);
			otherClient.setYPos(height);

			ws.addClient(otherClient);
		}
	}

	client.setXPos(width);
	client.setYPos(height);

	ws.addClient(client);
};
