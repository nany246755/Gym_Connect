// Bundled photos for the machine types in the mock data, keyed by lower-case equipment name.
// Any machine with the same name (in any branch, or added later) gets the same photo.
export const equipmentImages: Record<string, number> = {
  'bench press': require('../../assets/images/equipment/bench-press.jpg'),
  'incline bench': require('../../assets/images/equipment/incline-bench.jpg'),
  'lat pulldown': require('../../assets/images/equipment/lat-pulldown.jpg'),
  'seated row': require('../../assets/images/equipment/seated-row.jpg'),
  'squat rack': require('../../assets/images/equipment/squat-rack.jpg'),
  'leg press': require('../../assets/images/equipment/leg-press.jpg'),
  'smith machine': require('../../assets/images/equipment/smith-machine.jpg'),
  'shoulder press': require('../../assets/images/equipment/shoulder-press.jpg'),
  'cable machine': require('../../assets/images/equipment/cable-machine.jpg'),
  'cable crossover': require('../../assets/images/equipment/cable-crossover.jpg'),
  'preacher curl': require('../../assets/images/equipment/preacher-curl.jpg'),
  'dumbbell set': require('../../assets/images/equipment/dumbbell-set.jpg'),
  kettlebells: require('../../assets/images/equipment/kettlebells.jpg'),
  treadmill: require('../../assets/images/equipment/treadmill.jpg'),
  'spin bike': require('../../assets/images/equipment/spin-bike.jpg'),
  'rowing machine': require('../../assets/images/equipment/rowing-machine.jpg'),
};
