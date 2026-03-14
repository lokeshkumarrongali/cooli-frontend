import api from "../api/axios";

/**
 * Fetch workers from the discovery API.
 * All params are optional.
 */
export const fetchWorkers = async ({ skill = "", district = "", rating = "", experience = "", q = "", lat, lng, radius = 20, page = 1, limit = 12 } = {}) => {
  const params = new URLSearchParams();
  if (q)          params.append("q", q);
  if (skill)      params.append("skill", skill);
  if (district)   params.append("district", district);
  if (rating)     params.append("rating", rating);
  if (experience) params.append("experience", experience);
  if (lat)        params.append("lat", lat);
  if (lng)        params.append("lng", lng);
  params.append("radius", radius);
  params.append("page", page);
  params.append("limit", limit);

  const res = await api.get(`/workers?${params.toString()}`);
  return res.data; // { data, pagination }
};

/**
 * Fetch a single worker's full profile.
 */
export const fetchWorkerById = async (id) => {
  const res = await api.get(`/workers/${id}`);
  return res.data.data;
};
