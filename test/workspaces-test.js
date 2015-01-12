WAMS = require('../lib2');

mainWS = WAMS(3000);
firstChild = WAMS();
secondChild = WAMS();
higherParent = WAMS(3001);

mainWS.mergeShape({ x: 100, y: 100 });
firstChild.mergeShape({ x: 200, y: 200 });
secondChild.mergeShape({ x: 200, y: 200 });
higherParent.mergeShape({ x: 0, y: 0 });

mainWS.addElement(firstChild);
firstChild.addElement(secondChild);
higherParent.addElement(mainWS);

console.log(secondChild.getShapeRelativeTopParent());
