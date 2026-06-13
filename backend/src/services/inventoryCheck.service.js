import { Inventory } from '../models/Inventory.js';

/**
 * Given an order's lens requirements, check inventory collection
 * (built from past stocking data) to determine if the required
 * power/index/coating combination is available in-house.
 *
 * Returns: { availability: 'IN_HOUSE' | 'EXTERNAL_PROCUREMENT', estimatedLeadDays }
 */
export const checkLensAvailability = async ({ lensType, lensIndex, coatings, prescription }) => {
  // Use the worst-case (max absolute) sph/cyl across both eyes to check stock range
  const sphValues = [prescription?.rightEye?.sph, prescription?.leftEye?.sph].filter(
    (v) => v !== undefined && v !== null
  );
  const cylValues = [prescription?.rightEye?.cyl, prescription?.leftEye?.cyl].filter(
    (v) => v !== undefined && v !== null
  );

  const maxSph = sphValues.length ? Math.max(...sphValues.map(Math.abs)) : 0;
  const maxCyl = cylValues.length ? Math.max(...cylValues.map(Math.abs)) : 0;

  // Check inventory for each requested coating; order needs ALL coatings in-house to qualify
  const coatingList = coatings && coatings.length ? coatings : ['ANTI_REFLECTIVE'];

  let allInHouse = true;
  let maxLeadDays = 0;

  for (const coating of coatingList) {
    const stock = await Inventory.findOne({ lensType, lensIndex, coating });

    if (
      !stock ||
      stock.stockQuantity <= 0 ||
      maxSph > Math.max(Math.abs(stock.sphMin), Math.abs(stock.sphMax)) ||
      maxCyl > Math.max(Math.abs(stock.cylMin), Math.abs(stock.cylMax))
    ) {
      allInHouse = false;
      maxLeadDays = Math.max(maxLeadDays, stock?.avgProcurementDays || 5);
    }
  }

  return {
    availability: allInHouse ? 'IN_HOUSE' : 'EXTERNAL_PROCUREMENT',
    estimatedLeadDays: allInHouse ? 0 : maxLeadDays,
  };
};
