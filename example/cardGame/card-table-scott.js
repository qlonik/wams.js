//this is the card table exmaple
//include 'cardgame.js';							//gives access to objects for running the card game

//on the server
var MAX_HANDS = 4;

var mainWS = new Workspace(8080);				//this is the controlling workspace, communications on port 8080
mainWS.setPixelDimension(mainWS.UNLIMITTED);	//this is an unlimitted canvas

var tableWS = new Workspace();					//this workspace will be for the table, and is contained in the main WS
mainWS.add(tableWS);							//add the card table to the workspace

var handWS = new Array();
var handCount = 0;								//the number of hands connected
var tableConnected = false;

ws.setClientConnectHandler(addClientFunc);
ws.setClientDisconnectHandler(removeClientFunc);
ws.setDragHandler(handleDrag);

var addClientFunc = function(client, ws)
{
	// the first client to connect is the table
	if (!tableConnected)
	{
		tableWS.addClient(client);		//adding a client allows the client to have pixels that it can display from the workspace

		//set the size of the table to be the same as the client in pixels
		tableWS.setPixelDimension(client.getWidth(), client.getHeight());	

		tableWS.setStyle('background: dark-green; ...');	//provide CSS for the table, or maybe the table is a canvas(?)

		tableWorkspace.setDragHandler(tableDragFunc);
		tableConnected = true;

		tableWorkspace.objectMovement(Workspace.CONTINUOUS);//this says that objects can be moved continuously from one edge to another, if there is a shared edge
		tableWorkspace.setObjectsInBounds(true);			//keep the cards in the board, unless there is a nother workspace on the edge
	}
	else if (handCount < MAX_HANDS)
	{

		handWS[handCount] = new Workspace();
		handWS[handCount].add(client);														//add the client to the workspace
		handWS[handCount].rotateRelativeParent(handCount*90);								//add roate the client relative the workspace, by 90 degrees
																							//this allows the top edge to be aligned with parent, this might not be the easiest to implement
		handWS[handCount].setPixelDimension(client.getWidth(),client.getHeight());			//set dimensions of ws to be the client

		//this is sloppy but put the client roughly in the middle of its position
		if (handCount == 0)
			handWS[handCount].setLocation(tableWS.getWidth()/2,tableWS.getHeight());		//bottom
		else if (handCount == 1)
			handWS[handCount].setLocation(0,tableWS.getHeight()/2);							//left
		else if (handCount == 2)
			handWS[handCount].setLocation(tableWS.getWidth()/2,0-client.getHeight());		//top
		else if (handCount == 3)
			handWS[handCount].setLocation(tableWS.getWidth,tableWS.getHeight()/2);			//right

		tableWorkspace.objectMovement(Workspace.CONTINUOUS);//this says that objects can be moved continuously from one edge to another, if there is a shared edge
		tableWorkspace.setObjectsInBounds(true);			//keep the cards in the hand, unless there is a nother workspace on the edge

		//the card object comes from the cardgame file included at the top
		//there might be some way to make this card object into a displayable WorkspaceObject
		var card = new WorkspaceObject(new Card());
		card.setLocation(handWS[handCount].getWidth()/2,handWS[handCount].getHeight()/2);	//place the card roughly in the middle of the workspace
		handWS[handCount].addObject(card);
		handCount++;
	}

	else
	{
		client.sendErrorMsg("There are already " + MAX_HANDS + " clients connected to this game. You have been disconnected.");
		client.disconnect();
	}

};

var removeClientFunc = function(client)
{
	//maybe do somoe cleanup
	client.disconnect();	//not sure if this would be needed here
};

var handleDrag = function(ws, event)
{
	//only objects can be moved, i.e. dragging on the empty workspace does nothing
	if (typeof event.target == WorkspaceObject)	//might want to have a way to identify type of object
	{
		//calculate movement
//		event.target.setPosition(..);	//simply update the position
	}	
};
