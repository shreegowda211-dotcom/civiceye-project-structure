// Reusable pagination utility
export async function paginate(model, query = {}, page = 1, limit = 10, populate = []) {
  const skip = (page - 1) * limit;
  const total = await model.countDocuments(query);
  const totalPages = Math.ceil(total / limit);
  let q = model.find(query).skip(skip).limit(limit);
  if (populate && populate.length) {
    populate.forEach(pop => {
      q = q.populate(pop);
    });
  }
  const results = await q.lean();
  return {
    results,
    total,
    page,
    totalPages
  };
}
