export function multipleMongooseToObject(data: any) {
  return data.map((item: any) => item.toObject());
}

export function mongooseToObject(data: any) {
  return data.toObject();
}
