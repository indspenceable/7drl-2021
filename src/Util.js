export default class Util {
  static WeightedPick(items, weight) {
    var reducer = (acc, val) => {return acc + val};
    var valueIndex = Math.random() * (items.map(i => weight(i)).reduce(reducer, 0));
    for (var i = 0; i < items.length; i += 1) {
      valueIndex -= weight(items[i]);
      if (valueIndex < 0) return items[i];
    }
    return undefined;
  }
  static distance(p1, p2) {
    var d1 = Math.abs(p2.x-p1.x)
    var d2 = Math.abs(p2.y-p1.y)
    return Math.sqrt((d1*d1)+(d2*d2))
  }

  static lineBetween (startCoordinates, endCoordinates) {
    var coordinatesArray = new Array();
    // Translate coordinates
    var x1 = startCoordinates.x;
    var y1 = startCoordinates.y;
    var x2 = endCoordinates.x;
    var y2 = endCoordinates.y;
    // Define differences and error check
    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    var sx = (x1 < x2) ? 1 : -1;
    var sy = (y1 < y2) ? 1 : -1;
    var err = dx - dy;
    // Set first coordinates
    coordinatesArray.push({x:x1, y:y1});
    // Main loop
    while (!((x1 == x2) && (y1 == y2))) {
        var e2 = err << 1;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
        // Set coordinates
        coordinatesArray.push({x:x1, y:y1});
    }
    // Return the result
    return coordinatesArray;
}
}
