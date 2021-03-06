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
}
